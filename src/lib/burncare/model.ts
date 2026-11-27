import { z } from "zod";

export const STATUS = {
  ENVIADO_CONFECCAO: "ENVIADO_CONFECCAO",
  EM_PRODUCAO: "EM_PRODUCAO",
  EM_TRANSPORTE: "EM_TRANSPORTE",
  AGUARDANDO_PROVA: "AGUARDANDO_PROVA",
  EM_AJUSTE: "EM_AJUSTE",
  PRONTA_ENTREGA: "PRONTA_ENTREGA",
  ENTREGUE: "ENTREGUE",
} as const;

const statusSchema = z.enum([
  "ENVIADO_CONFECCAO", "EM_PRODUCAO", "EM_TRANSPORTE", "AGUARDANDO_PROVA",
  "EM_AJUSTE", "PRONTA_ENTREGA", "ENTREGUE",
]);
const patientSchema = z.object({
  id: z.string(), name: z.string(), recordNumber: z.string(), attendanceDate: z.string(),
  age: z.string(), city: z.string(), address: z.string(), phone: z.string(),
  weight: z.string(), height: z.string(), professional: z.string(),
});
const attachmentSchema = z.object({
  id: z.string(), name: z.string(), type: z.string(), size: z.number(), dataUrl: z.string(),
});
const productSchema = z.object({
  productId: z.string(), description: z.string(), code: z.string(), susCode: z.string(),
  model: z.string(), measurements: z.record(z.string(), z.string()),
});
const historySchema = z.object({
  id: z.string(), date: z.string(), status: statusSchema, description: z.string(), responsible: z.string(),
});
const adjustmentSchema = z.object({
  id: z.string(), description: z.string(), requestedAt: z.string(), returnedAt: z.string().nullable(),
});
const orderSchema = z.object({
  id: z.string(), patientId: z.string(), patientName: z.string(), recordNumber: z.string(),
  requestType: z.enum(["Primeira malha", "Segunda malha"]), regions: z.array(z.string()),
  products: z.array(productSchema), justification: z.string(), supplier: z.string(), createdAt: z.string(),
  status: statusSchema, history: z.array(historySchema), adjustments: z.array(adjustmentSchema),
  attachments: z.array(attachmentSchema), imageAuthorizationChecked: z.boolean(),
});
const draftSchema = z.object({
  step: z.number().min(0).max(3), patient: patientSchema,
  requestType: z.enum(["Primeira malha", "Segunda malha"]), regions: z.array(z.string()),
  productIds: z.array(z.string()), justification: z.string(),
  measurements: z.record(z.string(), z.record(z.string(), z.string())),
  models: z.record(z.string(), z.string()), attachments: z.array(attachmentSchema),
  imageAuthorizationChecked: z.boolean(),
});
export const persistedStateSchema = z.object({
  version: z.literal(1), orders: z.array(orderSchema), patients: z.array(patientSchema), draft: draftSchema,
});

export type Status = z.infer<typeof statusSchema>;
export type Patient = z.infer<typeof patientSchema>;
export type Attachment = z.infer<typeof attachmentSchema>;
export type Order = z.infer<typeof orderSchema>;
export type OrderDraft = z.infer<typeof draftSchema>;
export type DemoState = z.infer<typeof persistedStateSchema>;
export type ActionData = {
  date?: string;
  forecast?: string;
  tracking?: string;
  receivedBy?: string;
  result?: string;
  adjustmentDescription?: string;
  observation?: string;
};

export const EMPTY_PATIENT: Patient = {
  id: "patient-demo", name: "", recordNumber: "", attendanceDate: "", age: "", city: "",
  address: "", phone: "", weight: "", height: "", professional: "",
};
export const EMPTY_DRAFT: OrderDraft = {
  step: 0, patient: EMPTY_PATIENT, requestType: "Primeira malha", regions: [], productIds: [],
  justification: "", measurements: {}, models: {}, attachments: [], imageAuthorizationChecked: false,
};

export const STATUS_INFO: Record<Status, { label: string; className: string }> = {
  ENVIADO_CONFECCAO: { label: "Enviado à confecção", className: "status-neutral" },
  EM_PRODUCAO: { label: "Em produção", className: "status-production" },
  EM_TRANSPORTE: { label: "Em transporte", className: "status-transport" },
  AGUARDANDO_PROVA: { label: "Aguardando prova", className: "status-fitting" },
  EM_AJUSTE: { label: "Em ajuste", className: "status-adjustment" },
  PRONTA_ENTREGA: { label: "Prova aprovada", className: "status-ready" },
  ENTREGUE: { label: "Entregue", className: "status-done" },
};

