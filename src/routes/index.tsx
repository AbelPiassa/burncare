import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, ClipboardPlus, Clock3, Users } from "lucide-react";
import { useDemonstration } from "@/components/burncare/store";
import { PROFILE_INFO, STATUS_INFO, STATUS_ORDER, calculateIndicators, canProfileAct, formatDate, statusSummary } from "@/lib/burncare/model";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Visão geral | BurnCare CTQ HU" },
    { name: "description", content: "Resumo demonstrativo dos pedidos de malhas compressivas do CTQ HU." },
    { property: "og:title", content: "Visão geral | BurnCare CTQ HU" },
    { property: "og:description", content: "Acompanhe os pedidos fictícios de malhas compressivas em um só lugar." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: HomePage,
});

function HomePage() {
  const { state, storageWarning } = useDemonstration();
  const profile = state.profile ?? "CTQ";
  const metrics = calculateIndicators(state.orders);
  const summary = statusSummary(state.orders);
  const pending = state.orders.filter((order) => canProfileAct(profile, order.status))
    .sort((a, b) => (a.history.at(-1)?.date ?? a.createdAt).localeCompare(b.history.at(-1)?.date ?? b.createdAt)).slice(0, 5);
  const recent = [...state.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)).slice(0, 5);
  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[1.5px] text-primary">Painel operacional · {PROFILE_INFO[profile].label}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Visão geral</h1><p className="mt-2 text-sm text-muted-foreground">Indicadores calculados a partir dos {state.orders.length} pedidos fictícios salvos neste navegador.</p></div>
      {profile === "CTQ" && <div className="flex flex-wrap gap-2"><Link to="/pacientes" className="btn-secondary no-underline"><Users className="size-4" /> Pacientes</Link><Link to="/novo-pedido" className="btn-primary no-underline"><ClipboardPlus className="size-4" /> Novo pedido</Link></div>}</div>
    {storageWarning && <p role="alert" className="mt-5 rounded-lg bg-warning p-3 text-sm text-warning-foreground">{storageWarning}</p>}
    <section aria-label="Resumo por status" className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
      <Link to="/historico" search={{ status: "ABERTOS" }} className="card p-4 no-underline hover:border-primary"><p className="text-3xl font-semibold text-primary">{metrics.open}</p><p className="mt-2 text-xs text-muted-foreground">Em aberto</p></Link>
      {STATUS_ORDER.map((status) => <Link key={status} to="/historico" search={{ status }} className="card p-4 no-underline hover:border-primary"><p className="text-3xl font-semibold">{summary[status]}</p><p className="mt-2 text-xs text-muted-foreground">{STATUS_INFO[status].label}</p></Link>)}
    </section>
    <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
      <section className="card overflow-hidden"><div className="border-b p-5"><h2 className="flex items-center gap-2 text-lg font-semibold"><AlertCircle className="size-5 text-primary" /> Pendências do perfil</h2><p className="mt-1 text-sm text-muted-foreground">Pedidos cuja próxima etapa cabe a {PROFILE_INFO[profile].label}, do mais antigo para o mais recente.</p></div>
        <OrderList orders={pending} empty="Nenhuma pendência para este perfil." />
      </section>
      <section className="card overflow-hidden"><div className="flex items-center justify-between border-b p-5"><div><h2 className="text-lg font-semibold">Pedidos recentes</h2><p className="mt-1 text-sm text-muted-foreground">Mesma base do histórico.</p></div><Link to="/historico" className="flex items-center gap-1 text-sm font-semibold text-primary no-underline">Ver todos <ArrowRight className="size-4" /></Link></div>
        <OrderList orders={recent} empty="Nenhum pedido cadastrado." />
      </section>
    </div>
    <p className="mt-5 text-xs leading-5 text-muted-foreground">Ambiente demonstrativo — dados fictícios armazenados somente neste navegador, sem autenticação real ou integração hospitalar.</p>
  </div>;
}

function OrderList({ orders, empty }: { orders: ReturnType<typeof useDemonstration>["state"]["orders"]; empty: string }) {
  if (orders.length === 0) return <p className="p-5 text-sm text-muted-foreground">{empty}</p>;
  return <div className="divide-y">{orders.map((order) => <Link key={order.id} to="/pedidos/$id" params={{ id: order.id }} className="flex flex-wrap items-center gap-3 p-4 no-underline transition-colors hover:bg-muted"><span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground"><Clock3 className="size-4" /></span><div className="min-w-0 flex-1"><p className="font-semibold">{order.patientName}</p><p className="mt-1 truncate text-xs text-muted-foreground">{order.id} · {order.products[0]?.description ?? "Produto não informado"}</p></div><div className="text-right"><span className={`status-badge ${STATUS_INFO[order.status].className}`}>{STATUS_INFO[order.status].label}</span><p className="mt-1 text-xs text-muted-foreground">{formatDate(order.history.at(-1)?.date ?? order.createdAt)}</p></div></Link>)}</div>;
}
