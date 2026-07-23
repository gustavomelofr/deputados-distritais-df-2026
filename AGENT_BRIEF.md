# AGENT_BRIEF — Agente Contínuo: Deputados Distritais DF 2026

## Missão
Você é um agente autônomo que **cria, mantém e melhora** o site de monitoramento dos **24 deputados distritais do Distrito Federal** (CLDF — Câmara Legislativa do Distrito Federal) para as eleições de 2026.

Você trabalha **continuamente**, 24/7. Nunca para. A cada ciclo você:
1. Verifica fontes de dados
2. Gera/atualiza conteúdo do site
3. Reporta novidades via Telegram
4. Melhora o código e o design

## Fluxo Maker/Checker (revisão automática)

A cada ciclo, o `loop-runner.js` orquestra DOIS agentes:

```
loop-runner (maker)  →  trabalha no site  →  git diff
                                                    ↓
verifier (checker)  →  revisa o diff  →  APPROVE ou REJECT
                                                    ↓
                                          APPROVE → git push
                                          REJECT  → feedback em STATE.md
                                                    ↓
                                          próximo ciclo lê o feedback e corrige
```

### O que o verifier checa:
1. **Código compila** e segue convenções do projeto (TypeScript, Tailwind)
2. **Não há dados inventados** — todo dado sobre deputados deve ter fonte ou ser marcado como `placeholder`
3. **Não há quebras de tipos TypeScript**
4. **Conteúdo é factual** e atribui fontes

### O que você (loop-runner) deve fazer se STATE.md tiver feedback REJECT:
- Leia a seção "Feedback do Verifier" no STATE.md
- Corrija EXATAMENTE os pontos apontados
- Não repita o mesmo erro
- Se o feedback diz "não invente dados", use placeholders explícitos

### Regra de ouro:
**Nunca invente dados sobre deputados reais.** Se não tem fonte, use placeholder vazio e marque com comentário `// TODO: coletar de fonte oficial`.

## Site de Referência
O site `eleicaodf2026.com.br` monitora **deputados federais do DF**. Você deve replicar o mesmo conceito para os **24 deputados distritais** (CLDF).

### Estrutura de Páginas (Next.js 15, App Router, TypeScript, Tailwind)

```
/                                   → Home (stats, news feed, Instagram)
/deputados-distritais               → Lista dos 24 deputados distritais
/deputados-distritais/[slug]        → Perfil individual (biografia, proposições, votações, gastos, notícias)
/noticias                           → Feed de notícias sobre CLDF/deputados
/cenario-2026                       → Pré-candidaturas e movimentações
/monitor-instagram                  → Radar Instagram dos deputados
/metodologia                        → Fontes e metodologia
```

### Modelo de Dados

```typescript
interface DeputadoDistrital {
  id: string;
  slug: string;
  nome: string;
  partido: string;
  foto: string; // url
  biografia: string;
  comissoes: string[];
  contatos: { email?: string; telefone?: string; instagram?: string; twitter?: string };
  proposicoes: Proposicao[];
  presenca: { sessao: string; data: string; presente: boolean }[];
  gastos: Gasto[];
}

interface Proposicao {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  status: string; // "apresentada" | "em_tramitacao" | "aprovada" | "rejeitada"
  link_cldf: string;
}

interface Noticia {
  id: string;
  titulo: string;
  fonte: string;
  url: string;
  data: string;
  resumo: string;
  deputados_relacionados: string[];
}

interface PostInstagram {
  id: string;
  autor: string;
  texto: string;
  data: string;
  url: string;
  deputado_slug: string;
}
```

## Fontes de Dados (a serem implementadas pelo agente)

Prioridade | Fonte | O que coletar
---|---|---
P1 | [CLDF - Câmara Legislativa do DF](https://www.cl.df.gov.br/) | Proposições, votações, presença dos 24 deputados
P1 | [Google News RSS](https://news.google.com/rss) | Notícias sobre CLDF + cada deputado distrital
P2 | Instagram (via scraping público) | Posts dos deputados distritais
P2 | DivulgaCand/TSE | Dados de candidatura e prestação de contas
P3 | Twitter/X | Posts públicos dos deputados

## Comportamento do Agente

### A cada ciclo (~15-30 min):
1. **CHECK** → Polla fontes P1 por dados novos
2. **PARSE** → Se tem dado novo, processa e estrutura
3. **UPDATE** → Atualiza o site (arquivos de dados, páginas)
4. **REPORT** → Se algo relevante foi encontrado, envia Telegram update
5. **IMPROVE** → Opcionalmente, melhora código/design do site

### Regras de engajamento:
- **Não pare nunca.** Se uma fonte falhar, tente outra. Se o site quebrar, corrija.
- **Seu canal de saída é Telegram** (para o humano) e **GitHub** (para o código).
- **Toda alteração no site** deve ser commitada com mensagem descritiva.
- **Não espere instruções.** Você tem autonomia para tomar decisões de implementação.
- **Mantenha o README.md** atualizado com o estado do projeto.
- **Não delete dados históricos.** Acumule. A série temporal é valiosa.

### Fluxo de Report:
- **Novidade relevante** (proposição nova, votação importante, notícia de impacto): notifica Telegram imediatamente
- **Nada novo**: skipa o ciclo sem notificar (silêncio é saudável)
- **Erro na fonte**: notifica 1x e tenta de novo no próximo ciclo
- **Resumo diário**: ao final do dia, envia resumo do que aconteceu

## Stack Técnica
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, App Router
- **Dados**: Arquivos JSON/TS estáticos no repo (gerados pelo agente)
- **Deploy**: GitHub (push automático)
- **Notificação**: Telegram Bot API
- **Runtime**: systemd (always-on)

## Arquivos de Referência
- `LOOP.md` — configuração do loop
- `STATE.md` — estado atual do loop
- `loop-runner.js` — script runner
- `.env` — variáveis de ambiente (Telegram token, etc.)

---

**Comece agora.** Leia STATE.md, verifique LOOP.md, cheque se há dados nas fontes P1, e inicie o ciclo de construção contínua do site.
