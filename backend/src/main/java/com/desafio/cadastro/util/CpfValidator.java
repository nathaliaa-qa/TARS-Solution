package com.desafio.cadastro.util;

/**
 * Validacao de CPF: formato (11 digitos) e digitos verificadores.
 * Rejeita sequencias repetidas (ex.: 11111111111), que passam no calculo mas sao invalidas na pratica.
 */
public final class CpfValidator {

    private CpfValidator() {
    }

    public static String limpar(String cpf) {
        return cpf == null ? null : cpf.replaceAll("\\D", "");
    }

    public static boolean isValido(String cpfBruto) {
        String cpf = limpar(cpfBruto);
        if (cpf == null || cpf.length() != 11 || cpf.chars().distinct().count() == 1) {
            return false;
        }

        try {
            int[] digitos = cpf.chars().map(c -> c - '0').toArray();

            int soma1 = 0;
            for (int i = 0; i < 9; i++) {
                soma1 += digitos[i] * (10 - i);
            }
            int resto1 = (soma1 * 10) % 11;
            if (resto1 == 10) resto1 = 0;
            if (resto1 != digitos[9]) return false;

            int soma2 = 0;
            for (int i = 0; i < 10; i++) {
                soma2 += digitos[i] * (11 - i);
            }
            int resto2 = (soma2 * 10) % 11;
            if (resto2 == 10) resto2 = 0;
            return resto2 == digitos[10];
        } catch (Exception e) {
            return false;
        }
    }
}
