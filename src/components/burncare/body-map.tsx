import { useState } from 'react';
import { RotateCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { regionNames, type Region } from '@/lib/burncare/model';

const shapes: { region: Region; d: string }[] = [
  { region:'Cabeça', d:'M120 15 C99 15 92 31 94 51 C95 68 105 77 120 77 C135 77 145 68 146 51 C148 31 141 15 120 15Z' },
  { region:'Pescoço', d:'M106 77 L106 91 L96 97 L144 97 L134 91 L134 77Z' },
  { region:'Tronco', d:'M96 99 Q84 101 86 127 L94 171 L90 202 Q100 219 120 219 Q140 219 150 202 L146 171 L154 127 Q156 101 144 99Z' },
  { region:'Braços', d:'M84 103 Q72 105 69 124 L59 166 L47 210 L62 215 L78 174 L89 138Z M156 103 Q168 105 171 124 L181 166 L193 210 L178 215 L162 174 L151 138Z' },
  { region:'Mãos', d:'M47 213 L42 222 L36 238 Q35 245 40 243 L45 231 L43 250 Q44 255 48 250 L52 235 L52 253 Q56 257 58 250 L60 229 L66 224 L62 216Z M193 213 L198 222 L204 238 Q205 245 200 243 L195 231 L197 250 Q196 255 192 250 L188 235 L188 253 Q184 257 182 250 L180 229 L174 224 L178 216Z' },
  { region:'Pernas', d:'M91 218 Q104 226 117 222 L113 278 L106 339 L85 339 L85 283Z M123 222 Q136 226 149 218 L155 283 L155 339 L134 339 L127 278Z' },
  { region:'Pés', d:'M85 343 L106 343 L107 359 Q106 370 94 371 L73 371 Q68 369 72 365 L84 353Z M134 343 L155 343 L156 353 L168 365 Q172 369 167 371 L146 371 Q134 370 133 359Z' },
];
export function BodyMap({ selected, onSelect, readonly = false }: { selected: Region[]; onSelect?: (r: Region) => void; readonly?: boolean }) {
  const [back, setBack] = useState(false);
  return <div className="body-map"><div className="body-map-heading"><span>{back ? 'Vista posterior' : 'Vista anterior'}</span><Button variant="ghost" size="sm" onClick={() => setBack(!back)}><RotateCw />{back ? 'Frente' : 'Costas'}</Button></div><svg viewBox="0 0 240 390" role="img" aria-label={`Mapa corporal ${back ? 'costas' : 'frente'}`} className="anatomy"><defs><pattern id="map-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" className="anatomy-grid" fill="none" /></pattern></defs><rect width="240" height="390" fill="url(#map-grid)" />{shapes.map(({ region,d }) => <path key={region} d={d} className={`body-region ${selected.includes(region) ? 'selected' : ''}`} role={readonly ? undefined : 'button'} tabIndex={readonly ? undefined : 0} aria-label={region} aria-pressed={selected.includes(region)} onClick={() => onSelect?.(region)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(region); } }}><title>{region}</title></path>)}{!back && <><path d="M106 44 L113 44 M127 44 L134 44 M116 61 Q120 64 124 61" className="anatomy-detail" /><path d="M120 113 L120 193 M100 147 Q120 154 140 147" className="anatomy-detail" /></>}{back && <path d="M120 106 L120 202 M103 123 L114 145 M137 123 L126 145" className="anatomy-detail" />}</svg>{!readonly && <div className="region-options">{regionNames.map(r => <Button key={r} variant={selected.includes(r) ? 'secondary' : 'outline'} size="sm" onClick={() => onSelect?.(r)}>{selected.includes(r) && <Check />}{r}</Button>)}</div>}</div>;
}
