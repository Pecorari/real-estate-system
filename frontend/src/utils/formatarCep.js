export default function formatarCep(value) {
  if (!value) return "";

  const cep = value.replace(/\D/g, "").slice(0, 8);

  if (cep.length <= 5) return cep;

  return cep.replace(/^(\d{5})(\d{1,3})$/, "$1-$2");
}
