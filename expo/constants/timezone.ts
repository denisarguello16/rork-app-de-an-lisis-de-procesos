// Nicaragua timezone utilities
// Nicaragua is UTC-6 (Central Standard Time)

/**
 * Get current date and time in Nicaragua timezone
 * Nicaragua uses UTC-6 (Central Standard Time) year-round
 */
export const getNicaraguaTime = (): Date => {
  const now = new Date();
  // Nicaragua is UTC-6
  const nicaraguaOffset = -6 * 60; // -6 hours in minutes
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const nicaraguaTime = new Date(utc + (nicaraguaOffset * 60000));
  return nicaraguaTime;
};

/**
 * Format Nicaragua time as ISO string with timezone info
 */
export const getNicaraguaTimeISO = (): string => {
  const nicaraguaTime = getNicaraguaTime();
  // Format as ISO string but replace Z with -06:00 to indicate Nicaragua timezone
  return nicaraguaTime.toISOString().replace('Z', '-06:00');
};

/**
 * Format Nicaragua time for display
 */
export const formatNicaraguaTime = (date?: Date): string => {
  const timeToFormat = date || getNicaraguaTime();
  return timeToFormat.toLocaleString('es-NI', {
    timeZone: 'America/Managua',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * Convert any date to Nicaragua timezone
 */
export const toNicaraguaTime = (date: Date): Date => {
  const nicaraguaOffset = -6 * 60; // -6 hours in minutes
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const nicaraguaTime = new Date(utc + (nicaraguaOffset * 60000));
  return nicaraguaTime;
};

/**
 * Format date for Google Sheets in General Date format
 * Format: dd/mm/yyyy hh:mm:ss (e.g., 14/03/2001 13:30:55)
 */
export const formatForGoogleSheets = (date: Date): string => {
  const nicaraguaTime = toNicaraguaTime(date);
  
  const day = nicaraguaTime.getDate().toString().padStart(2, '0');
  const month = (nicaraguaTime.getMonth() + 1).toString().padStart(2, '0');
  const year = nicaraguaTime.getFullYear();
  const hours = nicaraguaTime.getHours().toString().padStart(2, '0');
  const minutes = nicaraguaTime.getMinutes().toString().padStart(2, '0');
  const seconds = nicaraguaTime.getSeconds().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};