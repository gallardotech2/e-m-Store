const errorMap: Record<string, string> = {
  'email rate limit exceeded': 'Límite de intentos excedido. Espera unos minutos e intenta de nuevo.',
  'invalid login credentials': 'Email o contraseña incorrectos.',
  'invalid email or password': 'Email o contraseña incorrectos.',
  'user already registered': 'Este email ya está registrado.',
  'password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
  'signup requires a valid password': 'Se requiere una contraseña válida.',
  'email not confirmed': 'Email no confirmado.',
  'invalid email': 'Email inválido.',
  'rate limit exceeded': 'Demasiados intentos. Intenta de nuevo más tarde.',
  'invalid password': 'Contraseña incorrecta.',
  'user not found': 'Usuario no encontrado.',
}

export function translateAuthError(message: string): string {
  return errorMap[message.toLowerCase()] || message
}
