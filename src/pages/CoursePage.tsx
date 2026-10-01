import { useEffect, useState, type ReactNode } from 'react'
import type { Data, Item } from '../types'
import { useStore, progress } from '../lib/store'
import { Bar, ProgText, StatusPicker, Empty } from '../components/ui'
import { fmt, kindLabel, pdfAvailable, pdfUrl, semLabel, sylOf } from '../lib/data'

const Sec = ({ title, count, children }: { title: string; count?: number; children: ReactNode }) =>
  <details className="card"><summary className="font-semibold">{title}{count != null && <span className="muted font-normal"> ({count})</span>}</summary><div className="mt-2 text-sm">{children}</div></details>
const List = ({ items }: { items: Item[] }) => <ol className="list-decimal space-y-1 pl-5">{items.map((x, i) => <li key={i}>{x.text} <span className="muted text-xs">(PDF p.{x.pdfPage})</span></li>)}</ol>

export default function CoursePage({ d, id, topicId }: { d: Data; id: string; topicId?: string }) {
  const { topic, setTopic, course, setCourse, open, topic: ts } = useStore()
  const e = d.entries[id]
  const [avail, setAvail] = useState<Record<string, boolean>>({})
  const [noteOpen, setNoteOpen] = useState<string | null>(null)
  useEffect(() => { if (e) open(e.id) }, [id])
  useEffect(() => { ['Avionics_Syllabus.pdf', 'Course_Curriculum.pdf'].forEach(f => pdfAvailable(f).then(ok => setAvail(a => ({ ...a, [f]: ok })))) }, [])
  useEffect(() => { if (topicId) setTimeout(() => document.getElementById('t-' + topicId)?.scrollIntoView({ block: 'center' }), 50) }, [topicId, id])
  if (!e) return <Empty title="Course not found">No course with id “{id}”. <a className="underline" href="#/curriculum">Back to curriculum</a></Empty>
  if (e.isElectiveSlot) {
    const opts = e.id === 'AVE47XX' ? d.elective1 : d.elective2.map(g => e.id.endsWith('-S') ? g.sessional : g.theory)
    return <div className="space-y-4"><h1 className="h1">{e.title} <span className="muted text-base">({fmt(e.credits)} credits, Semester {e.semesters.join(', ')})</span></h1>
      <p className="muted">This is an elective slot in the curriculum. Choose one of:</p>
      <ul className="card space-y-1">{opts.map(o => <li key={o.id}><a className="underline" href={'#/course/' + o.id}>{o.code} — {o.title}</a></li>)}</ul></div>
  }
  const s = sylOf(d, e), topics = s?.topics ?? [], pr = progress(d, [e], topic), cs = course(e.id)
  const flags = [...(s ? d.review.flags[s.sylCode] ?? [] : []), ...d.review.issues.filter(i => i.startsWith(e.code + ' ') || (s && s.sylCode !== e.code && i.startsWith(s.sylCode + ' '))), ...(e.contactHoursNote ? [e.contactHoursNote] : [])]
  const dup = s && d.duplicates.find(x => x.code === s.sylCode)
  const link = (file: string, page: number | null | undefined, label: string) => avail[file] === false
    ? <span className="chip chip-warn" title="Copy the PDFs into public/pdfs/ (see README)">{label}: PDF file not found in public/pdfs/</span>
    : <a className="btn" href={pdfUrl(file, page)} target="_blank" rel="noreferrer">{label}</a>
  const prereq = s?.prerequisites ?? null
  return <div className="space-y-5">
    <nav aria-label="Breadcrumb" className="text-sm"><a className="underline" href={'#/curriculum/' + (e.semesters[0] ?? 7)}>← {semLabel(e)}</a></nav>
    <header className="space-y-2">
      <p className="font-mono text-teal-700 dark:text-teal-300">{e.code}</p><h1 className="h1">{e.title}</h1>
      <div className="flex flex-wrap gap-1.5 text-xs"><span className="chip">{kindLabel(e)}</span><span className="chip">{semLabel(e)}</span><span className="chip">{fmt(e.credits)} credit hours</span>
        <span className="chip">{e.contactHours == null ? 'Contact hours: Not provided in source' : fmt(e.contactHours) + ' contact hours'}</span></div>
      {e.note && <p className="muted text-sm">{e.note}</p>}
    </header>
    {flags.length > 0 && <div role="note" className="rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-600 dark:bg-amber-950/50 dark:text-amber-100"><b>Flagged for review</b><ul className="list-disc pl-5">{flags.map((f, i) => <li key={i}>{f}</li>)}</ul></div>}
    {dup && <p className="text-sm text-amber-800 dark:text-amber-200">The syllabus PDF contains a second entry for this course code (PDF p.{dup.pdfPages[0]}–{dup.pdfPages[1]}). The first entry is shown.</p>}
    <section className="card grid gap-4 sm:grid-cols-3" aria-label="Study planning">
      <div className="sm:col-span-1"><h2 className="h2">Progress</h2>{topics.length ? <><p className="text-2xl font-bold">{pr.pct}%</p><Bar pct={pr.pct} label="Course progress" /><ProgText p={pr} /><p className="muted mt-1 text-xs">Revised = 1, Studying = ½, Not started = 0.</p></> : <p className="muted text-sm">Nothing to track.</p>}</div>
      <label className="text-sm font-medium">Exam date<input type="date" className="mt-1 block w-full" value={cs.examDate} onChange={ev => setCourse(e.id, { examDate: ev.target.value })} /></label>
      <label className="flex items-center gap-2 self-end text-sm font-medium"><input type="checkbox" className="h-5 w-5" checked={cs.priority} onChange={ev => setCourse(e.id, { priority: ev.target.checked })} /> Priority course (my own flag)</label>
    </section>

    <section aria-labelledby="topics-h" className="space-y-2">
      <h2 id="topics-h" className="h2">{e.type === 'Sessional' && topics.some(t => /^experiment/i.test(t.text)) ? 'Experiments' : 'Syllabus topics'} <span className="muted text-sm font-normal">in original order</span></h2>
      {prereq && <p className="text-sm"><b>Prerequisite:</b> {prereq}</p>}
      {!s ? <Empty title="No detailed syllabus in source">This course is in the curriculum ({e.source.file}, PDF p.{e.source.pdfPage ?? '?'}) but has no matching entry in Avionics_Syllabus.pdf.</Empty>
        : topics.length === 0 ? <Empty title="No topic list in the syllabus entry">{s.sylTitle} has no course-contents section in the source{s.otherSections.length ? '; see “Other sections” below' : ''}. Not provided in source.</Empty>
        : <ol className="space-y-2">{topics.map((t, i) => { const st = ts(t.id); return <li id={'t-' + t.id} key={t.id} className={'card ' + (t.id === topicId ? '!border-teal-500 ring-2 ring-teal-500/40' : '')}>
          <div className="flex gap-3"><span className="muted mt-0.5 w-6 shrink-0 text-right text-sm">{i + 1}.</span>
            <div className="min-w-0 flex-1"><p className="text-[15px] leading-relaxed">{t.text}</p>
              <p className="muted mt-0.5 text-xs">Source: Avionics_Syllabus.pdf, PDF p.{t.pdfPage} (printed {t.pdfPage + 19})</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusPicker name={`topic ${i + 1}`} value={st.status} onChange={v => setTopic(t.id, { status: v }, e.id)} />
                <button className="btn !min-h-[36px] !px-2.5 text-xs" aria-pressed={st.bookmarked} onClick={() => setTopic(t.id, { bookmarked: !st.bookmarked }, e.id)}>{st.bookmarked ? '★ Bookmarked' : '☆ Bookmark'}</button>
                <button className="btn !min-h-[36px] !px-2.5 text-xs" aria-pressed={st.needsPractice} onClick={() => setTopic(t.id, { needsPractice: !st.needsPractice }, e.id)}>{st.needsPractice ? '⚑ Needs practice' : '⚐ Needs practice'}</button>
                <button className="btn !min-h-[36px] !px-2.5 text-xs" aria-expanded={noteOpen === t.id} onClick={() => setNoteOpen(noteOpen === t.id ? null : t.id)}>{st.note ? '✎ Note' : '+ Note'}</button></div>
              {(noteOpen === t.id || st.note && noteOpen === null) && <textarea dir="auto" lang="bn" aria-label={`Personal note for topic ${i + 1}`} rows={3} className="mt-2 block w-full" placeholder="Personal note (Bengali or English)" value={st.note} onChange={ev => setTopic(t.id, { note: ev.target.value }, e.id)} />}
            </div></div></li> })}</ol>}
    </section>

    {s && <section className="space-y-2" aria-label="Supporting information">
      <h2 className="h2">Supporting information</h2>
      {s.objectives.length > 0 && <Sec title="Course objectives" count={s.objectives.length}><List items={s.objectives} /></Sec>}
      {s.outcomes.length > 0 && <Sec title="Course outcomes (CO)" count={s.outcomes.length}><List items={s.outcomes} /></Sec>}
      {s.rationale && <Sec title="Rationale">{s.rationale}</Sec>}
      <Sec title="Textbooks" count={s.textbooks.length || s.booksCombined.length}>{s.textbooks.length ? <List items={s.textbooks} /> : s.booksCombined.length ? <><p className="muted mb-1">Source lists textbooks and references together:</p><List items={s.booksCombined} /></> : 'Not provided in source'}</Sec>
      <Sec title="Reference books" count={s.references.length}>{s.references.length ? <List items={s.references} /> : s.booksCombined.length ? 'Listed together with textbooks above.' : 'Not provided in source'}</Sec>
      {s.otherSections.length > 0 && <Sec title="Other sections (as in source)"><List items={s.otherSections} /></Sec>}
      {!s.objectives.length && !s.outcomes.length && <p className="muted text-sm">Objectives and outcomes: Not provided in source.</p>}
    </section>}

    <section className="card space-y-2 text-sm" aria-label="Source references"><h2 className="h2">Sources</h2>
      <p><b>Curriculum entry:</b> {e.source.file}, PDF page {e.source.pdfPage ?? '?'} (printed label {e.source.printedLabel ?? '?'} — equal to PDF page in this file).</p>
      {s ? <p><b>Syllabus entry:</b> Avionics_Syllabus.pdf, PDF pages {s.pdfPages[0]}–{s.pdfPages[1]} (printed labels {s.printedPages[0]}–{s.printedPages[1]}; printed = PDF page + 19). Matched by {e.syllabusMatch!.method}{e.syllabusMatch!.sylCode !== e.code ? ` — syllabus code is ${e.syllabusMatch!.sylCode}` : ''}.</p> : <p><b>Syllabus entry:</b> Not provided in source.</p>}
      <div className="flex flex-wrap gap-2">{link('Course_Curriculum.pdf', e.source.pdfPage, 'Open curriculum PDF')}{s && link('Avionics_Syllabus.pdf', s.pdfPages[0], 'Open source PDF (syllabus)')}</div>
      <p className="muted text-xs">Extracted text may contain minor PDF-extraction artifacts (e.g. dropped apostrophes). Check the source PDF for exact wording.</p></section>
  </div>
}
