export default function MonitorInstagramPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2">
        Radar Instagram
      </h1>
      <p className="text-lg text-zinc-500 mb-10">
        Monitoramento da atividade pública dos deputados distritais no Instagram.
      </p>

      <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
        <div className="text-5xl mb-4">📱</div>
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">
          Em implementação
        </h2>
        <p className="text-zinc-500 max-w-md mx-auto leading-relaxed">
          O monitoramento de Instagram está sendo configurado. Em breve você poderá
          acompanhar aqui os posts públicos dos 24 deputados distritais.
        </p>
        <p className="text-zinc-400 text-sm mt-4">
          Serão monitorados: frequência de posts, temas abordados, engajamento e
          menções a outros políticos.
        </p>
      </div>
    </div>
  );
}
