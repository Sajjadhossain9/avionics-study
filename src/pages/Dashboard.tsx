import type { Data } from '../types'
import { useStore, progress } from '../lib/store'
import { Bar, ProgText, Empty } from '../components/ui'
import CourseCard from '../components/CourseCard'
import { fmt, topicsOf } from '../lib/data'

export default function Dashboard({ d }: { d: Data }) {
  const { p, topic, course, setPrefs } = useStore()
  const sem = d.semesters.find(s => s.semester === p.prefs.semester)!
  const list = sem.courseIds.map(i => d.entries[i])
  const pr = progress(d, list, topic)
  const bookmarks = Object.entries(p.topics).filter(([, s]) => s.bookmarked)
  const find = (tid: string) => { for (const e of Object.values(d.entries)) if (topicsOf(d, e).some(t => t.id === tid)) return e }
  const tText = (tid: string) => { const e = find(tid); return e ? { e, t: topicsOf(d, e).find(t => t.id === tid)! } : null }
  // Continue studying: last interacted topic/course, else first unfinished topic in the selected semester
  let cont: { href: string; label: string } | null = null
  if (p.last && d.entries[p.last.courseId]) cont = { href: `#/course/${p.last.courseId}${p.last.topicId ? '/' + p.last.topicId : ''}`, label: `${d.entries[p.last.courseId].code} — ${d.entries[p.last.courseId].title}` }
  else for (const e of list) { const t = topicsOf(d, e).find(t => topic(t.id).status !== 'revised'); if (t) { cont = { href: `#/course/${e.id}/${t.id}`, label: `${e.code} — ${e.title}` }; break } }
  const upcoming = list.filter(e => course(e.id).examDate).sort((a, b) => course(a.id).examDate.localeCompare(course(b.id).examDate))
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="muted text-sm">Avionics Engineering · AAUB</p><h1 className="h1">Welcome back, Sajjad</h1></div>
      <label className="text-sm font-medium">Semester <select value={p.prefs.semester} onChange={e => setPrefs({ semester: +e.target.value })} className="ml-1">
        {d.semesters.map(s => <option key={s.semester} value={s.semester}>Semester {s.semester}</option>)}</select></label>
    </div>
    <section className="card flex flex-wrap items-center justify-between gap-3 !border-teal-500">
      <div><h2 className="h2">Continue studying</h2><p className="muted text-sm">{cont ? cont.label : 'Nothing to continue — all topics in this semester are revised.'}</p></div>
      {cont ? <a className="btn btn-primary" href={cont.href}>Continue studying →</a> : <a className="btn" href="#/curriculum">Browse curriculum</a>}
    </section>
    <section className="grid gap-3 sm:grid-cols-3">
      <div className="card"><p className="muted text-sm">Semester {sem.semester} credits</p><p className="text-3xl font-bold">{fmt(sem.computedCredits)}</p>
        <p className="muted text-xs">Theory {fmt(sem.theoryCredits)} + Sessional {fmt(sem.sessionalCredits)} · {list.length} courses · elective options not counted</p></div>
      <div className="card sm:col-span-2"><p className="muted text-sm">Study progress — Semester {sem.semester}</p><p className="mb-2 text-3xl font-bold">{pr.pct}%</p><Bar pct={pr.pct} label="Semester progress" />
        <div className="mt-1"><ProgText p={pr} /></div><p className="muted mt-1 text-xs">Courses without a topic list in the source are excluded. {pr.practice} marked “Needs practice”.</p></div>
    </section>
    <section><h2 className="h2 mb-2">Current courses</h2><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{list.map(e => <CourseCard key={e.id} d={d} e={e} />)}</div></section>
    {upcoming.length > 0 && <section><h2 className="h2 mb-2">Exam dates you entered</h2><ul className="card divide-y divide-slate-200 dark:divide-navy-700">{upcoming.map(e => <li key={e.id} className="flex justify-between py-1.5 text-sm"><a className="underline" href={'#/course/' + e.id}>{e.code} {e.title}</a><span>{course(e.id).examDate}</span></li>)}</ul></section>}
    <div className="grid gap-6 md:grid-cols-2">
      <section><h2 className="h2 mb-2">Bookmarked topics</h2>
        {bookmarks.length === 0 ? <Empty title="No bookmarks yet">Use the ☆ on any syllabus topic to save it here.</Empty> :
          <ul className="card space-y-2">{bookmarks.slice(0, 8).map(([tid]) => { const r = tText(tid); return r ? <li key={tid} className="text-sm"><a className="font-medium underline" href={`#/course/${r.e.id}/${tid}`}>{r.e.code}</a> <span className="muted">{r.t.text.slice(0, 90)}{r.t.text.length > 90 ? '…' : ''}</span></li> : <li key={tid} className="muted text-sm">Topic {tid} (no longer in course data)</li> })}</ul>}</section>
      <section><h2 className="h2 mb-2">Recently opened</h2>
        {p.recent.length === 0 ? <Empty title="Nothing opened yet">Courses you open will appear here.</Empty> :
          <ul className="card space-y-1">{p.recent.filter(i => d.entries[i]).map(i => <li key={i}><a className="text-sm underline" href={'#/course/' + i}>{d.entries[i].code} — {d.entries[i].title}</a></li>)}</ul>}</section>
    </div>
  </div>
}
