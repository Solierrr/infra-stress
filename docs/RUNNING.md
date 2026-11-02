<p align="center">
  <img src="../assets/readme/banners/k6.png" alt="k6" width="100%">
</p>

# Execução local

Use Node.js 22, conforme o CI, npm, `make` e k6. O guia comum de ferramentas está em [TYPESCRIPT.md](https://github.com/Solierrr/docs-warehouse/blob/main/readme/running/TYPESCRIPT.md).

Execute `make install`, `make doctor`, `make lint` e `make build`. `make vault`, `make dev` e `make test` não têm configuração de execução própria.

```sh
make smoke TARGET=web-app ENV=local
make stress TARGET=web-app ENV=local PEAK_VUS=10
```

O alvo local precisa estar iniciado, e a variável `BASE_URL` substitui o endereço do catálogo, lembrando que o Worker não tem QA declarado. Para os cenários genéricos, prepare a lista local a partir do exemplo e use os scripts `test:smoke` ou `test:stress` do npm.

Produção é bloqueada sem a opção exigida pelo código. As iscas são opt-in e podem registrar o IP na proteção de borda fora do modo local. Não há execução automática de carga no CI consultado.
