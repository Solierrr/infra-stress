<p align="center">
  <img src="../assets/readme/banners/k6.png" alt="k6" width="100%">
</p>

# Execução por ambiente

Este repositório não publica imagem ou serviço. O operador executa os cenários manualmente contra o destino escolhido.

| Alvo | Ambientes |
|---|---|
| Aplicativo web | Local, QA e produção |
| Worker | Local e produção |

O QA do aplicativo aponta para https://web-app-ldi0.onrender.com. Ambos os alvos de produção apontam para https://solarianetwork.site. Os endereços locais ficam em `src/targets.json` e podem ser sobrescritos na execução.

O contexto dos ambientes está em [QA_RENDER.md](https://github.com/Solierrr/docs-warehouse/blob/main/readme/deploy/QA_RENDER.md). O build compila os testes, mas não aplica mudanças na aplicação.
