// O site grava o contacto das reservas como "Tel: 912 345 678 | Email: nome@email.com"
export function separarContacto(contacto?: string | null) {
  const texto = contacto || '';
  const email = texto.match(/[^\s|:<>]+@[^\s|:<>]+\.[^\s|:<>]+/)?.[0] ?? '';
  const telemovel = texto.match(/Tel:\s*([^|]+)/i)?.[1]?.trim() ?? (email ? '' : texto.trim());
  return { telemovel, email };
}
