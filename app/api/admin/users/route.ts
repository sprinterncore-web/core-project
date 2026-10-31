import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient, isAdminUserId } from '@/lib/supabase/service'

export async function DELETE(request: Request) {
  let body: { userId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const userId = body.userId?.trim()
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!(await isAdminUserId(user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (userId === user.id) {
    return NextResponse.json(
      { error: 'You cannot delete your own account from the admin panel' },
      { status: 400 }
    )
  }

  if (await isAdminUserId(userId)) {
    return NextResponse.json(
      { error: 'Cannot delete another admin account' },
      { status: 400 }
    )
  }

  const adminClient = createServiceClient()

  const { error: deleteAuthError } =
    await adminClient.auth.admin.deleteUser(userId)

  if (deleteAuthError) {
    return NextResponse.json(
      { error: deleteAuthError.message },
      { status: 500 }
    )
  }

  await adminClient.from('profiles').delete().eq('id', userId)

  return NextResponse.json({ success: true })
}
