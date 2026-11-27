import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, Cross, FileClock, LayoutDashboard, Plus, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { useDemonstration } from "./store";

const navigation = [
  { to: "/", label: "Visão geral", icon: LayoutDashboard },
  { to: "/novo-pedido", label: "Novo pedido", icon: Plus },
  { to: "/historico", label: "Histórico", icon: FileClock },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { resetDemonstration } = useDemonstration();

  return (
    <div className="min-h-screen lg:flex">
      <aside className="bg-secondary text-secondary-foreground lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:p-5">
        <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-2 lg:py-0">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <span className="grid size-10 place-items-center rounded-xl bg-primary"><Cross className="size-5" /></span>
            <span>
              <span className="block text-xl font-semibold tracking-tight">BurnCare</span>
              <span className="hidden text-[10px] font-medium tracking-[1.4px] text-secondary-foreground/65 lg:block">CTQ · HOSPITAL UNIVERSITÁRIO</span>
            </span>
          </Link>
          <ClipboardList className="size-5 lg:hidden" aria-hidden="true" />
        </div>
        <nav aria-label="Navegação principal" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:mt-9 lg:flex-col lg:px-0 lg:pb-0">
          {navigation.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to) || (to === "/historico" && pathname.startsWith("/pedidos/"));
            return (
              <Link key={to} to={to} aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium no-underline transition-colors ${active ? "bg-primary text-primary-foreground" : "text-secondary-foreground/75 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"}`}>
                <Icon className="size-4" />{label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden rounded-xl border border-secondary-foreground/15 p-4 lg:block">
          <p className="text-xs leading-5 text-secondary-foreground/65">Protótipo acadêmico local. Nenhuma informação é enviada a serviços externos.</p>
          <button type="button" onClick={resetDemonstration} className="mt-3 flex items-center gap-2 text-xs font-semibold text-secondary-foreground hover:underline">
            <RotateCcw className="size-3.5" /> Reiniciar demonstração
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1 lg:ml-64">
        <header className="border-b bg-card px-4 py-3 sm:px-7 lg:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Hospital Universitário de Londrina · CTQ</p>
              <p className="text-xs text-muted-foreground">Gestão demonstrativa de malhas compressivas</p>
            </div>
            <span className="rounded-md bg-warning px-2.5 py-1.5 text-center text-[10px] font-bold tracking-wide text-warning-foreground sm:text-xs">SIMULAÇÃO — SEM DADOS REAIS</span>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-7 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
