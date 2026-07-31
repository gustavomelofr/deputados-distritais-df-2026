// Lógica pura da página /comparar-eleitoral — comparação descritiva entre
// pessoas monitoradas para o mesmo cargo em 2026 no DF.
//
// Este módulo NÃO tem `'use client'`: é puro e pode ser invocado em
// server components durante o prerender. As constantes compartilhadas
// (CARGOS_ORDENADOS, rotuloCargo, rotuloEstagio, classesEstagio,
// formatarDataComparacao, ItemComparacao, PessoaComparacao,
// ComparacaoEleitoral, resumoComparacao) ficam aqui para que o server
// possa usá-las no prerender sem precisar importar o arquivo do
// componente, que é client-only.
//
// Regras editoriais (AGENT_BRIEF.md, P6 item "Criar comparação
// eleitoral em /comparar-eleitoral"):
//
//   - A nova rota aceita SOMENTE pessoas do mesmo cargo. Selecionar
//     pessoas de cargos diferentes é impedido tanto pela UI (select
//     filtrado por cargo) quanto por esta lógica pura (validação que
//     retorna estado vazio honesto em vez de comparar).
//   - Comparação puramente descritiva: estágio, partido, evidências
//     (com fonte, URL e data), datas de verificação. Sem ranking, nota
//     ou inferência de intenção de voto. Nada é inventado: tudo
//     deriva de `cenarioEleitoral` (src/data/cenario-eleitoral.ts),
//     validada em build por `validarCenarioEleitoral`.
//   - Links de evidência apontam para a URL específica registrada na
//     base (nunca homepage).
//   - Estados vazio, de erro e de carregamento são tratados pelo
//     componente client; aqui mantemos a API determinística para que
//     a página renderize o estado honesto.
//
// A página `/comparar` (comparação legislativa histórica) é preservada
// sem alterações: este módulo é estritamente aditivo.

import type {
  CargoEleitoral,
  EstagioEleitoral,
  EvidenciaEleitoral,
  PessoaEleitoral,
} from '@/types';

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

/**
 * Pessoa válida para a comparação eleitoral. Derivada de
 * `cenarioEleitoral` com apenas os campos consumidos pela tabela.
 * Nenhum campo é inventado.
 */
export interface PessoaComparacao {
  id: string;
  slug: string;
  nome: string;
  /** Pode ser `null` quando a pessoa é monitorada sem partido conhecido. */
  partido: string | null;
  cargo: CargoEleitoral;
  estagio: EstagioEleitoral;
  /** Total de evidências registradas com fonte e data. */
  totalEvidencias: number;
  /**
   * Data da evidência mais recente (ISO 8601). Quando a pessoa não
   * tem evidência, retorna string vazia para a UI exibir estado
   * honesto. A regra de aceite da base (P3) exige evidência para
   * entrar no monitor; aqui defendemos explicitamente.
   */
  dataEvidenciaMaisRecente: string;
  /** Data de verificação editorial mais recente (ISO 8601). */
  dataVerificacaoMaisRecente: string;
  /** Lista cronológica de evidências (mais antiga → mais recente). */
  evidencias: EvidenciaEleitoral[];
}

/**
 * Item de uma linha da tabela de comparação. Cada indicador
 * (Estágio, Total de evidências, Data da fonte, Verificada em,
 * Fonte) tem o mesmo valor textual para todas as pessoas — a
 * comparação é puramente descritiva, sem pontuação.
 */
export interface ItemComparacao {
  indicador: string;
  /** Valores na ordem das pessoas selecionadas. */
  valores: string[];
}

/**
 * Estado de erro da página. Disparado quando o usuário tenta
 * comparar pessoas de cargos diferentes (situação prevista pelo
 * critério) — a UI exibe a mensagem em vez de quebrar a renderização.
 */
export interface ErroComparacao {
  tipo: 'cargos_diferentes';
  mensagem: string;
}

/**
 * Agregação completa da comparação. Derivada de `pessoasSelecionadas`
 * filtradas pela lógica pura. Quando o array é vazio ou inválido,
 * `comparacao` é `null` e a UI exibe estado honesto.
 */
