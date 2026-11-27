import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/burncare/shell';
import { OrderDetail } from '@/components/burncare/order-detail';
export const Route=createFileRoute('/pedidos/$id')({head:({params})=>({meta:[{title:`${params.id} | Solicitação · BurnCare`},{name:'description',content:'Detalhes, medidas e histórico de uma solicitação demonstrativa de malha compressiva.'},{property:'og:title',content:`${params.id} | BurnCare`},{property:'og:description',content:'Acompanhe produção, envio, provas, ajustes e entrega de um pedido fictício.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:DetailPage});
function DetailPage(){const {id}=Route.useParams();return <AppShell><OrderDetail id={id}/></AppShell>;}
