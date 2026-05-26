import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="text-base font-sans" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex">
        {items.map((item, idx) => (
          <li key={item.label} className="flex items-center">
            {item.href && idx !== items.length - 1 ? (
              <Link href={item.href} className="hover:underline text-primary">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-gray-800">{item.label}</span>
            )}
            {idx < items.length - 1 && (
              <span className="mx-2 text-primary">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
} 