export const CATALOG = [
  ["luva-punho-direita", "Luvas com dedos até o punho (mão direita)", "S-47226 / E-183633", "07.01.10.001-0"],
  ["luva-punho-esquerda", "Luvas com dedos até o punho (mão esquerda)", "S-47226 / E-183633", "07.01.10.001-0"],
  ["meia-joelho-direita", "Meia até joelho (pé direito)", "S-47227 / E-183634", "07.01.10.002-8"],
  ["meia-joelho-esquerda", "Meia até joelho (pé esquerdo)", "S-47227 / E-183634", "07.01.10.002-8"],
  ["meio-cano-braco-direito", "Meio cano de braço direito", "S-47228 / E-183635", "07.01.10.003-6"],
  ["meio-cano-braco-esquerdo", "Meio cano de braço esquerdo", "S-47228 / E-183635", "07.01.10.003-6"],
  ["meio-cano-perna-direita", "Meio cano de perna direita", "S-47228 / E-183706", "07.01.10.003-6"],
  ["meio-cano-perna-esquerdo", "Meio cano de perna esquerda", "S-47228 / E-183706", "07.01.10.003-6"],
  ["luva-ombro-direita", "Luvas com dedos até ombro (mão direita)", "S-47229 / E-183636", "07.01.10.004-4"],
  ["luva-ombro-esquerda", "Luvas com dedos até ombro (mão esquerda)", "S-47229 / E-183636", "07.01.10.004-4"],
  ["meia-tres-quartos-direita", "Meia ¾ direita", "S-47230 / E-183637", "07.01.10.005-2"],
  ["meia-tres-quartos-esquerda", "Meia ¾ esquerda", "S-47230 / E-183637", "07.01.10.005-2"],
  ["meia-perna-inteira-direita", "Meia perna direita inteira", "S-47231 / E-183638", "07.01.10.006-0"],
  ["meia-perna-inteira-esquerda", "Meia perna esquerda inteira", "S-47231 / E-183638", "07.01.10.006-0"],
  ["meia-calca", "Meia calça", "S-47232 / E-183639", "07.01.10.007-9"],
  ["torax-com-mangas", "Tórax com mangas", "S-47233 / E-183640", "07.01.10.008-7"],
  ["torax-sem-mangas", "Tórax sem mangas", "S-47234 / E-183641", "07.01.10.009-5"],
  ["cabeca-pescoco-mascara", "Cabeça e pescoço — máscara", "S-47235 / E-183642", "07.01.10.010-9"],
  ["cabeca-pescoco-colar-cervical", "Cabeça e pescoço — colar cervical", "S-47235 / E-183707", "07.01.10.010-9"],
].map(([id, description, code, susCode]) => ({ id: id ?? "", description: description ?? "", code: code ?? "", susCode: susCode ?? "" }));

export const PRODUCTS_BY_REGION: Record<string, string[]> = {
  "perna-direita": ["meia-joelho-direita", "meio-cano-perna-direita", "meia-tres-quartos-direita", "meia-perna-inteira-direita", "meia-calca"],
  "perna-esquerda": ["meia-joelho-esquerda", "meio-cano-perna-esquerda", "meia-tres-quartos-esquerda", "meia-perna-inteira-esquerda", "meia-calca"],
  "braco-direito": ["meio-cano-braco-direito", "luva-ombro-direita"],
  "antebraco-direito": ["meio-cano-braco-direito", "luva-ombro-direita"],
  "braco-esquerdo": ["meio-cano-braco-esquerdo", "luva-ombro-esquerda"],
  "antebraco-esquerdo": ["meio-cano-braco-esquerdo", "luva-ombro-esquerda"],
  tronco: ["torax-com-mangas", "torax-sem-mangas"], quadril: ["meia-calca"],
  cabeca: ["cabeca-pescoco-mascara", "cabeca-pescoco-colar-cervical"],
  "mao-direita": ["luva-punho-direita", "luva-ombro-direita"],
  "mao-esquerda": ["luva-punho-esquerda", "luva-ombro-esquerda"],
};

export const GLOVE_MEASUREMENTS = [
  "Circunferência da Palma", "Circunferência do Dorso", "Circunferência do Punho",
  "Circunferência do Polegar", "Circunferência do Indicador", "Circunferência do Dedo Médio",
  "Circunferência do Anelar", "Circunferência do Dedo mínimo", "Altura da palma",
  "Altura do polegar", "Altura do indicador", "Altura do dedo médio", "Altura do anelar",
  "Altura do dedo mínimo", "Comprimento total da luva",
];
export const MODEL_OPTIONS = ["Fechada", "Dedo longo sem costura", "Com dedos abertos", "Sem dedos"];

