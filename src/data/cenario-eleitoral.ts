import { PessoaEleitoral } from '@/types';

// ---------------------------------------------------------------------------
// Base eleitoral independente das notícias — Eleições 2026 no DF
//
// Fonte de verdade do cenário eleitoral em /cenario-2026. NÃO é derivada de
// palavras-chave nos títulos de notícias. Cada registro segue o schema
// PessoaEleitoral (src/types/index.ts) e deve ser validado por
// validarCenarioEleitoral (src/lib/validar-cenario-eleitoral.ts).
//
// A base inicial é intencionalmente vazia: nenhum nome é adicionado sem
// evidência suficiente (fonte específica, data e estágio) conforme
// AGENT_BRIEF.md. Quando vazia, /cenario-2026 exibe estado honesto por
// estágio ("Ainda não há registros neste estágio").
//
// Preenchimento futuro: as tarefas P3 (mapear nomes por cargo) adicionam
// registros aqui, cada um com evidência individual — nunca por inferência
// de título de notícia.
// ---------------------------------------------------------------------------

export const cenarioEleitoral: PessoaEleitoral[] = [];
