"""Extracts curriculum + syllabus data from the PDFs (per-page text in WORK) into src/data/*.json.
Run: python3 scripts/build_data.py  (needs `pdftotext`). Output files are hand-editable."""
import re, json, subprocess, os, sys
PDF_DIR = os.environ.get('PDF_DIR', 'public/pdfs')
SYL, CUR = 'Avionics_Syllabus.pdf', 'Course_Curriculum.pdf'
def pages(pdf, n):
    out = []
    for p in range(1, n+1):
        out.append(subprocess.run(['pdftotext','-f',str(p),'-l',str(p),'-layout',f'{PDF_DIR}/{pdf}','-'],capture_output=True,text=True).stdout.replace('\f',''))
    return out
cur_pages, syl_pages = pages(CUR, 10), pages(SYL, 134)
SYL_OFFSET = 19  # printed label = pdf page + 19 (PDF p1 shows "20 | P a g e")
norm = lambda s: re.sub(r'[^a-z0-9]+',' ',s.lower().replace('&','and')).replace(' and ',' ').strip()
nospace = lambda c: c.replace(' ','')

# ---------- curriculum (typed from Course_Curriculum.pdf section 18; verified against sections I-V) ----------
T,S='Theory','Sessional'
SEM = {
1:[('PHY 4101','Physics',T,3,3),('AVE 4101','Electrical Circuits Analysis I',T,3,3),('MAT 4101','Differential and Integral Calculus',T,3,3),('ASE 4101','Introduction to Aeronautical Engineering',T,3,3),('HUM 4101','Communicative English',T,3,3),
   ('PHY 4102','Physics Sessional',S,3,1.5),('AVE 4102','Electrical Circuits Analysis I Sessional',S,3,1.5),('ASE 4102','Aeronautical Engineering Drawing',S,3,1.5),('HUM 4102','Communicative English Sessional (Technical Report Writing)',S,1.5,.75)],
2:[('AVE 4201','Electrical Circuits Analysis II',T,3,3),('CHM 4201','Chemistry',T,3,3),('MAT 4203','Ordinary and Partial Differential Equations',T,3,3),('CSE 4201','Computer Programming and Application',T,3,3),('HUM 4203','Bangladesh Studies and Sociology',T,3,3),
   ('AVE 4202','Electrical Circuits Analysis II Sessional',S,1.5,.75),('CHM 4202','Chemistry Sessional',S,1.5,.75),('ASE 4202','Workshop Technology Sessional',S,3,1.5),('CSE 4202','Computer Programming and Application Sessional',S,3,1.5)],
3:[('AVE 4301','Electronic Circuit I',T,3,3),('ASE 4341','Thermodynamics',T,3,3),('ASE 4353','Engineering Mechanics (Statics & Dynamics)',T,4,4),('MAT 4305','Linear Algebra, Coordinate Geometry and Complex Variables',T,3,3),('CSE 4305','Data Structures and Algorithm',T,3,3),
   ('AVE 4302','Electronic Circuit I Sessional',S,3,1.5),('ASE 4342','Thermodynamics Sessional',S,1.5,.75),('CSE 4306','Data Structures and Algorithm Sessional',S,3,1.5)],
4:[('AVE 4401','Electronic Circuits II',T,3,3),('AVE 4403','Electric Machines and Drives',T,3,3),('MAT 4407','Fourier and Laplace Transform',T,3,3),('AVE 4405','Digital Logic and Computer Design',T,3,3),('HUM 4413','Engineering Economics',T,3,3),
   ('AVE 4402','Electronic Circuits II Sessional',S,3,1.5),('AVE 4404','Electric Machines and Drives Sessional',S,3,1.5),('AVE 4406','Digital Logic and Computer Design Sessional',S,3,1.5)],
5:[('AVE 4501','Signals and Systems',T,3,3),('AVE 4503','Microprocessor and Microcontroller Systems',T,3,3),('AVE 4505','Electromagnetic Field Theory',T,3,3),('ASE 4513','Aerodynamics',T,3,3),('MAT 4509','Probability & Statistics',T,3,3),
   ('AVE 4502','Signals and Systems Sessional',S,1.5,.75),('AVE 4504','Microprocessor and Microcontroller Systems Sessional',S,1.5,.75),('AVE 4510','Modelling & Simulation Sessional',S,3,1.5),('ASE 4514','Aerodynamics Sessional',S,3,1.5)],
6:[('AVE 4601','Communication Systems',T,3,3),('AVE 4603','Real Time Embedded Systems',T,3,3),('AVE 4605','Microwave and Antennas',T,3,3),('AVE 4607','Numerical Methods',T,3,3),('AVE 4609','Control Systems',T,3,3),
   ('AVE 4600','Industrial Training',S,None,1),('AVE 4602','Communication Systems Sessional',S,3,1.5),('AVE 4604','Real Time Embedded Systems Sessional',S,1.5,.75),('AVE 4608','Numerical Methods Sessional',S,1.5,.75),('AVE 4610','Control Systems Sessional',S,1.5,.75)],
7:[('AVE 4701','Digital Signal Processing',T,3,3),('AVE 4703','Aircraft Electrical, Instrument and Autopilot Systems',T,3,3),('AVE 4705','Avionics System Design',T,3,3),('AVE 4707','Engineering Ethics & Professionalism',T,2,2),('AVE 47XX','Elective - I',T,3,3),
   ('AVE 4702','Digital Signal Processing Sessional',S,1.5,.75),('AVE 4704','Aircraft Electrical, Instrument and Autopilot Systems Sessional',S,3,1.5),('AVE 4706','Avionics System Design Sessional',S,1.5,.75),('AVE 4700','Final Year Research and Design Project (FYRDP)',S,9,4.5)],
8:[('AVE 4801','Radar System Engineering',T,3,3),('AVE 4803','Aircraft Communication, Navigation & Surveillance System',T,3,3),('ASE 4807','Industrial & Business Management',T,3,3),('AVE 48XX','Elective - II',T,3,3),
   ('AVE 4802','Radar System Engineering Sessional',S,3,1.5),('AVE 4804','Aircraft Communication, Navigation & Surveillance System Sessional',S,3,1.5),('AVE 48XX-S','Elective - II Sessional',S,1.5,.75),('AVE 4700','Final Year Research and Design Project (FYRDP)',S,9,4.5)]}
