import { createFileRoute, Link } from "@tanstack/react-router";
import { OrderDetail } from "@/components/burncare/order-detail";
import { useDemonstration } from "@/components/burncare/store";

export const Route = createFileRoute("/pedidos/$id")({
  head: ({ params }) => ({ meta: [
    { title: `Pedido ${params.id} | BurnCare CTQ HU` },
    { name: "description", content: "Detalhes e acompanhamento demonstrativo de um pedido de malha compressiva." },
    { property: "og:title", content: `Pedido ${params.id} | BurnCare CTQ HU` },
    { property: "og:description", content: "Detalhes, medidas, histórico e próximas ações do pedido fictício." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const { state } = useDemonstration();
  const order = state.orders.find((item) => item.id === id);
  if (!order) return <div className="card p-8 text-center"><h1 className="text-xl font-semibold">Pedido não encontrado</h1><p className="mt-2 text-sm text-muted-foreground">Ele pode ter sido removido ao reiniciar a demonstração.</p><Link to="/historico" className="btn-primary mt-5 no-underline">Voltar ao histórico</Link></div>;
  return <OrderDetail order={order} />;
}
