function toggleExtraFields() {
  const rows = [
    document.getElementById("moreOptionsRow1"),
    document.getElementById("moreOptionsRow2")
  ];

  rows.forEach(row => row.classList.toggle("hidden"));

  const btn = document.querySelector(".toggle-btn");
  const isVisible = !rows[0].classList.contains("hidden");
  btn.textContent = isVisible ? "Hide Extra Options" : "See More Options";
}

const resultDiv = document.getElementById('result');
const reportDiv = document.getElementById('report');
const examType = document.getElementById('examType').value;
const classTypeSelect = document.getElementById('classType');

classTypeSelect.onchange = () => {
  const selectedClass = classTypeSelect.value.trim();
  const masterRepResURL = RepResURLs[selectedClass] || null;

  
  resultDiv.innerHTML = '';
  reportDiv.innerHTML = '';
  // If no URL, show error and stop further execution
  if (!masterRepResURL) {
    resultDiv.innerHTML = `
      <div style="color: red; padding: 1rem; border: 1px solid red; background: #ffe5e5;">
        You cannot access anything here for <strong>${selectedClass}</strong> because access isn't available for now.
      </div>
    `;
    reportDiv.innerHTML = `
      <div style="color: red; padding: 1rem; border: 1px solid red; background: #ffe5e5;">
        You cannot access anything here for <strong>${selectedClass}</strong> because access isn't available for now.
      </div>
    `;
    return; 
  }
  
  
 };
    
    
async function fetchScores() {
   const examType = document.getElementById('examType').value.trim();
  const selectedClass = document.getElementById('classType').value.trim();
  const masterRepResURL = RepResURLs[selectedClass] || null;

  // Block if no URL
  if (!masterRepResURL) {
    resultDiv.innerHTML = `
      <div style="color: red; padding: 1rem; border: 1px solid red; background: #ffe5e5;">
        You cannot access anything here for <strong>${selectedClass}</strong> because access isn't available for now.
      </div>
    `;
    return;
  }

  // Proceed to fetch
  document.querySelector('.scroll-wrapper1').style.display = 'none'; 
  document.querySelector('.scroll-wrapper').style.display = 'block'; 
  showLoadingOverlay();
try {
  const resultDiv = document.getElementById('result');
const examType = document.getElementById('examType').value;
  const res = await fetch(`${masterRepResURL}?examType=${encodeURIComponent(examType)}`);
  const data = await res.json();
setTimeout(() => {
    hideLoadingOverlay();
  }, 3000);

  if (data.status === 'success') {
  const students = data.data;
 
  resultDiv.innerHTML = '';

  // School Header
  const schoolHeader = document.createElement('div');
  schoolHeader.className = 'school-header';
  schoolHeader.innerHTML = `
    <h1 contenteditable="true">Sunrise Secondary School</h1>
    <p contenteditable="true">Academic Year: 2024/2025</p>
    <p contenteditable="true" id="examTitle">Exam: ${examType || '-'}</p>
  `;
  resultDiv.appendChild(schoolHeader);

 
  resultDiv.appendChild(buildDivisionTable(students));
  resultDiv.appendChild(buildStudentTable(students));

 
  const subjectTable = buildSubjectTable(students);
  const wrapper = document.createElement('div');
  wrapper.className = 'table-container page-break'; // apply class to trigger new PDF page
  wrapper.appendChild(subjectTable);

  resultDiv.appendChild(wrapper);

  } else {
    resultDiv.innerHTML = `<p style="color:red;">❌ Error: ${data.message}</p>`;
  }
} catch (error) {
  resultDiv.innerHTML = `<p style="color:red;">❌ Network Error: ${error.message}</p>`;
}
}
    
   // ---------------------'Display Table--------------------- 
    async function displaystdData(masterRepResURL) {
      const examType = document.getElementById('examType').value;
      

try {
  const res = await fetch(`${masterRepResURL}?examType=${encodeURIComponent(examType)}`);
  const data = await res.json();

  if (data.status === 'success') {
  const students = data.data;
  renderStudentReports(students);

  } else {
    
  }
} catch (error) {
 
}
    
    }



    
    // ---------------------Results Table---------------------