STATED = {1:20.25,2:19.5,3:19.75,4:19.5,5:19.5,6:19.75,7:21.5,8:20.25}
ELEC1 = [('AVE 4721','Avionics Software Design'),('AVE 4723','Autonomous Systems, Guidance & Control'),('AVE 4725','Robotics and Mechatronics'),('AVE 4729','Remote Sensing and Digital Image Processing'),('AVE 4731','Avionics Human Factors Engineering'),('AVE 4733','RF Integrated Circuit'),('CSE 4781','Machine Learning'),('CSE 4783','Artificial Intelligence'),('CSE 4785','Introduction to Quantum Computing'),('ASE 4557','Aerospace Vehicle Dynamics & Control'),('ASE 4797','Orbital Mechanics')]
ELEC2 = [('AVE 4821','AVE 4822','Introduction to Satellite Communication Engineering'),('AVE 4823','AVE 4824','Space Avionics'),('AVE 4825','AVE 4826','VLSI Design'),('AVE 4827','AVE 4828','Optical Fibre Communication System'),('AVE 4829','AVE 4830','Avionics Cyber Security'),('AVE 4831','AVE 4832','Wireless Communication'),('ASE 4551','ASE 4552','Aircraft Systems')]
SEM_PAGES, ELEC_PAGES = range(6,10), range(4,11)
def cur_page(code, rng, title=None):
    key = code if 'X' not in code else ('Elective - I' if code=='AVE 47XX' else 'Elective - II')
    for p in rng:
        t = re.sub(r'\s+',' ',cur_pages[p-1])
        if key in t: return p
    return None
