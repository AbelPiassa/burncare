import { z } from 'zod';

export const statuses = ['Registrada', 'Encaminhada ao fornecedor', 'Em produção', 'Despachada', 'Em transporte', 'Recebida pelo CTQ', 'Aguardando prova', 'Em ajuste', 'Entregue e encerrada'] as const;
export type Status = typeof statuses[number];
export type Profile = 'ctq' | 'fornecedor';
export const regionNames = ['Cabeça', 'Pescoço', 'Tronco', 'Braços', 'Mãos', 'Pernas', 'Pés'] as const;
export type Region = typeof regionNames[number];
export const products = [
  { id: 'DEMO-01', name: 'Máscara compressiva', region: 'Cabeça', template: 'Cabeça', fields: ['Circunferência da cabeça', 'Altura facial', 'Largura facial'] },
  { id: 'DEMO-02', name: 'Colar compressivo', region: 'Pescoço', template: 'Pescoço', fields: ['Circunferência do pescoço', 'Altura do pescoço'] },
  { id: 'DEMO-03', name: 'Colete compressivo', region: 'Tronco', template: 'Tronco', fields: ['Tórax', 'Cintura', 'Quadril', 'Comprimento do tronco'] },
  { id: 'DEMO-04', name: 'Manga compressiva', region: 'Braços', template: 'Braço', fields: ['Braço', 'Cotovelo', 'Punho', 'Comprimento do braço'] },
  { id: 'DEMO-05', name: 'Luva compressiva', region: 'Mãos', template: 'Mão', fields: ['Punho', 'Palma', 'Comprimento da mão'] },
  { id: 'DEMO-06', name: 'Calça compressiva', region: 'Pernas', template: 'Perna', fields: ['Coxa', 'Joelho', 'Panturrilha', 'Comprimento da perna'] },
  { id: 'DEMO-07', name: 'Meia compressiva', region: 'Pés', template: 'Pé', fields: ['Tornozelo', 'Peito do pé', 'Comprimento do pé'] },
] satisfies Array<{ id: string; name: string; region: Region; template: string; fields: string[] }>;

export const patientSchema = z.object({
  id: z.string().trim().min(1).max(40), name: z.string().trim().min(2, 'Informe um nome fictício.').max(100),
  age: z.string().refine(v => v === '' || (/^\d+$/.test(v) && Number(v) <= 130), 'Informe uma idade numérica válida.'),
  address: z.string().max(200), city: z.string().max(100), phone: z.string().max(25),
  weight: z.string().refine(v => v === '' || (Number(v) > 0 && Number.isFinite(Number(v))), 'Peso deve ser positivo.'),
  height: z.string().refine(v => v === '' || (Number(v) > 0 && Number.isFinite(Number(v))), 'Altura deve ser positiva.'),
});
export type Patient = z.infer<typeof patientSchema>;
const attachmentSchema = z.object({ id: z.string(), name: z.string().max(180), type: z.string(), size: z.number().nonnegative(), data: z.string() });
export type Attachment = z.infer<typeof attachmentSchema>;
const measurementSchema = z.object({ model: z.string(), finish: z.string(), values: z.record(z.string(), z.string()) });
export type Measurement = z.infer<typeof measurementSchema>;
export const draftSchema = z.object({ patient: patientSchema, date: z.string(), kind: z.enum(['Primeira malha', 'Segunda malha']), professional: z.string().max(100), regions: z.array(z.enum(regionNames)), productIds: z.array(z.string()), justification: z.string().max(1000), measurements: z.record(z.string(), measurementSchema), authorized: z.boolean(), attachments: z.array(attachmentSchema).max(5), notes: z.string().max(1000) });
export type Draft = z.infer<typeof draftSchema>;
const eventSchema = z.object({ id: z.string(), date: z.string(), responsible: z.string(), status: z.enum(statuses), note: z.string().max(1000) });
export type OrderEvent = z.infer<typeof eventSchema>;
const fittingSchema = z.object({ date: z.string(), result: z.enum(['Aprovada', 'Necessita ajuste']), note: z.string().max(1000) });
export type Fitting = z.infer<typeof fittingSchema>;
export const orderSchema = draftSchema.extend({ id: z.string(), created: z.string(), status: z.enum(statuses), events: z.array(eventSchema), fittings: z.array(fittingSchema), tracking: z.string().max(100), shipping: z.string().max(200) });
export type Order = z.infer<typeof orderSchema>;
export const storeSchema = z.object({ version: z.literal(1), patients: z.array(patientSchema), orders: z.array(orderSchema), draft: draftSchema.nullable() });
export type Store = z.infer<typeof storeSchema>;
export const STORE_KEY = 'burncare.demo.v1';
export const emptyPatient = (): Patient => ({ id: '', name: '', age: '', address: '', city: '', phone: '', weight: '', height: '' });
export const emptyDraft = (): Draft => ({ patient: emptyPatient(), date: new Date().toISOString().slice(0,10), kind: 'Primeira malha', professional: '', regions: [], productIds: [], justification: '', measurements: {}, authorized: false, attachments: [], notes: '' });
export function bmi(weight: string, height: string) { const w = Number(weight), h = Number(height); return Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0 ? (w / ((h / 100) ** 2)).toFixed(1) : null; }
export function allowedTransitions(status: Status, profile: Profile): Status[] {
  if (profile === 'fornecedor') {
    if (status === 'Encaminhada ao fornecedor') return ['Em produção'];
    if (status === 'Em produção') return ['Despachada'];
    if (status === 'Despachada') return ['Em transporte'];
    if (status === 'Em ajuste') return ['Em produção'];
    return [];
  }
  if (status === 'Registrada') return ['Encaminhada ao fornecedor'];
  if (status === 'Em transporte' || status === 'Despachada') return ['Recebida pelo CTQ'];
  if (status === 'Recebida pelo CTQ') return ['Aguardando prova'];
  return [];
}
export function canFit(status: Status) { return status === 'Aguardando prova'; }
export function fittingStatus(fitting: Fitting): Status { return fitting.result === 'Necessita ajuste' ? 'Em ajuste' : 'Entregue e encerrada'; }
export function isActive(order: Order) { return order.status !== 'Entregue e encerrada'; }
export function visibleOrders(orders: Order[], profile: Profile | null) { return profile === 'fornecedor' ? orders.filter(o => o.status !== 'Registrada') : orders; }
export function nextOrderId(orders: Order[], year: number) { const prefix = `BC-${year}-`; const n = Math.max(0, ...orders.filter(o => o.id.startsWith(prefix)).map(o => Number(o.id.slice(prefix.length)) || 0)); return `${prefix}${String(n + 1).padStart(3, '0')}`; }
export function validateStep(draft: Draft, step: number): string | null {
  if (step === 1) { const p = patientSchema.safeParse(draft.patient); if (!p.success) return p.error.issues[0]?.message ?? 'Confira os dados do paciente.'; if (!draft.date || !draft.professional.trim()) return 'Informe a data e o profissional solicitante.'; }
  if (step === 2 && (!draft.regions.length || !draft.productIds.length || draft.productIds.some(id => { const p = products.find(x => x.id === id); return !p || !draft.regions.includes(p.region); }))) return 'Selecione uma região e pelo menos um produto compatível.';
  if (step === 3) { for (const id of draft.productIds) { const p = products.find(x => x.id === id), m = draft.measurements[id]; if (!p || !m?.model || !m.finish) return 'Selecione o modelo e o acabamento de cada peça.'; if (p.fields.some(f => !m.values[f] || !Number.isFinite(Number(m.values[f])) || Number(m.values[f]) <= 0)) return 'Preencha as medidas demonstrativas com valores positivos.'; } }
  return null;
}
export function formatDate(value: string, time = false) { return new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleDateString('pt-BR', time ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: '2-digit', year: 'numeric' }); }

