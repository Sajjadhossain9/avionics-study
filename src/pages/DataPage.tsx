import { useRef, useState } from 'react'
import type { Data, Personal } from '../types'
import { useStore, validate } from '../lib/store'
import { Modal } from '../components/ui'

export default function DataPage({ d }: { d: Data }) {
  const { p, replace, reset } = useStore()
  const file = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<{ data: Personal; warnings: string[]; orphan: number } | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const allTopicIds = new Set(Object.values(d.syl).flatMap(s => s.topics.map(t => t.id)))
  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ app: 'avionics-study-hub', exportedAt: new Date().toISOString(), data: p }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `avionics-study-hub-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href)
    setMsg({ ok: true, t: 'Backup downloaded.' })
  }
  const onFile = async (f?: File) => {
    if (!f) return
    try {
      const v = validate(JSON.parse(await f.text()))
      if (!v.ok) return setMsg({ ok: false, t: 'Import rejected: ' + v.error })
      setPending({ data: v.data, warnings: v.warnings, orphan: Object.keys(v.data.topics).filter(k => !allTopicIds.has(k)).length }); setMsg(null)
    } catch { setMsg({ ok: false, t: 'Import rejected: file is not valid JSON.' }) }
    if (file.current) file.current.value = ''
  }
  const n = (o: object) => Object.keys(o).length
  const tracked = Object.values(p.topics).filter(t => t.status !== 'not_started').length
  const r = d.review
  return <div className="space-y-6">
    <h1 className="h1">Backup & Data</h1>
    <section className="card space-y-3"><h2 className="h2">Your study data</h2>
      <p className="text-sm">{tracked} topics with progress · {Object.values(p.topics).filter(t => t.note).length} notes · {Object.values(p.topics).filter(t => t.bookmarked).length} bookmarks · {Object.values(p.courses).filter(c => c.examDate).length} exam dates.</p>
      <p className="muted text-sm">Everything is saved in this browser’s local storage only. It does <b>not</b> sync between devices or browsers, and clearing browser data will erase it — export a JSON backup regularly and import it on another device.</p>
      <div className="flex flex-wrap gap-2"><button className="btn btn-primary" onClick={exportJson}>Export JSON backup</button><button className="btn" onClick={() => file.current?.click()}>Import JSON backup…</button>
        <input ref={file} type="file" accept="application/json,.json" className="sr-only" aria-label="Choose backup file" onChange={e => onFile(e.target.files?.[0])} />
        <button className="btn btn-danger" onClick={() => setConfirmReset(true)}>Reset personal data…</button></div>
      {msg && <p role={msg.ok ? 'status' : 'alert'} className={'text-sm font-medium ' + (msg.ok ? 'text-teal-700 dark:text-teal-300' : 'text-red-700 dark:text-red-300')}>{msg.t}</p>}
      <p className="muted text-xs">Course source data (curriculum and syllabus) lives in <code>src/data/*.json</code> and is never changed by this page.</p></section>

    <section className="card space-y-2"><h2 className="h2">Data review & extraction notes</h2>
      <p className="text-sm">{n(d.entries)} curriculum entries (incl. elective slots & options) · {n(d.syl)} syllabus entries parsed · {Object.values(d.syl).reduce((a, s) => a + s.topics.length, 0)} syllabus topics.</p>
      <details open><summary className="font-semibold">Matching & conflicts ({r.issues.length})</summary><ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{r.issues.map((i, k) => <li key={k}>{i}</li>)}</ul></details>
      <details><summary className="font-semibold">Courses with missing or unreadable syllabus parts ({n(r.flags)})</summary><ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{Object.entries(r.flags).map(([c, f]) => <li key={c}><b>{c}</b>: {f.join(' ')}</li>)}</ul></details>
      <details><summary className="font-semibold">Other notes</summary><ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{r.notes.map((x, k) => <li key={k}>{x}</li>)}</ul></details></section>

    <Modal open={!!pending} title="Replace your data with this backup?" onClose={() => setPending(null)}>
      {pending && <><p className="text-sm">The backup contains {n(pending.data.topics)} topic records and {n(pending.data.courses)} course records. Importing <b>replaces</b> your current study data.</p>
        {pending.orphan > 0 && <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">{pending.orphan} topic records don’t match any current topic id; they’ll be kept but hidden.</p>}
        {pending.warnings.length > 0 && <ul className="mt-1 list-disc pl-5 text-xs">{pending.warnings.slice(0, 6).map((w, i) => <li key={i}>{w}</li>)}</ul>}
        <div className="mt-4 flex flex-wrap justify-end gap-2"><button className="btn" onClick={exportJson}>Back up current data first</button><button className="btn" onClick={() => setPending(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { replace(pending.data); setPending(null); setMsg({ ok: true, t: 'Backup imported.' }) }}>Import & replace</button></div></>}
    </Modal>
    <Modal open={confirmReset} title="Reset all personal data?" onClose={() => setConfirmReset(false)}>
      <p className="text-sm">This permanently deletes your progress, notes, bookmarks, exam dates, priorities and preferences from this browser. Course data is not affected. We recommend downloading a backup first.</p>
      <div className="mt-4 flex flex-wrap justify-end gap-2"><button className="btn" onClick={exportJson}>Download backup first</button><button className="btn" onClick={() => setConfirmReset(false)}>Cancel</button>
        <button className="btn btn-danger" onClick={() => { reset(); setConfirmReset(false); setMsg({ ok: true, t: 'Personal data reset.' }) }}>Yes, reset everything</button></div>
    </Modal>
  </div>
}
