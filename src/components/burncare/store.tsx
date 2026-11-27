import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  PROFILE_INFO, applyOrderAction, canProfileAct, createInitialState, createOrderFromDraft, migrateState,
  savePatientInState, validateOrderAction, validatePatient,
  type ActionData, type DemoState, type Order, type OrderDraft, type Patient, type Profile,
} from "@/lib/burncare/model";

export const STORAGE_KEY = "burncare-demonstration-v1";

type StoreValue = {
  state: DemoState;
  loaded: boolean;
  storageWarning: string;
  setProfile: (profile: Profile | null) => void;
  updateDraft: (update: Partial<OrderDraft>) => void;
  updatePatient: (field: string, value: string) => void;
  savePatient: (patient: Patient) => string[];
  submitDraft: () => Order;
  registerAction: (id: string, data: ActionData) => string[];
  resetDemonstration: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function DemonstrationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => createInitialState());
  const [loaded, setLoaded] = useState(false);
  const [storageWarning, setStorageWarning] = useState("");
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = migrateState(JSON.parse(raw));
        if (parsed) setState(parsed);
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
    loaded,
    storageWarning,
    setProfile: (profile) => setState((current) => ({ ...current, profile })),
    updateDraft: (update) => setState((current) => ({ ...current, draft: { ...current.draft, ...update } })),
    updatePatient: (field, value) => setState((current) => ({
      ...current,
      draft: { ...current.draft, patient: { ...current.draft.patient, [field]: value } },
    })),
    savePatient: (patient) => {
      const errors = validatePatient(patient, stateRef.current.patients);
      if (errors.length === 0) {
        const next = savePatientInState(stateRef.current, patient);
        stateRef.current = next;
        setState(next);
      }
      return errors;
    },
    submitDraft: () => {
      const current = stateRef.current;
      const { order, patient } = createOrderFromDraft(current.draft, current.orders);
      const withPatient = savePatientInState(current, patient);
      const next = { ...withPatient, orders: [order, ...withPatient.orders.filter((item) => item.id !== order.id)], draft: createInitialState().draft };
      stateRef.current = next;
      setState(next);
      return order;
    },
    registerAction: (id, data) => {
      const current = stateRef.current;
      const order = current.orders.find((item) => item.id === id);
      if (!order) return ["Pedido não encontrado."];
      if (!canProfileAct(current.profile, order.status)) return ["O perfil ativo não pode registrar esta etapa."];
      const errors = validateOrderAction(order, data);
      if (errors.length) return errors;
      const responsible = PROFILE_INFO[current.profile ?? "CTQ"].responsible;
      const next = { ...current, orders: current.orders.map((item) => item.id === id ? applyOrderAction(item, data, responsible) : item) };
      stateRef.current = next;
      setState(next);
      return [];
    },
    resetDemonstration: () => {
      const next = { ...createInitialState(), profile: stateRef.current.profile };
      stateRef.current = next;
      setState(next);
      setStorageWarning("");
    },
  }), [state, loaded, storageWarning]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useDemonstration() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useDemonstration deve ser usado dentro de DemonstrationProvider");
  return value;
}
