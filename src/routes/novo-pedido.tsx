import { createFileRoute } from "@tanstack/react-router";
import { OrderWizard } from "@/components/burncare/wizard";

export const Route = createFileRoute("/novo-pedido")({
  head: () => ({ meta: [
    { title: "Novo pedido | BurnCare CTQ HU" },
    { name: "description", content: "Formulário demonstrativo em quatro etapas para solicitar malhas compressivas." },
    { property: "og:title", content: "Novo pedido | BurnCare CTQ HU" },
    { property: "og:description", content: "Identificação, região, produtos, medidas, anexos e conferência em uma solicitação fictícia." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: OrderWizard,
});
