import { useState } from "react";
import { calculateBmi, type Patient } from "@/lib/burncare/model";

export const PATIENT_FIELDS: Array<{ name: Exclude<keyof Patient, "id">; label: string; placeholder?: string; type?: string; full?: boolean; unit?: string }> = [
  { name: "name", label: "Nome do paciente *", placeholder: "Paciente demonstrativo", full: true },
  { name: "recordNumber", label: "Prontuário HU *", placeholder: "DEMO-HU-0000" },
  { name: "attendanceDate", label: "Data do atendimento", type: "date" },
  { name: "age", label: "Idade", placeholder: "Ex.: 32", type: "number", unit: "anos" },
  { name: "city", label: "Cidade", placeholder: "Ex.: Londrina" },
  { name: "address", label: "Endereço", placeholder: "Endereço fictício", full: true },
  { name: "phone", label: "Telefone", placeholder: "(43) 90000-0000", type: "tel" },
  { name: "weight", label: "Peso", placeholder: "Ex.: 70", type: "number", unit: "kg" },
  { name: "height", label: "Altura", placeholder: "Ex.: 170", type: "number", unit: "cm" },
  { name: "professional", label: "Profissional solicitante", placeholder: "Nome fictício do profissional", full: true },
];

export function PatientFields({ patient, onChange, idPrefix }: { patient: Patient; onChange: (field: Exclude<keyof Patient, "id">, value: string) => void; idPrefix: string }) {
  const bmi = calculateBmi(patient.weight, patient.height);
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {PATIENT_FIELDS.map((field) => (
          <div key={field.name} className={field.full ? "sm:col-span-2" : ""}>
            <label className="label" htmlFor={`${idPrefix}-${field.name}`}>{field.label}{field.unit ? ` (${field.unit})` : ""}</label>
            <input id={`${idPrefix}-${field.name}`} className="field" type={field.type ?? "text"} min={field.type === "number" ? "0" : undefined} step={field.type === "number" ? "any" : undefined}
              value={patient[field.name]} placeholder={field.placeholder} onChange={(event) => onChange(field.name, event.target.value)} />
          </div>
        ))}
      </div>
      {bmi !== null && <p className="mt-4 rounded-lg bg-accent p-3 text-sm font-semibold text-accent-foreground">IMC estimado com base no peso e altura: {bmi.toFixed(1)} kg/m²</p>}
    </div>
  );
}

export function PatientEditor({ initial, onSave, onCancel, submitLabel }: { initial: Patient; onSave: (patient: Patient) => string[]; onCancel?: () => void; submitLabel: string }) {
  const [patient, setPatient] = useState(initial);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  return (
    <form noValidate onSubmit={(event) => { event.preventDefault(); const next = onSave(patient); setErrors(next); setSaved(next.length === 0); }}>
      <PatientFields idPrefix="cadastro" patient={patient} onChange={(field, value) => { setPatient((current) => ({ ...current, [field]: value })); setErrors([]); setSaved(false); }} />
      {errors.length > 0 && <div role="alert" className="mt-4 rounded-lg bg-danger p-3 text-sm text-danger-foreground">{errors.map((error) => <p key={error}>• {error}</p>)}</div>}
      {saved && <p role="status" className="mt-4 rounded-lg bg-accent p-3 text-sm font-semibold text-accent-foreground">Cadastro salvo localmente.</p>}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        {onCancel && <button type="button" className="btn-quiet" onClick={onCancel}>Cancelar</button>}
        <button type="submit" className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