export function measurementNames(productId: string) {
  return productId.startsWith("luva-punho")
    ? GLOVE_MEASUREMENTS
    : ["Medida A — campo demonstrativo", "Medida B — campo demonstrativo"];
}

export function availableProducts(regions: string[]) {
  const ids = new Set(regions.flatMap((selection) => PRODUCTS_BY_REGION[regionName(selection)] ?? []));
  return CATALOG.filter((product) => ids.has(product.id));
}

export function regionName(selection: string) {
  return selection.replace(/^frente-/, "").replace(/^costas-/, "");
}

export function formatDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function seedOrder(
  id: string, name: string, recordNumber: string, requestType: Order["requestType"], region: string,
  productId: string, supplier: string, createdAt: string, status: Status,
  events: Array<[string, Status, string]>, adjustments: Order["adjustments"] = [],
): Order {
  const product = CATALOG.find((item) => item.id === productId) ?? CATALOG[0];
  if (!product) throw new Error("Catálogo demonstrativo vazio");
  return {
    id, patientId: `patient-${recordNumber}`, patientName: name, recordNumber, requestType,
    regions: [region], products: [{ productId: product.id, description: product.description, code: product.code, susCode: product.susCode, model: "", measurements: {} }],
    justification: "Informação fictícia para demonstração.", supplier, createdAt, status,
    history: events.map(([date, eventStatus, description], index) => ({ id: `${id}-event-${index}`, date, status: eventStatus, description, responsible: "Equipe CTQ (demonstração)" })),
    adjustments, attachments: [], imageAuthorizationChecked: false,
  };
}

export const DEMO_ORDERS: Order[] = [
  seedOrder("BC-2026-001", "Paciente Fictício A", "FIC-0001", "Primeira malha", "Membro superior direito", "luva-punho-direita", "Fornecedor Exemplo 1", "2026-11-03", STATUS.ENVIADO_CONFECCAO, [["2026-11-03", STATUS.ENVIADO_CONFECCAO, "Pedido conferido e enviado à confecção."]]),
  seedOrder("BC-2026-002", "Paciente Fictício B", "FIC-0002", "Primeira malha", "Tronco", "torax-sem-mangas", "Fornecedor Exemplo 2", "2026-10-28", STATUS.EM_PRODUCAO, [["2026-10-28", STATUS.ENVIADO_CONFECCAO, "Pedido conferido e enviado à confecção."], ["2026-10-30", STATUS.EM_PRODUCAO, "Fornecedor Exemplo 2 confirmou a produção."]]),
  seedOrder("BC-2026-003", "Paciente Fictício C", "FIC-0003", "Segunda malha", "Face", "cabeca-pescoco-mascara", "Fornecedor Exemplo 1", "2026-10-20", STATUS.EM_TRANSPORTE, [["2026-10-20", STATUS.ENVIADO_CONFECCAO, "Pedido conferido e enviado à confecção."], ["2026-10-22", STATUS.EM_PRODUCAO, "Fornecedor Exemplo 1 confirmou a produção."], ["2026-11-10", STATUS.EM_TRANSPORTE, "Malha enviada pelo fornecedor. Rastreio: EX000000003BR."]]),
  seedOrder("BC-2026-004", "Paciente Fictício D", "FIC-0004", "Primeira malha", "Membro inferior esquerdo", "meia-calca", "Fornecedor Exemplo 2", "2026-10-15", STATUS.AGUARDANDO_PROVA, [["2026-10-15", STATUS.ENVIADO_CONFECCAO, "Pedido conferido e enviado à confecção."], ["2026-10-16", STATUS.EM_PRODUCAO, "Fornecedor Exemplo 2 confirmou a produção."], ["2026-11-05", STATUS.EM_TRANSPORTE, "Malha enviada pelo fornecedor."], ["2026-11-12", STATUS.AGUARDANDO_PROVA, "Malha recebida no CTQ por Enfermagem (fictício)."]]),
  seedOrder("BC-2026-005", "Paciente Fictício E", "FIC-0005", "Primeira malha", "Pescoço", "cabeca-pescoco-colar-cervical", "Fornecedor Exemplo 1", "2026-10-01", STATUS.EM_AJUSTE, [["2026-10-01", STATUS.ENVIADO_CONFECCAO, "Pedido conferido e enviado à confecção."], ["2026-10-03", STATUS.EM_PRODUCAO, "Fornecedor Exemplo 1 confirmou a produção."], ["2026-10-28", STATUS.EM_TRANSPORTE, "Malha enviada pelo fornecedor."], ["2026-11-04", STATUS.AGUARDANDO_PROVA, "Malha recebida no CTQ por Enfermagem (fictício)."], ["2026-11-14", STATUS.EM_AJUSTE, "Prova realizada: precisa de ajuste."]], [{ id: "BC-2026-005-adjustment-1", description: "Reduzir circunferência na base do pescoço.", requestedAt: "2026-11-14", returnedAt: null }]),
  seedOrder("BC-2026-006", "Paciente Fictício F", "FIC-0006", "Segunda malha", "Membro superior esquerdo", "meio-cano-braco-esquerdo", "Fornecedor Exemplo 2", "2026-09-25", STATUS.PRONTA_ENTREGA, [["2026-09-25", STATUS.ENVIADO_CONFECCAO, "Pedido conferido e enviado à confecção."], ["2026-09-27", STATUS.EM_PRODUCAO, "Fornecedor Exemplo 2 confirmou a produção."], ["2026-10-20", STATUS.EM_TRANSPORTE, "Malha enviada pelo fornecedor."], ["2026-10-27", STATUS.AGUARDANDO_PROVA, "Malha recebida no CTQ por Enfermagem (fictício)."], ["2026-11-18", STATUS.PRONTA_ENTREGA, "Prova realizada: malha aprovada."]]),
  seedOrder("BC-2026-007", "Paciente Fictício G", "FIC-0007", "Primeira malha", "Tronco", "torax-com-mangas", "Fornecedor Exemplo 1", "2026-09-02", STATUS.ENTREGUE, [["2026-09-02", STATUS.ENVIADO_CONFECCAO, "Pedido conferido e enviado à confecção."], ["2026-09-04", STATUS.EM_PRODUCAO, "Fornecedor Exemplo 1 confirmou a produção."], ["2026-09-25", STATUS.EM_TRANSPORTE, "Malha enviada pelo fornecedor."], ["2026-09-30", STATUS.AGUARDANDO_PROVA, "Malha recebida no CTQ por Enfermagem (fictício)."], ["2026-10-22", STATUS.ENTREGUE, "Malha entregue a Responsável (fictício). Pedido encerrado."]], [{ id: "BC-2026-007-adjustment-1", description: "Alongar alças em 2 cm.", requestedAt: "2026-10-06", returnedAt: "2026-10-20" }]),
];

