import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Search } from "lucide-react";
import { useState } from "react";
import { useDemonstration } from "@/components/burncare/store";
import { STATUS, STATUS_INFO, filterOrders, formatDate } from "@/lib/burncare/model";

export const Route = createFileRoute("/documentos/")({
  head: () => ({ meta: [
    { title: "Documentos | BurnCare CTQ HU" },
    { name: "description", content: "Resumos, fichas de medidas e comprovantes demonstrativos organizados por pedido." },
    { property: "og:title", content: "Documentos | BurnCare CTQ HU" },
    { property: "og:description", content: "Documentos demonstrativos sem validade clínica, prontos para impressão." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { state } = useDemonstration();
  const [search, setSearch] = useState("");
  const orders = filterOrders(state.orders, { term: search });
  return <div>
    <p className="text-xs font-bold uppercase tracking-[1.5px] text-primary">Gestão documental</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Documentos</h1><p className="mt-2 text-sm text-muted-foreground">Documentos demonstrativos gerados a partir de cada pedido — sem validade clínica.</p>
    <div className="card mt-6 p-4"><label className="relative block"><span className="sr-only">Buscar documentos</span><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input className="field pl-10" placeholder="Paciente, nº do pedido ou prontuário" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{orders.map((order) => <Link key={order.id} to="/documentos/$id" params={{ id: order.id }} className="card block p-5 no-underline hover:border-primary">
      <div className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-muted-foreground">{order.id}</span><span className={`status-badge ${STATUS_INFO[order.status].className}`}>{STATUS_INFO[order.status].label}</span></div>
      <h2 className="mt-3 font-semibold">{order.patientName}</h2><p className="mt-1 text-xs text-muted-foreground">Pedido em {formatDate(order.createdAt)}</p>
      <ul className="mt-3 space-y-1 text-sm"><li className="flex items-center gap-2"><FileText className="size-4 text-primary" /> Resumo da solicitação</li><li className="flex items-center gap-2"><FileText className="size-4 text-primary" /> Ficha de medidas</li><li className="flex items-center gap-2"><FileText className="size-4 text-primary" /> {order.attachments.length} anexo(s)</li>{order.status === STATUS.ENTREGUE && <li className="flex items-center gap-2"><FileText className="size-4 text-primary" /> Comprovante de entrega</li>}</ul>
    </Link>)}</div>
  </div>;
}
