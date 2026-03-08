function normalizeString(str) {
  if (!str || typeof str !== 'string') return str;

  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function onlyNumbers(str) {
  if (!str) return str;
  return str.replace(/\D/g, '');
}

module.exports = {
  normalizeString,
  onlyNumbers
};
