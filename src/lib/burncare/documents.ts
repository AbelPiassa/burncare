import { products, formatDate, type Order } from './model';
export async function exportOrderPdf(order: Order) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  let y = 20;
  function line(text: string, size = 10) { doc.setFontSize(size); const lines = doc.splitTextToSize(text, 174) as string[]; for (const textLine of lines) { if (y > 272) { doc.addPage(); y = 20; } doc.text(textLine, 18, y); y += size * 0.5 + 2; } }
  line('BurnCare | CTQ - HU Londrina', 18); line('SIMULAÇÃO - SEM DADOS REAIS', 12); line('Ficha demonstrativa. Sem validade clínica ou aprovação institucional.'); y += 6;
  line(`Solicitação ${order.id}`, 14); line(`Paciente fictício: ${order.patient.name} | ${order.patient.id}`); line(`Idade: ${order.patient.age || 'Não informada'} | Cidade: ${order.patient.city || 'Não informada'}`); line(`Atendimento: ${formatDate(order.date)} | ${order.kind}`); line(`Solicitante: ${order.professional}`); line(`Status: ${order.status}`); line(`Regiões: ${order.regions.join(', ')}`); line(`Justificativa: ${order.justification || 'Não informada'}`); y += 5;
  for (const id of order.productIds) { const p = products.find(p => p.id === id), m = order.measurements[id]; line(`${p?.name ?? id} | ${id}`,12); if (m) { line(`Modelo: ${m.model} | Acabamento: ${m.finish}`); for (const [field,value] of Object.entries(m.values)) line(`${field}: ${value} cm (demonstrativo)`); } }
  line(`Anexos: ${order.attachments.map(a => a.name).join(', ') || 'Sem anexos'}`); line(`Autorização de imagem conferida: ${order.authorized ? 'Sim (demo)' : 'Não registrada'}`); line(`Observações: ${order.notes || 'Sem observações'}`); y += 5;
  line('Histórico de movimentações',12); for (const e of order.events) line(`${formatDate(e.date,true)} | ${e.status} | ${e.responsible}. ${e.note}`);
  for (const f of order.fittings) line(`Prova: ${formatDate(f.date)} | ${f.result} | ${f.note}`);
  doc.save(`${order.id}-DEMONSTRACAO.pdf`);
}
