'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Shield, 
  Users, 
  Handshake, 
  BarChart3, 
  Settings, 
  LogOut,
  FileText,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const adminSidebarItems = [
  { href: '/admin', icon: BarChart3, label: 'Dashboard' },
  { href: '/admin/partnerships', icon: Handshake, label: 'Partnerships' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/reports', icon: FileText, label: 'Reports' },
  { href: '/admin/payments', icon: DollarSign, label: 'Payments' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-400" />
            <div>
              <h1 className="text-xl font-bold">ShopAbell Admin</h1>
              <p className="text-sm text-gray-400">Management Panel</p>
            </div>
          </div>
        </div>
        
        <nav className="px-4">
          {adminSidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg mb-1",
                  "transition-colors duration-200",
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4">
          <button className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white w-full">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}