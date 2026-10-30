import { redirect } from 'next/navigation'

export default function AdminWaitlistPage() {
  redirect('/admin/companies?status=waitlisted')
}
