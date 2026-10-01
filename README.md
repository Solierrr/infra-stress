# infra-stress

Testes de carga/stress em [k6](https://k6.io/) escritos em TypeScript.

## Estrutura

```
src/
  index.ts            # entry point padrão (reexporta o smoke test)
  https.ts            # carrega e expande a lista de alvos (urls.json)
  urls.example.json   # modelo da lista de alvos (domínio + paths)
  smoke/               # testes leves, poucos VUs, valida que os alvos respondem
  stress/              # testes de carga/stress com ramp-up de VUs
```

## Uso

```bash
npm install

# copie o modelo e edite com os domínios/paths reais que serão atacados
cp src/urls.example.json src/urls.json

npm run typecheck   # checa os tipos
npm run lint        # eslint
npm run build       # bundla src/*.ts (esbuild) para dist/, já com o urls.json ao lado de cada script

npm run test:smoke  # build + k6 run dist/smoke/smoke.js
npm run test:stress # build + k6 run dist/stress/stress.js
```

`src/urls.json` é ignorado pelo git (contém os domínios reais alvo dos testes); apenas
`src/urls.example.json` fica versionado.

### Formato do `urls.json`

```json
[
  { "url": "https://example.com", "paths": "/home" },
  { "url": "https://api.example.com", "paths": ["/health", "/status"] }
]
```

`paths` aceita uma string única ou um array de strings.
