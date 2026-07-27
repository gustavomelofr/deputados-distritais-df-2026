import type { CargoEleitoral, EstagioEleitoral, PessoaEleitoral } from '@/types';

// ---------------------------------------------------------------------------
// Validação de integridade da base eleitoral independente.
//
// Verifica: IDs e URLs duplicados, links genéricos (homepage), datas inválidas
// ou futuras, fonte ausente, slug inexistente, estágio válido, evidências com
// pessoaId consistente, evidência sem cargo e cargo inválido. Retorna lista de
// erros — vazia significa base íntegra.
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

const CARGOS_VALIDOS = new Set<CargoEleitoral>([
  'governador',
  'vice_governador',
  'senador',
  'deputado_federal',
  'deputado_distrital',
]);

function isIsoDate(s: string): boolean {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

function isFutureDate(s: string, hoje: string): boolean {
  return isIsoDate(s) && s > hoje;
}

// Link genérico: URL sem caminho significativo (apenas domínio, raiz ou
// domínio + barra). Homepage de veículo não é evidência — o brief exige URL
// específica da matéria/item.
function isGenericLink(url: string): boolean {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/+$/, '');
    return path === '' || path === '/';
  } catch {
    return false;
  }
}

export function validarCenarioEleitoral(
  base: PessoaEleitoral[],
  hoje: string = new Date().toISOString().slice(0, 10),
): ErroValidacao[] {
  const erros: ErroValidacao[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const urlsVistos = new Set<string>();

  for (const p of base) {
    if (ids.has(p.id)) {
      erros.push({ pessoaId: p.id, campo: 'id', mensagem: 'ID duplicado' });
    }
    ids.add(p.id);

    // slug inexistente (vazio ou ausente) além de duplicado.
    if (!p.slug || p.slug.trim() === '') {
      erros.push({ pessoaId: p.id, campo: 'slug', mensagem: 'slug inexistente' });
    } else if (slugs.has(p.slug)) {
      erros.push({ pessoaId: p.id, campo: 'slug', mensagem: 'slug duplicado' });
    }
    if (p.slug) slugs.add(p.slug);

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
      } else {
        // URL duplicada entre todas as evidências da base.
        if (urlsVistos.has(ev.url)) {
          erros.push({ pessoaId: p.id, campo: 'evidencias.url', mensagem: `URL duplicada na evidência ${ev.id}: ${ev.url}` });
        }
        urlsVistos.add(ev.url);

        // Link genérico (homepage) — não é evidência válida.
        if (isGenericLink(ev.url)) {
          erros.push({ pessoaId: p.id, campo: 'evidencias.url', mensagem: `link genérico (homepage) na evidência ${ev.id}: ${ev.url}` });
        }
      }

      // Fonte ausente (campo fonte vazio).
      if (!ev.fonte || ev.fonte.trim() === '') {
        erros.push({ pessoaId: p.id, campo: 'evidencias.fonte', mensagem: `fonte ausente na evidência ${ev.id}` });
      }

      // Evidência sem cargo (cargo ausente ou inválido).
      if (!ev.cargo || !CARGOS_VALIDOS.has(ev.cargo)) {
        erros.push({ pessoaId: p.id, campo: 'evidencias.cargo', mensagem: `evidência ${ev.id} sem cargo ou cargo inválido: ${ev.cargo ?? '(ausente)'}` });
      }

      if (!isIsoDate(ev.coletadaEm)) {
        erros.push({ pessoaId: p.id, campo: 'evidencias.coletadaEm', mensagem: `data inválida na evidência ${ev.id}` });
      }
      if (!isIsoDate(ev.verificadaEm)) {
        erros.push({ pessoaId: p.id, campo: 'evidencias.verificadaEm', mensagem: `data inválida na evidência ${ev.id}` });
      }
      if (isFutureDate(ev.coletadaEm, hoje)) {
        erros.push({ pessoaId: p.id, campo: 'evidencias.coletadaEm', mensagem: `data futura na evidência ${ev.id}` });
      }
      if (isFutureDate(ev.verificadaEm, hoje)) {
        erros.push({ pessoaId: p.id, campo: 'evidencias.verificadaEm', mensagem: `data futura na evidência ${ev.id}` });
      }
    }
  }

  return erros;
}
