import type { Data, Entry } from '../types'
import { useStore, progress } from '../lib/store'
import CourseCard from '../components/CourseCard'
import { fmt, kindLabel } from '../lib/data'

export default function Curriculum({ d, sem: s }: { d: Data; sem?: number }) {
  const { p, setPrefs, topic } = useStore()
  const sem = s ?? p.prefs.semester
  const row = d.semesters.find(x => x.semester === sem)!
  const list = row.courseIds.map(i => d.entries[i])
  const th = list.filter(e => e.type === 'Theory'), se = list.filter(e => e.type === 'Sessional')
  const view = p.prefs.view
  const options = sem === 7 ? d.elective1 : sem === 8 ? d.elective2.flatMap(g => [g.theory, g.sessional]) : []
  const Table = ({ rows }: { rows: Entry[] }) => <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-navy-700"><table className="w-full min-w-[34rem] text-left text-sm">
    <thead className="bg-navy-100 text-navy-900 dark:bg-navy-800 dark:text-white"><tr><th className="p-2">Code</th><th className="p-2">Title</th><th className="p-2">Type</th><th className="p-2 text-right">Contact h</th><th className="p-2 text-right">Credits</th><th className="p-2 text-right">Progress</th></tr></thead>
    <tbody>{rows.map(e => <tr key={e.id} className="border-t border-slate-200 dark:border-navy-700">
      <td className="p-2 font-mono">{e.isElectiveSlot ? '—' : e.code}</td>
      <td className="p-2">{e.isElectiveSlot ? <span>{e.title} <span className="muted">(choose below)</span></span> : <a className="underline" href={'#/course/' + e.id}>{e.title}</a>}</td>
      <td className="p-2">{kindLabel(e)}</td><td className="p-2 text-right">{e.contactHours == null ? 'Not provided' : fmt(e.contactHours)}</td><td className="p-2 text-right">{fmt(e.credits)}</td>
      <td className="p-2 text-right">{e.isElectiveSlot ? '—' : progress(d, [e], topic).total ? progress(d, [e], topic).pct + '%' : '—'}</td></tr>)}</tbody></table></div>
  const Group = ({ title, rows, sub, ch }: { title: string; rows: Entry[]; sub: number; ch: number }) => <section className="space-y-2">
    <h2 className="h2">{title} <span className="muted text-sm font-normal">— subtotal {fmt(sub)} credits · {fmt(ch)} contact h</span></h2>
    {view === 'table' ? <Table rows={rows} /> : <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{rows.map(e => e.isElectiveSlot
      ? <div key={e.id} className="card border-dashed"><span className="chip chip-teal">Elective slot</span><h3 className="mt-1 font-semibold">{e.title}</h3><p className="muted text-sm">{fmt(e.credits)} credits · choose one option below</p></div>
      : <CourseCard key={e.id} d={d} e={e} />)}</div>}</section>
  const sum = (r: Entry[], k: 'credits' | 'contactHours') => r.reduce((a, e) => a + (e[k] ?? 0), 0)
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><h1 className="h1">Curriculum</h1>
      <div className="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-navy-600" role="group" aria-label="View">
        {(['cards', 'table'] as const).map(v => <button key={v} aria-pressed={view === v} onClick={() => setPrefs({ view: v })} className={'min-h-[40px] px-3 text-sm font-medium ' + (view === v ? 'bg-navy-800 text-white dark:bg-teal-400 dark:text-navy-950' : 'bg-white dark:bg-navy-900')}>{v === 'cards' ? 'Cards' : 'Compact table'}</button>)}</div></div>
    <div role="tablist" aria-label="Semesters" className="flex flex-wrap gap-1.5">
      {d.semesters.map(x => <a key={x.semester} role="tab" aria-selected={x.semester === sem} href={'#/curriculum/' + x.semester} className={'rounded-md border px-3 py-2 text-sm font-medium ' + (x.semester === sem ? 'border-navy-800 bg-navy-800 text-white dark:border-teal-400 dark:bg-teal-400 dark:text-navy-950' : 'border-slate-300 bg-white hover:bg-slate-100 dark:border-navy-600 dark:bg-navy-900')}>Sem {x.semester}{x.semester === p.prefs.semester ? ' ★' : ''}</a>)}</div>
    <div className="card flex flex-wrap gap-x-6 gap-y-1 text-sm"><b>Semester {sem} total</b><span>{fmt(row.computedCredits)} credits (source states {fmt(row.statedCredits)}{Math.abs(row.computedCredits - row.statedCredits) < 1e-9 ? ' ✓' : ' ⚠ mismatch'})</span><span>{fmt(row.computedContactHours)} contact hours</span><span>{list.length} required courses</span>
      <button className="underline" onClick={() => setPrefs({ semester: sem })}>{sem === p.prefs.semester ? 'Current semester ★' : 'Set as my current semester'}</button></div>
    <Group title="Theory (required)" rows={th} sub={sum(th, 'credits')} ch={sum(th, 'contactHours')} />
    <Group title="Sessional (required)" rows={se} sub={sum(se, 'credits')} ch={sum(se, 'contactHours')} />
    {options.length > 0 && <section className="space-y-2"><h2 className="h2">Elective choices <span className="muted text-sm font-normal">— {sem === 7 ? 'pick one theory' : 'pick one theory + its sessional'}; not counted in totals above beyond the slot credits</span></h2>
      {view === 'table' ? <Table rows={options} /> : <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{options.map(e => <CourseCard key={e.id} d={d} e={e} />)}</div>}
      {sem === 7 && <p className="muted text-xs">Curriculum section V(b) also lists EEE 4881 / EEE 4882 (Electrical Power Systems), which are not in the Elective I list of section 21: {d.listed.map(e => <a key={e.id} className="underline" href={'#/course/' + e.id}>{e.code} </a>)}</p>}</section>}
    {sem === 8 && <p className="muted text-xs">AVE 4700 (FYRDP) runs across Semesters 7 and 8 at 4.50 credits in each.</p>}
  </div>
}
