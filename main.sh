#!/usr/bin/env bash

set -u

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

print_banner() {
  printf '\033[38;5;220m'
  cat <<'SUN'
                 \     (      /
            `.    \     )    /    .'
              `.   \   (    /   .'
                `.  .-''''-.  .'
          `~._    .'/_    _\`.    _.~'
              `~ /  / \  / \  \ ~'
         _ _ _ _|  _\O/  \O/_  |_ _ _ _
                | (_)  /\  (_) |
             _.~ \  \      /  / ~._
          .~'     `. `.__.' .'     `~.
                .'  `-,,,,-'  `.
              .'   /    )   \   `.
            .'    /    (     \    `.
                 /      )     \     `
                       (
SUN
  printf '\033[38;5;196m\n'
  cat <<'LOGO'
  #####   ###   #       ###   ####   #####   ###
  #      #   #  #      #   #  #   #    #    #   #
  #####  #   #  #      #####  ####     #    #####
      #  #   #  #      #   #  # #      #    #   #
  #####   ###   #####  #   #  #  ##  #####  #   #

                 [ R E D   T E A M ]
LOGO
  printf '\033[0m\n'
}


while true; do
  print_banner
  printf '  Lab de ataques e testes | cyber\n\n'

  mapfile -t scripts < <(find commands -type f -name '*.sh' 2>/dev/null | sort)

  if ((${#scripts[@]} == 0)); then
    printf '  Nenhum script encontrado em commands/.\n'
  else
    printf '  Scripts disponíveis em commands/:\n'
    for i in "${!scripts[@]}"; do
      printf '  %d) %s\n' "$((i + 1))" "${scripts[$i]}"
    done
  fi

  printf '  0) Sair\n\n'
  printf '  Selecione: '
  IFS= read -r choice || exit 0
  choice="${choice%$'\r'}"

  if [[ "$choice" == '0' ]]; then
    exit 0
  fi

  if [[ "$choice" =~ ^[1-9][0-9]*$ ]] && ((choice <= ${#scripts[@]})); then
    candidate="${scripts[$((choice - 1))]}"
    if [[ "$candidate" =~ ^commands/.*\.sh$ ]]; then
      bash "$candidate"
    else
      printf '\n  Script inválido para execução.\n\n'
    fi
  else
    printf '\n  Opção inválida.\n\n'
  fi
done
