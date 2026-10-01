import type { ReactNode } from 'react'
import { useStore } from '../lib/store'

const NAV = [
  ['/', 'Dashboard', 'M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10'],
  ['/curriculum', 'Curriculum', 'M4 5h16M4 12h16M4 19h16'],
  ['/search', 'Search', 'M11 4a7 7 0 100 14 7 7 0 000-14zm9 16l-4-4'],
  ['/exam', 'Exam Focus', 'M12 3l9 4-9 4-9-4 9-4zM7 11v5c0 1 2 3 5 3s5-2 5-3v-5'],
  ['/data', 'Backup & Data', 'M4 7c0-2 4-3 8-3s8 1 8 3-4 3-8 3-8-1-8-3zm0 0v10c0 2 4 3 8 3s8-1 8-3V7'],
] as const
const Icon = ({ d }: { d: string }) => <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>

export default function Layout({ route, children }: { route: string; children: ReactNode }) {
  const { p, setPrefs, saveError } = useStore()
  const active = (to: string) => to === '/' ? route === '/' : route.startsWith(to) || (to === '/curriculum' && route.startsWith('/course'))
  const next = p.prefs.theme === 'dark' ? 'light' : p.prefs.theme === 'light' ? 'system' : 'dark'
  return <div className="min-h-screen md:flex">
    <a href="#main" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus() }} className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2 focus:text-navy-900">Skip to content</a>
    <aside className="hidden w-60 shrink-0 flex-col bg-navy-900 p-4 text-white md:sticky md:top-0 md:flex md:h-screen">
      <a href="#/" className="mb-6 block"><span className="text-xs uppercase tracking-wider text-teal-300">AAUB · Avionics</span><span className="block text-lg font-bold leading-tight">Sajjad’s Avionics Study Hub</span></a>
      <nav aria-label="Main" className="flex flex-col gap-1">
        {NAV.map(([to, label, d]) => <a key={to} href={'#' + to} aria-current={active(to) ? 'page' : undefined}
          className={'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ' + (active(to) ? 'bg-teal-600 text-white' : 'text-navy-100 hover:bg-navy-700')}><Icon d={d} />{label}</a>)}
      </nav>
      <div className="mt-auto space-y-2 text-xs text-navy-200">
        <button className="btn w-full" onClick={() => setPrefs({ theme: next })} aria-label={`Theme: ${p.prefs.theme}. Switch to ${next}`}>Theme: {p.prefs.theme}</button>
        <p>Data stays in this browser only.</p>
      </div>
    </aside>
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur md:hidden dark:border-navy-700 dark:bg-navy-900/95">
        <a href="#/" className="font-bold text-navy-900 dark:text-white">Sajjad’s Avionics Study Hub</a>
        <button className="btn !min-h-[36px] !px-2" onClick={() => setPrefs({ theme: next })} aria-label={`Theme: ${p.prefs.theme}. Switch to ${next}`}>{p.prefs.theme === 'dark' ? '☾' : p.prefs.theme === 'light' ? '☀' : '◐'}</button>
      </header>
      {saveError && <div role="alert" className="bg-red-700 px-4 py-2 text-sm text-white">Could not save to browser storage (full or blocked). Export a backup from Backup & Data to avoid losing changes.</div>}
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 p-4 pb-24 outline-none md:p-8 md:pb-8">{children}</main>
    </div>
    <nav aria-label="Main (mobile)" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white md:hidden dark:border-navy-700 dark:bg-navy-900">
      {NAV.map(([to, label, d]) => <a key={to} href={'#' + to} aria-current={active(to) ? 'page' : undefined}
        className={'flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ' + (active(to) ? 'text-teal-700 dark:text-teal-300' : 'text-slate-600 dark:text-slate-300')}><Icon d={d} />{label.split(' ')[0]}</a>)}
    </nav>
  </div>
}
