import type { FotografiaEleitoral, LicencaFoto } from '@/types';

// ---------------------------------------------------------------------------
// Placeholder e metadados padronizados de fotografia — P4 do AGENT_BRIEF.md.
//
// O brief (item "Fotografias") explicita duas garantias editoriais:
//   1. "perfil funciona sem foto" — quando não há foto reutilizável, o
//      perfil é renderizado com um placeholder honesto, sem inventar
//      identidade visual da pessoa.
//   2. "nenhuma imagem sem fonte e base de uso" — toda imagem exibida
//      precisa registrar fonte, URL da fonte, data de verificação e
//      licença/base de uso. O placeholder atende a esses campos
//      declarando licenca = 'placeholder' (última posição da ordem de
//      preferência) e fonte/urlFonte que apontam para a origem desta
//      constante no repositório.
//
// O placeholder é um SVG inline servido de /public/foto-placeholder.svg.
// Não representa a pessoa, não é hotlink de imprensa e não exige
// verificação HTTP externa (já está no próprio repositório). Isso
// garante que o perfil eleitoral funcione sem foto, mesmo antes de
// concluir o lote de auditoria de fotos 1–10/11–20/21–24 já entregue
// em P4 para os deputados distritais, e antes da coleta de fotos dos
// demais nomes monitorados (governador/vice, senador, deputado
// federal, deputado distrital).
//
// Uso:
//
//   import { placeholderFoto } from '@/data/foto-placeholder';
//
//   const pessoa: PessoaEleitoral = {
//     ...outros campos,
//     foto: placeholderFoto('Foto pendente de verificação para Governador do DF'),
//   };
//
// O argumento `motivo` é registrado no campo `credito` para tornar
// visível, na própria estrutura, por que o placeholder está em uso.
// ---------------------------------------------------------------------------

const PLACEHOLDER_URL = '/foto-placeholder.svg';
const PLACEHOLDER_MIME = 'image/svg+xml';
const PLACEHOLDER_LARGURA = 240;
const PLACEHOLDER_ALTURA = 240;

/**
 * URL da fonte do placeholder. Aponta para o arquivo estático desta
 * constante no repositório (mesma origem da imagem). Como o arquivo
 * faz parte do build, não há dependência externa — o placeholder
 * sempre renderiza quando o perfil é acessado.
 */
export const PLACEHOLDER_FONTE_URL =
  'https://github.com/seudeputado-df/deputados-distritais-df-2026/blob/main/src/data/foto-placeholder.ts';

/**
 * Fonte humana-legível do placeholder. Quem consome a estrutura
 * sabe imediatamente que se trata de imagem genérica, não-fotográfica.
 */
export const PLACEHOLDER_FONTE = 'Placeholder de foto — repositório';

/**
 * Data de verificação editorial do placeholder. Fixa no esquema do
 * repositório para manter a base determinística enquanto a imagem
 * placeholder permanecer idêntica. Se o SVG placeholder mudar (por
 * exemplo, adoção de identidade visual), a data deve ser atualizada.
 */
export const PLACEHOLDER_VERIFICADA_EM = '2026-07-31';

/**
 * Licença/base de uso do placeholder. Equivale a informar que a
 * imagem é genérica, parte do produto, e não depende de licença
 * externa.
 */
export const PLACEHOLDER_LICENCA: LicencaFoto = 'placeholder';

/**
 * Cria uma FotografiaEleitoral padronizada do tipo placeholder.
 *
 * O argumento `motivo` é registrado no campo `credito` para tornar
 * explícita a razão do placeholder (por exemplo: "Foto pendente de
 * verificação para Governador do DF"). Se omitido, usa uma mensagem
 * genérica.
 *
 * Importante: este objeto nunca deve ser declarado como foto real
 * de nenhuma pessoa. A identidade da pessoa NÃO é derivada da
 * imagem — apenas o nome/registro oficial sustenta a identidade.
 * Quem renderiza o placeholder é responsável por não afirmar, em
 * texto, que a imagem é a pessoa.
 */
export function placeholderFoto(
  motivo: string = 'Foto pendente de verificação — placeholder honesto.',
): FotografiaEleitoral {
  return {
    url: PLACEHOLDER_URL,
    fonte: PLACEHOLDER_FONTE,
    urlFonte: PLACEHOLDER_FONTE_URL,
    licenca: PLACEHOLDER_LICENCA,
    mime: PLACEHOLDER_MIME,
    largura: PLACEHOLDER_LARGURA,
    altura: PLACEHOLDER_ALTURA,
    verificadaEm: PLACEHOLDER_VERIFICADA_EM,
    credito: motivo,
  };
}

/**
 * Indica se uma FotografiaEleitoral é o placeholder honesto desta
 * constante. Útil para componentes que precisam suprimir textos que
 * afirmem tratar-se de foto real (por exemplo, "foto oficial" no
 * alt ou na legenda).
 */
export function isPlaceholderFoto(
  foto: FotografiaEleitoral | null | undefined,
): boolean {
  if (!foto) return false;
  return (
    foto.licenca === 'placeholder' &&
    foto.url === PLACEHOLDER_URL &&
    foto.fonte === PLACEHOLDER_FONTE
  );
}
