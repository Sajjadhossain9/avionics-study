import { useEffect, useRef, type ReactNode } from 'react'
import type { Status } from '../types'
import { STATUS_LABEL } from '../lib/store'
import type { Prog } from '../lib/store'

export function Bar({ pct, label }: { pct: number; label: string }) {
  return <div role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-navy-700">
    <div className="h-full rounded-full bg-teal-600 dark:bg-teal-400" style={{ width: pct + '%' }} /></div>
}
export const ProgText = ({ p }: { p: Prog }) => p.total === 0
  ? <span className="muted text-xs">No syllabus topics to track</span>
  : <span className="muted text-xs">{p.revised} revised + {p.studying} studying (½) of {p.total} topics = <b>{p.pct}%</b></span>

const ORDER: Status[] = ['not_started', 'studying', 'revised']
export function StatusPicker({ value, onChange, name }: { value: Status; onChange: (s: Status) => void; name: string }) {
  return <div role="radiogroup" aria-label={'Status of ' + name} className="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-navy-600">
    {ORDER.map(s => <button key={s} role="radio" aria-checked={value === s} onClick={() => onChange(s)}
      className={'min-h-[36px] px-2.5 text-xs font-medium ' + (value === s ? (s === 'revised' ? 'bg-teal-700 text-white' : s === 'studying' ? 'bg-navy-700 text-white' : 'bg-slate-200 text-slate-900 dark:bg-navy-600 dark:text-white') : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-navy-900 dark:text-slate-200 dark:hover:bg-navy-800')}>{STATUS_LABEL[s]}</button>)}
  </div>
}
export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="card text-center"><p className="font-semibold">{title}</p><div className="muted mt-1 text-sm">{children}</div></div>
}
export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const r = useRef<HTMLDialogElement>(null)
  useEffect(() => { const d = r.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close() }, [open])
  return <dialog ref={r} onClose={onClose} onCancel={onClose} aria-labelledby="mt" className="w-[min(32rem,92vw)] rounded-xl bg-white p-5 text-slate-900 shadow-xl backdrop:bg-black/50 dark:bg-navy-900 dark:text-slate-100">
    <h2 id="mt" className="h2 mb-2">{title}</h2>{children}</dialog>
}
export const Hl = ({ parts }: { parts: string[] }) => parts.length === 3 ? <>{parts[0]}<mark>{parts[1]}</mark>{parts[2]}</> : <>{parts[0]}</>
