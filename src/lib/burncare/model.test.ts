import { describe, expect, it } from "vitest";
import {
  DEMO_ORDERS, STATUS, applyOrderAction, calculateIndicators, createInitialState,
  validateDraftStep, validateOrderAction,
} from "./model";

describe("regras demonstrativas do BurnCare", () => {
  it("calcula os indicadores a partir dos sete pedidos fictícios", () => {
    expect(calculateIndicators(DEMO_ORDERS)).toEqual({ open: 6, production: 3, fitting: 1, done: 1 });
  });

  it("exige descrição quando a prova precisa de ajuste", () => {
    const order = DEMO_ORDERS.find((item) => item.status === STATUS.AGUARDANDO_PROVA);
    expect(order).toBeDefined();
    if (!order) return;
    expect(validateOrderAction(order, { date: "2026-11-27", result: "AJUSTE", adjustmentDescription: "" })).toContain("Descreva o ajuste necessário.");
  });

  it("não aceita registro anterior ao último evento", () => {
    const order = DEMO_ORDERS[0];
    expect(order).toBeDefined();
    if (!order) return;
    expect(validateOrderAction(order, { date: "2026-11-02" })).toEqual(["A data não pode ser anterior ao último registro (03/11/2026)."]);
  });

  it("encerra o pedido somente após o registro da entrega", () => {
    const order = DEMO_ORDERS.find((item) => item.status === STATUS.PRONTA_ENTREGA);
    expect(order).toBeDefined();
    if (!order) return;
    const delivered = applyOrderAction(order, { date: "2026-11-27", receivedBy: "Responsável fictício" });
    expect(delivered.status).toBe(STATUS.ENTREGUE);
    expect(delivered.history.at(-1)?.description).toContain("Pedido encerrado");
  });

  it("exige duas medidas válidas por produto selecionado", () => {
    const state = createInitialState();
    const draft = { ...state.draft, patient: { ...state.draft.patient, name: "Paciente teste", recordNumber: "DEMO-1" }, regions: ["frente-mao-direita"], productIds: ["luva-punho-direita"], measurements: { "luva-punho-direita": { "Circunferência da Palma": "18" } } };
    expect(validateDraftStep(draft, 2)).toEqual(["Preencha pelo menos duas medidas válidas para Luvas com dedos até o punho (mão direita)."]);
  });
});
