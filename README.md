<p align="center">
  <img src="./assets/readme/banners/k6.png" alt="k6" width="100%">
</p>

<p align="center">
  <img src="./assets/readme/stacks/typescript.png" width="100" hspace="8" alt="TypeScript" title="TypeScript">
</p>

# Verificação de carga web

[![License](https://img.shields.io/github/license/Solierrr/infra-stress)](https://github.com/Solierrr/infra-stress/blob/main/LICENSE)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/Solierrr/infra-stress)](https://github.com/Solierrr/infra-stress/commits)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/Solierrr/infra-stress)](https://github.com/Solierrr/infra-stress/pulls)
[![Release](https://img.shields.io/github/v/release/Solierrr/infra-stress)](https://github.com/Solierrr/infra-stress/releases)

O repositório permite verificar como a aplicação web e sua entrada de borda respondem a acessos repetidos. A equipe pode executar uma verificação breve ou aumentar a quantidade de visitantes virtuais durante um intervalo controlado. Os resultados ajudam a distinguir indisponibilidade da aplicação, falha de recursos e comportamento esperado de manutenção.

Os cenários são escritos em TypeScript e executados pelo k6. A configuração seleciona alvo e ambiente, define a intensidade e exige confirmação para produção. O teste da aplicação busca páginas e arquivos estáticos. O teste da borda também reconhece respostas de manutenção e oferece verificações opcionais dos caminhos isca.

## Aprofunde-se no Projeto!

- [OVERVIEW.md](./docs/OVERVIEW.md), finalidade e regras de produto.
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md), componentes, dados e integrações.
- [RUNNING.md](./docs/RUNNING.md), preparação e execução local.
- [DEPLOY.md](./docs/DEPLOY.md), ambientes e publicação.
- [STATUS.md](./docs/STATUS.md), limites observados.
- [Fluxos](./flows/), etapas e casos de erro do repositório.
- [PENDENCIAS.md](./PENDENCIAS.md), questões para revisão.

## Contribuindo

- [CONTRIBUTING.md](https://github.com/Solierrr/.github/blob/main/.github/CONTRIBUTING.md), convenções de contribuição.
- [CODE_OF_CONDUCT.md](https://github.com/Solierrr/.github/blob/main/CODE_OF_CONDUCT.md), código de conduta.
- [SECURITY.md](https://github.com/Solierrr/.github/blob/main/SECURITY.md), relato de vulnerabilidades.
