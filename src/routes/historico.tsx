import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { useDemonstration } from "@/components/burncare/store";
import { STATUS_INFO, STATUS_ORDER, filterOrders, formatDate } from "@/lib/burncare/model";

const filters: Array<[string, string]> = [["TODOS", "Todos"], ["ABERTOS", "Em aberto"], ...STATUS_ORDER.map((status): [string, string] => [status, STATUS_INFO[status].label])];

export const Route = createFileRoute("/historico")({
  validateSearch: (search: Record<string, unknown>): { status?: string } => {
    const status = typeof search["status"] === "string" ? search["status"] : undefined;
    return status && filters.some(([key]) => key === status) ? { status } : {};
  },
  head: () => ({ meta: [
    { title: "Histórico de pedidos | BurnCare CTQ HU" },
    { name: "description", content: "Acompanhamento demonstrativo de produção, prova, ajustes e entrega." },
    { property: "og:title", content: "Histórico de pedidos | BurnCare CTQ HU" },
    { property: "og:description", content: "Consulte e atualize os pedidos fictícios de malhas compressivas." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { state } = useDemonstration();
  const { status = "TODOS" } = Route.useSearch();
  const navigate = useNavigate({ from: "/historico" });
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const orders = filterOrders(state.orders, { status, term: search, from, to });
  const supplier = state.profile === "FORNECEDOR";
  return <div>
    <p className="text-xs font-bold uppercase tracking-[1.5px] text-primary">Acompanhamento</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{supplier ? "Solicitações encaminhadas" : "Histórico de pedidos"}</h1><p className="mt-2 text-sm text-muted-foreground">Fornecedor, prova, ajustes e entrega das malhas compressivas — mesma base do painel e do novo pedido.</p>
    <div className="card mt-6 p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_160px]">
        <label className="relative block"><span className="sr-only">Buscar pedidos</span><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input className="field pl-10" placeholder="Paciente, nº do pedido ou prontuário" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <label><span className="sr-only">Pedidos a partir de</span><input aria-label="Pedidos a partir de" className="field" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
        <label><span className="sr-only">Pedidos até</span><input aria-label="Pedidos até" className="field" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">{filters.map(([key, label]) => <button key={key} type="button" aria-pressed={status === key} onClick={() => void navigate({ search: key === "TODOS" ? {} : { status: key } })} className={`chip ${status === key ? "chip-active" : ""}`}>{label} ({filterOrders(state.orders, { status: key }).length})</button>)}</div>
      {(from || to || search) && <button type="button" className="mt-3 text-xs font-semibold text-primary underline" onClick={() => { setFrom(""); setTo(""); setSearch(""); }}>Limpar busca e período</button>}
    </div>
    <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">{orders.length} pedido(s) encontrado(s).</p>
    <div className="mt-3 grid gap-3 lg:grid-cols-2">{orders.map((order) => <Link key={order.id} to="/pedidos/$id" params={{ id: order.id }} className="card block p-5 no-underline transition-transform hover:-translate-y-0.5 hover:border-primary"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold text-muted-foreground">{order.id}</span><span className={`status-badge ${STATUS_INFO[order.status].className}`}>{STATUS_INFO[order.status].label}</span></div><h2 className="mt-3 text-lg font-semibold">{order.patientName}</h2><p className="mt-1 text-sm text-muted-foreground">{order.products.map((product) => product.description).join(" · ")}</p><p className="mt-3 text-xs text-muted-foreground">{order.requestType} · {order.supplier} · pedido em {formatDate(order.createdAt)}{order.adjustments.length > 0 ? ` · ${order.adjustments.length} ajuste(s)` : ""}</p></Link>)}</div>
    {orders.length === 0 && <div className="card mt-5 p-8 text-center"><h2 className="font-semibold">Nenhum pedido encontrado</h2><p className="mt-1 text-sm text-muted-foreground">Altere o filtro, o período ou a busca.</p></div>}
    <p className="mt-5 text-xs text-muted-foreground">Ambiente demonstrativo — registros locais, sem integração com fornecedores ou com o HU.</p>
  </div>;
}
