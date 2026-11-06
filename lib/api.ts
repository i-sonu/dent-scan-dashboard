export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/backend/${path}`, { ...options, cache: 'no-store' })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json()
}
