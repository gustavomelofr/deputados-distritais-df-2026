import type { DisponibilidadeDivulgaCand } from '@/types';

const ANO_ELEICAO = 2026;

const DIVULGACAND_BASE = 'https://divulgacandcontas.tse.jus.br/divulga/rest/v1';

const ENDPOINT_ELEICOES = `${DIVULGACAND_BASE}/eleicao/listar`;

const TIMEOUT_MS = 10_000;

interface Eleicao {
  ano: number;
  codigo: number;
  nome: string;
}

function agora(): string {
  return new Date().toISOString().slice(0, 10);
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T | null> {
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) return null;
    const text = await response.text();
    if (!text || text.trim() === '') return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function checkDisponibilidade(): Promise<DisponibilidadeDivulgaCand> {
  const abortController = new AbortController();
  const timer = setTimeout(() => abortController.abort(), TIMEOUT_MS);

  try {
    const eleicoes = await fetchJson<Eleicao[]>(ENDPOINT_ELEICOES, abortController.signal);

    if (!eleicoes || !Array.isArray(eleicoes)) {
      return {
        status: 'indisponivel',
        ano: ANO_ELEICAO,
        verificadoEm: agora(),
        motivo:
          'API do DivulgaCand não retornou lista de eleições ou resposta vazia. Eleição 2026 ainda não disponível.',
      };
    }

    const eleicao2026 = eleicoes.find((e) => e.ano === ANO_ELEICAO);

    if (!eleicao2026) {
      return {
        status: 'indisponivel',
        ano: ANO_ELEICAO,
        verificadoEm: agora(),
        motivo: `Nenhuma eleição com ano ${ANO_ELEICAO} encontrada no DivulgaCand. Dados oficiais só estarão disponíveis após o período de registro de candidaturas.`,
      };
    }

    return {
      status: 'disponivel',
      ano: ANO_ELEICAO,
      verificadoEm: agora(),
      codigoEleicao: eleicao2026.codigo,
    };
  } catch {
    return {
      status: 'erro_rede',
      ano: ANO_ELEICAO,
      verificadoEm: agora(),
      motivo:
        'Não foi possível contactar o servidor do DivulgaCand/TSE. A API pode estar temporariamente indisponível.',
    };
  } finally {
    clearTimeout(timer);
  }
}

export function estadoInicial(): DisponibilidadeDivulgaCand {
  return {
    status: 'indisponivel',
    ano: ANO_ELEICAO,
    verificadoEm: agora(),
    motivo:
      'Dados oficiais de candidaturas do TSE (DivulgaCand) para 2026 ainda não foram publicados. Disponível apenas após o período de registro de candidaturas.',
  };
}

export { ANO_ELEICAO, DIVULGACAND_BASE };