def cur_page_in(code, sem, title):
    # semester plan pages are 6-9; pick the page whose text has the semester heading before the code
    names = {1:'First Year, First',2:'First Year, Second',3:'Second Year, First',4:'Second Year, Second',5:'Third Year, First',6:'Third Year, Second',7:'Fourth Year, First',8:'Fourth Year, Second'}
    full = ''.join(f'\n@@P{p}@@\n'+re.sub(r'[ \t]+',' ',cur_pages[p-1]) for p in range(6,11))
    start = full.find(names[sem]); end = full.find(next((names[s] for s in range(sem+1,9) if s in names), '19. Summary'), start+10)
    seg = full[start:end if end>0 else None]
    key = code if 'X' not in code else ('Elective - I' if sem==7 else 'Elective - II')
    # find code position and nearest preceding page marker
    pos = seg.find(key if '-S' not in key else 'Elective - II Sessional')
    if pos<0:
        return None
    marks = [(m.start(), int(m.group(1))) for m in re.finditer(r'@@P(\d+)@@', full)]
    abs_pos = start + pos
    pg = [p for s,p in marks if s<=abs_pos]
    if sem==8 and 'Elective - II Sessional' not in seg and key.endswith('-S'): return None
    return pg[-1] if pg else (marks[0][1] if marks else None)

# ---------- syllabus parsing ----------
HDR = re.compile(r'Course Code\s*:\s*([A-Z]{3})\s*-?\s*(\d{4})\s*(?:Course Title\s*:\s*(.*?))?(?:Credits?\s*:\s*([\d.]+)?)?\s*$')
HEAD = re.compile(r'^\s*(Pre-?\s?requisites?|Rationale of the Course(?: of the Course)?|Course Objectives?|Objectives?|Course Outcomes?(?: \(CO\))?|Course Contents?|The course content covers the following topics|Text and Ref(?:erence)? ?Books?|Text and Reference book|Ref(?:erence)? and Text ?books?|Text ?books? and Ref(?:erences?)?|Text ?books?|Reference Books?|Ref\.? Books?|Reading Material|Mapping of Course Outcomes to Program Outcomes|Mapping Course Outcomes.*|Teaching-learning and Assessment Strategy|Criterion|Criteria|Evaluation|Assessment)\s*:?\s*(.*)$', re.I)
FOOT = re.compile(r'^\s*\d+\s*\|\s*P\s*a\s*g\s*e\s*$')
def kind(h):
    h=h.lower()
    if h.startswith('pre'): return 'prereq'
    if h.startswith('rationale'): return 'rationale'
    if 'objective' in h: return 'objectives'
    if 'outcome' in h and not h.startswith('mapping'): return 'outcomes'
    if h.startswith('course content') or h.startswith('the course content'): return 'contents'
    if h.startswith('mapping') or h.startswith('teaching'): return 'skip'
    if h.startswith(('criteri','evaluation','assessment')): return 'other'
    if re.match(r'(text ?books?)$',h): return 'textbooks'
    if h.startswith('ref') and 'text' not in h or h.startswith('reading'): return 'references'
    return 'booksCombined'
lines=[]
for i,t in enumerate(syl_pages,1):
    for l in t.split('\n'):
        if not FOOT.match(l): lines.append((i,l.rstrip()))
