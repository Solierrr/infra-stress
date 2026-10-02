#!/usr/bin/env bash

set -u

# ============================================================
# LIMITES DE SEGURANÇA DO TESTE
# ============================================================

MAX_WORKERS=32
MAX_RPS=100
MAX_DURATION=600

CONNECT_TIMEOUT=5
REQUEST_TIMEOUT=20

# ============================================================
# DEPENDÊNCIAS
# ============================================================

for cmd in curl awk sort mktemp date sleep; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    printf 'Dependência não encontrada: %s\n' "$cmd" >&2
    exit 1
  fi
done

# ============================================================
# ENTRADAS
# ============================================================

printf 'URL HTTP(S): '
IFS= read -r target_url || exit 0
target_url="${target_url%$'\r'}"

shopt -s nocasematch

if [[ ! "$target_url" =~ ^https?://(localhost|127\.0\.0\.1|\[::1\])(:[0-9]{1,5})?([/?#][^[:space:]]*)?$ ]]; then
  printf 'Informe uma URL HTTP(S) para localhost, 127.0.0.1 ou [::1].\n' >&2
  exit 1
fi

shopt -u nocasematch


printf 'Duração do teste em segundos (máximo %s): ' "$MAX_DURATION"
IFS= read -r duration

if [[ ! "$duration" =~ ^[1-9][0-9]*$ ]] ||
   ((duration > MAX_DURATION)); then
  printf 'Duração inválida. Use 1-%s segundos.\n' "$MAX_DURATION" >&2
  exit 1
fi


printf 'Limite global de requests por segundo (máximo %s): ' "$MAX_RPS"
IFS= read -r rps

if [[ ! "$rps" =~ ^[1-9][0-9]*$ ]] ||
   ((rps > MAX_RPS)); then
  printf 'RPS inválido. Use 1-%s.\n' "$MAX_RPS" >&2
  exit 1
fi


printf 'Workers concorrentes (máximo %s): ' "$MAX_WORKERS"
IFS= read -r workers

if [[ ! "$workers" =~ ^[1-9][0-9]*$ ]] ||
   ((workers > MAX_WORKERS)); then
  printf 'Workers inválidos. Use 1-%s.\n' "$MAX_WORKERS" >&2
  exit 1
fi


# Não faz sentido criar mais workers que RPS.
if ((workers > rps)); then
  workers="$rps"
  printf 'Workers ajustados automaticamente para %s.\n' "$workers"
fi


# ============================================================
# ARQUIVOS TEMPORÁRIOS
# ============================================================

temp_dir=$(mktemp -d)

results_file="$temp_dir/results.txt"
latency_file="$temp_dir/latency.txt"

touch "$results_file"
touch "$latency_file"


# ============================================================
# CLEANUP
# ============================================================

worker_pids=()

cleanup() {

  printf '\nInterrompendo teste...\n'

  for pid in "${worker_pids[@]}"; do
    kill "$pid" 2>/dev/null || true
  done

  for pid in "${worker_pids[@]}"; do
    wait "$pid" 2>/dev/null || true
  done

  rm -rf "$temp_dir"

  exit 130
}

trap cleanup INT TERM


# ============================================================
# RATE LIMIT
#
# Cada worker recebe aproximadamente:
#
# RPS / workers
#
# Exemplo:
#
# 20 RPS
# 4 workers
#
# cada worker -> ~5 req/s
#
# ============================================================

interval=$(awk -v r="$rps" -v w="$workers" \
  'BEGIN { printf "%.6f", w / r }')


# ============================================================
# REQUEST
# ============================================================

request_target() {

  local worker="$1"
  local target="$2"

  local output
  local curl_status
  local http_code
  local request_time

  output=$(curl \
    -sS \
    -o /dev/null \
    -w '%{http_code} %{time_total}' \
    --connect-timeout "$CONNECT_TIMEOUT" \
    --max-time "$REQUEST_TIMEOUT" \
    "$target" 2>/dev/null)

  curl_status=$?

  if ((curl_status == 0)); then

    read -r http_code request_time <<< "$output"

    printf '%s %s %s\n' \
      "$worker" \
      "$http_code" \
      "$request_time" \
      >> "$results_file"

    printf '%s\n' "$request_time" >> "$latency_file"

  else

    printf '%s CURL_ERROR_%s 0\n' \
      "$worker" \
      "$curl_status" \
      >> "$results_file"

  fi
}


# ============================================================
# WORKER
# ============================================================

run_worker() {

  local worker_id="$1"
  local end_time="$2"

  local count=0

  while (( $(date +%s) < end_time )); do

    request_target "$worker_id" "$target_url"

    count=$((count + 1))

    # Pequeno controle de RPS por worker.
    sleep "$interval"

  done

  printf '[worker %s] finalizado (%s requests)\n' \
    "$worker_id" \
    "$count"
}


# ============================================================
# INÍCIO
# ============================================================

start_time=$(date +%s)
end_time=$((start_time + duration))

printf '\n'
printf '=============================================\n'
printf ' TESTE DE CARGA\n'
printf '=============================================\n'
printf 'URL:        %s\n' "$target_url"
printf 'Duração:    %ss\n' "$duration"
printf 'RPS máximo: %s\n' "$rps"
printf 'Workers:    %s\n' "$workers"
printf 'Timeout:    %ss\n' "$REQUEST_TIMEOUT"
printf '=============================================\n'
printf '\nCtrl+C para interromper.\n\n'


# ============================================================
# INICIAR WORKERS
# ============================================================

for ((worker_id = 1; worker_id <= workers; worker_id++)); do

  run_worker "$worker_id" "$end_time" &

  worker_pids+=("$!")

done


# ============================================================
# AGUARDAR
# ============================================================

for pid in "${worker_pids[@]}"; do
  wait "$pid"
done

finish_time=$(date +%s)

actual_duration=$((finish_time - start_time))


# ============================================================
# RELATÓRIO
# ============================================================

total_requests=$(wc -l < "$results_file")

success_requests=$(awk '
$2 ~ /^2[0-9][0-9]$/ {
    count++
}
END {
    print count+0
}' "$results_file")


client_errors=$(awk '
$2 ~ /^4[0-9][0-9]$/ {
    count++
}
END {
    print count+0
}' "$results_file")


server_errors=$(awk '
$2 ~ /^5[0-9][0-9]$/ {
    count++
}
END {
    print count+0
}' "$results_file")


curl_errors=$(awk '
$2 ~ /^CURL_ERROR_/ {
    count++
}
END {
    print count+0
}' "$results_file")


other_status=$(awk '
$2 ~ /^[0-9][0-9][0-9]$/ &&
$2 !~ /^2/ &&
$2 !~ /^4/ &&
$2 !~ /^5/ {
    count++
}
END {
    print count+0
}' "$results_file")


# ============================================================
# LATÊNCIA
# ============================================================

if [[ -s "$latency_file" ]]; then

  sorted_latency="$temp_dir/latency_sorted.txt"

  sort -n "$latency_file" > "$sorted_latency"

  latency_count=$(wc -l < "$sorted_latency")

  latency_min=$(head -1 "$sorted_latency")
  latency_max=$(tail -1 "$sorted_latency")

  latency_avg=$(awk '
{
    total += $1
}
END {
    if (NR > 0)
        printf "%.4f", total / NR
    else
        print "0"
}' "$sorted_latency")


  percentile() {

    local percent="$1"

    awk \
      -v p="$percent" \
      -v count="$latency_count" '
BEGIN {
    index = int((p / 100) * count)

    if (index < 1)
        index = 1
}
NR == index {
    print
    exit
}' "$sorted_latency"

  }

  p50=$(percentile 50)
  p95=$(percentile 95)
  p99=$(percentile 99)

else

  latency_min=0
  latency_max=0
  latency_avg=0

  p50=0
  p95=0
  p99=0

fi


# ============================================================
# RPS REAL
# ============================================================

if ((actual_duration > 0)); then

  actual_rps=$(awk \
    -v total="$total_requests" \
    -v duration="$actual_duration" \
    'BEGIN {
        printf "%.2f", total / duration
    }')

else

  actual_rps=0

fi


# ============================================================
# TAXA DE SUCESSO
# ============================================================

if ((total_requests > 0)); then

  success_rate=$(awk \
    -v success="$success_requests" \
    -v total="$total_requests" \
    'BEGIN {
        printf "%.2f", (success / total) * 100
    }')

else

  success_rate=0

fi


# ============================================================
# RESULTADO FINAL
# ============================================================

printf '\n'
printf '=============================================\n'
printf ' RESULTADO\n'
printf '=============================================\n'

printf 'Duração real:        %ss\n' "$actual_duration"
printf 'Requests totais:     %s\n' "$total_requests"
printf 'RPS médio real:      %s\n' "$actual_rps"

printf '\n'

printf '2xx:                  %s\n' "$success_requests"
printf '4xx:                  %s\n' "$client_errors"
printf '5xx:                  %s\n' "$server_errors"
printf 'Outros HTTP:          %s\n' "$other_status"
printf 'Erros curl/rede:      %s\n' "$curl_errors"

printf '\n'

printf 'Taxa de sucesso:      %s%%\n' "$success_rate"

printf '\n'
printf 'LATÊNCIA\n'
printf '---------------------------------------------\n'

printf 'mínima:               %ss\n' "$latency_min"
printf 'média:                %ss\n' "$latency_avg"
printf 'máxima:               %ss\n' "$latency_max"

printf 'p50:                   %ss\n' "$p50"
printf 'p95:                   %ss\n' "$p95"
printf 'p99:                   %ss\n' "$p99"

printf '\n'
printf 'STATUS HTTP\n'
printf '---------------------------------------------\n'

awk '
$2 ~ /^[0-9][0-9][0-9]$/ {
    status[$2]++
}
END {
    for (code in status)
        printf "HTTP %s: %s\n", code, status[code]
}' "$results_file" | sort

printf '\n'
printf '=============================================\n'

rm -rf "$temp_dir"

trap - INT TERM
