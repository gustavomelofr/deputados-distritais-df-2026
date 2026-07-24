import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { execSync } from "node:child_process";
import "./globals.css";

// Data da última atualização do site, derivada do último commit do git.
// Calculada em build time — sempre factual, nunca hardcoded.
function getUltimaAtualizacao(): string {
  try {
    const iso = execSync("git log -1 --format=%cI", {
      encoding: "utf-8",
      timeout: 5000,
    }).trim();
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

const ultimaAtualizacao = getUltimaAtualizacao();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Deputados Distritais DF 2026 — Monitor Independente",
  description:
    "Monitoramento independente dos 24 deputados distritais do Distrito Federal. Proposições, votações, presença, gastos e cobertura jornalística organizados com contexto editorial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <header className="border-b border-zinc-200 bg-white">
          <nav className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <a href="/" className="text-lg font-bold tracking-tight text-zinc-900">
                Deputados Distritais <span className="text-blue-600">DF 2026</span>
              </a>
              <span
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-600/20"
                title="Agente autônomo monitorando fontes públicas continuamente"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-600"></span>
                </span>
                agente ativo
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium text-zinc-600">
              <a href="/deputados-distritais" className="hover:text-zinc-900 transition">
                Deputados
              </a>
              <a href="/noticias" className="hover:text-zinc-900 transition">
                Notícias
              </a>
              <a href="/cenario-2026" className="hover:text-zinc-900 transition">
                Cenário 2026
              </a>
              <a href="/monitor-instagram" className="hover:text-zinc-900 transition">
                Instagram
              </a>
              <a href="/metodologia" className="hover:text-zinc-900 transition">
                Metodologia
              </a>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-200 bg-zinc-100 py-8 text-xs text-zinc-500">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <p className="font-semibold text-zinc-700 text-sm mb-2">
              Deputados Distritais DF 2026
            </p>
            <p>Monitor independente dos 24 deputados distritais do Distrito Federal.</p>
            <p className="mt-2">
              Dados públicos organizados para fins informativos e analíticos.
              Não é página oficial da CLDF ou de órgão público.
            </p>
            <p className="mt-4 text-zinc-400 text-[11px]">
              {ultimaAtualizacao
                ? `Última atualização: ${ultimaAtualizacao} (agente autônomo)`
                : "Atualizado continuamente por agente autônomo"}
            </p>
            <p className="mt-3">
              <a
                href="https://github.com/gustavomelofr/deputados-distritais-df-2026"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Repositório do projeto no GitHub (abre em nova aba)"
                className="underline hover:text-zinc-700"
              >
                GitHub
              </a>
              <span className="mx-2">·</span>
              <a
                href="https://www.cl.df.gov.br"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Site oficial da Câmara Legislativa do Distrito Federal (abre em nova aba)"
                className="underline hover:text-zinc-700"
              >
                CLDF
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
