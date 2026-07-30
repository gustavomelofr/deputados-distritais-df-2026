import type { CargoEleitoral, EstagioEleitoral, Noticia, PessoaEleitoral } from '@/types';

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
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const parsed = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === s;
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

function canonicalUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    parsed.searchParams.sort();
    parsed.pathname = parsed.pathname.replace(/\/+$/, '') || '/';
    return parsed.toString();
  } catch {
    return url;
  }
}

export function validarCenarioEleitoral(
  base: PessoaEleitoral[],
  hoje: string = new Date().toISOString().slice(0, 10),
  noticias: Noticia[] = [],
): ErroValidacao[] {
  const erros: ErroValidacao[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const noticiasPorId = new Map(noticias.map((noticia) => [noticia.id, noticia]));
  const noticiasPorUrl = new Map(noticias.map((noticia) => [canonicalUrl(noticia.url), noticia.id]));
  const evidenciaIdsGlobais = new Set<string>();

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

    const evidenciaUrls = new Set<string>();
    const noticiasRelacionadas = new Set(p.noticiasRelacionadas);
    for (const noticiaId of noticiasRelacionadas) {
      if (noticias.length > 0 && !noticiasPorId.has(noticiaId)) {
        erros.push({ pessoaId: p.id, campo: 'noticiasRelacionadas', mensagem: `notícia relacionada inexistente: ${noticiaId}` });
      }
    }
    if (noticiasRelacionadas.size !== p.noticiasRelacionadas.length) {
      erros.push({ pessoaId: p.id, campo: 'noticiasRelacionadas', mensagem: 'notícia relacionada duplicada' });
    }

    for (const ev of p.evidencias) {
      if (evidenciaIdsGlobais.has(ev.id)) {
        erros.push({ pessoaId: p.id, campo: 'evidencias.id', mensagem: `evidência com ID duplicado: ${ev.id}` });
      }
      evidenciaIdsGlobais.add(ev.id);

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
        const canonica = canonicalUrl(ev.url);
        // Uma matéria pode evidenciar mais de uma pessoa, mas variações
        // cosméticas da mesma URL não podem duplicar evidência da mesma pessoa.
        if (evidenciaUrls.has(canonica)) {
          erros.push({ pessoaId: p.id, campo: 'evidencias.url', mensagem: `URL duplicada na evidência ${ev.id}: ${ev.url}` });
        }
        evidenciaUrls.add(canonica);

        const noticiaId = noticiasPorUrl.get(canonica);
        if (noticiaId && !noticiasRelacionadas.has(noticiaId)) {
          erros.push({ pessoaId: p.id, campo: 'noticiasRelacionadas', mensagem: `evidência ${ev.id} corresponde a ${noticiaId}, mas a notícia não está relacionada` });
        }

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
    if (p.evidencias.length === 0) {
      erros.push({ pessoaId: p.id, campo: 'evidencias', mensagem: 'pessoa sem evidência' });
    } else {
      if (!p.evidencias.some((ev) => ev.cargo === p.cargo)) {
        erros.push({ pessoaId: p.id, campo: 'evidencias.cargo', mensagem: 'nenhuma evidência sustenta o cargo atual' });
      }
      if (!p.evidencias.some((ev) => ev.estagio === p.estagio)) {
        erros.push({ pessoaId: p.id, campo: 'evidencias.estagio', mensagem: 'nenhuma evidência sustenta o estágio atual' });
      }
    }
  }

  return erros;
}
