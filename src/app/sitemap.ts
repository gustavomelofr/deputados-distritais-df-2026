import type { MetadataRoute } from 'next';
import { deputados } from '@/data/deputados';

// Gera /sitemap.xml via convenção de metadados do Next.js App Router.
// Lista as rotas estáticas do site e os perfis individuais de cada
// deputado distrital, derivados dos dados reais (fonte: CLDF — P1).
// Não inventa URLs: todas as rotas correspondem a páginas existentes.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const rotasEstaticas: MetadataRoute.Sitemap = [
    { url: '/', lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    {
      url: '/deputados-distritais',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: '/atividade-legislativa',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: '/noticias',
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: '/atualizacoes',
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: '/cenario-2026',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: '/comparar',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: '/analise',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: '/monitor-instagram',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: '/metodologia',
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];

  // Perfis individuais dos 24 deputados distritais — rotas dinâmicas reais.
  const perfisDeputados: MetadataRoute.Sitemap = deputados.map((d) => ({
    url: `/deputados-distritais/${d.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...rotasEstaticas, ...perfisDeputados];
}
