function normalizeString(str) {
  if (!str || typeof str !== 'string') return str;

  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

module.exports = {
  normalizeString
};
