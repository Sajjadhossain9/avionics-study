export type Status = 'not_started' | 'studying' | 'revised'
export type CourseType = 'Theory' | 'Sessional'
export type Kind = 'required' | 'elective1' | 'elective2' | 'listed'
export interface Src { file: string; pdfPage: number | null; printedLabel: string | null }
export interface SylRef { sylCode: string; method: string; sylTitle: string }
export interface Entry {
  id: string; code: string; title: string; type: CourseType; contactHours: number | null; credits: number
  kind: Kind; semesters: number[]; isElectiveSlot?: boolean; source: Src
  syllabusMatch?: SylRef | null; contactHoursNote?: string; note?: string; totalCreditsStated?: number; pairedSessional?: string
}
export interface Item { text: string; pdfPage: number }
export interface Topic extends Item { id: string }
export interface Syl {
  sylCode: string; sylTitle: string; pdfPages: [number, number]; printedPages: [number, number]
  prerequisites: string | null; rationale: string | null; objectives: Item[]; outcomes: Item[]; topics: Topic[]
  textbooks: Item[]; references: Item[]; booksCombined: Item[]; otherSections: Item[]
}
export interface SemRow { semester: number; courseIds: string[]; computedCredits: number; statedCredits: number; computedContactHours: number; theoryCredits: number; sessionalCredits: number }
export interface Data {
  entries: Record<string, Entry>; semesters: SemRow[]; syl: Record<string, Syl>
  elective1: Entry[]; elective2: { theory: Entry; sessional: Entry }[]; listed: Entry[]
  review: { issues: string[]; flags: Record<string, string[]>; notes: string[] }
  duplicates: { code: string; pdfPages: number[] }[]; program: Record<string, unknown>
}
export interface TopicState { status: Status; bookmarked: boolean; needsPractice: boolean; note: string }
export interface CourseState { examDate: string; priority: boolean }
export interface Personal {
  version: 1
  prefs: { semester: number; theme: 'system' | 'light' | 'dark'; view: 'cards' | 'table' }
  topics: Record<string, TopicState>
  courses: Record<string, CourseState>
  recent: string[]
  last: { courseId: string; topicId?: string } | null
  updatedAt: string
}
