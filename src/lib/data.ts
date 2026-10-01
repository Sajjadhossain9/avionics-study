import type { Data, Entry, Syl, Topic } from '../types'

const slug = (c: string) => c.replace(/\s+/g, '')

/** Course source data is loaded separately from personal study data. */
export async function loadData(): Promise<Data> {
  const [cur, syl, rev] = await Promise.all([
    import('../data/curriculum.json'), import('../data/syllabus.json'), import('../data/review.json'),
  ])
  const c: any = cur.default, s: any = syl.default
  const entries: Record<string, Entry> = {}
  const add = (e: any, kind: Entry['kind'], semesters: number[]) => {
    entries[slug(e.code)] = { ...e, id: slug(e.code), kind, semesters, contactHours: e.contactHours ?? null }
  }
  for (const e of Object.values<any>(c.courses)) add(e, 'required', e.semesters)
  const e1 = c.electives.elective1.options.map((o: any) => (add(o, 'elective1', [7]), entries[slug(o.code)]))
  const e2 = c.electives.elective2.options.map((g: any) => {
    add(g.theory, 'elective2', [8]); add(g.sessional, 'elective2', [8])
    return { theory: entries[slug(g.theory.code)], sessional: entries[slug(g.sessional.code)] }
  })
  const listed = c.electives.otherListed.options.map((o: any) => (add(o, 'listed', []), entries[slug(o.code)]))
  return { entries, semesters: c.semesters, syl: s.courses, elective1: e1, elective2: e2, listed, review: rev.default as any, duplicates: s.duplicates, program: c.program }
}

export const sylOf = (d: Data, e: Entry): Syl | null => (e.syllabusMatch ? d.syl[e.syllabusMatch.sylCode] ?? null : null)
export const topicsOf = (d: Data, e: Entry): Topic[] => sylOf(d, e)?.topics ?? []
export const fmt = (n: number | null | undefined) => (n == null ? 'Not provided in source' : n.toFixed(2))
export const semLabel = (e: Entry) => e.kind === 'elective1' ? 'Elective I (Sem 7)' : e.kind === 'elective2' ? 'Elective II (Sem 8)' : e.kind === 'listed' ? 'Elective (listed, no slot)' : e.semesters.length ? 'Sem ' + e.semesters.join(' + ') : '—'
export const kindLabel = (e: Entry) => e.kind === 'required' ? e.type : e.type + ' · Elective'

const BASE = import.meta.env.BASE_URL
export const pdfUrl = (file: string, page?: number | null) => `${BASE}pdfs/${file}${page ? `#page=${page}` : ''}`
export async function pdfAvailable(file: string): Promise<boolean> {
  try { const r = await fetch(`${BASE}pdfs/${file}`, { method: 'HEAD' }); return r.ok && /pdf/i.test(r.headers.get('content-type') || '') } catch { return false }
}

// ---------------- search ----------------
export interface Hit { entry: Entry; kind: 'code' | 'title' | 'topic' | 'book'; text: string; topicId?: string; score: number }
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ')
const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
export function search(d: Data, q: string, sem: number | 'all', type: 'all' | 'Theory' | 'Sessional' | 'Elective'): Hit[] {
  const nq = norm(q.trim()), cq = compact(q)
  if (!nq) return []
  const out: Hit[] = []
  for (const e of Object.values(d.entries)) {
    if (e.isElectiveSlot) continue
    if (type === 'Elective' ? e.kind === 'required' : type !== 'all' && e.type !== type) continue
    if (sem !== 'all' && !(e.semesters.includes(sem) || (e.kind === 'elective1' && sem === 7) || (e.kind === 'elective2' && sem === 8))) continue
    if (cq && compact(e.code).includes(cq)) out.push({ entry: e, kind: 'code', text: e.code, score: compact(e.code) === cq ? 100 : 80 })
    if (norm(e.title).includes(nq)) out.push({ entry: e, kind: 'title', text: e.title, score: 70 })
    const s = sylOf(d, e); if (!s) continue
    for (const t of s.topics) if (norm(t.text).includes(nq)) out.push({ entry: e, kind: 'topic', text: t.text, topicId: t.id, score: 50 })
    for (const b of [...s.textbooks, ...s.references, ...s.booksCombined]) if (norm(b.text).includes(nq)) out.push({ entry: e, kind: 'book', text: b.text, score: 40 })
  }
  return out.sort((a, b) => b.score - a.score || a.entry.code.localeCompare(b.entry.code))
}
export function snippet(text: string, q: string, len = 160): string[] {
  const i = text.toLowerCase().indexOf(q.trim().toLowerCase())
  if (i < 0) return [text.slice(0, len)]
  const a = Math.max(0, i - 50), b = Math.min(text.length, i + q.trim().length + len - 50)
  return [(a > 0 ? '…' : '') + text.slice(a, i), text.slice(i, i + q.trim().length), text.slice(i + q.trim().length, b) + (b < text.length ? '…' : '')]
}
