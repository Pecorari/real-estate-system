export default function titleCase(str) {
  const excecoes = ['e', 'de', 'da', 'do', 'dos', 'das'];

  return str
    .toLowerCase()
    .split(' ')
    .map((p, i) =>
      i > 0 && excecoes.includes(p)
        ? p
        : p.charAt(0).toUpperCase() + p.slice(1)
    )
    .join(' ');
}
