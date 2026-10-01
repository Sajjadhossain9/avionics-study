import { useState } from 'react'
import type { Data } from '../types'
import { useStore, STATUS_LABEL } from '../lib/store'
import { topicsOf } from '../lib/data'
import { Empty } from '../components/ui'

export default function ExamPage({ d }: { d: Data }) {
  const { p, topic, course, setPrefs } = useStore()
  const [mode, setMode] = useState<'both' | 'practice' | 'unfinished'>('both')
  const sem = d.semesters.find(s => s.semester === p.prefs.semester)!
  const rows = sem.courseIds.map(i => d.entries[i]).filter(e => !e.isElectiveSlot).map(e => {
    const items = topicsOf(d, e).map(t => ({ t, s: topic(t.id) })).filter(({ s }) => {
      const un = s.status !== 'revised', pr = s.needsPractice
      return mode === 'practice' ? pr : mode === 'unfinished' ? un : un || pr
    })
    return { e, items, c: course(e.id) }
  }).filter(r => r.items.length).sort((a, b) => (+b.c.priority - +a.c.priority) || (a.c.examDate || '9').localeCompare(b.c.examDate || '9'))
  const total = rows.reduce((a, r) => a + r.items.length, 0)
  return <div className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="h1">Exam Focus</h1><p className="muted text-sm">Semester {sem.semester}: your unfinished and needs-practice topics. This is based only on your own tracking — it does not predict exam questions.</p></div>
      <label className="text-sm font-medium">Semester <select value={p.prefs.semester} onChange={e => setPrefs({ semester: +e.target.value })} className="ml-1">{d.semesters.map(s => <option key={s.semester} value={s.semester}>Semester {s.semester}</option>)}</select></label></div>
    <div role="group" aria-label="Filter" className="flex flex-wrap gap-2">
      {([['both', 'Unfinished + needs practice'], ['unfinished', 'Unfinished only'], ['practice', 'Needs practice only']] as const).map(([k, l]) => <button key={k} aria-pressed={mode === k} onClick={() => setMode(k)} className={'btn ' + (mode === k ? 'btn-primary' : '')}>{l}</button>)}</div>
    <p role="status" className="muted text-sm">{total} topic{total === 1 ? '' : 's'} in {rows.length} course{rows.length === 1 ? '' : 's'}</p>
    {rows.length === 0 ? <Empty title="Nothing to focus on 🎉">Every tracked topic in this semester is revised and none is marked “Needs practice” (or no topics match this filter).</Empty> :
      rows.map(({ e, items, c }) => <section key={e.id} className="card"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="h2"><a className="underline" href={'#/course/' + e.id}>{e.code} — {e.title}</a></h2>
        <div className="flex gap-1.5 text-xs">{c.priority && <span className="chip chip-warn">★ Priority</span>}{c.examDate ? <span className="chip chip-teal">Exam {c.examDate}</span> : <span className="chip">No exam date</span>}</div></div>
        <ul className="mt-2 divide-y divide-slate-200 dark:divide-navy-700">{items.map(({ t, s }) => <li key={t.id} className="py-2 text-sm"><a className="hover:underline" href={`#/course/${e.id}/${t.id}`}>{t.text.length > 220 ? t.text.slice(0, 220) + '…' : t.text}</a>
          <div className="mt-1 flex gap-1.5 text-xs"><span className="chip">{STATUS_LABEL[s.status]}</span>{s.needsPractice && <span className="chip chip-warn">⚑ Needs practice</span>}{s.bookmarked && <span className="chip chip-teal">★</span>}</div></li>)}</ul></section>)}
  </div>
}
