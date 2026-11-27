import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useDemonstration } from "@/components/burncare/store";
import { STATUS, STATUS_INFO, calculateBmi, formatDate, type Order } from "@/lib/burncare/model";

export const Route = createFileRoute("/documentos/$id")({
  head: ({ params }) => ({ meta: [
    { title: `Documentos do pedido ${params.id} | BurnCare CTQ HU` },
    { name: "description", content: "Resumo, ficha de medidas, anexos e comprovante demonstrativos do pedido." },
    { property: "og:title", content: `Documentos do pedido ${params.id} | BurnCare CTQ HU` },
    { property: "og:description", content: "Documentos demonstrativos sem validade clínica." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: OrderDocumentsPage,
});

type DocKey = "resumo" | "medidas" | "anexos" | "entrega";

function OrderDocumentsPage() {
  const { id } = Route.useParams();
  const { state } = useDemonstration();
  const [selected, setSelected] = useState<DocKey | "todos">("todos");
  const order = state.orders.find((item) => item.id === id);
  if (!order) return <div className="card p-8 text-center"><h1 className="text-xl font-semibold">Pedido não encontrado</h1><Link to="/documentos" className="btn-primary mt-5 no-underline">Voltar aos documentos</Link></div>;
  const patient = state.patients.find((item) => item.id === order.patientId);
  const docs: Array<[DocKey, string, boolean]> = [["resumo", "Resumo da solicitação", true], ["medidas", "Ficha de medidas", true], ["anexos", "Anexos", true], ["entrega", "Comprovante de entrega", order.status === STATUS.ENTREGUE]];
  const show = (key: DocKey) => selected === "todos" || selected === key;
  return <div>
    <div className="no-print flex flex-wrap items-center justify-between gap-3">
      <Link to="/documentos" className="btn-quiet no-underline"><ArrowLeft className="size-4" /> Documentos</Link>
      <div className="flex flex-wrap gap-2"><button type="button" className="btn-secondary" onClick={() => window.print()}><Printer className="size-4" /> Imprimir</button><button type="button" className="btn-primary" onClick={() => window.print()}><Download className="size-4" /> Exportar PDF</button></div>
    </div>
    <p className="no-print mt-3 text-xs text-muted-foreground">“Exportar PDF” abre a impressão do navegador; escolha “Salvar como PDF” como destino.</p>
    <div className="no-print mt-4 flex flex-wrap gap-2" role="group" aria-label="Escolher documento">
      <button type="button" aria-pressed={selected === "todos"} className={`chip ${selected === "todos" ? "chip-active" : ""}`} onClick={() => setSelected("todos")}>Todos</button>
      {docs.map(([key, label, available]) => <button key={key} type="button" disabled={!available} aria-pressed={selected === key} className={`chip ${selected === key ? "chip-active" : ""}`} onClick={() => setSelected(key)}>{label}{!available ? " (após entrega)" : ""}</button>)}
    </div>
    <div className="mt-5 space-y-5">
      {show("resumo") && <DocPage order={order} title="Resumo da solicitação">
        <Grid rows={[["Paciente", order.patientName], ["Prontuário", order.recordNumber], ["Prescrição", order.requestType], ["Data do pedido", formatDate(order.createdAt)], ["Profissional solicitante", patient?.professional || "Não informado"], ["Fornecedor", order.supplier], ["Regiões", order.regions.join(", ")], ["Status atual", STATUS_INFO[order.status].label], ["Peso / altura", patient?.weight ? `${patient.weight} kg / ${patient.height || "—"} cm` : "—"], ["IMC", (() => { const bmi = patient ? calculateBmi(patient.weight, patient.height) : null; return bmi !== null ? `${bmi.toFixed(1)} kg/m²` : "—"; })()]]} />
        <h3 className="mt-5 text-sm font-semibold">Produtos</h3><ul className="mt-2 list-disc pl-5 text-sm">{order.products.map((product) => <li key={product.productId}>{product.description} — {product.code} · SUS {product.susCode}{product.model ? ` · ${product.model}` : ""}</li>)}</ul>
        <h3 className="mt-5 text-sm font-semibold">Justificativa</h3><p className="mt-1 text-sm">{order.justification || "Não informada"}</p>
        <h3 className="mt-5 text-sm font-semibold">Movimentações</h3><ol className="mt-2 space-y-1 text-sm">{order.history.map((event) => <li key={event.id}>{formatDate(event.date)} — {STATUS_INFO[event.status].label}: {event.description} ({event.responsible})</li>)}</ol>
      </DocPage>}
      {show("medidas") && <DocPage order={order} title="Ficha de medidas">
        {order.products.map((product) => { const values = Object.entries(product.measurements).filter(([, value]) => value); return <div key={product.productId} className="mb-5"><h3 className="text-sm font-semibold">{product.description}</h3><p className="text-xs text-muted-foreground">Acabamento: {product.model || "não informado"}</p>{values.length ? <table className="mt-2 w-full text-sm"><tbody>{values.map(([name, value]) => <tr key={name} className="border-b"><td className="py-1.5">{name}</td><td className="py-1.5 text-right font-semibold">{value} cm</td></tr>)}</tbody></table> : <p className="mt-2 text-sm text-muted-foreground">Nenhuma medida registrada neste pedido fictício.</p>}</div>; })}
        <p className="text-xs text-muted-foreground">Gabaritos demonstrativos; os modelos oficiais ainda dependem de validação do CTQ.</p>
      </DocPage>}
      {show("anexos") && <DocPage order={order} title="Anexos">
        <p className="text-sm">Termo de autorização de imagem: {order.imageAuthorizationChecked ? "conferido (marcação demonstrativa)" : "não conferido"}</p>
        {order.attachments.length ? <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{order.attachments.map((file) => <figure key={file.id}><img src={file.dataUrl} alt={`Anexo ${file.name}`} className="aspect-square w-full rounded object-cover" /><figcaption className="mt-1 truncate text-xs">{file.name}</figcaption></figure>)}</div> : <p className="mt-3 text-sm text-muted-foreground">Nenhum anexo neste pedido.</p>}
      </DocPage>}
      {show("entrega") && order.status === STATUS.ENTREGUE && <DocPage order={order} title="Comprovante de entrega">
        <Grid rows={[["Paciente", order.patientName], ["Prontuário", order.recordNumber], ["Produtos", order.products.map((product) => product.description).join(", ")], ["Entregue a", order.deliveredTo || order.history.at(-1)?.description || "—"], ["Data da entrega", formatDate(order.deliveredAt ?? order.history.at(-1)?.date ?? "")], ["Ajustes realizados", String(order.adjustments.length)]]} />
        <p className="mt-6 text-sm text-muted-foreground">Campo de assinatura não incluído: esta demonstração não emite documentos oficiais.</p>
      </DocPage>}
    </div>
  </div>;
}

function DocPage({ order, title, children }: { order: Order; title: string; children: ReactNode }) {
  return <article className="doc-page">
    <header className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-secondary pb-3">
      <div><p className="text-lg font-semibold text-secondary">BurnCare · CTQ HU Londrina</p><p className="text-xs text-muted-foreground">Gestão demonstrativa de malhas compressivas</p></div>
      <div className="text-right text-xs"><p className="font-bold">{order.id}</p><p className="text-muted-foreground">Emitido em {formatDate(new Date().toISOString().slice(0, 10))}</p></div>
    </header>
    <p className="mt-3 rounded bg-warning px-3 py-2 text-center text-xs font-bold tracking-wide text-warning-foreground">DOCUMENTO DEMONSTRATIVO — SEM VALIDADE CLÍNICA</p>
    <h2 className="mt-4 text-xl font-semibold">{title}</h2>
    <div className="mt-4">{children}</div>
  </article>;
}

function Grid({ rows }: { rows: Array<[string, string]> }) {
  return <dl className="grid gap-3 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="text-sm font-medium">{value}</dd></div>)}</dl>;
}
