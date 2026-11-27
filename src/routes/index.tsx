import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ClipboardPlus, Clock3, Factory, Ruler } from "lucide-react";
import { useDemonstration } from "@/components/burncare/store";
import { STATUS_INFO, calculateIndicators, formatDate } from "@/lib/burncare/model";

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
  const metrics = calculateIndicators(state.orders);
  const cards = [
    { label: "Pedidos em aberto", value: metrics.open, icon: ClipboardPlus },
    { label: "No fornecedor", value: metrics.production, icon: Factory },
    { label: "Aguardando prova", value: metrics.fitting, icon: Ruler },
    { label: "Concluídos", value: metrics.done, icon: CheckCircle2 },
  ];
  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[1.5px] text-primary">Painel operacional</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Visão geral</h1><p className="mt-2 text-sm text-muted-foreground">Acompanhe as solicitações fictícias de malhas compressivas.</p></div><Link to="/novo-pedido" className="btn-primary no-underline"><ClipboardPlus className="size-4" /> Novo pedido</Link></div>
    {storageWarning && <p role="alert" className="mt-5 rounded-lg bg-warning p-3 text-sm text-warning-foreground">{storageWarning}</p>}
    <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon }) => <div key={label} className="card p-5"><div className="flex items-start justify-between"><p className="text-4xl font-semibold tracking-tight text-primary">{value}</p><span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="size-5" /></span></div><p className="mt-3 text-sm text-muted-foreground">{label}</p></div>)}</section>
    <section className="card mt-6 overflow-hidden"><div className="flex items-center justify-between border-b p-5"><div><h2 className="text-lg font-semibold">Pedidos recentes</h2><p className="mt-1 text-sm text-muted-foreground">Dados compartilhados com o histórico e o novo pedido.</p></div><Link to="/historico" className="hidden items-center gap-1 text-sm font-semibold text-primary no-underline sm:flex">Ver histórico <ArrowRight className="size-4" /></Link></div>
      <div className="divide-y">{state.orders.slice(0, 5).map((order) => <Link key={order.id} to="/pedidos/$id" params={{ id: order.id }} className="flex flex-wrap items-center gap-3 p-4 no-underline transition-colors hover:bg-muted sm:p-5"><span className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground"><Clock3 className="size-4" /></span><div className="min-w-0 flex-1"><p className="font-semibold">{order.patientName}</p><p className="mt-1 text-xs text-muted-foreground">{order.id} · {order.products[0]?.description ?? "Produto não informado"}</p></div><div className="text-right"><span className={`status-badge ${STATUS_INFO[order.status].className}`}>{STATUS_INFO[order.status].label}</span><p className="mt-2 text-xs text-muted-foreground">{formatDate(order.createdAt)}</p></div></Link>)}</div>
    </section>
    <p className="mt-5 text-xs leading-5 text-muted-foreground">Ambiente demonstrativo — dados fictícios armazenados somente neste navegador, sem autenticação ou integração hospitalar.</p>
  </div>;
}