starts=[i for i,(p,l) in enumerate(lines) if HDR.search(l)]
raw={}
dups=[]
for n,s in enumerate(starts):
    e=starts[n+1] if n+1<len(starts) else len(lines)
    blk=lines[s:e]; m=HDR.search(blk[0][1]); code=f'{m.group(1)} {m.group(2)}'
    title=(m.group(3) or '').strip()
    k=1
    while k<len(blk) and not HEAD.match(blk[k][1]) and blk[k][1].strip() and k<3:
        if 'Credits' not in blk[0][1] and blk[k][1].strip(): title+=' '+re.sub(r'Credits?\s*:.*','',blk[k][1].strip()); 
        k+=1
    title=re.sub(r'\s+',' ',title.replace('Credits:','')).strip()
    sec={}; cur=None; pg={}
    for p,l in blk[1:]:
        h=HEAD.match(l)
        if h and h.group(1).lower().startswith('the course content') and cur=='contents':
            continue
        if not h and cur!='contents' and re.match(r'^\s*(Experiment|Expt)\.?\s*(no\.?)?\s*:?\s*\d+',l,re.I):
            cur='contents'; sec.setdefault(cur,[]); pg.setdefault(cur,p)
        if h:
            cur=kind(h.group(1)); 
            if cur in sec and cur!='skip': cur=cur+'2'
            sec.setdefault(cur,[]); pg.setdefault(cur,p)
            if h.group(2).strip() and cur!='skip': sec[cur].append((p,h.group(2).strip()))
            continue
        if cur and cur!='skip' and l.strip(): sec[cur].append((p,l.strip()))
    rec=dict(code=code,sylTitle=title,startPage=blk[0][0],endPage=blk[-1][0],sec=sec)
    if code in raw: dups.append(rec); continue
    raw[code]=rec
def items(lines_):
    """numbered list -> list of {text}; joins wrapped lines"""
    out=[]
    for p,l in lines_:
        m=re.match(r'^(\d+|[a-z])[.)]\s+(.*)',l)
        if m: out.append([p,m.group(2)])
        elif out: out[-1][1]+=' '+l
        else: out.append([p,l])
    return [dict(text=re.sub(r'\s+',' ',t).strip(),pdfPage=p) for p,t in out if re.sub(r'\W','',t)]
def topics(lines_, code):
    ex=[(p,l) for p,l in lines_ if re.match(r'^\s*(Experiment|Expt|Exp)\.?\s*(no\.?|No\.?)?\s*:?\s*\d+',l,re.I)]
    out=[]
    if len(ex)>=2:
        for p,l in lines_:
            if re.match(r'^\s*(Experiment|Expt|Exp)\.?\s*(no\.?|No\.?)?\s*:?\s*\d+',l,re.I): out.append([p,l.strip()])
            elif out and l.strip(): out[-1][1]+=' '+l.strip()
        return [dict(text=re.sub(r'\s+',' ',t),pdfPage=p) for p,t in out]
    # theory: a topic starts at a "Label: text" line, a numbered/bulleted line, "UNIT x", or a sentence-initial "Label:" inside a paragraph
    start=re.compile(r'^(?:\d+[.)]\s+|[•▪-]\s*)?([A-Z][^:.;]{1,90}):\s*\S|^\s*(?:\d+[.)]|[•▪])\s+\S|^UNIT\s+[IVX]+')
    segs=[]  # (page,text)
    for p,l in lines_:
        s_=l.strip()
        if not s_: continue
        if start.match(s_) or not segs: segs.append([p,s_])
        else: segs[-1][1]+=' '+s_
    out=[]
    inner=re.compile(r'(?<=[.;])\s+(?=[A-Z][A-Za-z ,&/()\'-]{2,80}:\s)|\s+(?=UNIT\s+[IVX]+\b)')
    for p,t in segs:
        for part in inner.split(t):
            part=re.sub(r'\s+',' ',part).strip()
            if len(re.sub(r'\W','',part))>2: out.append(dict(text=part,pdfPage=p))
    return out
def books(lines_):
    return items(lines_)
def build_course_syl(r, code):
    s=r['sec']; get=lambda k: s.get(k,[])
    d=dict(sylCode=r['code'],sylTitle=r['sylTitle'],pdfPages=[r['startPage'],r['endPage']],printedPages=[r['startPage']+SYL_OFFSET,r['endPage']+SYL_OFFSET])
    pre=' '.join(t for _,t in get('prereq')).strip()
    d['prerequisites']=pre or None
    d['rationale']=' '.join(t for _,t in get('rationale')).strip() or None
    d['objectives']=items(get('objectives')) if get('objectives') else []
    d['outcomes']=items(get('outcomes')) if get('outcomes') else []
    d['topics']=topics(get('contents'),code) if get('contents') else []
    for i,t in enumerate(d['topics'],1): t['id']=f"{nospace(code)}-t{i:02d}"
    d['textbooks']=books(get('textbooks')); d['references']=books(get('references'))
    d['otherSections']=items(get('other')) if get('other') else []
    d['booksCombined']=books(get('booksCombined')+get('booksCombined2'))
    return d
