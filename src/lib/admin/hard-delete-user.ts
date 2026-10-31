export async function hardDeleteUser(
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch('/api/admin/delete-user', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })

  if (res.ok) {
    return { ok: true }
  }

  const data = (await res.json().catch(() => ({}))) as { error?: string }
  return { ok: false, error: data.error ?? 'Failed to delete user' }
}
