export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password) {
  return password && password.length >= 6;
}

export function isValidMessage(message) {
  return message && message.trim().length > 0 && message.length <= 10000;
}

export function isValidFileType(file, allowedTypes) {
  return allowedTypes.includes(file.type);
}

export function isValidFileSize(file, maxSize) {
  return file.size <= maxSize;
}
