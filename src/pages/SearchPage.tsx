import { useMemo, useState } from 'react'
import type { Data } from '../types'
import { search, snippet, semLabel } from '../lib/data'
import { Empty, Hl } from '../components/ui'

const LABEL = { code: 'Course code', title: 'Course title', topic: 'Syllabus topic', book: 'Book' } as const
export default function SearchPage({ d, qs }: { d: Data; qs: string }) {
  const [q, setQ] = useState(new URLSearchParams(qs).get('q') ?? '')
  const [sem, setSem] = useState<'all' | number>('all')
  const [type, setType] = useState<'all' | 'Theory' | 'Sessional' | 'Elective'>('all')
  const [limit, setLimit] = useState(50)
  const hits = useMemo(() => search(d, q, sem, type), [d, q, sem, type])
  return <div className="space-y-4">
    <h1 className="h1">Search</h1>
    <div className="card grid gap-3 sm:grid-cols-[1fr_auto_auto]">
      <label className="text-sm font-medium">Search codes, titles, topics, textbooks
        <input type="search" autoFocus value={q} onChange={e => { setQ(e.target.value); setLimit(50) }} placeholder="e.g. ave 4505, laplace, Sadiku" className="mt-1 block w-full" /></label>
      <label className="text-sm font-medium">Semester<select className="mt-1 block w-full" value={sem} onChange={e => setSem(e.target.value === 'all' ? 'all' : +e.target.value)}><option value="all">All semesters</option>{[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>Semester {n}</option>)}</select></label>
      <label className="text-sm font-medium">Course type<select className="mt-1 block w-full" value={type} onChange={e => setType(e.target.value as any)}><option value="all">All types</option><option>Theory</option><option>Sessional</option><option value="Elective">Elective options</option></select></label>
    </div>
    <div role="status" aria-live="polite" className="muted text-sm">{q.trim() ? `${hits.length} match${hits.length === 1 ? '' : 'es'} across the full curriculum${sem !== 'all' || type !== 'all' ? ' (filtered)' : ''}` : ''}</div>
    {!q.trim() ? <Empty title="Start typing to search">Searches all eight semesters, elective options, syllabus topics and textbook names. Partial and case-insensitive.</Empty>
      : hits.length === 0 ? <Empty title={`No results for “${q}”`}>Try fewer letters, a course code like “4505”, or clear the filters.</Empty>
      : <ul className="space-y-2">{hits.slice(0, limit).map((h, i) => <li key={i}><a className="card block hover:border-teal-500" href={`#/course/${h.entry.id}${h.topicId ? '/' + h.topicId : ''}`}>
        <div className="flex flex-wrap items-center gap-2 text-sm"><span className="chip chip-teal">{LABEL[h.kind]}</span><span className="font-mono font-semibold">{h.entry.code}</span><span className="font-medium">{h.entry.title}</span><span className="chip">{semLabel(h.entry)}</span></div>
        <p className="muted mt-1 text-sm"><Hl parts={snippet(h.text, q)} /></p></a></li>)}</ul>}
    {hits.length > limit && <button className="btn" onClick={() => setLimit(limit + 50)}>Show more ({hits.length - limit} remaining)</button>}
  </div>
}