export function seedStore(): Store {
  const patients: Patient[] = ['Aurora', 'Bento', 'Cecília', 'Davi', 'Elisa', 'Felipe', 'Gabriela', 'Henrique'].map((name, i) => ({ id: `DEMO-HU-${String(i + 1).padStart(3,'0')}`, name: `Paciente ${name}`, age: String(24 + i * 4), address: 'Endereço fictício — demonstração', city: 'Londrina / PR', phone: '', weight: String(62 + i * 2), height: '168' }));
  const seedStatuses: Status[] = ['Aguardando prova', 'Em produção', 'Em transporte', 'Encaminhada ao fornecedor', 'Registrada', 'Em ajuste', 'Entregue e encerrada', 'Em produção'];
  const orders = patients.map((patient, i): Order => { const p = products[i % products.length] ?? products[0]; const status = seedStatuses[i] ?? 'Registrada'; const created = `2026-11-${String(12+i).padStart(2,'0')}T10:30:00.000Z`; const product = p ?? { id:'DEMO-05', region:'Mãos' as Region, fields:['Punho'] }; return { ...emptyDraft(), patient, date: created.slice(0,10), professional: 'Equipe CTQ · demonstração', regions: [product.region], productIds: [product.id], measurements: { [product.id]: { model: 'Sob medida · demo', finish: 'Costura externa', values: Object.fromEntries(product.fields.map((field,j) => [field, String(18+j*6)])) } }, id: `BC-2026-${String(i+1).padStart(3,'0')}`, created, status, kind: i===6 ? 'Segunda malha' : 'Primeira malha', events: [{ id:`seed-${i}-0`, date:created, responsible:'Equipe CTQ · demonstração', status:'Registrada', note:'Solicitação fictícia cadastrada.' }, ...(status === 'Registrada' ? [] : [{ id:`seed-${i}-1`, date:`2026-11-${String(20+i%6).padStart(2,'0')}T14:00:00.000Z`, responsible: status==='Em produção' ? 'Fornecedor · demonstração' : 'Equipe CTQ · demonstração', status, note:'Estado de exemplo para demonstração institucional.' }])], fittings: status==='Em ajuste' ? [{ date:'2026-11-25', result:'Necessita ajuste', note:'Ajuste demonstrativo no acabamento.' }] : [], tracking: status==='Em transporte' ? 'ENVIO-DEMO-003' : '', shipping: status==='Em transporte' ? 'Transporte fictício · sem envio real' : '', notes:'Registro fictício para demonstração. Sem validade clínica.' }; });
  return { version: 1, patients, orders, draft: null };
}
