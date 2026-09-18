import { describe, expect, it } from "vitest";
import { isCepValido, isCpfValido, mascararCep, mascararCpf } from "./validators";

describe("isCpfValido", () => {
  it("aceita CPF válido com máscara", () => {
    expect(isCpfValido("529.982.247-25")).toBe(true);
  });

  it("aceita CPF válido sem máscara", () => {
    expect(isCpfValido("52998224725")).toBe(true);
  });

  it.each(["11111111111", "00000000000", "99999999999"])(
    "rejeita sequência repetida: %s",
    (cpf) => {
      expect(isCpfValido(cpf)).toBe(false);
    }
  );

  it("rejeita CPF com dígito verificador inválido", () => {
    expect(isCpfValido("52998224700")).toBe(false);
  });

  it("rejeita CPF com tamanho inválido", () => {
    expect(isCpfValido("123456")).toBe(false);
  });
});

describe("isCepValido", () => {
  it("aceita CEP de 8 dígitos, com ou sem máscara", () => {
    expect(isCepValido("01001-000")).toBe(true);
    expect(isCepValido("01001000")).toBe(true);
  });

  it("rejeita CEP com tamanho errado", () => {
    expect(isCepValido("0100100")).toBe(false);
  });
});

describe("máscaras", () => {
  it("mascararCpf formata como 000.000.000-00 e ignora excesso de dígitos", () => {
    expect(mascararCpf("52998224725999")).toBe("529.982.247-25");
  });

  it("mascararCep formata como 00000-000", () => {
    expect(mascararCep("01001000999")).toBe("01001-000");
  });
});