export function createInitialState(): DemoState {
  return {
    version: 1,
    orders: DEMO_ORDERS,
    patients: DEMO_ORDERS.map((order) => ({ ...EMPTY_PATIENT, id: order.patientId, name: order.patientName, recordNumber: order.recordNumber })),
    draft: { ...EMPTY_DRAFT, patient: { ...EMPTY_PATIENT }, regions: [], productIds: [], measurements: {}, models: {}, attachments: [] },
  };
}

export function calculateIndicators(orders: Order[]) {
  return {
    open: orders.filter((order) => order.status !== STATUS.ENTREGUE).length,
    production: orders.filter((order) => order.status === STATUS.ENVIADO_CONFECCAO || order.status === STATUS.EM_PRODUCAO || order.status === STATUS.EM_TRANSPORTE).length,
    fitting: orders.filter((order) => order.status === STATUS.AGUARDANDO_PROVA).length,
    done: orders.filter((order) => order.status === STATUS.ENTREGUE).length,
  };
}

export function validateDraftStep(draft: OrderDraft, step: number) {
  const errors: string[] = [];
  if (step === 0 || step === 3) {
    if (!draft.patient.name.trim()) errors.push("Informe o nome do paciente fictício.");
    if (!draft.patient.recordNumber.trim()) errors.push("Informe o prontuário demonstrativo.");
  }
  if (step === 1 || step === 3) {
    if (draft.regions.length === 0) errors.push("Selecione ao menos uma região anatômica.");
    if (draft.productIds.length === 0) errors.push("Selecione ao menos um produto.");
  }
  if (step === 2 || step === 3) {
    draft.productIds.forEach((productId) => {
      const product = CATALOG.find((item) => item.id === productId);
      const values = Object.values(draft.measurements[productId] ?? {}).filter((value) => Number(value) > 0);
      if (values.length < 2) errors.push(`Preencha pelo menos duas medidas válidas para ${product?.description ?? productId}.`);
    });
  }
  return errors;
}

