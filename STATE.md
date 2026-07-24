# Loop State — Deputados Distritais DF 2026

Last run: 2026-07-24T06:10:00.000Z
Status: 🟡 Correção aplicada — entrada 03:41:39 reescrita como registro factual limpo em terceira pessoa, em português, sem marcadores `·`, sem texto de thinking e sem truncamento. Diff inclui alteração de código-fonte real (`src/app/deputados-distritais/page.tsx`: indicador de atividade legislativa nos cards da lista).

## Melhoria aplicada neste ciclo
- Adicionado, em cada card da lista de deputados, um indicador discreto de atividade legislativa mostrando a contagem de proposições monitoradas (`N proposições` quando > 0; `sem proposições monitoradas` em itálico cinza quando vazio), acompanhado de ícone de documento. A informação é derivada de `dep.proposicoes.length` e fica visível entre os chips de comissões e a barra inferior de ações.

## Próximo ciclo
- Prosseguir com a rotina de polling de fontes P1 (CLDF, Google News RSS) para preencher os arrays `proposicoes`, `presenca` e `gastos` atualmente vazios na maioria dos deputados, começando pelos partidos com maior bancada na CLDF.
- Continuar aplicando melhorias incrementais ao site (componentes, dados, acessibilidade).
