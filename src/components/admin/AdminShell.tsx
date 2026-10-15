import { AdminNav } from './AdminNav'
import { AdminSidebar } from './AdminSidebar'

export function AdminShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminNav title={title} />
        <main className="mx-auto w-full max-w-[1200px] flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
