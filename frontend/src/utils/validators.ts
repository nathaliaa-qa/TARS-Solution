export function limparDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function mascararCpf(valor: string): string {
  const digitos = limparDigitos(valor).slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Exibe apenas os quatro últimos dígitos em listagens administrativas. */
export function ocultarCpf(valor: string): string {
  const digitos = limparDigitos(valor);
  return digitos.length === 11 ? `***.***.***-${digitos.slice(-2)}` : "***.***.***-**";
}

export function mascararCep(valor: string): string {
  const digitos = limparDigitos(valor).slice(0, 8);
  return digitos.replace(/(\d{5})(\d)/, "$1-$2");
}

/** Mesmo algoritmo de digito verificador usado no backend (CpfValidator). */
export function isCpfValido(valorBruto: string): boolean {
  const cpf = limparDigitos(valorBruto);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const digitos = cpf.split("").map(Number);

  let soma1 = 0;
  for (let i = 0; i < 9; i++) soma1 += digitos[i] * (10 - i);
  let resto1 = (soma1 * 10) % 11;
  if (resto1 === 10) resto1 = 0;
  if (resto1 !== digitos[9]) return false;

  let soma2 = 0;
  for (let i = 0; i < 10; i++) soma2 += digitos[i] * (11 - i);
  let resto2 = (soma2 * 10) % 11;
  if (resto2 === 10) resto2 = 0;
  return resto2 === digitos[10];
}

export function isCepValido(valorBruto: string): boolean {
  return /^\d{8}$/.test(limparDigitos(valorBruto));
}
