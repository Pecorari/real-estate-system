export default function maskCpfCnpj(value) {
  // Remove tudo que não é número
  let numbers = value.replace(/\D/g, "");

  // Limite máximo: 14 números (CNPJ)
  if (numbers.length > 14) {
    numbers = numbers.slice(0, 14);
  }

  // CPF
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  // CNPJ
  return numbers
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}
