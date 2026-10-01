import { useEffect, useState } from 'react'
import type { Data } from './types'
import { loadData } from './lib/data'
import { useHash, useStore } from './lib/store'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Curriculum from './pages/Curriculum'
import CoursePage from './pages/CoursePage'
import SearchPage from './pages/SearchPage'
import ExamPage from './pages/ExamPage'
import DataPage from './pages/DataPage'
import { Empty } from './components/ui'

export default function App() {
  const [data, setData] = useState<Data | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [route] = useHash()
  const { error, clearError } = useStore()
  useEffect(() => { loadData().then(setData).catch(e => setErr(String(e?.message ?? e))) }, [])
  const [path, qs = ''] = route.split('?')
  const seg = path.split('/').filter(Boolean)
  let page
  if (err) page = <Empty title="Course data failed to load">{err}<br />Run <code>npm run data</code> to regenerate <code>src/data/*.json</code>, or restore them from the project.</Empty>
  else if (!data) page = <div role="status" aria-live="polite" className="card text-center muted">Loading curriculum and syllabus…</div>
  else if (seg[0] === 'curriculum') page = <Curriculum d={data} sem={Number(seg[1]) || undefined} />
  else if (seg[0] === 'course') page = <CoursePage d={data} id={seg[1]} topicId={seg[2]} />
  else if (seg[0] === 'search') page = <SearchPage d={data} qs={qs} />
  else if (seg[0] === 'exam') page = <ExamPage d={data} />
  else if (seg[0] === 'data') page = <DataPage d={data} />
  else page = <Dashboard d={data} />
  return <Layout route={path}>
    {error && <div role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-100">{error} <button className="underline" onClick={clearError}>Dismiss</button></div>}
    {page}
  </Layout>
}
