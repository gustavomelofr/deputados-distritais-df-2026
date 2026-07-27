import type { EstagioEleitoral, PessoaEleitoral } from '@/types';

// ---------------------------------------------------------------------------
// Validação de integridade da base eleitoral independente.
//
// Verifica: IDs e slugs únicos, estágio válido, evidências com pessoaId
// consistente, datas em formato ISO válido e não futuras, e URL de evidência
// presente e absoluta. Retorna lista de erros — vazia significa base íntegra.
//
// Usada por /cenario-2026 para exibir estado honesto quando a base contém
// inconsistências. Disponível também para testes e validação automatizada.
// ---------------------------------------------------------------------------

export interface ErroValidacao {
  pessoaId: string;
  campo: string;
  mensagem: string;
}

const ESTAGIOS_VALIDOS = new Set<EstagioEleitoral>([
  'nome_monitorado',
  'pre_candidatura_declarada',
  'anunciado_pelo_partido',
  'movimentacao_publica',
  'registro_oficial',
]);

function isIsoDate(s: string): boolean {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

function isFutureDate(s: string, hoje: string): boolean {
  return isIsoDate(s) && s > hoje;
}

export function validarCenarioEleitoral(
  base: PessoaEleitoral[],
  hoje: string = new Date().toISOString().slice(0, 10),
): ErroValidacao[] {
  const erros: ErroValidacao[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();

  for (const p of base) {
    if (ids.has(p.id)) {
      erros.push({ pessoaId: p.id, campo: 'id', mensagem: 'ID duplicado' });
    }
    ids.add(p.id);

    if (slugs.has(p.slug)) {
      erros.push({ pessoaId: p.id, campo: 'slug', mensagem: 'slug duplicado' });
    }
    slugs.add(p.slug);

    if (!ESTAGIOS_VALIDOS.has(p.estagio)) {
      erros.push({ pessoaId: p.id, campo: 'estagio', mensagem: `estágio inválido: ${p.estagio}` });
    }

    if (!isIsoDate(p.coletadaEm)) {
      erros.push({ pessoaId: p.id, campo: 'coletadaEm', mensagem: 'data inválida' });
    }
    if (!isIsoDate(p.verificadaEm)) {
      erros.push({ pessoaId: p.id, campo: 'verificadaEm', mensagem: 'data inválida' });
    }
    if (isFutureDate(p.coletadaEm, hoje)) {
      erros.push({ pessoaId: p.id, campo: 'coletadaEm', mensagem: 'data futura' });
    }
    if (isFutureDate(p.verificadaEm, hoje)) {
      erros.push({ pessoaId: p.id, campo: 'verificadaEm', mensagem: 'data futura' });
    }

    const evidenciaIds = new Set<string>();
    for (const ev of p.evidencias) {
      if (evidenciaIds.has(ev.id)) {
        erros.push({ pessoaId: p.id, campo: 'evidencias.id', mensagem: `evidência com ID duplicado: ${ev.id}` });
      }
      evidenciaIds.add(ev.id);

      if (ev.pessoaId !== p.id) {
        erros.push({ pessoaId: p.id, campo: 'evidencias.pessoaId', mensagem: `evidência ${ev.id} pertence a outra pessoa (${ev.pessoaId})` });
      }
      if (!isIsoDate(ev.dataEvidencia)) {
        erros.push({ pessoaId: p.id, campo: 'evidencias.dataEvidencia', mensagem: `data inválida na evidência ${ev.id}` });
      }
      if (isFutureDate(ev.dataEvidencia, hoje)) {
        erros.push({ pessoaId: p.id, campo: 'evidencias.dataEvidencia', mensagem: `data futura na evidência ${ev.id}` });
      }
      if (!ev.url || !/^https?:\/\//.test(ev.url)) {
        erros.push({ pessoaId: p.id, campo: 'evidencias.url', mensagem: `URL ausente ou inválida na evidência ${ev.id}` });
      }
    }
  }

  return erros;
}