function buildStudentTable(students) {
  const selectedValue = document.getElementById("resultType").value;
  const includePosition = document.getElementById('positionToggle').value === 'show';
  const SchoolI = document.getElementById('schoolIndexInput').value.trim().toUpperCase();

  const studentTable = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const headers = ["CAND'S NO", "CAND'S NAME", 'SEX', 'AGG', 'DIV'];
  if (includePosition) headers.push('POS');
  headers.push('DETAILED SUBJECTS');

  headers.forEach(title => {
    const th = document.createElement('th');
    th.textContent = title;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  studentTable.appendChild(thead);

  const tbody = document.createElement('tbody');

  students.forEach((student, i) => {
    const tr = document.createElement('tr');

    // Build subject summary string
    const summary = Object.entries(student.scores).map(([subject, s]) => {
      if (s.mark == null || s.mark === '') return '';
      if (selectedValue === "both") {
        return `${subject}- ${s.mark}'${s.grade}'`;
      } else if (selectedValue === "raw") {
        return `${subject}- ${s.mark}`;
      } else if (selectedValue === "grade") {
        return `${subject}-'${s.grade}'`;
      }
      return '';
    }).filter(Boolean).join(' ');

    // Compose table row cells
    const cells = [
      `<td>${SchoolI}-${String(i + 1).padStart(4, '0')}</td>`,
      `<td>${student.name}</td>`,
      `<td>${student.gender}</td>`,
      `<td>${student.point}</td>`,
      `<td>${student.division}</td>`,
      includePosition ? `<td class="pos-column">${student.position}</td>` : '',
      `<td class="subject-summary">${summary}</td>`
    ];

    tr.innerHTML = cells.join('');
    tbody.appendChild(tr);
  });

  studentTable.appendChild(tbody);

  // ---------- Apply column widths dynamically ----------
  const allRows = studentTable.querySelectorAll('tr');
  allRows.forEach(row => {
    const cells = row.querySelectorAll('td, th');
     if (cells.length > 0) {
    cells[0].style.width = '9%'; 
    cells[0].style.textAlign = 'center';   
    cells[1].style.width = '21%';    
    cells[1].style.textAlign = 'left';

    cells[2].style.width = '6%';     
    cells[2].style.textAlign = 'center';

    cells[3].style.width = '6%';    
    cells[3].style.textAlign = 'center';

    cells[4].style.width = '6%';     
    cells[4].style.textAlign = 'center';

    if (includePosition) {
      cells[5].style.width = '6%';  
      cells[5].style.textAlign = 'center';

      cells[6].style.width = 'auto'; 
    } else {
      cells[5].style.width = 'auto'; 
    }
  }
  });

  return studentTable;
}



    // ---------------------Subjects Table---------------------

let calcSchoolGPA = null;

function buildSubjectTable(students) {
  const subjectStats = {};
  const subjectGPAs = {};
  const subjectAverages = {};
  const subjectCounts = {};
  const gradeValues = { A: 1, B: 2, C: 3, D: 4, F: 5 };

  students.forEach(student => {
    const gender = student.gender || 'U';
    Object.entries(student.scores).forEach(([subject, s]) => {
      if (!s.grade || typeof s.mark !== 'number') return;

      const grade = s.grade;
      const mark = s.mark;

      if (!subjectStats[subject]) {
        subjectStats[subject] = {
          A: { F: 0, M: 0 },
          B: { F: 0, M: 0 },
          C: { F: 0, M: 0 },
          D: { F: 0, M: 0 },
          F: { F: 0, M: 0 }
        };
      }

      if (subjectStats[subject][grade] && subjectStats[subject][grade][gender] !== undefined) {
        subjectStats[subject][grade][gender]++;
      }

      if (!subjectGPAs[subject]) subjectGPAs[subject] = { totalPoints: 0, count: 0 };
      subjectGPAs[subject].totalPoints += gradeValues[grade];
      subjectGPAs[subject].count++;

      if (!subjectAverages[subject]) subjectAverages[subject] = { total: 0, count: 0 };
      subjectAverages[subject].total += mark;
      subjectAverages[subject].count++;

      if (!subjectCounts[subject]) subjectCounts[subject] = { F: 0, M: 0 };
      if (gender === 'F' || gender === 'M') {
        subjectCounts[subject][gender]++;
      }
    });
  });

  const finalGPAs = {};
  const finalAverages = {};
  const finalGradesWithComments = {};

  let totalGPA = 0;
  let gpaCount = 0;

  Object.keys(subjectStats).forEach(subject => {
    const g = subjectGPAs[subject];
    const avgGPA = g.count > 0 ? (g.totalPoints / g.count) : null;
    finalGPAs[subject] = avgGPA ? avgGPA.toFixed(1) : 'N/A';

    if (avgGPA !== null) {
      totalGPA += avgGPA;
      gpaCount++;
    }

    const a = subjectAverages[subject];
    const avg = a.count > 0 ? (a.total / a.count).toFixed(1) : 'N/A';
    finalAverages[subject] = avg;

    const avgNum = parseFloat(avg);
    let gradeComment = 'N/A';
    if (!isNaN(avgNum)) {
      if (avgNum > 74) gradeComment = 'A (Excell)';
      else if (avgNum > 64) gradeComment = 'B (V.Good)';
      else if (avgNum > 44) gradeComment = 'C (Good)';
      else if (avgNum > 29) gradeComment = 'D (Satisf)';
      else gradeComment = 'F (Fail)';
    }
    finalGradesWithComments[subject] = gradeComment;
  });

  
 const schoolGPA = gpaCount > 0 ? totalGPA / gpaCount : null;
calcSchoolGPA = schoolGPA;

  // Build Table
  const subjectTable = document.createElement('table');
  subjectTable.className = 'subject-table';
  const thead = document.createElement('thead');

  const headerRow = document.createElement('tr');
  headerRow.appendChild(Object.assign(document.createElement('th'), { textContent: 'GRADE' }));
  headerRow.appendChild(Object.assign(document.createElement('th'), { textContent: 'SEX' }));

  const subjects = Object.keys(subjectStats);
  subjects.forEach(subject => {
    const th = document.createElement('th');
    th.textContent = subject;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);

  const rows = [
    { label: 'GPA', data: finalGPAs },
    { label: 'AVER', data: finalAverages },
    { label: 'GRADE', data: finalGradesWithComments },
    { label: 'SAT-F', data: subjects.reduce((acc, s) => (acc[s] = subjectCounts[s]?.F || 0, acc), {}) },
    { label: 'SAT-M', data: subjects.reduce((acc, s) => (acc[s] = subjectCounts[s]?.M || 0, acc), {}) },
    { label: 'TOTAL', data: subjects.reduce((acc, s) => (acc[s] = (subjectCounts[s]?.F || 0) + (subjectCounts[s]?.M || 0), acc), {}) }
  ];

  rows.forEach(rowInfo => {
    const row = document.createElement('tr');
    row.appendChild(document.createElement('td'));
    const label = document.createElement('td');
    label.textContent = rowInfo.label;
    label.style.textAlign = 'left';
    label.style.fontWeight = '500';
    label.style.fontSize = '12px';
    row.appendChild(label);
    subjects.forEach(subject => {
      const td = document.createElement('td');
      td.textContent = rowInfo.data[subject];
      td.style.fontWeight = '500';
      td.style.fontSize = '11px';
      row.appendChild(td);
    });
    thead.appendChild(row);
  });

  subjectTable.appendChild(thead);

  const tbody = document.createElement('tbody');
  ['A', 'B', 'C', 'D', 'F'].forEach(grade => {
    ['F', 'M'].forEach((sex, index) => {
      const row = document.createElement('tr');
      row.classList.add(`grade-${grade}`);

      if (index === 0) {
        const gradeCell = document.createElement('td');
        gradeCell.textContent = grade;
        gradeCell.rowSpan = 2;
        gradeCell.style.verticalAlign = 'middle';
        gradeCell.style.fontWeight = 'bold';
        gradeCell.style.backgroundColor = 'white';
        row.appendChild(gradeCell);
      }
      const sexCell = document.createElement('td');
      sexCell.textContent = sex;
      row.appendChild(sexCell);

      subjects.forEach(subject => {
        const td = document.createElement('td');
        td.textContent = subjectStats[subject][grade][sex] || 0;
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
  });

  subjectTable.appendChild(tbody);

  // Styling
  const style = document.createElement('style');
  const subjectWidth = (88 / subjects.length).toFixed(2) + '%';
  let css = `
    table.subject-table {
      width: 100%;
      margin: 5px auto;
      border-collapse: collapse;
      text-align: center;
      font-size: 11px;
      border: 0.5px solid #000 !important;
      color: #000;
    }

    table.subject-table th,
    table.subject-table td {
      border: 0.5px solid #000 !important;
      color: #000;
      padding: 6px;
      text-align: center;
    }

    table.subject-table th:nth-child(1),
    table.subject-table td:nth-child(1),
    table.subject-table th:nth-child(2),
    table.subject-table td:nth-child(2) {
      width: 6%;
    }

    table.subject-table td[rowspan] {
      vertical-align: top !important;
      background-color: #fff;
      font-weight: bold;
    }
  `;

  for (let i = 3; i < 3 + subjects.length; i++) {
    css += `
      table.subject-table th:nth-child(${i}),
      table.subject-table td:nth-child(${i}) {
        width: ${subjectWidth};
      }
    `;
  }

  style.textContent = css;
  document.head.appendChild(style);

  return subjectTable;
}



// ---------------------Divison Table---------------------

function buildDivisionTable(students) {
  const divisionTable = document.createElement('table');
  divisionTable.className = 'summary-table division-table';

  const divisionCount = { 'I': 0, 'II': 0, 'III': 0, 'IV': 0, 'O': 0 };
  const divisionGenderCount = {
    'I': { Male: 0, Female: 0 },
    'II': { Male: 0, Female: 0 },
    'III': { Male: 0, Female: 0 },
    'IV': { Male: 0, Female: 0 },
    'O': { Male: 0, Female: 0 }
  };

  students.forEach(student => {
    const div = student.division;
    const gender = student.gender === 'F' ? 'Female' : 'Male';
    if (divisionCount[div] !== undefined) divisionCount[div]++;
    if (divisionGenderCount[div]) divisionGenderCount[div][gender]++;
  });

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.appendChild(document.createElement('th')).textContent = 'DIVISION';

  Object.keys(divisionCount).forEach(div => {
    const th = document.createElement('th');
    th.textContent = div.replace('O','0');
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement('tbody');
  ['Female', 'Male'].forEach(label => {
    const row = document.createElement('tr');
    row.appendChild(document.createElement('td')).textContent = label[0];
    Object.keys(divisionGenderCount).forEach(div => {
      const td = document.createElement('td');
      td.textContent = divisionGenderCount[div][label];
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });

  const totalRow = document.createElement('tr');
  totalRow.appendChild(document.createElement('td')).textContent = 'T';
  Object.keys(divisionCount).forEach(div => {
    const td = document.createElement('td');
    td.textContent = divisionCount[div];
    totalRow.appendChild(td);
  });
  tbody.appendChild(totalRow);

  
  if (typeof calcSchoolGPA === 'number' && !isNaN(calcSchoolGPA)) {
    const gpaRow = document.createElement('tr');
    const gpaLabelCell = document.createElement('td');
    gpaLabelCell.colSpan = Object.keys(divisionCount).length + 1;
    gpaLabelCell.style.fontWeight = 'bold';
    gpaLabelCell.style.padding = '10px';
    gpaLabelCell.style.backgroundColor = '#fff';
    gpaLabelCell.style.textAlign = 'center';

    let gpaGrade = '';
    let gpaComment = '';
  
if (calcSchoolGPA > 4.4) {
  gpaGrade = 'F';
  gpaComment = 'Fail';
  gpaLabelCell.style.backgroundColor = '#ffcccc';
} else if (calcSchoolGPA > 3.4) {
  gpaGrade = 'D';
  gpaComment = 'Satisfactory';
  gpaLabelCell.style.backgroundColor = '#ffe0b2';
} else if (calcSchoolGPA > 2.4) {
  gpaGrade = 'C';
  gpaComment = 'Good';
  gpaLabelCell.style.backgroundColor = '#fff9c4';
} else if (calcSchoolGPA > 1.4) {
  gpaGrade = 'B';
  gpaComment = 'Very Good';
  gpaLabelCell.style.backgroundColor = '#c8e6c9'; 
} else {
  gpaGrade = 'A';
  gpaComment = 'Excellent';
  gpaLabelCell.style.backgroundColor = '#b2dfdb'; 


    gpaLabelCell.textContent = `SCHOOL GPA: ${calcSchoolGPA.toFixed(2)} → Grade ${gpaGrade} (${gpaComment})`;
    gpaRow.appendChild(gpaLabelCell);
    tbody.appendChild(gpaRow);
  }

  divisionTable.appendChild(thead);
  divisionTable.appendChild(tbody);
  return divisionTable;
}






function renderStudentReports(students) {
   const scrollWrapper = document.querySelector('.scroll-wrapper1');
   const reportContainer = document.getElementById("report");
   reportContainer.innerHTML = '';
  // 1. Clear ALL child elements
   while (reportContainer.firstChild) {
     reportContainer.removeChild(reportContainer.firstChild);
   }
  
   // 2. Optionally remove previously added nav if it exists
   const oldNav = document.querySelector(".report-nav");
   if (oldNav) oldNav.remove();
  
   // 3. Remove any dynamically injected styles related to subject tables
   const styleTags = document.head.querySelectorAll('style');
   styleTags.forEach(styleTag => {
     if (styleTag.textContent.includes('table.subject-table')) {
       styleTag.remove();
     }
   });
   // Filter and rank eligible students
   const eligible = students.filter(s => s.point >= 7 && s.point <= 35)
                            .sort((a, b) => a.point - b.point);
   eligible.forEach((s, i) => {
     s.position = i + 1;
     s.total = eligible.length;
   });
  
   
  
   let navContainer = document.querySelector('.report-nav');
  
  if (!navContainer) {
   navContainer = document.createElement('div');
   navContainer.className = 'report-nav';
  
   
   // Navigation buttons
   const buttons = [
     { id: 'prevBtn', text: 'Back' },
     { id: 'nextBtn', text: 'Next' },
     { id: 'previewBtn', text: 'Preview' },
     { id: 'downloadBtn', text: 'Download PDF' },
     { id: 'engBtn', text: 'English Version' },
     { id: 'swaBtn', text: 'Switch to Swahili' },
   ];
  
   buttons.forEach(({ id, text }) => {
     const btn = document.createElement('button');
     btn.id = id;
     btn.textContent = text;
     btn.style.marginRight = '0.5em';
     navContainer.appendChild(btn);
   });
  
   reportContainer.insertAdjacentElement('beforebegin', navContainer);
  }
  
  // Reference the buttons
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const previewBtn = document.getElementById("previewBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const engBtn = document.getElementById("engBtn");
  const swaBtn = document.getElementById("swaBtn");

  let currentLang = 'en';
  function highlightLanguage() {
    engBtn.style.fontWeight = currentLang === 'en' ? 'bold' : 'normal';
    swaBtn.style.fontWeight = currentLang === 'sw' ? 'bold' : 'normal';
  }
  
  const savedLang = localStorage.getItem('preferredLang');
currentLang = savedLang || 'en';

function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('preferredLang', lang);
  updateReport(currentIndex);
  highlightLanguage();
}
  
  engBtn.addEventListener("click", () => {
    switchLanguage("en");
  });
  
  swaBtn.addEventListener("click", () => {
    switchLanguage("sw");
  });
  
 

   let currentIndex = 0;
   const reportDiv = document.createElement("div");
   reportDiv.className = "student-report";
   reportContainer.appendChild(reportDiv);

   const LANG = {
    en: {
      governmentHeader: "President’s Office",
      localGov: "Regional Administration and Local Government",
      reportTitle: "Student Progress Report",
      performanceTitle: "Academic Performance",
      examNotice: "This is to notify that student",
      satFor: "sat for the",
      at: "at",
      academicStanding: "Below are their academic and behavioral evaluations:",
      subject: "Subject",
      mark: "Mark",
      comment: "Comment",
      points: "Total Points",
      division: "Division",
      position: "Position",
      outF:"Out of",
      behavior: "Behavioral Assessment",
      asp:"aspect",
      rat:"rating",
      rem : "Remarks:",
      behaviorAspects: {
        discipline: "Discipline",
        cooperation: "Cooperation",
        learning: "Learning Effort",
        sports: "Sportsmanship",
        participation: "Participation",
        punctuality: "Punctuality",
        leadership: "Leadership",
        neatness: "Neatness",
        respect: "Respect",
        creativity: "Creativity"
      },
      termDates: "Term Dates",
      closes: "The term closed on",
      reopens: "and reopens on",
      requirements: "Requirements for Next Term",
      classComment: "Class Teacher’s Comment",
      headComment: "Head of School’s Comment",
      signature: "Signature",
      date: "Date",
      noDataHeader: "Student Not Found",
      noDataText: "No record was found for {name} in the eligible list.",
      noDataReason: "This may be due to a name mismatch or missing exam data.",
      noDataFollowUp: "Please ensure the name and exam results are correctly entered.",
      noDataFinal: "Contact the administrator for further assistance.",
      comments: {
        'A': "Excellent",
        'B': "Good",
        'C': "Average",
        'D': "Satisfactory",
        'F': "Fail"
      },
      remarks: {
        outstanding: "Outstanding academic achievement and behavior.",
        commendable: "Commendable effort with good results.",
        satisfactory: "Satisfactory performance. Keep it up.",
        followup: "Needs academic and behavioral support."
      },
      headSupportNote: "Continued parental support is recommended.",
      classCommentIntro: (name) => `${name} has shown`,
      performanceLevels: {
        strong: "strong",
        moderate: "moderate",
        weak: "weak"
      },
      encouragement: {
        encouraged: "Improvement is encouraged.",
        necessary: "Improvement is necessary."
      }
    },
  
    sw: {
      governmentHeader: "Ofisi ya Rais",
      localGov: "Tawala za Mikoa na Serikali za Mitaa",
      reportTitle: "Ripoti ya Maendeleo ya Mwanafunzi",
      performanceTitle: "Utendaji wa Kitaaluma",
      examNotice: "Hii ni kuthibitisha kuwa mwanafunzi",
      satFor: "alifanya mtihani wa",
      at: "katika",
      academicStanding: "Chini ni tathmini ya kitaaluma na tabia:",
      subject: "Somo",
      mark: "Alama",
      comment: "Maoni",
      points: "Jumla ya Alama",
      division: "Daraja",
      outF:"Kati ya ",
      position: "Nafasi",
      behavior: "Tathmini ya Tabia",
      asp: "Kipengele",
      rat: "Daraja",
      rem: "Maoni:",
      behaviorAspects: {
        discipline: "Nidhamu",
        cooperation: "Ushirikiano",
        learning: "Bidii ya Kujifunza",
        sports: "Michezo",
        participation: "Ushiriki",
        punctuality: "Utimilifu wa Muda",
        leadership: "Uongozi",
        neatness: "Usafi",
        respect: "Heshima",
        creativity: "Ubunifu"
      },
      termDates: "Tarehe za Muhula",
      closes: "Muhula umefungwa tarehe",
      reopens: "na utafunguliwa tena tarehe",
      requirements: "Vitu vya Kuleta Muhula Ujao",
      classComment: "Maoni ya Mwalimu wa Darasa",
      headComment: "Maoni ya Mkuu wa Shule",
      signature: "Sahihi",
      date: "Tarehe",
      noDataHeader: "Mwanafunzi Hajapatikana",
      noDataText: "Hakuna rekodi iliyopatikana kwa {name} kwenye orodha ya waliohitimu.",
      noDataReason: "Hii inaweza kuwa kutokana na jina kutolingana au data ya mtihani kupotea.",
      noDataFollowUp: "Tafadhali hakikisha jina na matokeo ya mtihani yameingizwa kwa usahihi.",
      noDataFinal: "Wasiliana na msimamizi kwa msaada zaidi.",
      comments: {
        'A': "Bora Sana",
        'B': "Nzuri",
        'C': "Wastani",
        'D': "Inaridhisha",
        'F': "Feli"
      },
      remarks: {
        outstanding: "Ufanisi wa hali ya juu katika masomo na tabia.",
        commendable: "Juhudi nzuri zenye matokeo mazuri.",
        satisfactory: "Utendaji wa kuridhisha. Endelea hivyo.",
        followup: "Anahitaji msaada wa kitaaluma na kitabia."
      },
      headSupportNote: "Inashauriwa kuendelea kushirikiana na wazazi.",
      classCommentIntro: (name) => `${name} ameonyesha`,
      performanceLevels: {
        strong: "utendaji mzuri",
        moderate: "utendaji wa wastani",
        weak: "utendaji hafifu"
      },
      encouragement: {
        encouraged: "Anahimizwa kuendelea kujitahidi.",
        necessary: "Ni muhimu kuboresha juhudi zake."
      }
    }
  };
  
  
  function updateReport(index) {
    const lang = LANG[currentLang]; // shortcut
    const examType = document.getElementById('examType').value.trim();
    const openingDate = document.getElementById("openingDateInput").value;
    const schoolName = document.getElementById("schoolNameInput").value;
    const schoolIndex = document.getElementById("schoolIndexInput").value;
    const month = document.getElementById("monthInput").value;
    const closingDate = document.getElementById("closingDateInput").value;
    const classTeacher = document.getElementById("classTeacherInput").value;
    const headmaster = document.getElementById("headmasterInput").value;
  
    const requirement1 = document.getElementById("requirement1").value.trim();
    const requirement2 = document.getElementById("requirement2").value.trim();
    const requirement3 = document.getElementById("requirement3").value.trim();
  
    const requirements = [requirement1, requirement2, requirement3];
    const filteredRequirements = requirements.filter(req => req !== "");
    const formattedRequirements = filteredRequirements.map(item => `<li>${item}</li>`).join('');
  
    const student = students[index];
    const eligibleStudent = eligible.find(s => s.name === student.name && s.point === student.point);
    const positionInfo = eligibleStudent ? `<strong>${eligibleStudent.position} ${lang.outF} ${eligibleStudent.total}</strong>` : '';
    let discipline = 'D', cooperation = 'D', learning = 'D', sports = 'B';
    let participation = 'D', punctuality = 'D', leadership = 'D';
    let neatness = 'D', respect = 'D', creativity = 'D';
    let remark = lang.remarks.followup;
  
   
  
    let division = Number(student.point);
    if (division <= 17) {
      discipline = 'A'; cooperation = 'A'; learning = 'A'; sports = 'C';
      participation = 'A'; punctuality = 'A'; leadership = 'A';
      neatness = 'A'; respect = 'A'; creativity = 'B';
      remark = lang.remarks.outstanding;
    } else if (division <= 21) {
      discipline = 'B'; cooperation = 'B'; learning = 'B'; sports = 'C';
      participation = 'B'; punctuality = 'B'; leadership = 'B';
      neatness = 'B'; respect = 'B'; creativity = 'B';
      remark = lang.remarks.commendable;
    } else if (division <= 30) {
      discipline = 'C'; cooperation = 'C'; learning = 'C'; sports = 'A';
      participation = 'C'; punctuality = 'C'; leadership = 'C';
      neatness = 'C'; respect = 'C'; creativity = 'C';
      remark = lang.remarks.satisfactory;
    }
  
    
  
    if (!eligibleStudent) {
      reportDiv.innerHTML = `
        <div style="text-align: center; color: #b71c1c; font-weight: 500; padding: 20px; border: 1px solid #f0c0c0; background-color: #fff5f5; border-radius: 8px;">
          <div style="font-size: 28px; margin-bottom: 10px;">⚠️</div>
          <p style="font-size: 18px; margin: 0;"><strong>${lang.noDataHeader}:</strong> ${lang.noDataText.replace('{name}', student.name)}</p>
          <p style="margin: 10px 0;">${lang.noDataReason}</p>
          <p style="margin: 10px 0;">${lang.noDataFollowUp}</p>
          <p style="margin-top: 15px;"><em>${lang.noDataFinal}</em></p>
        </div>
      `;
      return;
    }
  
    reportDiv.innerHTML = `
      <h2 style="text-align: center; margin: 0;">${lang.governmentHeader}</h2>
      <h2 style="text-align: center; margin: 0;">${lang.localGov}</h2>
      <h4 style="text-align: center; margin: 10px 0;">${schoolName.toUpperCase()} - ${schoolIndex.toUpperCase()}</h4><br>
      <h4 style="text-align: center; margin: 10px 0;">${lang.reportTitle} - ${month.toUpperCase()}</h4><br>
  
      <p style="margin: 2px 0;">
        ${lang.examNotice} <strong>${student.name}</strong><br>
        ${lang.satFor} ${examType.toUpperCase()} ${lang.at} <strong>${schoolName.toUpperCase()}</strong>.<br>
        ${lang.academicStanding}
      </p>
  
      <div style="display: flex; gap: 20px; margin-top: 5px; flex-wrap: wrap;">
        <div style="flex: 2; width: 600px;">
          <h4>${lang.performanceTitle}</h4>
          <table class="report-table" style="width: 100%; border-collapse: collapse; margin-top: -20px; border: none;">
            <thead>
              <tr>
                <th style="padding: 3px; border: none;">${lang.subject}</th>
                <th style="padding: 3px; border: none;">${lang.mark}</th>
                <th style="padding: 3px; border: none;">${lang.comment}</th>
              </tr>
            </thead>
            <tbody>
              ${
                Object.entries(student.scores).map(([subject, s]) => {
                  if (s.mark == null || s.mark === '') return '';
                  return `
                    <tr>
                      <td>${subject}</td>
                      <td>${s.mark} - '${s.grade}'</td>
                      <td>(${lang.comments[s.grade] || '-'})</td>
                    </tr>`;
                }).join('')
              }
              <tr><td colspan="3" style="text-align: center;">*********************************************************************************</td></tr>
              <tr><td colspan="3"> ${lang.points}: <b>${student.point}</b> &nbsp;&nbsp;&nbsp;&nbsp; ${lang.division}: <b>${student.division}</b></td></tr>
              <tr><td colspan="3"> ${lang.position}: ${positionInfo.toUpperCase()}</td></tr>
            </tbody>
          </table>
        </div>
  
        <div style="flex: 1; width: 300px;">
          <h4>${lang.behavior}</h4>
          <table class="behavior-table" style="width: 100%; border-collapse: collapse; margin-top: -20px;">
            <thead>
              <tr><th style="border: 1px solid #ccc;">${lang.asp}</th><th style="border: 1px solid #ccc;">${lang.rat}</th></tr>
            </thead>
            <tbody>
              ${Object.entries({
                discipline, cooperation, learning, sports, participation,
                punctuality, leadership, neatness, respect, creativity
              }).map(([key, val]) => `
                <tr>
                  <td style="border: 1px solid #ccc; padding: 6px;">${lang.behaviorAspects[key]}</td>
                  <td style="border: 1px solid #ccc; padding: 6px;">${val}</td>
                </tr>`).join('')}
              <tr><td colspan="2" style="border: 1px solid #ccc;"><strong>${lang.rem}</strong> ${remark}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <div style="margin-top: 10px; font-size: 14px; line-height: 1.5;">
        <p><strong>${lang.termDates}:</strong> ${lang.closes} <strong>${closingDate}</strong> ${lang.reopens} <strong>${openingDate}</strong>.</p>
  
        <p><strong>${lang.requirements}:</strong></p>
  <ul style="margin-left: 5px; margin-top: -15px;">${formattedRequirements}</ul>

  <p>
    <strong>${lang.classComment}:</strong> 
    ${lang.classCommentIntro(
      `<i>${student.name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</i>`
    )} ${
      student.point <= 12 ? lang.performanceLevels.strong :
      student.point <= 21 ? lang.performanceLevels.moderate :
      lang.performanceLevels.weak
    } ${currentLang === "en" ? "academic performance" : "katika masomo"} 
    ${currentLang === "en" ? "this term." : "kwa muhula huu."}
    ${
      student.point <= 28
        ? lang.encouragement.encouraged
        : lang.encouragement.necessary
    }
    <br><strong>${lang.signature}:</strong> ${classTeacher} &nbsp; | &nbsp; <strong>${lang.date}:</strong> ${closingDate}
  </p>

  <p>
    <strong>${lang.headComment}:</strong> 
    ${
      student.point <= 13
        ? lang.remarks.outstanding
        : student.point <= 17
        ? lang.remarks.commendable
        : student.point <= 24
        ? lang.remarks.satisfactory
        : lang.remarks.followup
    }. ${lang.headSupportNote}
    <br><strong>${lang.signature}:</strong> ${headmaster} &nbsp; | &nbsp; <strong>${lang.date}:</strong> ${closingDate}
  </p>
      </div>
    `;
  
   // Navigation buttons
   prevBtn.disabled = index === 0;
   nextBtn.disabled = index === students.length - 1;
  }
  
  
   updateReport(currentIndex);
  
   prevBtn.onclick = () => {
     if (currentIndex > 0) {
       currentIndex--;
       updateReport(currentIndex);
     }
   };
  
   nextBtn.onclick = () => {
     if (currentIndex < students.length - 1) {
       currentIndex++;
       updateReport(currentIndex);
     }
   };
  
  previewBtn.addEventListener("click", () => {
    const controls = document.querySelector('.controls');
   const report = document.querySelector('.scroll-wrapper1');
  
   // Temporarily hide controls
   controls.style.display = 'none';
   report.style.display = 'block';
   const student = eligible[currentIndex];
  const repNumber = String(currentIndex + 1).padStart(4,'0');
   const opt = {
     margin: 0.2,
     filename: `Report_No_${repNumber}.pdf`,
     image: { type: 'jpeg', quality: 0.98 },
     html2canvas: { scale: 4 },
     jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
   };
   html2pdf().set(opt).from(reportDiv).outputPdf('dataurlnewwindow');
   
  });
  
  // Download single student report
  downloadBtn.addEventListener("click", () => {
   const controls = document.querySelector('.controls');
   const report = document.querySelector('.scroll-wrapper1');
  
   // Temporarily hide controls
   controls.style.display = 'none';
   report.style.display = 'block';
   const student = eligible[currentIndex];
  const repNumber = String(currentIndex + 1).padStart(4,'0');
   const opt = {
     margin: 0.2,
     filename: `Report_No_${repNumber}.pdf`,
     image: { type: 'jpeg', quality: 0.98 },
     html2canvas: { scale: 4 },
     jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
   };
   html2pdf().set(opt).from(reportDiv).save();
   
  });
  }


function fetchReport() {
  const wrapper1 = document.querySelector('.scroll-wrapper1');
  const reportDiv = document.getElementById('report');
 const examType = document.getElementById('examType').value.trim();
  const selectedClass = document.getElementById('classType').value.trim();
  const masterRepResURL = RepResURLs[selectedClass] || null;
   reportDiv.innerHTML = '';
  // Block if no URL
  if (!masterRepResURL) {
     reportDiv.innerHTML = `
      <div style="color: red; padding: 1rem; border: 1px solid red; background: #ffe5e5;">
        You cannot access anything here for <strong>${selectedClass}</strong> because access isn't available for now.
      </div>
    `;
    return;
  }
  showLoadingOverlay();
  wrapper1.style.display = 'block';
 document.querySelector('.scroll-wrapper').style.display = 'none';
 displaystdData(masterRepResURL);
  setTimeout(() => {
    hideLoadingOverlay();
  }, 3000);

  
}

 function showLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'flex';
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'none';
}
   

    function generatePDF(action) {
  const controls = document.querySelector('.controls');
  const result = document.querySelector('.scroll-wrapper');
  const resultContent = document.getElementById('result');

  // Hide UI elements temporarily
  controls.style.display = 'none';
  result.style.display = 'block';

  // PDF options
  const opt = {
    margin: [0.3, 0],
    filename: 'School_Result.pdf',
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: {
      scale: 2,             // Lower scale = faster + avoids dark render
      useCORS: true,
      allowTaint: true,
      logging: true
    },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
  };

  // Create PDF
  const worker = html2pdf().set(opt).from(resultContent);

  // Handle download or preview
  const output = action === 'download'
    ? worker.save()
    : worker.outputPdf('dataurlnewwindow');

  // Restore controls after rendering
  output.then(() => {
    controls.style.display = 'block';
  }).catch(error => {
    console.error('PDF Generation Error:', error);
    controls.style.display = 'block'; // Restore even on error
  });
}

// Action-specific wrappers
function previewPDF() {
  generatePDF('preview');
}

function downloadPDF() {
  generatePDF('download');
}
