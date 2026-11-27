import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/burncare/shell';
import { OrderWizard } from '@/components/burncare/wizard';
export const Route=createFileRoute('/novo-pedido')({head:()=>({meta:[{title:'Novo pedido | BurnCare'},{name:'description',content:'Elabore uma solicitação demonstrativa de malha compressiva em quatro etapas.'},{property:'og:title',content:'Novo pedido | BurnCare'},{property:'og:description',content:'Paciente, prescrição, regiões, produtos, medidas e conferência em um fluxo conectado.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:()=> <AppShell><OrderWizard /></AppShell>});
