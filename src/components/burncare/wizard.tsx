import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, FileImage, Plus, Trash2 } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { PatientFields } from "./patient-form";
import { BodyMap } from "./body-map";
import { useDemonstration } from "./store";
import {
  CATALOG, EMPTY_PATIENT, MODEL_OPTIONS, availableProducts, measurementNames, regionName, validateDraftStep,
  type Attachment,
} from "@/lib/burncare/model";

const steps = ["Paciente e prescrição", "Região e produto", "Medidas e anexos", "Conferência"];
function readFile(file: File): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, type: file.type, size: file.size, dataUrl: String(reader.result) });
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

export function OrderWizard() {
  const { state, updateDraft, updatePatient, submitDraft } = useDemonstration();
  const draft = state.draft;
  const [errors, setErrors] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const products = availableProducts(draft.regions);
  const visibleProducts = products.filter((product) => `${product.description} ${product.code} ${product.susCode}`.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")));
  const submitting = useRef(false);
  const [patientSearch, setPatientSearch] = useState("");
  const patientTerm = patientSearch.trim().toLocaleLowerCase("pt-BR");
  const patientMatches = patientTerm ? state.patients.filter((patient) => `${patient.name} ${patient.recordNumber}`.toLocaleLowerCase("pt-BR").includes(patientTerm)).slice(0, 5) : [];
  const selectedExisting = state.patients.some((patient) => patient.id === draft.patient.id);

  function showErrors(nextErrors: string[]) {
    setErrors(nextErrors);
    return nextErrors.length === 0;
  }

  function goTo(step: number) {
    if (step > draft.step && !showErrors(validateDraftStep(draft, draft.step, state.patients))) return;
    setErrors([]);
    updateDraft({ step });
  }

  function updateRegions(regions: string[]) {
    const allowed = new Set(availableProducts(regions).map((product) => product.id));
    updateDraft({ regions, productIds: draft.productIds.filter((id) => allowed.has(id)) });
    setErrors([]);
  }

  function toggleProduct(id: string) {
    updateDraft({ productIds: draft.productIds.includes(id) ? draft.productIds.filter((item) => item !== id) : [...draft.productIds, id] });
    setErrors([]);
  }

  function updateMeasurement(productId: string, name: string, value: string) {
    updateDraft({ measurements: { ...draft.measurements, [productId]: { ...draft.measurements[productId], [name]: value } } });
    setErrors([]);
  }

  async function addAttachments(event: ChangeEvent<HTMLInputElement>) {
    try {
      const files = Array.from(event.target.files ?? []);
      if (files.some((file) => file.size > 2 * 1024 * 1024)) {
        setErrors(["Cada imagem deve ter no máximo 2 MB para esta demonstração local."]);
        return;
      }
      const additions = await Promise.all(files.map(readFile));
      updateDraft({ attachments: [...draft.attachments, ...additions] });
      setErrors([]);
    } catch {
      setErrors(["Não foi possível ler as imagens selecionadas."]);
    } finally {
      event.target.value = "";
    }
  }

  function finish() {
    if (submitting.current) return;
    const allErrors = [0, 1, 2].flatMap((step) => validateDraftStep(draft, step, state.patients));
    if (!showErrors([...new Set(allErrors)])) return;
    submitting.current = true;
    const order = submitDraft();
    void navigate({ to: "/pedidos/$id", params: { id: order.id } });
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[1.5px] text-primary">Nova solicitação</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Novo pedido de malha</h1>
        <p className="mt-2 text-sm text-muted-foreground">Preencha os dados demonstrativos para encaminhar à confecção.</p>
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <ol className="flex gap-2 overflow-x-auto lg:flex-col">
          {steps.map((label, index) => (
            <li key={label} className="min-w-[190px] flex-1 lg:min-w-0">
              <button type="button" onClick={() => goTo(index)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm ${index === draft.step ? "bg-accent font-semibold text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <span className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold ${index <= draft.step ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>
                  {index < draft.step ? <Check className="size-4" /> : index + 1}
                </span>{label}
              </button>
            </li>
          ))}
        </ol>
        <section className="card p-4 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[1.3px] text-primary">Etapa {draft.step + 1} de 4</p>
          <h2 className="mt-2 text-xl font-semibold">{steps[draft.step]}</h2>
          <div className="my-5 h-px bg-border" />

          {draft.step === 0 && (
            <div>
              <div className="mb-5 rounded-xl border bg-muted/50 p-4">
                <label className="label" htmlFor="patient-search">Buscar paciente cadastrado</label>
                <input id="patient-search" className="field" placeholder="Nome ou prontuário" value={patientSearch} onChange={(event) => setPatientSearch(event.target.value)} />
                {patientMatches.length > 0 && <ul className="mt-2 divide-y rounded-lg border bg-card">{patientMatches.map((patient) => <li key={patient.id}><button type="button" className="flex w-full justify-between gap-3 p-3 text-left text-sm hover:bg-muted" onClick={() => { updateDraft({ patient, requestType: state.orders.some((order) => order.patientId === patient.id) ? "Segunda malha" : "Primeira malha" }); setPatientSearch(""); setErrors([]); }}><span className="font-semibold">{patient.name}</span><span className="text-muted-foreground">{patient.recordNumber}</span></button></li>)}</ul>}
                {patientTerm && patientMatches.length === 0 && <p className="mt-2 text-xs text-muted-foreground">Nenhum paciente encontrado — preencha abaixo para cadastrar um novo.</p>}
                {selectedExisting && <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">Paciente cadastrado selecionado: <strong>{draft.patient.name}</strong><button type="button" className="text-xs font-semibold text-primary underline" onClick={() => updateDraft({ patient: { ...EMPTY_PATIENT } })}>Novo paciente</button></p>}
              </div>
              <PatientFields idPrefix="patient" patient={draft.patient} onChange={(field, value) => { updatePatient(field, value); setErrors([]); }} />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <fieldset className="sm:col-span-2">
                  <legend className="label">Tipo de solicitação *</legend>
                  <div className="flex flex-wrap gap-2">
                    {(["Primeira malha", "Segunda malha"] as const).map((type) => (
                      <button key={type} type="button" aria-pressed={draft.requestType === type} onClick={() => updateDraft({ requestType: type })}
                        className={`rounded-lg border px-4 py-2.5 text-sm ${draft.requestType === type ? "border-primary bg-accent font-semibold text-accent-foreground" : "bg-card text-muted-foreground"}`}>{type}</button>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div className="mt-5 border-l-4 border-warning-foreground bg-warning p-4 text-sm leading-6 text-warning-foreground">
                <strong>Observação importante:</strong> a segunda malha é uma nova indicação da ficha médica. O ajuste de uma peça já produzida permanece vinculado ao pedido original.
              </div>
            </div>
          )}

          {draft.step === 1 && (
            <div>
              <p className="mb-5 text-sm text-muted-foreground">Selecione a região anatômica e os produtos necessários.</p>
              <div className="grid gap-6 md:grid-cols-[250px_minmax(0,1fr)]">
                <BodyMap selected={draft.regions} onChange={updateRegions} />
                <div className="min-w-0">
                  <label className="label" htmlFor="product-search">Buscar produto</label>
                  <input id="product-search" className="field" placeholder="Buscar por descrição ou código" value={search} onChange={(event) => setSearch(event.target.value)} />
                  <div className="mt-3 max-h-[390px] space-y-2 overflow-y-auto pr-1">
                    {visibleProducts.map((product) => {
                      const checked = draft.productIds.includes(product.id);
                      return (
                        <button key={product.id} type="button" role="checkbox" aria-checked={checked} onClick={() => toggleProduct(product.id)}
                          className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left ${checked ? "border-primary bg-accent" : "bg-card hover:bg-muted"}`}>
                          <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded border ${checked ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{checked && <Check className="size-3.5" />}</span>
                          <span><span className="block text-sm font-medium">{product.description}</span><span className="mt-1 block text-xs text-muted-foreground">{product.code} · SUS {product.susCode}</span></span>
                        </button>
                      );
                    })}
                    {visibleProducts.length === 0 && <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">{draft.regions.length === 0 ? "Selecione uma parte do corpo para ver os produtos correspondentes." : "Nenhum produto encontrado para a seleção ou busca."}</p>}
                  </div>
                </div>
              </div>
              {draft.regions.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{draft.regions.map((region) => <span key={region} className="rounded-full bg-muted px-3 py-1 text-xs">{regionName(region).replaceAll("-", " ")} · {region.startsWith("frente") ? "Frente" : "Costas"}</span>)}</div>}
              <div className="mt-5"><label className="label" htmlFor="justification">Justificativa / indicação clínica</label><textarea id="justification" className="field min-h-20" placeholder="Campo demonstrativo para validação do protótipo." value={draft.justification} onChange={(event) => updateDraft({ justification: event.target.value })} /></div>
              <p className="mt-3 rounded-lg bg-warning p-3 text-sm text-warning-foreground">O modelo da malha requer validação clínica.</p>
            </div>
          )}

          {draft.step === 2 && (
            <div className="space-y-7">
              <p className="text-sm leading-6 text-muted-foreground">A demonstração exige duas medidas válidas por produto. Os campos não substituem os gabaritos clínicos oficiais.</p>
              {draft.productIds.map((productId) => {
                const product = CATALOG.find((item) => item.id === productId);
                if (!product) return null;
                const names = measurementNames(productId);
                const isOfficialGlove = productId.startsWith("luva-punho");
                return (
                  <section key={productId} className="rounded-xl border p-4">
                    <h3 className="font-semibold">{product.description}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{isOfficialGlove ? "Gabarito da luva até o punho · unidade: centímetros (cm)." : "Campos genéricos demonstrativos; o gabarito específico ainda não foi integrado."}</p>
                    <div className="mt-4"><label className="label" htmlFor={`model-${productId}`}>Modelo / acabamento</label><select id={`model-${productId}`} className="field max-w-md" value={draft.models[productId] ?? ""} onChange={(event) => updateDraft({ models: { ...draft.models, [productId]: event.target.value } })}><option value="">Escolher (se aplicável)</option>{MODEL_OPTIONS.map((model) => <option key={model}>{model}</option>)}</select></div>
                    <div className="mt-4 grid gap-x-5 sm:grid-cols-2">
                      {names.map((name, index) => (
                        <div key={name} className="flex items-center gap-3 border-b py-2.5">
                          <label className="flex-1 text-sm" htmlFor={`${productId}-${index}`}>{index + 1} · {name}</label>
                          <div className="flex w-28 items-center gap-2"><input id={`${productId}-${index}`} className="field min-w-0 px-2 text-right" inputMode="decimal" aria-label={`${name}, em centímetros`} value={draft.measurements[productId]?.[name] ?? ""} onChange={(event) => updateMeasurement(productId, name, event.target.value)} /><span className="text-xs text-muted-foreground">cm</span></div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
              <section>
                <h3 className="text-lg font-semibold">Documentação de apoio</h3>
                <label className="mt-4 flex items-start gap-3 rounded-lg border p-4 text-sm"><input type="checkbox" className="mt-1 size-4 accent-primary" checked={draft.imageAuthorizationChecked} onChange={(event) => updateDraft({ imageAuthorizationChecked: event.target.checked })} /><span><strong>Termo de autorização de imagem conferido</strong><span className="mt-1 block text-xs text-muted-foreground">Marcação demonstrativa, sem validade institucional.</span></span></label>
                <div className="mt-4"><label className="btn-secondary cursor-pointer" htmlFor="attachments"><Plus className="size-4" /> Escolher imagens fictícias</label><input id="attachments" className="sr-only" type="file" accept="image/*" multiple onChange={addAttachments} /><p className="mt-2 text-xs text-muted-foreground">Somente imagens fictícias, até 2 MB cada. Não envie fotografias reais de pacientes.</p></div>
                {draft.attachments.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2">{draft.attachments.map((file) => <div key={file.id} className="flex items-center gap-3 rounded-lg border p-3"><img src={file.dataUrl} alt="Anexo demonstrativo" className="size-12 rounded object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{file.name}</p><p className="text-xs text-muted-foreground">{Math.ceil(file.size / 1024)} KB</p></div><button type="button" className="btn-quiet p-2" aria-label={`Remover ${file.name}`} onClick={() => updateDraft({ attachments: draft.attachments.filter((item) => item.id !== file.id) })}><Trash2 className="size-4" /></button></div>)}</div>}
              </section>
            </div>
          )}

          {draft.step === 3 && (
            <div className="space-y-5">
              <div className="rounded-xl bg-accent p-5"><h3 className="text-lg font-semibold text-accent-foreground">{draft.patient.name || "Paciente não informado"}</h3><p className="mt-1 text-sm text-accent-foreground">Prontuário {draft.patient.recordNumber || "—"} · {draft.requestType}</p></div>
              <ReviewBlock title="Paciente e prescrição" onEdit={() => goTo(0)}><p>{draft.patient.city || "Cidade não informada"} · {draft.patient.phone || "Telefone não informado"}</p><p>Peso {draft.patient.weight || "—"} kg · Altura {draft.patient.height || "—"} cm</p><p>Profissional solicitante: {draft.patient.professional || "Não informado"}</p></ReviewBlock>
              <ReviewBlock title="Regiões" onEdit={() => goTo(1)}><p>{draft.regions.map((region) => `${regionName(region).replaceAll("-", " ")} (${region.startsWith("frente") ? "frente" : "costas"})`).join(", ") || "—"}</p></ReviewBlock>
              <ReviewBlock title="Produtos, acabamentos e medidas" onEdit={() => goTo(2)}>{draft.productIds.map((id) => { const product = CATALOG.find((item) => item.id === id); const values = Object.entries(draft.measurements[id] ?? {}).filter(([, value]) => value); return <div key={id} className="mb-3"><p><strong>{product?.description}</strong> <span className="text-xs text-muted-foreground">{product?.code} · SUS {product?.susCode}</span></p><p className="text-xs">Acabamento: {draft.models[id] || "não informado"}</p><p className="text-xs text-muted-foreground">{values.map(([name, value]) => `${name}: ${value} cm`).join(" · ") || "Sem medidas"}</p></div>; })}</ReviewBlock>
              <ReviewBlock title="Justificativa" onEdit={() => goTo(1)}><p>{draft.justification || "Não informada"}</p></ReviewBlock>
              <ReviewBlock title="Anexos" onEdit={() => goTo(2)}><p className="flex items-center gap-2"><FileImage className="size-4" /> {draft.attachments.length} imagem(ns) fictícia(s) · termo de imagem {draft.imageAuthorizationChecked ? "conferido" : "não conferido"}</p>{draft.attachments.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{draft.attachments.map((file) => <img key={file.id} src={file.dataUrl} alt={`Anexo ${file.name}`} className="size-14 rounded object-cover" />)}</div>}</ReviewBlock>
              <p className="rounded-lg bg-warning p-4 text-sm leading-6 text-warning-foreground">Ao confirmar, o pedido será criado somente neste navegador, com status “Enviado à confecção”. Nenhum envio externo será realizado.</p>
            </div>
          )}

          {errors.length > 0 && <div role="alert" className="mt-5 rounded-lg bg-danger p-4 text-sm text-danger-foreground">{errors.map((error) => <p key={error}>• {error}</p>)}</div>}
          <div className="mt-7 flex items-center justify-between gap-3 border-t pt-5">
            <button type="button" className="btn-quiet" disabled={draft.step === 0} onClick={() => goTo(draft.step - 1)}><ArrowLeft className="size-4" /> Voltar</button>
            {draft.step < 3 ? <button type="button" className="btn-primary" onClick={() => goTo(draft.step + 1)}>Continuar <ArrowRight className="size-4" /></button> : <button type="button" className="btn-primary" onClick={finish}><Check className="size-4" /> Confirmar e criar pedido</button>}
          </div>
        </section>
      </div>
    </div>
  );
}

function ReviewBlock({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit: () => void }) {
  return <section className="border-b pb-4 last:border-0"><div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h3><button type="button" className="text-xs font-semibold text-primary underline" onClick={onEdit}>Corrigir</button></div><div className="text-sm leading-6">{children}</div></section>;
}