export function createOrderFromDraft(draft: OrderDraft, orders: Order[]) {
  const highest = orders.reduce((max, order) => {
    const match = /BC-\d{4}-(\d+)/.exec(order.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  const id = `BC-${new Date().getFullYear()}-${String(highest + 1).padStart(3, "0")}`;
  const date = new Date().toISOString().slice(0, 10);
  const products = draft.productIds.flatMap((productId) => {
    const product = CATALOG.find((item) => item.id === productId);
    return product ? [{ productId, description: product.description, code: product.code, susCode: product.susCode, model: draft.models[productId] ?? "", measurements: draft.measurements[productId] ?? {} }] : [];
  });
  const patient = { ...draft.patient, id: `patient-${draft.patient.recordNumber.trim()}` };
  const order: Order = {
    id, patientId: patient.id, patientName: patient.name.trim(), recordNumber: patient.recordNumber.trim(),
    requestType: draft.requestType, regions: draft.regions, products, justification: draft.justification.trim(),
    supplier: "Fornecedor a definir", createdAt: date, status: STATUS.ENVIADO_CONFECCAO,
    history: [{ id: `${id}-event-0`, date, status: STATUS.ENVIADO_CONFECCAO, description: "Pedido demonstrativo conferido e enviado à confecção.", responsible: "Equipe CTQ (demonstração)" }],
    adjustments: [], attachments: draft.attachments, imageAuthorizationChecked: draft.imageAuthorizationChecked,
  };
  return { order, patient };
}

export function validateOrderAction(order: Order, data: ActionData) {
  const errors: string[] = [];
  if (order.status === STATUS.ENTREGUE) return ["Este pedido já foi encerrado."];
  if (!validDate(data.date ?? "")) errors.push("Informe uma data válida.");
  if ((order.status === STATUS.EM_TRANSPORTE || order.status === STATUS.PRONTA_ENTREGA) && !(data.receivedBy ?? "").trim()) errors.push("Informe quem recebeu a malha.");
  if (order.status === STATUS.AGUARDANDO_PROVA && !["APROVADA", "AJUSTE"].includes(data.result ?? "")) errors.push("Informe o resultado da prova.");
  if (order.status === STATUS.AGUARDANDO_PROVA && data.result === "AJUSTE" && !(data.adjustmentDescription ?? "").trim()) errors.push("Descreva o ajuste necessário.");
  const last = order.history.at(-1);
  if (last && validDate(data.date ?? "") && (data.date ?? "") < last.date) errors.push(`A data não pode ser anterior ao último registro (${formatDate(last.date)}).`);
  return errors;
}

export function applyOrderAction(order: Order, data: ActionData): Order {
  const date = data.date ?? "";
  const note = (data.observation ?? "").trim();
  let status = order.status;
  let description = "";
  let adjustments = order.adjustments;
  if (order.status === STATUS.ENVIADO_CONFECCAO) {
    status = STATUS.EM_PRODUCAO; description = `${order.supplier} confirmou o início da produção.`;
    if (data.forecast) description += ` Previsão de envio: ${formatDate(data.forecast)}.`;
  } else if (order.status === STATUS.EM_PRODUCAO) {
    status = STATUS.EM_TRANSPORTE; description = "Malha enviada pelo fornecedor.";
    if (data.tracking?.trim()) description += ` Rastreio: ${data.tracking.trim()}.`;
  } else if (order.status === STATUS.EM_TRANSPORTE) {
    status = STATUS.AGUARDANDO_PROVA; description = `Malha recebida no CTQ por ${(data.receivedBy ?? "").trim()}.`;
  } else if (order.status === STATUS.AGUARDANDO_PROVA && data.result === "AJUSTE") {
    status = STATUS.EM_AJUSTE; description = `Prova realizada: precisa de ajuste — ${(data.adjustmentDescription ?? "").trim()}.`;
    adjustments = [...adjustments, { id: `${order.id}-adjustment-${adjustments.length + 1}`, description: (data.adjustmentDescription ?? "").trim(), requestedAt: date, returnedAt: null }];
  } else if (order.status === STATUS.AGUARDANDO_PROVA) {
    status = STATUS.PRONTA_ENTREGA; description = "Prova realizada: malha aprovada.";
  } else if (order.status === STATUS.EM_AJUSTE) {
    status = STATUS.AGUARDANDO_PROVA; description = "Malha ajustada retornou ao CTQ para nova prova.";
    adjustments = adjustments.map((adjustment, index) => index === adjustments.length - 1 ? { ...adjustment, returnedAt: date } : adjustment);
  } else if (order.status === STATUS.PRONTA_ENTREGA) {
    status = STATUS.ENTREGUE; description = `Malha entregue a ${(data.receivedBy ?? "").trim()}. Pedido encerrado.`;
  }
  if (note) description += ` Obs.: ${note}`;
  return { ...order, status, adjustments, history: [...order.history, { id: `${order.id}-event-${order.history.length}`, date, status, description, responsible: "Equipe CTQ (demonstração)" }] };
}
