import { createContext, useContext, useEffect, useMemo, useState, useCallback, createElement, type ReactNode } from 'react'
import type { Personal, Status, TopicState, CourseState, Data, Entry } from '../types'
import { topicsOf } from './data'

export const KEY = 'avhub.v1'
export const blank = (): Personal => ({ version: 1, prefs: { semester: 5, theme: 'system', view: 'cards' }, topics: {}, courses: {}, recent: [], last: null, updatedAt: new Date().toISOString() })
const defT: TopicState = { status: 'not_started', bookmarked: false, needsPractice: false, note: '' }
const defC: CourseState = { examDate: '', priority: false }

/** Validates untrusted JSON (import or localStorage). Returns cleaned data + problems; never throws. */
export function validate(raw: unknown): { ok: true; data: Personal; warnings: string[] } | { ok: false; error: string } {
  const o = raw as any
  if (!o || typeof o !== 'object' || Array.isArray(o)) return { ok: false, error: 'File is not a JSON object.' }
  const root = o.app === 'avionics-study-hub' && o.data ? o.data : o
  if (root.version !== 1) return { ok: false, error: `Unsupported or missing version (${String(root.version)}); expected 1.` }
  const p = blank(), w: string[] = []
  const pr = root.prefs ?? {}
  if (Number.isInteger(pr.semester) && pr.semester >= 1 && pr.semester <= 8) p.prefs.semester = pr.semester; else if (pr.semester !== undefined) w.push('Invalid semester preference ignored.')
  if (['system', 'light', 'dark'].includes(pr.theme)) p.prefs.theme = pr.theme
  if (['cards', 'table'].includes(pr.view)) p.prefs.view = pr.view
  if (root.topics && typeof root.topics === 'object') for (const [k, v] of Object.entries<any>(root.topics)) {
    if (!v || typeof v !== 'object') { w.push(`Skipped malformed topic entry "${k}".`); continue }
    if (!['not_started', 'studying', 'revised'].includes(v.status)) { w.push(`Topic "${k}" had an invalid status; reset to Not started.`) }
    p.topics[k] = { status: ['not_started', 'studying', 'revised'].includes(v.status) ? v.status : 'not_started', bookmarked: v.bookmarked === true, needsPractice: v.needsPractice === true, note: typeof v.note === 'string' ? v.note.slice(0, 20000) : '' }
  } else if (root.topics !== undefined) return { ok: false, error: '"topics" must be an object.' }
  if (root.courses && typeof root.courses === 'object') for (const [k, v] of Object.entries<any>(root.courses)) {
    const d = typeof v?.examDate === 'string' && /^(\d{4}-\d{2}-\d{2})?$/.test(v.examDate) ? v.examDate : ''
    if (v?.examDate && !d) w.push(`Course "${k}" had an invalid exam date; cleared.`)
    p.courses[k] = { examDate: d, priority: v?.priority === true }
  }
  if (Array.isArray(root.recent)) p.recent = root.recent.filter((x: unknown) => typeof x === 'string').slice(0, 8)
  if (root.last && typeof root.last.courseId === 'string') p.last = { courseId: root.last.courseId, topicId: typeof root.last.topicId === 'string' ? root.last.topicId : undefined }
  return { ok: true, data: p, warnings: w }
}

interface Ctx {
  p: Personal; error: string | null; saveError: boolean
  topic: (id: string) => TopicState; course: (id: string) => CourseState
  setTopic: (id: string, patch: Partial<TopicState>, courseId?: string) => void
  setCourse: (id: string, patch: Partial<CourseState>) => void
  setPrefs: (patch: Partial<Personal['prefs']>) => void
  open: (courseId: string) => void
  replace: (p: Personal) => void; reset: () => void; clearError: () => void
}
const C = createContext<Ctx>(null as any)
export const useStore = () => useContext(C)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState(false)
  const [p, setP] = useState<Personal>(() => {
    try {
      const s = localStorage.getItem(KEY); if (!s) return blank()
      const v = validate(JSON.parse(s)); if (v.ok) return v.data
      setTimeout(() => setError('Saved study data could not be read: ' + v.error + ' It has been left untouched in your browser; export it from the Data page before changing anything.'), 0)
      return blank()
    } catch { setTimeout(() => setError('Saved study data is corrupted or browser storage is unavailable. Changes may not persist.'), 0); return blank() }
  })
  const [loadedBad] = useState(() => error !== null)
  useEffect(() => {
    if (error && !saveError && loadedBad) return
    const t = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(p)); setSaveError(false) } catch { setSaveError(true) } }, 150)
    return () => clearTimeout(t)
  }, [p, error])
  useEffect(() => {
    const dark = p.prefs.theme === 'dark' || (p.prefs.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', dark)
  }, [p.prefs.theme])
  const upd = (f: (x: Personal) => Personal) => setP(x => ({ ...f(x), updatedAt: new Date().toISOString() }))
  const api: Ctx = useMemo(() => ({
    p, error, saveError,
    topic: id => p.topics[id] ?? defT, course: id => p.courses[id] ?? defC,
    setTopic: (id, patch, courseId) => upd(x => ({ ...x, topics: { ...x.topics, [id]: { ...(x.topics[id] ?? defT), ...patch } }, last: courseId ? { courseId, topicId: id } : x.last })),
    setCourse: (id, patch) => upd(x => ({ ...x, courses: { ...x.courses, [id]: { ...(x.courses[id] ?? defC), ...patch } } })),
    setPrefs: patch => upd(x => ({ ...x, prefs: { ...x.prefs, ...patch } })),
    open: id => setP(x => x.recent[0] === id ? x : { ...x, recent: [id, ...x.recent.filter(r => r !== id)].slice(0, 6), last: x.last?.courseId === id ? x.last : { courseId: id } }),
    replace: np => { setError(null); setP(np) }, reset: () => { setError(null); setP(blank()) }, clearError: () => setError(null),
  }), [p, error, saveError])
  return createElement(C.Provider, { value: api }, children)
}

// -------- progress (transparent): Revised = 1, Studying = 0.5, Not started = 0 --------
export interface Prog { total: number; revised: number; studying: number; notStarted: number; pct: number; practice: number; bookmarks: number }
export function progress(d: Data, entries: Entry[], topic: (id: string) => TopicState): Prog {
  let total = 0, revised = 0, studying = 0, practice = 0, bookmarks = 0
  for (const e of entries) for (const t of topicsOf(d, e)) {
    const s = topic(t.id); total++
    if (s.status === 'revised') revised++; else if (s.status === 'studying') studying++
    if (s.needsPractice) practice++; if (s.bookmarked) bookmarks++
  }
  return { total, revised, studying, notStarted: total - revised - studying, pct: total ? Math.round(((revised + studying * 0.5) / total) * 100) : 0, practice, bookmarks }
}
export const STATUS_LABEL: Record<Status, string> = { not_started: 'Not started', studying: 'Studying', revised: 'Revised' }
export const useHash = () => {
  const [h, setH] = useState(location.hash.slice(1) || '/')
  useEffect(() => { const f = () => setH(location.hash.slice(1) || '/'); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  const go = useCallback((to: string) => { location.hash = to }, [])
  return [h, go] as const
}
