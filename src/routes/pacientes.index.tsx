import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { PatientEditor } from "@/components/burncare/patient-form";
import { useDemonstration } from "@/components/burncare/store";
import { EMPTY_PATIENT, newPatientId } from "@/lib/burncare/model";

export const Route = createFileRoute("/pacientes/")({
  head: () => ({ meta: [
    { title: "Pacientes | BurnCare CTQ HU" },
    { name: "description", content: "Consulta e cadastro de pacientes fictícios para a demonstração do CTQ HU." },
    { property: "og:title", content: "Pacientes | BurnCare CTQ HU" },
    { property: "og:description", content: "Pesquise por nome ou prontuário demonstrativo e consulte as solicitações vinculadas." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: PatientsPage,
});

function PatientsPage() {
  const { state, savePatient } = useDemonstration();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const term = search.trim().toLocaleLowerCase("pt-BR");
  const patients = state.patients.filter((patient) => !term || `${patient.name} ${patient.recordNumber}`.toLocaleLowerCase("pt-BR").includes(term));
  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[1.5px] text-primary">Cadastro</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Pacientes</h1><p className="mt-2 text-sm text-muted-foreground">Somente pacientes fictícios. {state.patients.length} cadastrado(s).</p></div>
      <button type="button" className="btn-primary" onClick={() => setCreating((value) => !value)}>{creating ? <><X className="size-4" /> Fechar cadastro</> : <><UserPlus className="size-4" /> Cadastrar paciente</>}</button></div>
    {creating && <section className="card mt-6 p-5"><h2 className="mb-4 text-lg font-semibold">Novo paciente fictício</h2>
      <PatientEditor initial={{ ...EMPTY_PATIENT, id: "" }} submitLabel="Salvar paciente" onCancel={() => setCreating(false)} onSave={(patient) => {
        const withId = { ...patient, id: newPatientId(patient.recordNumber) };
        const errors = savePatient(withId);
        if (errors.length === 0) void navigate({ to: "/pacientes/$id", params: { id: withId.id } });
        return errors;
      }} /></section>}
    <div className="card mt-6 p-4"><label className="relative block"><span className="sr-only">Buscar pacientes</span><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input className="field pl-10" placeholder="Buscar por nome ou prontuário" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
    <div className="card mt-4 overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="border-b bg-muted text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-3">Paciente</th><th className="p-3">Prontuário</th><th className="p-3">Cidade</th><th className="p-3">Pedidos</th><th className="p-3"><span className="sr-only">Ações</span></th></tr></thead>
        <tbody className="divide-y">{patients.map((patient) => <tr key={patient.id} className="hover:bg-muted/60">
          <td className="p-3 font-semibold">{patient.name}</td><td className="p-3">{patient.recordNumber}</td><td className="p-3 text-muted-foreground">{patient.city || "—"}</td>
          <td className="p-3">{state.orders.filter((order) => order.patientId === patient.id).length}</td>
          <td className="p-3 text-right"><Link to="/pacientes/$id" params={{ id: patient.id }} className="font-semibold text-primary">Abrir</Link></td></tr>)}</tbody>
      </table>
      {patients.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Nenhum paciente encontrado.</p>}
    </div>
  </div>;
}
