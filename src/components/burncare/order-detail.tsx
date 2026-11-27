import { ArrowLeft, CheckCircle2, FileImage, Printer } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useDemonstration } from "./store";
import { STATUS, STATUS_INFO, formatDate, validateOrderAction, type ActionData, type Order } from "@/lib/burncare/model";

const actionCopy = {
  ENVIADO_CONFECCAO: ["Confirmar início da produção", "Registre quando o fornecedor confirmou o recebimento do pedido.", "Confirmar produção"],
  EM_PRODUCAO: ["Registrar envio pelo fornecedor", "Registre quando a malha saiu do fornecedor para o CTQ.", "Registrar envio"],
  EM_TRANSPORTE: ["Registrar recebimento no CTQ", "Confirme a chegada da malha ao CTQ para agendar a prova.", "Confirmar recebimento"],
  AGUARDANDO_PROVA: ["Registrar prova da malha", "Informe o resultado demonstrativo da prova.", "Registrar prova"],
  EM_AJUSTE: ["Registrar retorno do ajuste", "Registre quando a malha ajustada voltou ao CTQ para nova prova.", "Registrar retorno"],
  PRONTA_ENTREGA: ["Registrar entrega ao paciente", "Ao registrar a entrega, o pedido é encerrado.", "Registrar entrega e encerrar"],
} as const;

