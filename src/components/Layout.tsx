// src/components/Layout.tsx
import Navbar from './Navbar'
import Footer from './Footer'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode;
  breadcrumb?: ReactNode;
  fullWidth?: boolean;
}

export default function Layout({ children, breadcrumb, fullWidth = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-base">
      <Navbar />
      {breadcrumb && <div className="bg-gray-50 px-6 py-2 border-b">{breadcrumb}</div>}
      <main className="flex-1 flex flex-col items-center justify-start p-6">
        <div className={`${fullWidth ? 'w-full' : 'w-full max-w-5xl'} bg-white rounded shadow-sm p-8 min-h-[60vh]`}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