syl={c:build_course_syl(r,c) for c,r in raw.items()}
for c,r in raw.items():
    if not r['sec'] and len(lines)>0:
        pass
dup_info=[dict(code=r['code'],pdfPages=[r['startPage'],r['endPage']]) for r in dups]

# ---------- assemble curriculum ----------
courses={}; semesters=[]; issues=[]
def cid(code,sem): return nospace(code)+('' if code!='AVE 4700' else '')
for sem,rows in SEM.items():
    ids=[]
    for code,title,typ,ch,cr in rows:
        c = 'AVE 4800X' if False else code
        key = nospace(code) if code!='AVE 4700' else 'AVE4700'
        if code=='AVE 4700':
            if key in courses:
                courses[key]['semesters'].append(sem); courses[key]['perSemesterCredit']=cr; ids.append(key); continue
        pg=cur_page_in(code,sem,title)
        slot = 'X' in code
        courses[key]=dict(id=key,code=code,title=title,type=typ,contactHours=ch,credits=cr,semesters=[sem],isElectiveSlot=slot,
            source=dict(file='Course_Curriculum.pdf',pdfPage=pg,printedLabel=str(pg) if pg else None))
        ids.append(key)
    req=sum(r[4] for r in rows); sem_th=sum(r[4] for r in rows if r[2]==T); sem_se=req-sem_th
    ch=sum((r[3] or 0) for r in rows)
    semesters.append(dict(semester=sem,courseIds=ids,computedCredits=req,statedCredits=STATED[sem],computedContactHours=ch,theoryCredits=sem_th,sessionalCredits=sem_se))
    if abs(req-STATED[sem])>1e-9: issues.append(f'Semester {sem}: computed credits {req} differ from stated {STATED[sem]}')
courses['AVE4700']['totalCreditsStated']=9.0
courses['AVE4700']['note']='Appears in Semesters 7 and 8 at 9.00 contact / 4.50 credit hours each (total 9 credits per curriculum section VI).'
courses['AVE4600']['contactHoursNote']='Source gives "Sessional (4 week)" instead of contact hours.'
# electives
def opt(code,title,typ,cr,ch):
    pgs=[p for p in ELEC_PAGES if code in re.sub(r'\s+',' ',cur_pages[p-1])]
    return dict(code=code,title=title,type=typ,contactHours=ch,credits=cr,source=dict(file='Course_Curriculum.pdf',pdfPage=pgs[-1] if pgs else None,printedLabel=str(pgs[-1]) if pgs else None))
electives=dict(
 otherListed=dict(label='Non-Departmental electives listed in curriculum section V(b) but not in the Elective I / II lists of section 21',options=[opt('EEE 4881','Electrical Power Systems',T,3,3),opt('EEE 4882','Electrical Power Systems Sessional',S,.75,1.5)]),
 elective1=dict(label='Elective - I [One Theory]',semester=7,slotId='AVE47XX',options=[opt(c,t,T,3,3) for c,t in ELEC1]),
 elective2=dict(label='Elective - II [One Theory + One Sessional]',semester=8,slotId='AVE48XX',options=[dict(theory=opt(a,t,T,3,3),sessional=opt(b,t+' Sessional',S,.75,1.5)) for a,b,t in ELEC2]))
for g in (electives['elective2']['options']): g['theory']['pairedSessional']=g['sessional']['code']

# ---------- match syllabus ----------
syl_by_title={}
for c,d in syl.items(): syl_by_title.setdefault(norm(d['sylTitle']),[]).append(c)
def match(code,title):
    if code in syl and norm(syl[code]['sylTitle'])==norm(title): return code,'code+title'
    if code in syl: return code,'code'
    alt=syl_by_title.get(norm(title),[])
    if alt: return alt[0],'title-only (code differs)'
    return None,None