export interface ComparacaoEleitoral {
  cargo: CargoEleitoral;
  pessoas: PessoaComparacao[];
  itens: ItemComparacao[];
  /** Erro estruturado (atualmente: cargos diferentes). */
  erro: ErroComparacao | null;
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Ordem canônica dos cargos na navegação e nos filtros. */
export const CARGOS_ORDENADOS: CargoEleitoral[] = [
  'governador',
  'vice_governador',
  'senador',
  'deputado_federal',
  'deputado_distrital',
];

/** Mínimo e máximo de pessoas que a comparação aceita. */
export const MIN_COMPARACAO_ELEITORAL = 2;
export const MAX_COMPARACAO_ELEITORAL = 4;

/**
 * Rótulo humano-legível do cargo. Centralizado para que a página
 * e os componentes usem a mesma nomenclatura.
 */
export function rotuloCargoComparacao(cargo: CargoEleitoral): string {
  switch (cargo) {
    case 'governador':
      return 'Governador';
    case 'vice_governador':
      return 'Vice-governador';
    case 'senador':
      return 'Senador';
    case 'deputado_federal':
      return 'Deputado federal';
    case 'deputado_distrital':
      return 'Deputado distrital';
  }
}

/**
 * Rótulo humano-legível do estágio. Reutilizado da lib de
 * perfil-eleitoral para evitar divergência entre páginas.
 */
export function rotuloEstagioComparacao(estagio: EstagioEleitoral): string {
  switch (estagio) {
    case 'nome_monitorado':
      return 'Nome monitorado';
    case 'pre_candidatura_declarada':
      return 'Pré-candidatura declarada';
    case 'anunciado_pelo_partido':
      return 'Anunciado pelo partido';
    case 'movimentacao_publica':
      return 'Movimentação pública';
    case 'registro_oficial':
      return 'Registro oficial (TSE)';
  }
}

/**
 * Classes Tailwind para badge do estágio. Consistente com
 * `classesEstagioPerfil` e `classesEstagio` para padronizar a UI.
 */
export function classesEstagioComparacao(estagio: EstagioEleitoral): string {
  switch (estagio) {
    case 'registro_oficial':
      return 'bg-green-100 text-green-700';
    case 'pre_candidatura_declarada':
    case 'anunciado_pelo_partido':
      return 'bg-blue-100 text-blue-700';
    case 'movimentacao_publica':
      return 'bg-amber-100 text-amber-700';
    case 'nome_monitorado':
      return 'bg-zinc-200 text-zinc-700';
  }
}

/** Formata ISO 8601 (aaaa-mm-dd) em dd/mm/aaaa. Estado honesto: '—'. */
export function formatarDataComparacao(iso: string): string {
  if (!iso) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

// ---------------------------------------------------------------------------
// Implementação
// ---------------------------------------------------------------------------

/**
 * Filtra as pessoas da base eleitoral válida para o cargo informado.
 * Apenas pessoas com pelo menos uma evidência entram na lista
 * (regra do critério P3: evidência é obrigatória para uma pessoa
 * aparecer como nome monitorado).
 */
export function pessoasPorCargo(
  base: ReadonlyArray<PessoaEleitoral>,
  cargo: CargoEleitoral,
): PessoaEleitoral[] {
  return base.filter((p) => p.cargo === cargo && p.evidencias.length > 0);
}

/**
 * Normaliza uma `PessoaEleitoral` para `PessoaComparacao`. Pureza:
 * só lê os campos já validados.
 */
export function pessoaParaComparacao(p: PessoaEleitoral): PessoaComparacao {
  const ordenadas = p.evidencias
    .slice()
    .sort((a, b) => a.dataEvidencia.localeCompare(b.dataEvidencia));
  const maisRecente = ordenadas[ordenadas.length - 1];
  const verificacaoMaisRecente = ordenadas
    .map((e) => e.verificadaEm)
    .sort((a, b) => b.localeCompare(a))[0];
  return {
    id: p.id,
    slug: p.slug,
    nome: p.nome,
    partido: p.partido ?? null,
    cargo: p.cargo,
    estagio: p.estagio,
    totalEvidencias: p.evidencias.length,
    dataEvidenciaMaisRecente: maisRecente?.dataEvidencia ?? '',
    dataVerificacaoMaisRecente: verificacaoMaisRecente ?? '',
    evidencias: ordenadas,
  };
}

/**
 * Verifica se duas ou mais pessoas compartilham o mesmo cargo.
 * Retorna `true` quando todos os itens do array têm o mesmo
 * `cargo`. Array vazio também retorna `true` (estado neutro) —
 * a regra de mínimo é aplicada em `comparar`.
 */
export function mesmoCargo(
  pessoas: ReadonlyArray<PessoaComparacao>,
): boolean {
  if (pessoas.length <= 1) return true;
  const primeiro = pessoas[0].cargo;
  return pessoas.every((p) => p.cargo === primeiro);
}

/**
 * Compara as pessoas selecionadas. Regras:
 *
 *   - Pessoas de cargos diferentes geram `ComparacaoEleitoral` com
 *     `erro` preenchido e `itens` vazio. A UI exibe a mensagem.
 *   - Menos de 2 pessoas válidas também retorna `comparacao` `null`
 *     (a UI mostra estado vazio honesto).
 *   - Sem ranking, nota ou inferência de intenção de voto: os
 *     indicadores são apenas descritivos.
 *   - A comparação é feita para até `MAX_COMPARACAO_ELEITORAL`
 *     pessoas; excedentes são silenciosamente descartados depois
 *     da deduplicação (mantendo a ordem de entrada).
 */
export function comparar(
  base: ReadonlyArray<PessoaEleitoral>,
  slugs: ReadonlyArray<string>,
): ComparacaoEleitoral | null {
  // Limpa/normaliza a entrada.
  const slugsLimpos = slugs
    .map((s) => s?.trim())
    .filter((s): s is string => Boolean(s));

  // Remove duplicatas preservando ordem.
  const slugsUnicos: string[] = [];
  for (const s of slugsLimpos) {
    if (!slugsUnicos.includes(s)) slugsUnicos.push(s);
  }
  const slugsFinal = slugsUnicos.slice(0, MAX_COMPARACAO_ELEITORAL);

  if (slugsFinal.length < MIN_COMPARACAO_ELEITORAL) return null;

  // Localiza as pessoas na base. Slugs não encontrados são
  // descartados; mas o array final ainda precisa respeitar o
  // mínimo.
  const pessoas: PessoaComparacao[] = [];
  for (const slug of slugsFinal) {
    const p = base.find((x) => x.slug === slug);
    if (p) pessoas.push(pessoaParaComparacao(p));
  }
  if (pessoas.length < MIN_COMPARACAO_ELEITORAL) return null;

  // Regra do critério: a nova rota aceita SOMENTE pessoas do mesmo
  // cargo. Quando isso falha, retornamos um estado de erro
  // estruturado para a UI exibir mensagem honesta.
  if (!mesmoCargo(pessoas)) {
    return {
      cargo: pessoas[0].cargo,
      pessoas,
      itens: [],
      erro: {
        tipo: 'cargos_diferentes',
        mensagem:
          'A comparação eleitoral aceita apenas pessoas do mesmo cargo. A página /comparar continua disponível para a comparação legislativa histórica.',
      },
    };
  }

  return {
    cargo: pessoas[0].cargo,
    pessoas,
    itens: construirItens(pessoas),
    erro: null,
  };
}

/**
 * Constrói a matriz de indicadores da tabela de comparação. Os
 * indicadores são puramente descritivos, sem nota ou ranking:
 * nome, partido, estágio, total de evidências, data da fonte mais
 * recente, data de verificação mais recente e a lista de fontes.
 */
function construirItens(pessoas: ReadonlyArray<PessoaComparacao>): ItemComparacao[] {
  const indicadores: ItemComparacao[] = [];

  indicadores.push({
    indicador: 'Nome',
    valores: pessoas.map((p) => p.nome),
  });

  indicadores.push({
    indicador: 'Partido',
    valores: pessoas.map((p) => p.partido ?? '— sem partido registrado'),
  });

  indicadores.push({
    indicador: 'Estágio de evidência',
    valores: pessoas.map((p) => rotuloEstagioComparacao(p.estagio)),
  });

  indicadores.push({
    indicador: 'Total de evidências',
    valores: pessoas.map((p) => String(p.totalEvidencias)),
  });

  indicadores.push({
    indicador: 'Data da fonte mais recente',
    valores: pessoas.map((p) => formatarDataComparacao(p.dataEvidenciaMaisRecente)),
  });

  indicadores.push({
    indicador: 'Verificada em',
    valores: pessoas.map((p) => formatarDataComparacao(p.dataVerificacaoMaisRecente)),
  });

  // Fontes de evidências — listadas uma por linha para garantir que
  // cada fonte apareça com link específico (nunca agregada em uma
  // só string sem rastreabilidade).
  const fontesPorPessoa = pessoas.map((p) =>
    p.evidencias.map((e) => `${e.fonte} (${formatarDataComparacao(e.dataEvidencia)})`),
  );
  const maxFontes = Math.max(...fontesPorPessoa.map((f) => f.length), 0);
  for (let i = 0; i < maxFontes; i++) {
    indicadores.push({
      indicador: maxFontes === 1 ? 'Fonte' : `Fonte ${i + 1}`,
      valores: pessoas.map((_, idx) => fontesPorPessoa[idx][i] ?? '—'),
    });
  }

  return indicadores;
}

// ---------------------------------------------------------------------------
// Resumo para a UI — derivado da comparação, sem ranking
// ---------------------------------------------------------------------------

/**
 * Conta pessoas por estágio dentro de uma comparação. Utilizado
 * para mostrar um resumo quantitativo "X pessoas em estágio
 * Anunciado pelo partido, Y em Movimentação pública" — descritivo,
 * sem qualquer juízo.
 */
export function contarPorEstagio(
  pessoas: ReadonlyArray<PessoaComparacao>,
): Record<EstagioEleitoral, number> {
  const acc: Record<EstagioEleitoral, number> = {
    nome_monitorado: 0,
    pre_candidatura_declarada: 0,
    anunciado_pelo_partido: 0,
    movimentacao_publica: 0,
    registro_oficial: 0,
  };
  for (const p of pessoas) {
    acc[p.estagio] += 1;
  }
  return acc;
}

/**
 * Texto curto para o estado de carregamento (acessibilidade). O
 * componente client pode usar este rótulo como fallback enquanto
 * os parâmetros chegarem.
 */
export const ROTULO_CARREGAMENTO =
  'Carregando comparação — selecione ao menos duas pessoas do mesmo cargo.';
