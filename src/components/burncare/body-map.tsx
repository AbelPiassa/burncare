import { useState } from "react";

const regions = [
  { id: "cabeca", name: "Cabeça", path: "M45 25a15 15 0 1 0 30 0a15 15 0 1 0-30 0", area: [40, 8, 40, 36] },
  { id: "tronco", name: "Tronco", path: "M45 44H75L79 64L72 101H48L41 64Z", area: [38, 42, 44, 62] },
  { id: "quadril", name: "Quadril", path: "M48 103H72L79 122H41Z", area: [38, 101, 44, 24] },
  { id: "braco-direito", name: "Braço direito", path: "M40 48L31 51L23 80L34 83L42 57Z", area: [19, 45, 25, 40] },
  { id: "antebraco-direito", name: "Antebraço direito", path: "M23 82L34 85L27 108L16 105Z", area: [12, 80, 24, 31] },
  { id: "mao-direita", name: "Mão direita", path: "M16 107L27 110L24 124L12 121Z", area: [8, 105, 23, 22] },
  { id: "braco-esquerdo", name: "Braço esquerdo", path: "M80 48L89 51L97 80L86 83L78 57Z", area: [76, 45, 25, 40] },
  { id: "antebraco-esquerdo", name: "Antebraço esquerdo", path: "M97 82L86 85L93 108L104 105Z", area: [84, 80, 24, 31] },
  { id: "mao-esquerda", name: "Mão esquerda", path: "M104 107L93 110L96 124L108 121Z", area: [89, 105, 23, 22] },
  { id: "perna-direita", name: "Perna direita", path: "M42 124H59L55 189H33L39 177Z", area: [30, 122, 31, 70] },
  { id: "perna-esquerda", name: "Perna esquerda", path: "M78 124H61L65 189H87L81 177Z", area: [59, 122, 31, 70] },
] as const;

export function BodyMap({ selected, onChange }: { selected: string[]; onChange: (regions: string[]) => void }) {
  const [view, setView] = useState<"frente" | "costas">("frente");
  const toggle = (id: string) => {
    const selection = `${view}-${id}`;
    onChange(selected.includes(selection) ? selected.filter((item) => item !== selection) : [...selected, selection]);
  };

  return (
    <div className="mx-auto w-full max-w-[250px]">
      <div className="mb-3 grid grid-cols-2 gap-2" role="group" aria-label="Visão do corpo">
        {(["frente", "costas"] as const).map((item) => (
          <button key={item} type="button" onClick={() => setView(item)} aria-pressed={view === item}
            className={`rounded-md border px-3 py-2 text-sm capitalize ${view === item ? "border-primary bg-accent font-semibold text-accent-foreground" : "bg-card text-muted-foreground"}`}>
            {item}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 120 200" className="h-[390px] w-full" role="group" aria-label={`Mapa corporal — ${view}`}>
        <g transform={view === "costas" ? "translate(120 0) scale(-1 1)" : undefined}>
          {regions.map((region) => {
            const id = `${view}-${region.id}`;
            return <path key={region.id} d={region.path} className={`map-region ${selected.includes(id) ? "map-region-selected" : ""}`} pointerEvents="none" />;
          })}
        </g>
        {regions.map((region) => {
          const [x, y, width, height] = region.area;
          const left = view === "costas" ? 120 - x - width : x;
          const id = `${view}-${region.id}`;
          return <rect key={region.id} x={left} y={y} width={width} height={height} fill="transparent" className="map-hit" role="button" tabIndex={0}
            aria-label={`${region.name}, ${view}`} aria-pressed={selected.includes(id)} onClick={() => toggle(region.id)}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggle(region.id); } }} />;
        })}
      </svg>
      <p className="text-center text-xs leading-5 text-muted-foreground">Selecione as regiões diretamente no mapa. A indicação clínica deve ser validada pela equipe.</p>
    </div>
  );
}
