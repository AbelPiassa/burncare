import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/burncare/shell";
import { DemonstrationProvider } from "@/components/burncare/store";
import "@/styles.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BurnCare — CTQ HU" },
      { name: "description", content: "Protótipo demonstrativo para solicitações de malhas compressivas do CTQ HU." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>
        <DemonstrationProvider><AppShell><Outlet /></AppShell></DemonstrationProvider>
        <Scripts />
      </body>
    </html>
  );
}
