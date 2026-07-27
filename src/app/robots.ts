import type { MetadataRoute } from 'next';

// Gera /robots.txt via convenção de metadados do Next.js App Router.
// Permite indexação por todos os crawlers e aponta para o sitemap.
// O site é um monitor independente de fontes públicas; não há conteúdo
// que precise ser bloqueado dos motores de busca.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: '/sitemap.xml',
  };
}