export function OrderDetail({ order }: { order: Order }) {
  const { registerAction } = useDemonstration();
  const info = STATUS_INFO[order.status];
  return (
    <div>
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/historico" className="btn-quiet no-underline"><ArrowLeft className="size-4" /> Voltar ao histórico</Link>
        <button type="button" className="btn-secondary" onClick={() => window.print()}><Printer className="size-4" /> Imprimir demonstração</button>
      </div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-bold tracking-wider text-muted-foreground">{order.id}</p><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{order.patientName}</h1><p className="mt-1 text-sm text-muted-foreground">Prontuário {order.recordNumber} · {order.requestType}</p></div>
        <span className={`status-badge ${info.className}`}>{info.label}</span>
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <div className="space-y-5">
          <section className="card p-5"><h2 className="text-lg font-semibold">Dados do pedido</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2"><Info label="Data do pedido" value={formatDate(order.createdAt)} /><Info label="Fornecedor" value={order.supplier} /><Info label="Regiões" value={order.regions.join(", ")} /><Info label="Justificativa" value={order.justification || "Não informada"} /></dl></section>
          <section className="card p-5"><h2 className="text-lg font-semibold">Produtos e medidas</h2>{order.products.map((product) => <div key={product.productId} className="mt-4 rounded-xl border p-4"><h3 className="font-semibold">{product.description}</h3><p className="mt-1 text-xs text-muted-foreground">{product.code} · SUS {product.susCode}</p>{product.model && <p className="mt-2 text-sm">Acabamento: {product.model}</p>}{Object.keys(product.measurements).length > 0 ? <dl className="mt-3 grid gap-2 sm:grid-cols-2">{Object.entries(product.measurements).filter(([, value]) => value).map(([name, value]) => <div key={name} className="flex justify-between gap-3 border-b pb-2 text-xs"><dt className="text-muted-foreground">{name}</dt><dd className="font-semibold">{value} cm</dd></div>)}</dl> : <p className="mt-3 text-sm text-muted-foreground">Nenhuma medida registrada neste pedido fictício.</p>}</div>)}</section>
          {order.attachments.length > 0 && <section className="card p-5"><h2 className="flex items-center gap-2 text-lg font-semibold"><FileImage className="size-5" /> Anexos fictícios</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{order.attachments.map((file) => <a key={file.id} href={file.dataUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border p-3 no-underline"><img src={file.dataUrl} alt="Anexo demonstrativo" className="size-14 rounded object-cover" /><span className="min-w-0 truncate text-sm">{file.name}</span></a>)}</div></section>}
          <section className="card p-5"><h2 className="text-lg font-semibold">Histórico do pedido</h2><ol className="mt-5">{[...order.history].reverse().map((event) => <li key={event.id} className="relative border-l pb-5 pl-5 last:pb-0"><span className="absolute -left-[5px] top-1 size-2.5 rounded-full bg-primary" /><p className="text-sm font-semibold">{formatDate(event.date)} · {STATUS_INFO[event.status].label}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{event.description}</p><p className="mt-1 text-xs text-muted-foreground">{event.responsible}</p></li>)}</ol></section>
        </div>
        <div className="space-y-5 no-print">
          <ActionPanel key={`${order.id}-${order.status}-${order.history.length}`} order={order} onConfirm={(data) => registerAction(order.id, data)} />
          {order.adjustments.length > 0 && <section className="card p-5"><h2 className="text-lg font-semibold">Ajustes</h2>{order.adjustments.map((adjustment, index) => <div key={adjustment.id} className="mt-3 border-l-4 border-danger-foreground pl-3"><p className="font-semibold">Ajuste nº {index + 1}</p><p className="mt-1 text-sm text-muted-foreground">{adjustment.description}</p><p className="mt-1 text-xs text-muted-foreground">Solicitado em {formatDate(adjustment.requestedAt)} · {adjustment.returnedAt ? `retornou em ${formatDate(adjustment.returnedAt)}` : "aguardando retorno"}</p></div>)}</section>}
          <p className="rounded-lg bg-warning p-3 text-xs leading-5 text-warning-foreground">Registros salvos localmente nesta demonstração. Nenhuma ação clínica ou administrativa real é executada.</p>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium leading-6">{value}</dd></div>;
}

function ActionPanel({ order, onConfirm }: { order: Order; onConfirm: (data: ActionData) => void }) {
  const [data, setData] = useState<ActionData>({ date: new Date().toISOString().slice(0, 10), result: "" });
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  if (order.status === STATUS.ENTREGUE) return <section className="card bg-accent p-5"><CheckCircle2 className="size-7 text-primary" /><h2 className="mt-3 text-lg font-semibold">Pedido encerrado</h2><p className="mt-1 text-sm text-muted-foreground">A malha já foi entregue. Para uma nova malha, abra um novo pedido.</p></section>;
  const copy = actionCopy[order.status];
  const update = (name: string, value: string) => { setData((current) => ({ ...current, [name]: value })); setErrors([]); setSaved(false); };
  const confirm = () => { const nextErrors = validateOrderAction(order, data); setErrors(nextErrors); if (nextErrors.length === 0) { onConfirm(data); setSaved(true); } };

  return <section className="card p-5"><h2 className="text-lg font-semibold">{copy[0]}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{copy[1]}</p><div className="mt-4 space-y-4">
    <Field label="Data do registro *"><input aria-label="Data do registro" className="field" type="date" value={data.date ?? ""} onChange={(event) => update("date", event.target.value)} /></Field>
    {order.status === STATUS.ENVIADO_CONFECCAO && <Field label="Previsão de envio (opcional)"><input aria-label="Previsão de envio" className="field" type="date" value={data.forecast ?? ""} onChange={(event) => update("forecast", event.target.value)} /></Field>}
    {order.status === STATUS.EM_PRODUCAO && <Field label="Código de rastreio / transportadora"><input aria-label="Código de rastreio" className="field" value={data.tracking ?? ""} onChange={(event) => update("tracking", event.target.value)} /></Field>}
    {(order.status === STATUS.EM_TRANSPORTE || order.status === STATUS.PRONTA_ENTREGA) && <Field label={order.status === STATUS.PRONTA_ENTREGA ? "Recebido por (paciente ou responsável) *" : "Recebido por *"}><input aria-label="Recebido por" className="field" value={data.receivedBy ?? ""} onChange={(event) => update("receivedBy", event.target.value)} /></Field>}
    {order.status === STATUS.AGUARDANDO_PROVA && <fieldset><legend className="label">Resultado *</legend><div className="grid grid-cols-2 gap-2">{[["APROVADA", "Aprovada"], ["AJUSTE", "Precisa de ajuste"]].map(([value, label]) => <button key={value} type="button" aria-pressed={data.result === value} onClick={() => update("result", value ?? "")} className={`rounded-lg border px-3 py-2 text-sm ${data.result === value ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{label}</button>)}</div></fieldset>}
    {order.status === STATUS.AGUARDANDO_PROVA && data.result === "AJUSTE" && <Field label="Descrição do ajuste *"><textarea aria-label="Descrição do ajuste" className="field min-h-20" value={data.adjustmentDescription ?? ""} onChange={(event) => update("adjustmentDescription", event.target.value)} /></Field>}
    <Field label="Observação"><textarea aria-label="Observação" className="field min-h-20" maxLength={300} value={data.observation ?? ""} onChange={(event) => update("observation", event.target.value)} /></Field>
    {errors.length > 0 && <div role="alert" className="rounded-lg bg-danger p-3 text-sm text-danger-foreground">{errors.map((error) => <p key={error}>• {error}</p>)}</div>}
    {saved && <p role="status" className="rounded-lg bg-accent p-3 text-sm font-semibold text-accent-foreground">Registro salvo localmente.</p>}
    <button type="button" className="btn-primary w-full" onClick={confirm}>{copy[2]}</button>
  </div></section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="label">{label}</span>{children}</label>;
}
