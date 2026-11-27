import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { STORE_KEY, seedStore, storeSchema, type Store, type Profile, type Draft, type Order, type Patient } from '@/lib/burncare/model';

type Context = { store: Store; ready: boolean; storageError: string; profile: Profile | null; setProfile: (p: Profile | null) => void; saveDraft: (d: Draft | null) => boolean; savePatient: (p: Patient) => boolean; saveOrder: (o: Order) => boolean; retry: () => void };
const DemoContext = createContext<Context | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(seedStore);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [profile, setSelectedProfile] = useState<Profile | null>(null);
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) { const parsed = storeSchema.safeParse(JSON.parse(raw)); if (!parsed.success) throw new Error('Dados locais inválidos.'); setStore(parsed.data); }
      else localStorage.setItem(STORE_KEY, JSON.stringify(seedStore()));
      const p = sessionStorage.getItem('burncare.profile');
      if (p === 'ctq' || p === 'fornecedor') setSelectedProfile(p);
      setStorageError('');
    } catch { setStorageError('Armazenamento local indisponível ou inválido. Os dados não podem ser gravados. Libere o armazenamento do navegador e tente novamente.'); }
    setReady(true);
  }
  useEffect(() => { load(); }, []);
  function persist(next: Store) {
    const parsed = storeSchema.safeParse(next);
    if (!parsed.success) { toast.error('Não foi possível validar os dados. Confira os campos.'); return false; }
    try { localStorage.setItem(STORE_KEY, JSON.stringify(parsed.data)); setStore(parsed.data); setStorageError(''); return true; }
    catch { setStorageError('Não foi possível salvar. O armazenamento do navegador está cheio ou bloqueado. Remova anexos grandes e tente novamente.'); toast.error('Dados não salvos. Verifique o armazenamento local.'); return false; }
  }
  function setProfile(p: Profile | null) { setSelectedProfile(p); try { if (p) sessionStorage.setItem('burncare.profile',p); else sessionStorage.removeItem('burncare.profile'); } catch { /* profile remains session-only in memory */ } }
  const value: Context = { store, ready, storageError, profile, setProfile, retry: load,
    saveDraft: draft => persist({ ...store, draft }),
    savePatient: p => persist({ ...store, patients: [...store.patients.filter(x => x.id !== p.id), p] }),
    saveOrder: o => persist({ ...store, orders: [o, ...store.orders.filter(x => x.id !== o.id)], patients: [...store.patients.filter(p => p.id !== o.patient.id), o.patient], draft: null }),
  };
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
export function useDemo() { const ctx = useContext(DemoContext); if (!ctx) throw new Error('BurnCare provider missing'); return ctx; }
