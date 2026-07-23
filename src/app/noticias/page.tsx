import { noticias } from '@/data/noticias';

export default function NoticiasPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2">
        Notícias
      </h1>
      <p className="text-lg text-zinc-500 mb-10">
        Cobertura jornalística sobre a Câmara Legislativa do Distrito Federal e
        seus 24 deputados distritais. Atualizado automaticamente.
      </p>

      {noticias.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
          <p className="text-zinc-400 text-lg">Nenhuma notícia encontrada ainda.</p>
          <p className="text-zinc-400 text-sm mt-2">
            As notícias serão carregadas automaticamente das fontes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {noticias.map((n) => (
            <a
              key={n.id}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-zinc-200 bg-white p-5 hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-zinc-900 leading-snug">
                    {n.titulo}
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">{n.fonte}</p>
                </div>
                <span className="text-xs text-zinc-400 whitespace-nowrap mt-1">
                  {new Date(n.data).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed line-clamp-2">
                {n.resumo}
              </p>
              {n.deputadosRelacionados.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {n.deputadosRelacionados.map((slug) => {
                    const nome = {
                      'chico-vigilante': 'Chico Vigilante',
                      'fabio-felix': 'Fábio Felix',
                      'max-maciel': 'Max Maciel',
                      'gabriel-magno': 'Gabriel Magno',
                      'thiago-manzoni': 'Thiago Manzoni',
                      'dayse-amarilio': 'Dayse Amarilio',
                      'jaqueline-silva': 'Jaqueline Silva',
                      'paula-belmonte': 'Paula Belmonte',
                      'doutora-jane': 'Doutora Jane',
                      'martins-machado': 'Martins Machado',
                      'joaquim-roriz-neto': 'Joaquim Roriz Neto',
                      'joao-cardoso': 'João Cardoso',
                      'roosevelt-vilela': 'Roosevelt Vilela',
                      'ricardo-vale': 'Ricardo Vale',
                    }[slug] || slug;
                    return (
                      <span
                        key={slug}
                        className="rounded-full bg-blue-50 text-blue-700 text-xs px-2 py-0.5"
                      >
                        {nome}
                      </span>
                    );
                  })}
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
