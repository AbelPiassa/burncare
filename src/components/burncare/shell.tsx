import { Link, useRouterState } from "@tanstack/react-router";
import { Cross, Factory, FileClock, FileText, LayoutDashboard, LogOut, Plus, RotateCcw, Stethoscope, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { PROFILE_INFO, type Profile } from "@/lib/burncare/model";
import { useDemonstration } from "./store";

const navigation = [
  { to: "/", label: "Visão geral", icon: LayoutDashboard, profiles: ["CTQ", "FORNECEDOR"] },
  { to: "/pacientes", label: "Pacientes", icon: Users, profiles: ["CTQ"] },
  { to: "/novo-pedido", label: "Novo pedido", icon: Plus, profiles: ["CTQ"] },
  { to: "/historico", label: "Pedidos", icon: FileClock, profiles: ["CTQ", "FORNECEDOR"] },
  { to: "/documentos", label: "Documentos", icon: FileText, profiles: ["CTQ"] },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { state, loaded, setProfile } = useDemonstration();

  if (!loaded) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground" role="status">Carregando demonstração…</div>;
  if (!state.profile) return <AccessScreen onSelect={setProfile} />;
  const profile = state.profile;

  return (
    <div className="min-h-screen lg:flex">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-card focus:p-2">Pular para o conteúdo</a>
      <aside className="bg-secondary text-secondary-foreground lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:p-5">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:block lg:px-2 lg:py-0">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <span className="grid size-10 place-items-center rounded-xl bg-primary"><Cross className="size-5" /></span>
            <span>
              <span className="block text-xl font-semibold tracking-tight">BurnCare</span>
              <span className="hidden text-[10px] font-medium tracking-[1.4px] text-secondary-foreground/65 lg:block">CTQ · HOSPITAL UNIVERSITÁRIO</span>
            </span>
          </Link>
          <ProfileBadge profile={profile} onSwitch={() => setProfile(null)} className="lg:hidden" />
        </div>
        <nav aria-label="Navegação principal" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:mt-9 lg:flex-col lg:px-0 lg:pb-0">
          {navigation.filter((item) => (item.profiles as readonly string[]).includes(profile)).map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to) || (to === "/historico" && pathname.startsWith("/pedidos/"));
            return (
              <Link key={to} to={to} aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium no-underline transition-colors ${active ? "bg-primary text-primary-foreground" : "text-secondary-foreground/75 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"}`}>
                <Icon className="size-4" />{profile === "FORNECEDOR" && to === "/historico" ? "Solicitações" : label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden space-y-3 lg:block">
          <ProfileBadge profile={profile} onSwitch={() => setProfile(null)} />
          <div className="rounded-xl border border-secondary-foreground/15 p-4">
            <p className="text-xs leading-5 text-secondary-foreground/65">Protótipo acadêmico local. Nenhuma informação é enviada a serviços externos.</p>
            <ResetButton />
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1 lg:ml-64">
        <header className="border-b bg-card px-4 py-3 sm:px-7 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Hospital Universitário de Londrina · CTQ</p>
              <p className="text-xs text-muted-foreground">Gestão demonstrativa de malhas compressivas · perfil <strong>{PROFILE_INFO[profile].label}</strong></p>
            </div>
            <span className="rounded-md bg-warning px-2.5 py-1.5 text-center text-[10px] font-bold tracking-wide text-warning-foreground sm:text-xs">SIMULAÇÃO — SEM DADOS REAIS</span>
          </div>
        </header>
        <main id="conteudo" className="mx-auto max-w-7xl px-4 py-6 sm:px-7 lg:px-10 lg:py-8">{children}</main>
        <div className="no-print px-4 pb-6 lg:hidden"><div className="card p-4"><ResetButton dark={false} /></div></div>
      </div>
    </div>
  );
}

function ProfileBadge({ profile, onSwitch, className = "" }: { profile: Profile; onSwitch: () => void; className?: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl bg-secondary-foreground/10 p-2.5 ${className}`}>
      <span className="grid size-8 place-items-center rounded-lg bg-primary">{profile === "CTQ" ? <Stethoscope className="size-4" /> : <Factory className="size-4" />}</span>
      <span className="min-w-0 flex-1"><span className="block text-[10px] uppercase tracking-wider text-secondary-foreground/65">Perfil ativo</span><span className="block truncate text-sm font-semibold">{PROFILE_INFO[profile].label}</span></span>
      <button type="button" onClick={onSwitch} className="rounded-md p-1.5 hover:bg-secondary-foreground/15" aria-label="Trocar perfil"><LogOut className="size-4" /></button>
    </div>
  );
}

function ResetButton({ dark = true }: { dark?: boolean }) {
  const { resetDemonstration } = useDemonstration();
  const [confirming, setConfirming] = useState(false);
  const tone = dark ? "text-secondary-foreground" : "text-foreground";
  if (!confirming) return <button type="button" onClick={() => setConfirming(true)} className={`mt-3 flex items-center gap-2 text-xs font-semibold hover:underline ${tone}`}><RotateCcw className="size-3.5" /> Reiniciar demonstração</button>;
  return (
    <div role="alertdialog" aria-label="Confirmar reinício" className={`mt-3 text-xs ${tone}`}>
      <p className="leading-5">Todos os pedidos, pacientes e rascunhos locais voltarão ao estado inicial. Confirmar?</p>
      <div className="mt-2 flex gap-2">
        <button type="button" className="rounded-md bg-danger px-2.5 py-1.5 font-semibold text-danger-foreground" onClick={() => { resetDemonstration(); setConfirming(false); }}>Sim, reiniciar</button>
        <button type="button" className="rounded-md border border-current px-2.5 py-1.5 font-semibold" onClick={() => setConfirming(false)}>Cancelar</button>
      </div>
    </div>
  );
}

function AccessScreen({ onSelect }: { onSelect: (profile: Profile) => void }) {
  return (
    <main className="grid min-h-screen bg-secondary text-secondary-foreground lg:grid-cols-[1.1fr_1fr]">
      <section className="flex flex-col justify-between p-8 sm:p-12">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-primary"><Cross className="size-5" /></span><span><span className="block text-2xl font-semibold">BurnCare</span><span className="text-[11px] tracking-[1.4px] text-secondary-foreground/65">CTQ · HOSPITAL UNIVERSITÁRIO DE LONDRINA</span></span></div>
        <div className="my-12 max-w-lg"><h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Gestão de malhas compressivas para o Centro de Tratamento de Queimados</h1><p className="mt-4 text-sm leading-6 text-secondary-foreground/75">Solicitação, confecção, prova, ajustes e entrega em um fluxo único — nesta versão, exclusivamente com dados fictícios.</p></div>
        <p className="text-xs text-secondary-foreground/60">Protótipo acadêmico. Não homologado para uso hospitalar.</p>
      </section>
      <section className="flex items-center bg-background p-6 text-foreground sm:p-12">
        <div className="mx-auto w-full max-w-md">
          <span className="rounded-md bg-warning px-2.5 py-1.5 text-xs font-bold text-warning-foreground">SIMULAÇÃO — SEM DADOS REAIS</span>
          <h2 className="mt-5 text-2xl font-semibold">Acesso demonstrativo</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Escolha um perfil para explorar o sistema. <strong>Não há autenticação real:</strong> o perfil apenas organiza a demonstração e não protege informações.</p>
          <div className="mt-6 space-y-3">
            {(["CTQ", "FORNECEDOR"] as const).map((profile) => (
              <button key={profile} type="button" onClick={() => onSelect(profile)} className="card flex w-full items-start gap-4 p-5 text-left transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-primary">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">{profile === "CTQ" ? <Stethoscope className="size-5" /> : <Factory className="size-5" />}</span>
                <span><span className="block font-semibold">Entrar como {PROFILE_INFO[profile].label}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{PROFILE_INFO[profile].description}</span></span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export function RequireCtq({ children }: { children: ReactNode }) {
  const { state } = useDemonstration();
  if (state.profile === "CTQ") return <>{children}</>;
  return <div className="card p-8 text-center"><h1 className="text-xl font-semibold">Área da Equipe CTQ</h1><p className="mt-2 text-sm text-muted-foreground">O perfil Fornecedor não acessa esta área na demonstração.</p><Link to="/historico" className="btn-primary mt-5 no-underline">Ver solicitações</Link></div>;
}
