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

## Painel Bash

Execute `main.sh` com Bash para listar e chamar os scripts `.sh` em `commands/`.
O comando `commands/DOS/dos-simulation.sh` solicita uma URL HTTP(S), a duração,
o limite global de requests por segundo e o número de workers. Ele aceita apenas
`localhost`, `127.0.0.1` e `[::1]`, com limites de 100 requests por segundo,
32 workers e 600 segundos. Redirecionamentos HTTP não são seguidos.

Use Git Bash, incluído no Git for Windows, ou outro ambiente Bash. `curl` e as
ferramentas Unix padrão precisam estar no `PATH`.

Para instalar o Git for Windows, use o [site oficial](https://git-scm.com/install/windows)
ou rode este comando no PowerShell:

```powershell
winget install --id Git.Git -e --source winget
```

Abra um novo terminal após a instalação. Se `bash` chamar o atalho do WSL, use
o Bash instalado com Git for Windows:

```powershell
& "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe" --version
& "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe" -lc "curl --version"
& "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe" ./main.sh
```

Para verificar a sintaxe dos arquivos Bash sem executar o painel ou enviar
tráfego, rode este comando no PowerShell, na pasta do repositório:

```powershell
& "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe" -n ./main.sh ./commands/DOS/dos-simulation.sh
```
