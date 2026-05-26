// src/pages/domains/relations.tsx
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Domain } from '@/types/domain'
import { DomainRelation } from '@/types/domainRelation'

const relationTypes = [
  'hypernym',
  'hyponym',
  'co-hyponym',
  'meronym',
  'holonym',
  'syntagmatic',
] as const

export default function RelationsPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [relations, setRelations] = useState<DomainRelation[]>([])
  const [form, setForm] = useState({
    domainA: '',
    domainB: '',
    relationType: relationTypes[0],
  })

  const fetchAll = () => {
    api.get<Domain[]>('/domains').then(res => setDomains(res.data))
    api.get<DomainRelation[]>('/domain-relations').then(res => setRelations(res.data))
  }

  useEffect(fetchAll, [])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    api.post('/domain-relations', form).then(() => {
      setForm({ domainA: '', domainB: '', relationType: relationTypes[0] })
      fetchAll()
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Semantic Domain Relations</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          name="domainA"
          value={form.domainA}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        >
          <option value="">Select Domain A</option>
          {domains.map(d => (
            <option key={d._id} value={d._id}>
              {d.name} ({d.type})
            </option>
          ))}
        </select>

        <select
          name="domainB"
          value={form.domainB}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        >
          <option value="">Select Domain B</option>
          {domains.map(d => (
            <option key={d._id} value={d._id}>
              {d.name} ({d.type})
            </option>
          ))}
        </select>

        <select
          name="relationType"
          value={form.relationType}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        >
          {relationTypes.map(rt => (
            <option key={rt} value={rt}>
              {rt}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          Add Relation
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Domain A</th>
              <th className="px-4 py-2 text-left">Relation</th>
              <th className="px-4 py-2 text-left">Domain B</th>
            </tr>
          </thead>
          <tbody>
            {relations.map(r => {
              const a = domains.find(d => d._id === r.domainA)
              const b = domains.find(d => d._id === r.domainB)
              return (
                <tr key={r._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{a?.name || '—'}</td>
                  <td className="px-4 py-2 capitalize">{r.relationType}</td>
                  <td className="px-4 py-2">{b?.name || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
