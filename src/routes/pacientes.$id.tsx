import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ClipboardPlus, Pencil } from "lucide-react";
import { useState } from "react";
import { PatientEditor } from "@/components/burncare/patient-form";
import { useDemonstration } from "@/components/burncare/store";
import { STATUS_INFO, calculateBmi, createInitialState, formatDate } from "@/lib/burncare/model";

export const Route = createFileRoute("/pacientes/$id")({
  head: () => ({ meta: [
    { title: "Paciente fictício | BurnCare CTQ HU" },
    { name: "description", content: "Dados demonstrativos e solicitações vinculadas a um paciente fictício." },
    { property: "og:title", content: "Paciente fictício | BurnCare CTQ HU" },
    { property: "og:description", content: "Consulta, edição e histórico de pedidos de um paciente fictício." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: PatientPage,
});

function PatientPage() {
  const { id } = Route.useParams();
  const { state, savePatient, updateDraft } = useDemonstration();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const patient = state.patients.find((item) => item.id === id);
  if (!patient) return <div className="card p-8 text-center"><h1 className="text-xl font-semibold">Paciente não encontrado</h1><Link to="/pacientes" className="btn-primary mt-5 no-underline">Voltar aos pacientes</Link></div>;
  const orders = state.orders.filter((order) => order.patientId === patient.id);
  const bmi = calculateBmi(patient.weight, patient.height);
  const startOrder = () => {
    const hasSecond = orders.length > 0;
    updateDraft({ ...createInitialState().draft, patient, requestType: hasSecond ? "Segunda malha" : "Primeira malha" });
    void navigate({ to: "/novo-pedido" });
  };
  const rows: Array<[string, string]> = [["Prontuário HU", patient.recordNumber], ["Data do atendimento", formatDate(patient.attendanceDate) || "—"], ["Idade", patient.age ? `${patient.age} anos` : "—"], ["Telefone", patient.phone || "—"], ["Endereço", patient.address || "—"], ["Cidade", patient.city || "—"], ["Peso", patient.weight ? `${patient.weight} kg` : "—"], ["Altura", patient.height ? `${patient.height} cm` : "—"], ["IMC", bmi !== null ? `${bmi.toFixed(1)} kg/m²` : "—"], ["Profissional solicitante", patient.professional || "—"]];
  return <div>
    <Link to="/pacientes" className="btn-quiet no-underline"><ArrowLeft className="size-4" /> Pacientes</Link>
    <div className="mt-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[1.5px] text-primary">Paciente fictício</p><h1 className="mt-1 text-3xl font-semibold">{patient.name}</h1></div>
      <div className="flex flex-wrap gap-2"><button type="button" className="btn-secondary" onClick={() => setEditing((value) => !value)}><Pencil className="size-4" /> {editing ? "Fechar edição" : "Editar dados"}</button><button type="button" className="btn-primary" onClick={startOrder}><ClipboardPlus className="size-4" /> Novo pedido</button></div></div>
    <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <section className="card p-5">{editing ? <PatientEditor key={patient.id} initial={patient} submitLabel="Salvar alterações" onCancel={() => setEditing(false)} onSave={(next) => { const errors = savePatient(next); if (!errors.length) setEditing(false); return errors; }} /> :
        <dl className="grid gap-4 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium">{value}</dd></div>)}</dl>}</section>
      <section className="card p-5"><h2 className="text-lg font-semibold">Solicitações vinculadas</h2>
        {orders.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Nenhum pedido para este paciente.</p> : <ul className="mt-3 divide-y">{orders.map((order) => <li key={order.id}><Link to="/pedidos/$id" params={{ id: order.id }} className="flex flex-wrap items-center justify-between gap-2 py-3 no-underline hover:text-primary"><span><span className="block text-sm font-semibold">{order.id} · {order.requestType}</span><span className="text-xs text-muted-foreground">{formatDate(order.createdAt)} · {order.products.map((product) => product.description).join(", ")}</span></span><span className={`status-badge ${STATUS_INFO[order.status].className}`}>{STATUS_INFO[order.status].label}</span></Link></li>)}</ul>}
      </section>
    </div>
  </div>;
}
