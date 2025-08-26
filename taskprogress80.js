
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
    
    
async function createExcelFile(students, examType = '', selectedClass = '') {
  try {
    
    if (!students || students.length === 0) {
      alert('No student data available to export');
      return;
    }
    const allSubjects = new Set();
    students.forEach(student => {
      if (student.scores && typeof student.scores === 'object') {
        Object.keys(student.scores).forEach(subjectName => {
          allSubjects.add(subjectName);
        });
      }
    });
    
    const subjectsList = Array.from(allSubjects).sort();
    console.log('Found subjects:', subjectsList);
    
    const headers = ['S/N', 'Student Name', 'Gender', ...subjectsList];
    
    
    const rows = students.map((student, index) => {
      const row = [
        index + 1, 
        student.name || `Student ${index + 1}`,
        student.gender || '-' 
      ];
      
      
      subjectsList.forEach(subjectName => {
        let mark = 'X';
        
        if (student.scores && student.scores[subjectName]) {
          const scoreData = student.scores[subjectName];
          mark = (scoreData.mark !== undefined && scoreData.mark !== null) ? scoreData.mark : 'X';
        }
        
        row.push(mark);
      });
      
      return row;
    });
    
    
    const worksheetData = [headers, ...rows];
    
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    
    const colWidths = [
      { wch: 6 },
      { wch: 40 },
      { wch: 10 },
      ...subjectsList.map(() => ({ wch: 12 }))
    ];
    ws['!cols'] = colWidths;
    
   
    const columnColors = [
      "E8F4FD", 
      "F0F8E8", 
      "FFF2E8", 
      "F8E8F8", 
      "E8F8F8", 
      "F8F8E8", 
    ];
    
   
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "366092" } },
      alignment: { horizontal: "center", vertical: "center" }
    };
    
    // Apply header styles
    for (let i = 0; i < headers.length; i++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: i });
      if (!ws[cellAddress]) ws[cellAddress] = {};
      ws[cellAddress].s = headerStyle;
    }
    
    
    for (let r = 1; r <= rows.length; r++) {
      for (let c = 0; c < headers.length; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r: r, c: c });
        if (!ws[cellAddress]) ws[cellAddress] = {};
        
        
        let alignment;
        if (c === 1) { 
          alignment = { horizontal: "left", vertical: "center" };
        } else {
          alignment = { horizontal: "center", vertical: "center" };
        }
        
        
        const bgColor = columnColors[c % columnColors.length];
        
        ws[cellAddress].s = {
          alignment: alignment,
          fill: { fgColor: { rgb: bgColor } },
          font: { color: { rgb: "000000" } }
        };
      }
    }
    
    
    const sheetName = `${examType || 'Exam'} Results`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${selectedClass || 'Class'}_${examType || 'Exam'}_Results_${timestamp}.xlsx`;
    
    
    XLSX.writeFile(wb, filename);
    
    console.log(`Excel file "${filename}" has been downloaded successfully`);
    
  } catch (error) {
    console.error('Error creating Excel file:', error);
    alert('Error creating Excel file. Please try again.');
  }
}


async function fetchScores() {
  const examType = document.getElementById('examType').value.trim();
  const selectedClass = document.getElementById('classType').value.trim();
  const masterRepResURL = RepResURLs[selectedClass] || null;
  
  
  if (!masterRepResURL) {
    resultDiv.innerHTML = `
      <div style="color: red; padding: 1rem; border: 1px solid red; background: #ffe5e5;">
        You cannot access anything here for <strong>${selectedClass}</strong> because access isn't available for now.
      </div>
    `;
    return;
  }
  
 
  document.querySelector('.scroll-wrapper1').style.display = 'none'; 
  document.querySelector('.scroll-wrapper').style.display = 'block'; 
  showLoadingOverlay();

  try {
    const resultDiv = document.getElementById('result');
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

      const buttonGNMG = document.querySelector('.button-group');
      const exportButton = document.createElement('button');
      exportButton.textContent = 'Export to Excel';
      exportButton.className = 'export-btn';
      exportButton.style.cssText = `
        background: #28a745;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin: 10px 0;
        font-size: 14px;
      `;
      exportButton.onclick = () => createExcelFile(students, examType, selectedClass);
      buttonGNMG.appendChild(exportButton);

      resultDiv.appendChild(buildDivisionTable(students));
      resultDiv.appendChild(buildStudentTable(students));

      const subjectTable = buildSubjectTable(students);
      const wrapper = document.createElement('div');
      wrapper.className = 'table-container page-break';
      wrapper.appendChild(subjectTable);
      resultDiv.appendChild(wrapper);
      
    } else {
      resultDiv.innerHTML = `<p style="color:red;">❌ Error: ${data.message}</p>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<p style="color:red;">❌ Network Error: ${error.message}</p>`;
  }
}


function exportCurrentData() {
  const students = getCurrentStudentsData(); 
  const examType = document.getElementById('examType').value.trim();
  const selectedClass = document.getElementById('classType').value.trim();
  
  createExcelFile(students, examType, selectedClass);
}


function getCurrentStudentsData() {
  return [];
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

// ---------------------Divison Table---------------------

function buildDivisionTable(students) {
  const divisionTable = document.createElement('table');
  divisionTable.className = 'summary-table division-table';

  // Division count setup
  const divisionCount = { 'I': 0, 'II': 0, 'III': 0, 'IV': 0, 'O': 0 };
  const divisionGenderCount = {
    'I': { Male: 0, Female: 0 },
    'II': { Male: 0, Female: 0 },
    'III': { Male: 0, Female: 0 },
    'IV': { Male: 0, Female: 0 },
    'O': { Male: 0, Female: 0 }
  };

  // Count divisions
  students.forEach(student => {
    const div = student.division;
    const gender = student.gender === 'F' ? 'Female' : 'Male';
    if (divisionCount[div] !== undefined) divisionCount[div]++;
    if (divisionGenderCount[div]) divisionGenderCount[div][gender]++;
  });

  // Table Head
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.appendChild(document.createElement('th')).textContent = 'DIVISION';

  Object.keys(divisionCount).forEach(div => {
    const th = document.createElement('th');
    th.textContent = div.replace('O', '0'); // display 'O' as '0'
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Table Body
  const tbody = document.createElement('tbody');
  ['Female', 'Male'].forEach(label => {
    const row = document.createElement('tr');
    row.appendChild(document.createElement('td')).textContent = label[0]; // F or M
    Object.keys(divisionCount).forEach(div => {
      const td = document.createElement('td');
      td.textContent = divisionGenderCount[div][label];
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });

  // Total Row
  const totalRow = document.createElement('tr');
  totalRow.appendChild(document.createElement('td')).textContent = 'T';
  Object.keys(divisionCount).forEach(div => {
    const td = document.createElement('td');
    td.textContent = divisionCount[div];
    totalRow.appendChild(td);
  });
  tbody.appendChild(totalRow);

  // ---------------- GPA Calculation ----------------

  const gradePoints = { A: 1.0, B: 2.0, C: 3.0, D: 4.0, F: 5.0 };
  const subjectTotals = {};
  const subjectCounts = {};

  students.forEach(student => {
    Object.entries(student.scores || {}).forEach(([subject, s]) => {
      const grade = s.grade;
      if (gradePoints.hasOwnProperty(grade)) {
        if (!subjectTotals[subject]) {
          subjectTotals[subject] = 0;
          subjectCounts[subject] = 0;
        }
        subjectTotals[subject] += gradePoints[grade];
        subjectCounts[subject]++;
      }
    });
  });

  const subjectGPAs = [];
  Object.keys(subjectTotals).forEach(subject => {
    const avg = subjectTotals[subject] / subjectCounts[subject];
    subjectGPAs.push(avg);
  });

  const schoolGPA = subjectGPAs.length > 0
    ? subjectGPAs.reduce((a, b) => a + b, 0) / subjectGPAs.length
    : null;

  // Add GPA row
  if (schoolGPA !== null && !isNaN(schoolGPA)) {
    const gpaRow = document.createElement('tr');
    const gpaCell = document.createElement('td');
    gpaCell.colSpan = Object.keys(divisionCount).length + 1;
    gpaCell.style.fontWeight = 'bold';
    gpaCell.style.textAlign = 'center';
    gpaCell.style.padding = '10px';

    // Grade category from GPA
    let gpaGrade = '';
    let gpaComment = '';
    if (schoolGPA > 4.4) {
      gpaGrade = 'F'; gpaComment = 'Fail'; gpaCell.style.backgroundColor = '#ffcccc';
    } else if (schoolGPA > 3.4) {
      gpaGrade = 'D'; gpaComment = 'Satisfactory'; gpaCell.style.backgroundColor = '#ffe0b2';
    } else if (schoolGPA > 2.4) {
      gpaGrade = 'C'; gpaComment = 'Good'; gpaCell.style.backgroundColor = '#fff9c4';
    } else if (schoolGPA > 1.4) {
      gpaGrade = 'B'; gpaComment = 'Very Good'; gpaCell.style.backgroundColor = '#c8e6c9';
    } else {
      gpaGrade = 'A'; gpaComment = 'Excellent'; gpaCell.style.backgroundColor = '#b2dfdb';
    }

    gpaCell.textContent = `SCHOOL GPA: ${schoolGPA.toFixed(2)} → Grade ${gpaGrade} (${gpaComment})`;
    gpaRow.appendChild(gpaCell);
    tbody.appendChild(gpaRow);
  }

  divisionTable.appendChild(thead);
  divisionTable.appendChild(tbody);
  return divisionTable;
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
const stdPos  = students.filter(s => s.point >= 7 && s.point <= 35)
                            .sort((a, b) => a.point - b.point);
   stdPos.forEach((s, i) => {
     s.position = i + 1;
     
   });
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
      includePosition ? `<td class="pos-column">${student.position || ''}</td>` : '',
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

      if (subjectStats[subject][grade][gender] !== undefined) {
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

  Object.keys(subjectStats).forEach(subject => {
    const g = subjectGPAs[subject];
    const avgGPA = g.count > 0 ? (g.totalPoints / g.count) : null;
    finalGPAs[subject] = avgGPA ? avgGPA.toFixed(1) : 'N/A';

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

  // === Build Table ===
  const table = document.createElement('table');
  table.className = 'subject-table';

  const thead = document.createElement('thead');
  const gradeRow = document.createElement('tr');
  const genderRow = document.createElement('tr');

  // SUBJECT column
  const thSubject = document.createElement('th');
  thSubject.textContent = 'SUBJECT';
  thSubject.rowSpan = 2;
  gradeRow.appendChild(thSubject);

  // SAT-F, SAT-M, TOTAL
  ['SAT-F', 'SAT-M', 'TOTAL'].forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    th.rowSpan = 2;
    gradeRow.appendChild(th);
  });

  // Grade headers A-F with colspan 2
  ['A', 'B', 'C', 'D', 'F'].forEach(grade => {
    const th = document.createElement('th');
    th.textContent = grade;
    th.colSpan = 2;
    gradeRow.appendChild(th);
  });

  // AVER, GPA, GRADE
  ['AVER', 'GPA', 'GRADE'].forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    th.rowSpan = 2;
    gradeRow.appendChild(th);
  });

  // Subheaders: F, M under each grade
  ['A', 'B', 'C', 'D', 'F'].forEach(() => {
    ['F', 'M'].forEach(sex => {
      const subTh = document.createElement('th');
      subTh.textContent = sex;
      genderRow.appendChild(subTh);
    });
  });

  // Add 3 empty <th> cells to match AVER, GPA, GRADE col alignment
  for (let i = 0; i < 3; i++) {
    const emptyTh = document.createElement('th');
    emptyTh.style.display = 'none'; // optional: hide or leave blank
    genderRow.appendChild(emptyTh);
  }

  thead.appendChild(gradeRow);
  thead.appendChild(genderRow);
  table.appendChild(thead);

  // === Body ===
  const tbody = document.createElement('tbody');
  const subjects = Object.keys(subjectStats);

  subjects.forEach(subject => {
    const row = document.createElement('tr');

    const subjectCell = document.createElement('td');
    subjectCell.textContent = subject;
    subjectCell.style.fontWeight = 'bold';
    row.appendChild(subjectCell);

    // SAT-F, SAT-M, TOTAL
    const satF = subjectCounts[subject]?.F || 0;
    const satM = subjectCounts[subject]?.M || 0;
    const total = satF + satM;

    [satF, satM, total].forEach(val => {
      const td = document.createElement('td');
      td.textContent = val;
      row.appendChild(td);
    });

    // Grade Cells A–F for both sexes
    ['A', 'B', 'C', 'D', 'F'].forEach(grade => {
      ['F', 'M'].forEach(sex => {
        const td = document.createElement('td');
        td.textContent = subjectStats[subject][grade][sex] || 0;
        row.appendChild(td);
      });
    });

    // AVER
    const tdAvg = document.createElement('td');
    tdAvg.textContent = finalAverages[subject];
    row.appendChild(tdAvg);

    // GPA
    const tdGPA = document.createElement('td');
    tdGPA.textContent = finalGPAs[subject];
    row.appendChild(tdGPA);

    // GRADE Comment
    const tdComment = document.createElement('td');
    tdComment.textContent = finalGradesWithComments[subject];
    row.appendChild(tdComment);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);

  // === Styling ===
  if (!document.getElementById('subject-table-style')) {
    const style = document.createElement('style');
    style.id = 'subject-table-style';
    style.textContent = `
      table.subject-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        text-align: center;
        margin-top: 10px;
        table-layout : fixed;
      }

      table.subject-table th,
      table.subject-table td {
        border: 0.5px solid #000;
        padding: 4px;
      }

      table.subject-table th:nth-child(1),
      table.subject-table td:nth-child(1) {
        width: 12%;
        font-weight: bold;
        text-align: left;
      }

      table.subject-table th:nth-child(2),
      table.subject-table td:nth-child(2),
      table.subject-table th:nth-child(3),
      table.subject-table td:nth-child(3),
      table.subject-table th:nth-child(4),
      table.subject-table td:nth-child(4) {
        width: 5%;
        text-align : center;
      }

      table.subject-table th:nth-child(5),
      table.subject-table td:nth-child(5),
      table.subject-table th:nth-child(6),
      table.subject-table td:nth-child(6),
      table.subject-table th:nth-child(7),
      table.subject-table td:nth-child(7),
      table.subject-table th:nth-child(8),
      table.subject-table td:nth-child(8),
      table.subject-table th:nth-child(9),
      table.subject-table td:nth-child(9),
      table.subject-table th:nth-child(10),
      table.subject-table td:nth-child(10),
      table.subject-table th:nth-child(11),
      table.subject-table td:nth-child(11),
      table.subject-table th:nth-child(12),
      table.subject-table td:nth-child(12),
      table.subject-table th:nth-child(13),
      table.subject-table td:nth-child(13),
      table.subject-table th:nth-child(14),
      table.subject-table td:nth-child(14) {
        width: 4%;
        text-align : center;
      }

      table.subject-table th:nth-child(15),
      table.subject-table td:nth-child(15),
      table.subject-table th:nth-child(16),
      table.subject-table td:nth-child(16) {
        width: 5%;
        text-align: center;
      }

      table.subject-table th:nth-child(17),
      table.subject-table td:nth-child(17) {
        width: 23%;
        text-align: left;
      }
    `;
    document.head.appendChild(style);
  }

  return table;
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
    let discipline = 'C', cooperation = 'C', learning = 'C', sports = 'B';
    let participation = 'C', punctuality = 'C', leadership = 'C';
    let neatness = 'C', respect = 'C', creativity = 'C';
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
