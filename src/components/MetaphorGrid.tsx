import { useState } from 'react'
import { AnnotatedMetaphor } from '@/types/annotatedMetaphor'

interface MetaphorGridProps {
  metaphors: AnnotatedMetaphor[]
  onAction?: (id: string, action: 'approve' | 'to_edit' | 'discarded' | 'metonymy') => void
}

export default function MetaphorGrid({ metaphors, onAction }: MetaphorGridProps) {
  const [search, setSearch] = useState('')

  const filtered = metaphors.filter(m =>
    m.expression.toLowerCase().includes(search.toLowerCase()) ||
    m.customId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search by expression or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-1 w-1/3"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="text-left border-b">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Expression</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Trigger</th>
              <th className="px-4 py-2">Novelty</th>
              <th className="px-4 py-2">Status</th>
              {onAction && <th className="px-4 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{m.customId}</td>
                <td className="px-4 py-2">{m.expression}</td>
                <td className="px-4 py-2">
                  {m.location.section}.{m.location.subsection} (p.{m.location.page})
                </td>
                <td className="px-4 py-2">{m.triggerWord}</td>
                <td className="px-4 py-2 capitalize">{m.noveltyType}</td>
                <td className="px-4 py-2 capitalize">{m.status}</td>
                {onAction && (
                  <td className="px-4 py-2 space-x-1">
                    <button
                      onClick={() => onAction(m._id, 'approve')}
                      className="px-2 py-1 text-sm bg-green-100 text-green-800 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onAction(m._id, 'to_edit')}
                      className="px-2 py-1 text-sm bg-yellow-100 text-yellow-800 rounded"
                    >
                      To Edit
                    </button>
                    <button
                      onClick={() => onAction(m._id, 'discarded')}
                      className="px-2 py-1 text-sm bg-red-100 text-red-800 rounded"
                    >
                      Discard
                    </button>
                    <button
                      onClick={() => onAction(m._id, 'metonymy')}
                      className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded"
                    >
                      Metonymy
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
