import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { useDemonstration } from "@/components/burncare/store";
import { STATUS, STATUS_INFO, formatDate } from "@/lib/burncare/model";

const filters = [
  ["TODOS", "Todos", []], ["ABERTOS", "Em aberto", []], ["PRODUCAO", "Fornecedor", [STATUS.ENVIADO_CONFECCAO, STATUS.EM_PRODUCAO, STATUS.EM_TRANSPORTE]],
  ["PROVA", "Aguardando prova", [STATUS.AGUARDANDO_PROVA]], ["AJUSTE", "Em ajuste", [STATUS.EM_AJUSTE]],
  ["ENTREGA", "Prontos p/ entrega", [STATUS.PRONTA_ENTREGA]], ["CONCLUIDOS", "Concluídos", [STATUS.ENTREGUE]],
] as const;

export const Route = createFileRoute("/historico")({
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
  const [filter, setFilter] = useState("TODOS");
  const [search, setSearch] = useState("");
  const selected = filters.find((item) => item[0] === filter) ?? filters[0];
  const orders = state.orders.filter((order) => {
    const statusMatch = filter === "TODOS" ? true : filter === "ABERTOS" ? order.status !== STATUS.ENTREGUE : (selected?.[2] as readonly string[]).includes(order.status);
    const term = search.trim().toLocaleLowerCase("pt-BR");
    const searchMatch = !term || `${order.id} ${order.patientName} ${order.recordNumber}`.toLocaleLowerCase("pt-BR").includes(term);
    return statusMatch && searchMatch;
  });
  return <div>
    <p className="text-xs font-bold uppercase tracking-[1.5px] text-primary">Acompanhamento</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Histórico de pedidos</h1><p className="mt-2 text-sm text-muted-foreground">Acompanhe fornecedor, prova, ajustes e entrega das malhas compressivas.</p>
    <div className="card mt-6 p-4 sm:p-5"><label className="relative block"><span className="sr-only">Buscar pedidos</span><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input className="field pl-10" placeholder="Buscar por paciente, nº do pedido ou prontuário" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      <div className="mt-4 flex flex-wrap gap-2">{filters.map(([key, label]) => { const count = state.orders.filter((order) => key === "TODOS" ? true : key === "ABERTOS" ? order.status !== STATUS.ENTREGUE : (filters.find((item) => item[0] === key)?.[2] as readonly string[]).includes(order.status)).length; return <button key={key} type="button" onClick={() => setFilter(key)} className={`chip ${filter === key ? "chip-active" : ""}`}>{label} ({count})</button>; })}</div>
    </div>
    <div className="mt-5 grid gap-3 lg:grid-cols-2">{orders.map((order) => <Link key={order.id} to="/pedidos/$id" params={{ id: order.id }} className="card block p-5 no-underline transition-transform hover:-translate-y-0.5 hover:border-primary"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold text-muted-foreground">{order.id}</span><span className={`status-badge ${STATUS_INFO[order.status].className}`}>{STATUS_INFO[order.status].label}</span></div><h2 className="mt-3 text-lg font-semibold">{order.patientName}</h2><p className="mt-1 text-sm text-muted-foreground">{order.products.map((product) => product.description).join(" · ")}</p><p className="mt-3 text-xs text-muted-foreground">{order.requestType} · {order.supplier} · pedido em {formatDate(order.createdAt)}{order.adjustments.length > 0 ? ` · ${order.adjustments.length} ajuste(s)` : ""}</p></Link>)}</div>
    {orders.length === 0 && <div className="card mt-5 p-8 text-center"><h2 className="font-semibold">Nenhum pedido encontrado</h2><p className="mt-1 text-sm text-muted-foreground">Altere o filtro ou a busca.</p></div>}
    <p className="mt-5 text-xs text-muted-foreground">Ambiente demonstrativo — registros locais, sem integração com fornecedores ou com o HU.</p>
  </div>;
}
