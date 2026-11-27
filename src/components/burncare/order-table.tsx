import { Link } from '@tanstack/react-router';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { products, formatDate, type Order } from '@/lib/burncare/model';
import { StatusBadge, EmptyState } from './shell';
export function OrderTable({ orders, limit }: { orders: Order[]; limit?: number }) {
  const rows = limit ? orders.slice(0,limit) : orders;
  if (!rows.length) return <EmptyState title="Nenhum pedido encontrado" text="Altere os filtros ou registre uma nova solicitação demonstrativa." />;
  return <div className="table-scroll"><table className="order-table"><thead><tr><th>PEDIDO / PACIENTE</th><th>PRODUTO</th><th>DATA DO PEDIDO</th><th>STATUS</th><th aria-label="Ações" /></tr></thead><tbody>{rows.map(o => <tr key={o.id}><td><Link className="order-id" to="/pedidos/$id" params={{id:o.id}}>{o.id}<ArrowUpRight size={12} /></Link><div className="patient-cell">{o.patient.name}</div><small className="muted">{o.patient.id}</small></td><td><span>{o.productIds.map(id => products.find(p => p.id===id)?.name ?? id).join(', ')}</span><small className="table-subline">{o.kind}</small></td><td>{formatDate(o.created)}</td><td><StatusBadge status={o.status} /></td><td><Button variant="ghost" size="icon" asChild title={`Ver ${o.id}`}><Link to="/pedidos/$id" params={{id:o.id}} aria-label={`Ver ${o.id}`}><ChevronRight /></Link></Button></td></tr>)}</tbody></table></div>;
}
