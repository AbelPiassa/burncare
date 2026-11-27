import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  applyOrderAction, createInitialState, createOrderFromDraft, persistedStateSchema,
  type ActionData, type DemoState, type Order, type OrderDraft,
} from "@/lib/burncare/model";

const STORAGE_KEY = "burncare-demonstration-v1";

type StoreValue = {
  state: DemoState;
  storageWarning: string;
  updateDraft: (update: Partial<OrderDraft>) => void;
  updatePatient: (field: string, value: string) => void;
  submitDraft: () => Order;
  registerAction: (id: string, data: ActionData) => void;
  resetDemonstration: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function DemonstrationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => createInitialState());
  const [loaded, setLoaded] = useState(false);
  const [storageWarning, setStorageWarning] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = persistedStateSchema.safeParse(JSON.parse(raw));
        if (parsed.success) setState(parsed.data);
        else setStorageWarning("Os dados locais salvos eram inválidos; a demonstração inicial foi restaurada.");
      }
    } catch {
      setStorageWarning("Não foi possível ler os dados locais; a demonstração inicial foi restaurada.");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      setStorageWarning("O navegador não conseguiu salvar localmente. Reduza os anexos e tente novamente.");
    }
  }, [loaded, state]);

  const value = useMemo<StoreValue>(() => ({
    state,
    storageWarning,
    updateDraft: (update) => setState((current) => ({ ...current, draft: { ...current.draft, ...update } })),
    updatePatient: (field, value) => setState((current) => ({
      ...current,
      draft: { ...current.draft, patient: { ...current.draft.patient, [field]: value } },
    })),
    submitDraft: () => {
      const { order, patient } = createOrderFromDraft(state.draft, state.orders);
      setState((current) => ({
        ...current,
        orders: [order, ...current.orders.filter((item) => item.id !== order.id)],
        patients: [patient, ...current.patients.filter((item) => item.id !== patient.id)],
        draft: createInitialState().draft,
      }));
      return order;
    },
    registerAction: (id, data) => setState((current) => ({
      ...current,
      orders: current.orders.map((order) => order.id === id ? applyOrderAction(order, data) : order),
    })),
    resetDemonstration: () => {
      setState(createInitialState());
      setStorageWarning("");
    },
  }), [state, storageWarning]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useDemonstration() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useDemonstration deve ser usado dentro de DemonstrationProvider");
  return value;
}
