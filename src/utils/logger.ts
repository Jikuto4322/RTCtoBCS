// Simple logger utility for consistent backend logging

export function logInfo(message: string, ...args: any[]) {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
}

export function logWarn(message: string, ...args: any[]) {
  console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
}

export function logError(message: string, ...args: any[]) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
}