// src/components/Sidebar.tsx

import Link from 'next/link'
import { useRouter } from 'next/router'
import { HomeIcon, Squares2X2Icon, Cog6ToothIcon } from '@heroicons/react/24/outline'

export default function Sidebar() {
  const router = useRouter()
  const menu = [
    {
      label: 'Projects',
      href: '/projects',
      icon: <Squares2X2Icon className="w-5 h-5" />
    }
  ]

  return (
    <aside className="w-64 bg-gray-800 text-gray-100 flex-shrink-0">
      <div className="p-6 text-2xl font-bold"></div>
      <nav className="mt-6">
        {menu.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-6 py-3 hover:bg-gray-700 transition ${
              router.pathname === item.href ? 'bg-gray-700' : ''
            }`}
          >
            {item.icon}
            <span className="ml-3">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
