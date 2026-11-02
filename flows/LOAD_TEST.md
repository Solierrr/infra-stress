<p align="center">
  <img src="../assets/readme/banners/k6.png" alt="k6" width="100%">
</p>

# Execução de cenário

O operador seleciona o perfil, prepara o alvo e observa os checks do cenário.

```mermaid
flowchart TD
 A[Seleciona alvo e ambiente] --> B[Valida travas e intensidade]
 B --> C[Compila cenário]
 C --> D[Aquece alvo quando aplicável]
 D --> E[Executa smoke ou estágios de carga]
 E --> F[Exibe checks e métricas]
```

Alvo desconhecido, ambiente sem URL e produção sem confirmação impedem iniciar. O aquecimento pode falhar se a página não responder. A taxa `origin_unavailable` separa respostas de manutenção no cenário da borda.
