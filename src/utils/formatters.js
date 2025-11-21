// Funciones para formatear números en la aplicación

/**
 * Formatea un número de peso para mostrarlo con 1 decimal
 * @param {number} peso - El peso a formatear
 * @returns {string} - El peso formateado (ej: "45.5")
 */
export function formatPeso(peso) {
  if (peso === null || peso === undefined) return '0.0';
  return parseFloat(peso).toFixed(1);
}

/**
 * Formatea un número entero (repeticiones, series, etc.)
 * @param {number} numero - El número a formatear
 * @returns {string} - El número formateado
 */
export function formatNumero(numero) {
  if (numero === null || numero === undefined) return '0';
  return Math.round(numero).toString();
}

/**
 * Formatea un tiempo en segundos a formato MM:SS
 * @param {number} segundos - Los segundos a formatear
 * @returns {string} - El tiempo formateado (ej: "02:30")
 */
export function formatTiempo(segundos) {
  if (!segundos) return '00:00';
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formatea un tiempo en segundos a formato legible
 * @param {number} segundos - Los segundos a formatear
 * @returns {string} - El tiempo formateado (ej: "2min 30s")
 */
export function formatTiempoLegible(segundos) {
  if (!segundos) return '0s';
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}min`;
  return `${mins}min ${secs}s`;
}

/**
 * Formatea un volumen (peso × reps)
 * @param {number} volumen - El volumen a formatear
 * @returns {string} - El volumen formateado
 */
export function formatVolumen(volumen) {
  if (volumen === null || volumen === undefined) return '0';
  return Math.round(volumen).toString();
}
