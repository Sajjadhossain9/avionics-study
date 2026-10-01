import type { Data, Entry } from '../types'
import { useStore, progress } from '../lib/store'
import { Bar, ProgText } from './ui'
import { fmt, kindLabel, topicsOf } from '../lib/data'

export default function CourseCard({ d, e }: { d: Data; e: Entry }) {
  const { topic, course } = useStore()
  const pr = progress(d, [e], topic), c = course(e.id)
  const hasSyl = topicsOf(d, e).length > 0
  return <a href={'#/course/' + e.id} className="card block hover:border-teal-500 hover:shadow">
    <div className="flex items-start justify-between gap-2">
      <div><span className="font-mono text-sm font-semibold text-teal-700 dark:text-teal-300">{e.code}</span>
        <h3 className="font-semibold leading-snug">{e.title}</h3></div>
      {c.priority && <span className="chip chip-warn" title="Priority course">★ Priority</span>}
    </div>
    <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
      <span className="chip">{kindLabel(e)}</span><span className="chip">{fmt(e.credits)} credits</span>
      <span className="chip">{e.contactHours == null ? 'Contact: not provided' : fmt(e.contactHours) + ' contact h'}</span>
      {c.examDate && <span className="chip chip-teal">Exam {c.examDate}</span>}
    </div>
    <div className="mt-3 space-y-1">{e.isElectiveSlot ? <span className="muted text-xs">Elective slot — pick an option in Curriculum</span> : hasSyl ? <><Bar pct={pr.pct} label={e.code + ' progress'} /><ProgText p={pr} /></> : <span className="muted text-xs">{e.syllabusMatch ? 'No topic list in source' : 'No syllabus entry in source'}</span>}</div>
  </a>
}
