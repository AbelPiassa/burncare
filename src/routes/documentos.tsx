import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireCtq } from "@/components/burncare/shell";

export const Route = createFileRoute("/documentos")({
  component: () => <RequireCtq><Outlet /></RequireCtq>,
});
