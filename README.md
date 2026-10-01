# Sajjad's Avionics Study Hub

Personal study website for BSc in Aeronautical Engineering (Avionics), AAUB. React + TypeScript + Tailwind (Vite). No backend, login or paid services.

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build && npm run preview   # production build
npm run test       # checks extracted data against the PDFs (needs `pdftotext`)
```

## Source PDFs
Both PDFs are already in `public/pdfs/` (`Course_Curriculum.pdf`, `Avionics_Syllabus.pdf`). "Open source PDF" links use `#page=N`. If a PDF is missing, the course page shows "PDF file not found" instead of a broken link; copy the files back into `public/pdfs/` using those exact names.

## Data (kept separate from personal data)
- `src/data/curriculum.json` – semesters, courses, credits, contact hours, types, electives, curriculum PDF pages
- `src/data/syllabus.json` – prerequisites, objectives, outcomes, ordered topics, books, syllabus PDF pages
- `src/data/review.json` – conflicts and extraction flags shown in the app (Backup & Data page)
- Regenerate from the PDFs: `npm run data` (overwrites hand edits; edit the JSON directly instead if you prefer).
- Topic ids look like `AVE4505-t03` and are stored in the JSON, so progress survives text edits as long as ids are kept. Do not renumber ids.

## Personal data
Saved in `localStorage` key `avhub.v1` (progress, notes, bookmarks, exam dates, priorities, preferences). It does not sync between devices — use Export/Import JSON on the Backup & Data page.
Progress = (Revised + 0.5 × Studying) / topics. Courses with no topic list are excluded.

## Page numbers
Curriculum PDF: printed label = PDF page. Syllabus PDF: printed label = PDF page + 19 (PDF p.1 is printed "20").