def attach(obj,code,title,typ_hint=None):
    sc,how=match(code,title)
    if not sc: obj['syllabusMatch']=None; return
    d=syl[sc]; obj['syllabusMatch']=dict(sylCode=sc,method=how,sylTitle=d['sylTitle'])
    obj['sylSource']=dict(file='Avionics_Syllabus.pdf',pdfPages=d['pdfPages'],printedLabels=d['printedPages'])
    if how!='code+title' : issues.append(f"{code} '{title}': syllabus title is '{d['sylTitle']}' (match by {how}; syllabus code {sc})")
for c in courses.values():
    if c['isElectiveSlot']: continue
    attach(c,c['code'],c['title'])
for e in electives['elective1']['options']+electives['otherListed']['options']: attach(e,e['code'],e['title'])
for g in electives['elective2']['options']:
    attach(g['theory'],g['theory']['code'],g['theory']['title']); attach(g['sessional'],g['sessional']['code'],g['sessional']['title'])
# syllabus entries not used
used={c['syllabusMatch']['sylCode'] for c in list(courses.values())+electives['elective1']['options']+electives['otherListed']['options']+[x for g in electives['elective2']['options'] for x in (g['theory'],g['sessional'])] if c.get('syllabusMatch')}
unused=[c for c in syl if c not in used]
for c in unused: issues.append(f'Syllabus entry {c} "{syl[c]["sylTitle"]}" not matched to any curriculum course')
for d in dup_info: issues.append(f"Syllabus contains a second entry for {d['code']} (PDF pp. {d['pdfPages'][0]}-{d['pdfPages'][1]}); first entry used, duplicate kept in review list")
# per-course content flags
flags={}
def flag(code,msg): flags.setdefault(code,[]).append(msg)
for sc,d in syl.items():
    if not d['topics']: flag(sc,'No course contents / topics found in syllabus.')
    if not d['objectives']: flag(sc,'Course objectives not found in syllabus.')
    if not d['outcomes']: flag(sc,'Course outcomes not found in syllabus.')
    if not (d['textbooks'] or d['references'] or d['booksCombined']): flag(sc,'No textbooks or references found in syllabus.')
    nums=[]
    for t in d['topics']:
        mm=re.match(r'(?i)\s*(?:experiment|expt|exp)\.?\s*(?:no\.?)?\s*:?\s*(\d+)',t['text'])
        if mm: nums.append(int(mm.group(1)))
    if nums and nums!=list(range(1,max(nums)+1)): flag(sc,f'Experiment numbering has gaps or is out of order ({nums}); source text may be unreadable or missing.')
    blob=json.dumps(d)
    if '\ufffd' in blob: flag(sc,'Contains unreadable characters.')
os.makedirs('src/data',exist_ok=True)
json.dump(dict(courses=courses,semesters=semesters,electives=electives,program=dict(name='BSc in Aeronautical Engineering (Avionics)',semesters=8,totalCreditsStated=160,minCreditsRequirementStated=154,source='Course_Curriculum.pdf')),open('src/data/curriculum.json','w'),indent=1,ensure_ascii=False)
json.dump(dict(courses=syl,duplicates=dup_info,flags=flags,syllabusPdfPageOffset=SYL_OFFSET),open('src/data/syllabus.json','w'),indent=1,ensure_ascii=False)
json.dump(dict(issues=issues,flags=flags,notes=['Curriculum states both a 154-credit minimum (section c) and 160 total credits (sections 18/19); both preserved.','Syllabus pages carry printed labels = PDF page + 19.','Curriculum core list titles "Electronic Circuits I" while semester plan says "Electronic Circuit I" (AVE 4301/4302); semester-plan wording kept.']),open('src/data/review.json','w'),indent=1,ensure_ascii=False)
print(len(courses),'curriculum courses;',len(syl),'syllabus entries;',len(issues),'issues;',len(flags),'flagged courses')
