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

  divisionTable.appendChild(thead);
  divisionTable.appendChild(tbody);
  return divisionTable;
}

    
    // ---------------------Results Table---------------------
function buildStudentTable(students) {
  const selectedValue = document.getElementById("resultType").value;
  const includePosition = document.getElementById('positionToggle').value === 'show';

  const studentTable = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  // Define headers in desired order
  const headers = ["CAND's NAME", 'SEX', 'AGG', 'DIV'];
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

  students.forEach(student => {
    const tr = document.createElement('tr');

    // Build subject summary based on selection
    const summary = Object.entries(student.scores).map(([subject, s]) => {
      if (!s.mark) return '';
      if (selectedValue === "both") return `${subject}- ${s.mark}'${s.grade}'`;
      if (selectedValue === "raw") return `${subject}- ${s.mark}`;
      if (selectedValue === "grade") return `${subject}-'${s.grade}'`;
    }).filter(Boolean).join(' ');

    // Compose HTML cells in correct order
    const cells = [
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

  // Style PO column if included
  if (includePosition) {
    const posCells = studentTable.querySelectorAll('td.pos-column, th:nth-child(5)');
    posCells.forEach(cell => {
      cell.style.textAlign = 'center';
      cell.style.fontSize = '14px';
      cell.style.width = '5%';
    });
  }

  return studentTable;
}

    // ---------------------Subjects Table---------------------
function buildSubjectTable(students) {
  const subjectStats = {};

  // Collect stats per subject, grade, and gender
  students.forEach(student => {
    const gender = student.gender || 'U'; // Default to 'U' if missing
    Object.entries(student.scores).forEach(([subject, s]) => {
      if (!s.grade) return;
      const grade = s.grade;

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
    });
  });

  const subjectTable = document.createElement('table');
  subjectTable.className = 'subject-table';

  // Build header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const gradeTh = document.createElement('th');
  gradeTh.textContent = 'GRADE';
  headerRow.appendChild(gradeTh);

  const sexTh = document.createElement('th');
  sexTh.textContent = 'SEX';
  headerRow.appendChild(sexTh);

  const subjects = Object.keys(subjectStats);
  subjects.forEach(subject => {
    const th = document.createElement('th');
    th.textContent = subject;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  subjectTable.appendChild(thead);

  // Build body
  const tbody = document.createElement('tbody');
  ['A', 'B', 'C', 'D', 'F'].forEach(grade => {
    ['F', 'M'].forEach((sex, index) => {
      const row = document.createElement('tr');

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

  // Inject dynamic CSS for layout
  const style = document.createElement('style');
  const subjectWidth = (88 / subjects.length).toFixed(2) + '%';

let css = `
  table.subject-table {
    width: 100%;
    margin: 5px auto;
    border-collapse: collapse;
    text-align: center;
    font-size: 12px;
    border: 0.5px solid #000 !important;
  color: #000;
   
  }

  table.subject-table th,
  table.subject-table td {
   border: 0.5px solid #000 !important;
  color: #000;
    padding: 6px;
    text-align : center;
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



function renderStudentReports(students) {
  const formData = getFormValues();
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



 let currentIndex = 0;
 const reportDiv = document.createElement("div");
 reportDiv.className = "student-report";
 reportContainer.appendChild(reportDiv);

 function updateReport(index) {
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

// Format them like: "Item1 || Item2 || Item3"
const formattedRequirements = filteredRequirements.map(item => `${item}`).join(' || ');

   const student = students[index];
   const eligibleStudent = eligible.find(s => s.name === student.name && s.point === student.point);
   const positionInfo = eligibleStudent
     ? `<strong>${eligibleStudent.position} out of ${eligibleStudent.total}</strong>`
     : '';

 let discipline = 'D', cooperation = 'D', learning = 'D', sports = 'B';
let participation = 'D', punctuality = 'D', leadership = 'D';
let neatness = 'D', respect = 'D', creativity = 'D';
let remark = 'Needs support to strengthen academic discipline and involvement.';

let division = Number(student.point);  

if (division <= 17) {
 discipline = 'A'; cooperation = 'A'; learning = 'A'; sports = 'C';
 participation = 'A'; punctuality = 'A'; leadership = 'A';
 neatness = 'A'; respect = 'A'; creativity = 'B';
 remark = 'Exhibits discipline, cooperation, and strong academic focus.';
} else if (division <= 21) {
 discipline = 'B'; cooperation = 'B'; learning = 'B'; sports = 'C';
 participation = 'B'; punctuality = 'B'; leadership = 'B';
 neatness = 'B'; respect = 'B'; creativity = 'B';
 remark = 'Generally good, with room for academic improvement.';
} else if (division <= 30) {
 discipline = 'C'; cooperation = 'C'; learning = 'C'; sports = 'A';
 participation = 'C'; punctuality = 'C'; leadership = 'C';
 neatness = 'C'; respect = 'C'; creativity = 'C';
 remark = 'Shows potential but needs motivation and guidance.';
}

   if (eligibleStudent) {
   reportDiv.innerHTML = `
    <h2 style="text-align: center; margin: 0;">President’s Office</h2>
<h2 style="text-align: center; margin: 0;">Regional Administration and Local Government</h2>
<h4 style="text-align: center; margin: 10px 0;">${schoolName.toUpperCase()} - ${schoolIndex.toUpperCase()}</h4><br>
<h4 style="text-align: center; margin: 10px 0;">Report of Examination Results,${month.toUpperCase()}</h4><br>

<p style="margin: 2px 0;">
 This report serves to notify that <strong>${student.name}</strong><br> sat for Terminal Examination held in <strong>${month.toUpperCase()}</strong> at <strong>${schoolName.toUpperCase()}.</strong><br>This reflects their academic standing and progress during the evaluation period.
</p>



     <div style="display: flex; gap: 20px; margin-top: 5px; flex-wrap: wrap;">
       <!-- Subject Performance Table -->
       <div style="flex: 2; width: 600px;">
         <h4 >The following are the detailed particulars of performance:-</h4>
         <table class="report-table" style="width: 100%; border-collapse: collapse; margin-top: -20px;border : none;">
           <thead>
             <tr>
         <th style="padding: 3px; border: none;">Subject</th>
         <th style="padding: 3px; border: none;">Mark</th>
         <th style="padding: 3px; border: none;">Comment</th>
       </tr>
           </thead>
   <tbody>
 ${
   Object.entries(student.scores).map(([subject, s]) => {
     if (!s.mark) return '';
     let comment = {
       'A': 'Excellent',
       'B': 'Very Good',
       'C': 'Good',
       'D': 'Satisfactory',
       'F': 'Fail'
     }[s.grade] || '-';

     return `
       <tr>
         <td>${subject}</td>
         <td>${s.mark} - '${s.grade}'</td>
         <td>(${comment})</td>
       </tr>
     `;
   }).join('')
 }
 <tr>
 <td colspan="3" style=" text-align: center; width: 100%; display: table-cell;">*********************************************************************************</td>
</tr>
<tr>
<td colspan="3" style=" text-align: left; width: 100%; display: table-cell;">POINTS: <b>${student.point}</b>&nbsp;&nbsp;&nbsp;&nbsp;DIVISION: <b>${student.division}</b></td>
</tr>
<tr>
<td colspan="3" style=" text-align: left; width: 100%; display: table-cell;">POSITION: ${positionInfo.toUpperCase()}</td>
</tr>
</tbody>

         </table>
       </div>

       <!-- Behavioral Performance Table -->
       ${eligibleStudent ? `
 <div style="flex: 1; width: 300px;">
   <h4 style="">Behavioral Performance</h4>
   <table class="behavior-table" style="width: 100%; border-collapse: collapse; margin-top: -20px;">
     <thead>
       <tr>
         <th style="border: 1px solid #ccc; padding: 6px;">Aspect</th>
         <th style="border: 1px solid #ccc; padding: 6px;">Rating</th>
       </tr>
     </thead>
     <tbody>
       <tr><td style="border: 1px solid #ccc; padding: 6px;">Discipline</td><td style="border: 1px solid #ccc; padding: 6px;">${discipline}</td></tr>
       <tr><td style="border: 1px solid #ccc; padding: 6px;">Cooperation</td><td style="border: 1px solid #ccc; padding: 6px;">${cooperation}</td></tr>
       <tr><td style="border: 1px solid #ccc; padding: 6px;">Learning Effort</td><td style="border: 1px solid #ccc; padding: 6px;">${learning}</td></tr>
       <tr><td style="border: 1px solid #ccc; padding: 6px;">Sports Involvement</td><td style="border: 1px solid #ccc; padding: 6px;">${sports}</td></tr>
       <tr><td style="border: 1px solid #ccc; padding: 6px;">Participation</td><td style="border: 1px solid #ccc; padding: 6px;">${participation}</td></tr>
       <tr><td style="border: 1px solid #ccc; padding: 6px;">Punctuality</td><td style="border: 1px solid #ccc; padding: 6px;">${punctuality}</td></tr>
       <tr><td style="border: 1px solid #ccc; padding: 6px;">Leadership</td><td style="border: 1px solid #ccc; padding: 6px;">${leadership}</td></tr>
       <tr><td style="border: 1px solid #ccc; padding: 6px;">Neatness</td><td style="border: 1px solid #ccc; padding: 6px;">${neatness}</td></tr>
       <tr><td style="border: 1px solid #ccc; padding: 6px;">Respect</td><td style="border: 1px solid #ccc; padding: 6px;">${respect}</td></tr>
       <tr><td style="border: 1px solid #ccc; padding: 6px;">Creativity</td><td style="border: 1px solid #ccc; padding: 6px;">${creativity}</td></tr>
       <tr><td colspan="2" style="border: 1px solid #ccc; padding: 6px;"><strong>Remarks:</strong> ${remark}</td></tr>
     </tbody>
   </table>
 </div>` : ''}  
</div>

`; 

reportDiv.innerHTML += `
 <div style="margin-top: 10px; font-size: 14px; line-height: 1.5;">
   <p><strong>Term Dates:</strong> School closes on <strong>${closingDate}</strong> and reopens on <strong>${openingDate}</strong>.</p>
   
   <p><strong>Requirements for Next Term:</strong></p>
   <ul style="margin-left: 5px; margin-top: -15px; padding-left: 0; list-style-type: none;">
   ${formattedRequirements}
 </ul>

   <p><strong>Class Teacher's Comment:</strong> <i>${
     student.name.toLowerCase().replace(/\b\w/g, char => char.toUpperCase())}</i> has shown ${
     student.point <= 12 ? 'strong' :
     student.point <= 21 ? 'moderate' : 'weak'
   } academic performance this term. Improvement is ${
     student.point <= 28 ? 'encouraged' : 'necessary'
   }. 
   <br><strong>Signature:</strong> ${classTeacher} &nbsp; | &nbsp; <strong>Date:</strong> ${closingDate}</p>

   <p><strong>Headmaster's Comment:</strong> General performance is ${
     student.point <= 13 ? 'outstanding' :
     student.point <= 17 ? 'commendable' :
     student.point <= 24 ? 'satisfactory' : 'requires close follow-up'
       }. Continued parental support is recommended.
   <br><strong>Signature:</strong> ${headmaster} &nbsp; | &nbsp; <strong>Date:</strong> ${closingDate}</p>
 </div>
</div>
`;
   }else {
   
   reportDiv.innerHTML = `
     <div style="text-align: center; color: #b71c1c; font-weight: 500; padding: 20px; border: 1px solid #f0c0c0; background-color: #fff5f5; border-radius: 8px;">
       <div style="font-size: 28px; margin-bottom: 10px;">⚠️</div>
       <p style="font-size: 18px; margin: 0;"><strong>Notice:</strong> Candidate "<strong>${student.name}</strong>" does not have any recorded marks or points.</p>
       <p style="margin: 10px 0;">This may be due to missing subject scores, an incomplete grading process, or a data entry issue.</p>
       <p style="margin: 10px 0;">Please ensure the student's exam results have been properly entered and processed.</p>
       <p style="margin-top: 15px;"><em>No academic report is available at this time.</em></p>
     </div>
   `;
 }

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
 const opt = {
   margin: 0.2,
   filename: `${student.name.replace(/\s+/g, '_')}_Report.pdf`,
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
 const opt = {
   margin: 0.2,
   filename: `${student.name.replace(/\s+/g, '_')}_Report.pdf`,
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
    filename: 'Sunrise_Report.pdf',
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

function getFormValues() {
  return {
    classType: document.getElementById("classType").value,
    examType: document.getElementById("examType").value,
    resultType: document.getElementById("resultType").value,
    positionToggle: document.getElementById("positionToggle").value,
    month: document.getElementById("monthInput").value,
    closingDate: document.getElementById("closingDateInput").value,
    classTeacher: document.getElementById("classTeacherInput").value,
    headmaster: document.getElementById("headmasterInput").value,
    requirements: [
      document.getElementById("requirement1").value,
      document.getElementById("requirement2").value,
      document.getElementById("requirement3").value
    ].filter(r => r.trim() !== "") // remove empty strings
  };
}
