export const normalizeTextSpacing = (text) => {
  if (!text) return '';
  
  return text
    .trim()                             // 1. Elimina espacios al inicio y al final
    .toLowerCase()                      // 2. Convierte a minúsculas
    .normalize('NFD')                   // 3. Descompone las tildes (ej: "ó" se vuelve "o" + "´")
    .replace(/[\u0300-\u036f]/g, '')    // 4. Elimina los caracteres de las tildes
    .replace(/\s+/g, ' ');              // 5. Convierte múltiples espacios en medio a solo uno
};