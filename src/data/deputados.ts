import { DeputadoDistrital } from '@/types';

export const deputados: DeputadoDistrital[] = [
  {
    id: '1',
    slug: 'deputado-exemplo',
    nome: 'Deputado Exemplo',
    nomeCompleto: 'Deputado Exemplo da Silva',
    partido: 'PARTIDO',
    foto: '/candidates/placeholder.svg',
    biografia: 'Biografia do deputado distrital.',
    comissoes: ['Comissão de Constituição e Justiça'],
    contatos: { email: 'dep.exemplo@cl.df.gov.br' },
    proposicoes: [],
    presenca: [],
    gastos: [],
    statusMandato: 'exercicio',
  },
];
