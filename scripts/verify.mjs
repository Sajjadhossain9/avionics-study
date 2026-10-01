// Data verification: run `npm run test`. Compares extracted JSON against text pulled from the PDFs.
import fs from 'node:fs'; import { execSync } from 'node:child_process'
const cur = JSON.parse(fs.readFileSync('src/data/curriculum.json')), syl = JSON.parse(fs.readFileSync('src/data/syllabus.json'))
let fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++ }
const txt = execSync('pdftotext -layout public/pdfs/Course_Curriculum.pdf -', { maxBuffer: 1e8 }).toString().replace(/\s+/g, ' ')
// 1. every course code in the semester plan (section 18) is represented
const plan = txt.slice(txt.indexOf('First Year, First Semester'), txt.indexOf('19. Summary'))
const planCodes = [...new Set([...plan.matchAll(/\b(AVE|ASE|CSE|MAT|PHY|CHM|HUM) (\d{4}|\d{2}XX)\b/g)].map(m => m[0]))]
const have = new Set(Object.values(cur.courses).map(c => c.code))
ok(planCodes.every(c => have.has(c)), `all ${planCodes.length} distinct course codes in semester plan present (${planCodes.filter(c => !have.has(c)).join(',') || 'none missing'})`)
ok(cur.semesters.length === 8, '8 semesters present')
// 2. semester totals match stated summary (section 19)
for (const s of cur.semesters) ok(Math.abs(s.computedCredits - s.statedCredits) < 1e-9, `Semester ${s.semester}: computed ${s.computedCredits} = stated ${s.statedCredits}`)
ok(Math.abs(cur.semesters.reduce((a, s) => a + s.computedCredits, 0) - 160) < 1e-9, 'program total = 160.00 credits')
const th = cur.semesters.reduce((a, s) => a + s.theoryCredits, 0), se = cur.semesters.reduce((a, s) => a + s.sessionalCredits, 0)
ok(th === 117 && se === 43, `theory ${th} / sessional ${se} credits = 117 / 43`)
// 3. electives
const e1 = cur.electives.elective1.options.length, e2 = cur.electives.elective2.options.length
ok(e1 === 11 && e2 === 7, `Elective I options=${e1} (expect 11), Elective II theory+sessional pairs=${e2} (expect 7)`)
const e1codes = ['AVE 4721','AVE 4723','AVE 4725','AVE 4729','AVE 4731','AVE 4733','CSE 4781','CSE 4783','CSE 4785','ASE 4557','ASE 4797']
ok(e1codes.every(c => cur.electives.elective1.options.some(o => o.code === c)), 'Elective I codes match section 21a')
for (const s of cur.semesters) ok(!s.courseIds.some(id => /^(AVE47[2-3]|AVE48[2-3])\d$/.test(id) && id !== 'AVE4700'), `Semester ${s.semester}: no elective option counted as required`)
// 4. source refs
const all = [...Object.values(cur.courses), ...cur.electives.elective1.options, ...cur.electives.elective2.options.flatMap(g => [g.theory, g.sessional]), ...cur.electives.otherListed.options]
ok(all.every(c => c.source.pdfPage >= 1 && c.source.pdfPage <= 10), `all ${all.length} curriculum entries have a PDF page (1-10)`)
const real = all.filter(c => !c.code.includes('X'))
ok(real.every(c => c.syllabusMatch && c.sylSource), `all ${real.length} non-slot entries matched to a syllabus entry`)
ok(real.every(c => c.sylSource.pdfPages[0] >= 2 && c.sylSource.printedLabels[0] === c.sylSource.pdfPages[0] + 19), 'syllabus printed label = PDF page + 19')
// 5. syllabus completeness (spot check against PDF page text)
const sp = i => execSync(`pdftotext -f ${i} -l ${i} -layout public/pdfs/Avionics_Syllabus.pdf -`).toString()
for (const [code, pg] of [['AVE 4501', 19], ['AVE 4505', 25], ['MAT 4509', 84]]) {
  const s = syl.courses[code]; ok(s && s.pdfPages[0] === pg, `${code} starts at PDF page ${pg}`)
}
const t505 = syl.courses['AVE 4505'].topics.map(t => t.text).join(' '); ok(/Time Varying Fields/.test(t505) && /Vector Analysis/.test(t505) && t505.indexOf('Vector Analysis') < t505.indexOf('Time Varying'), 'AVE 4505 topics keep source order')
ok(Object.values(syl.courses).every(s => s.topics.every((t, i) => t.id === `${s.sylCode.replace(/\s/g, '')}-t${String(i + 1).padStart(2, '0')}`)), 'topic ids are stable & sequential')
const codesInSyl = [...new Set([...execSync('for i in $(seq 1 134); do pdftotext -f $i -l $i -layout public/pdfs/Avionics_Syllabus.pdf -; done', { maxBuffer: 1e9 }).toString().matchAll(/Course Code:\s*([A-Z]{3})\s*-?\s*(\d{4})/g)].map(m => m[1] + ' ' + m[2]))]
ok(codesInSyl.every(c => syl.courses[c]), `all ${codesInSyl.length} distinct syllabus codes parsed`)
console.log(fail ? `\n${fail} check(s) FAILED` : '\nAll checks passed'); process.exit(fail ? 1 : 0)
