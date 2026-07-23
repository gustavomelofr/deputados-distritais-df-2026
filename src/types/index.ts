export interface DeputadoDistrital {
  id: string;
  slug: string;
  nome: string;
  nomeCompleto: string;
  partido: string;
  foto: string;
  biografia: string;
  comissoes: string[];
  contatos: {
    email?: string;
    telefone?: string;
    instagram?: string;
    twitter?: string;
  };
  proposicoes: Proposicao[];
  presenca: Sessao[];
  gastos: Gasto[];
  statusMandato: 'exercicio' | 'licenca' | 'suplente';
}

export interface Proposicao {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  tipo: 'projeto_de_lei' | 'indicacao' | 'requerimento' | 'emenda';
  status: 'apresentada' | 'em_tramitacao' | 'aprovada' | 'rejeitada';
  link: string;
}

export interface Sessao {
  id: string;
  data: string;
  descricao: string;
  presente: boolean;
}

export interface Gasto {
  id: string;
  tipo: string;
  valor: number;
  data: string;
  descricao: string;
}

export interface Noticia {
  id: string;
  titulo: string;
  fonte: string;
  url: string;
  data: string;
  resumo: string;
  deputadosRelacionados: string[];
}

export interface PostInstagram {
  id: string;
  autor: string;
  texto: string;
  data: string;
  url: string;
  deputadoSlug: string;
}
