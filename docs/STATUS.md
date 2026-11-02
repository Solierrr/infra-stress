<p align="center">
  <img src="../assets/readme/banners/k6.png" alt="k6" width="100%">
</p>

# Situação

Leitura da main em 2026-10-31.

- Há smoke e stress por alvo e cenários genéricos.
- O teste de SPA verifica HTML e assets, sem executar React ou jornadas autenticadas.
- O teste de manutenção compara texto específico em português, o que pode exigir alinhamento com a página traduzida da borda.
- O CI constrói scripts e não mede carga remota.
- Não há metas de capacidade nem critérios de aceite definidos.
