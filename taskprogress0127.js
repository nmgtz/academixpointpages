const NMG_SCRIPT_ = 'https://script.google.com/macros/s/AKfycbxaMpVdGPtkJB94ADOer_FFNrVMIEuxLh4P-knZhBSx5YysMKg2tESUaPR5nhhExWsW/exec';
    const CACHE_KEY = 'academixpoint_schools';
    const CACHE_DURATION = 24 * 60 * 60 * 1000;
    
    let currentSchoolData = null;
    let allSchoolsData = null;
    window.universalCodeUrl = null;
    function log(message, data = null) {
        console.log(`[AcademixPoint] ${message}`, data || '');
    }
    
    async function init() {
        try {
            const schoolIndex = extractSchoolIndexFromUrl();
            
            if (!schoolIndex) {
                log('❌ No school index found in URL');
                return false;
            }
            
            let schoolsData = loadFromCache();
            
            if (!schoolsData) {
                schoolsData = await fetchSchoolDataFromServer();
                if (schoolsData) {
                    saveToCache(schoolsData);
                } else {
                    log('❌ Failed to load data');
                }
            } else {
                log('💾 Using cached data');
            }
            
            if (schoolsData) {
                allSchoolsData = schoolsData;
                const success = setCurrentSchool(schoolIndex);
                if (success) {
                    log('🎯 School data initialized successfully');
                } else {
                    log('❌ Failed to set current school');
                }
                return success;
            }
            
        } catch (error) {
            log('💥 Error initializing school data');
            console.error('Initialization error occurred');
        }
        
        return false;
    }
    
    function extractSchoolIndexFromUrl() {
        const url = window.location.href;
        const pathname = window.location.pathname;
        
        const primaryMatch = pathname.match(/\/p\/s(\d+)[-_]/i);
        if (primaryMatch) {
            const index = 'S' + primaryMatch[1];
            return index;
        }
        
        const fallbackPatterns = [
            /\/s(\d+)[-_]/i,
            /[?&]school[=:]s?(\d+)/i,
            /[?&]index[=:]s?(\d+)/i,
            /[?&]schoolIndex[=:]s?(\d+)/i,
            /school[_\-]?s?(\d+)/i,
            /\/p\/.*s(\d+)/i
        ];
        
        for (const pattern of fallbackPatterns) {
            const match = url.match(pattern);
            if (match) {
                const index = 'S' + match[1];
                return index;
            }
        }
        
        return null;
    }
    
    function buildApiUrl() {
        const params = new URLSearchParams({
            page: getCurrentPageType(),
            referer: window.location.origin,
            domain: window.location.hostname,
            timestamp: Date.now().toString(),
            path: window.location.pathname
        });
        
        const apiUrl = `${NMG_SCRIPT_}?${params.toString()}`;
        return apiUrl;
    }
    
    function getCurrentPageType() {
        const path = window.location.pathname.toLowerCase();
        
        let pageType;
        if (path.includes('teachers')) pageType = 'teachers-feeding-area';
        else if (path.includes('student')) pageType = 'student-feeding-area';
        else if (path.includes('academix')) pageType = 'academixpoint-page';
        else pageType = 'school-portal';
        
        return pageType;
    }
    
    async function fetchSchoolDataFromServer() {
        
        try {
            const url = buildApiUrl();
            
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors'
            });
            
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'success' && result.data) {
                log('✅ Server data loaded successfully');
                return result.data;
            } else {
                log('❌ Server returned error or no data');
                throw new Error(result.message || 'Unknown server error');
            }
            
        } catch (error) {
            log('💥 Server request failed');
            console.error('Server request error occurred');
            return null;
        }
    }
    
    function loadFromCache() {
       
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) {
                return null;
            }
            
            const data = JSON.parse(cached);
            
            const age = Date.now() - data.timestamp;
            
            if (data.timestamp && (age < CACHE_DURATION)) {
                log('✅ Using valid cached data');
                return data.schools;
            } else {
                localStorage.removeItem(CACHE_KEY);
                return null;
            }
            
        } catch (error) {
            log('💥 Cache load error occurred');
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
    }
    
    function saveToCache(schoolsData) {
        
        try {
            const cacheData = {
                schools: schoolsData,
                timestamp: Date.now()
            };
            
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
            log('✅ Data cached successfully');
            
        } catch (error) {
            log('💥 Cache save error occurred');
            console.error('Cache save error occurred');
        }
    }
    
    function setCurrentSchool(schoolIndex) {
        
        if (!allSchoolsData || !schoolIndex) {
            return false;
        }
        
        const school = allSchoolsData[schoolIndex];
        
        if (!school) {
            return false;
        }
        
        currentSchoolData = school;
        log('✅ Current school configured');
        
        return true;
    }
    
  
    window.getSchoolUrl = function(type) {
        
        if (!currentSchoolData || !currentSchoolData.urls) {
            return null;
        }
        
        const url = currentSchoolData.urls[type];
        return url || null;
    };
    
    window.getAllSchoolUrls = function() {
       
        if (!currentSchoolData || !currentSchoolData.urls) {
            return null;
        }
        
        const urls = { ...currentSchoolData.urls };
        return urls;
    };
    
    window.getCurrentSchoolInfo = function() {
        
        if (!currentSchoolData) {
            return null;
        }
        
        const info = {
            name: currentSchoolData.schoolName,
            index: currentSchoolData.indexNumber,
            serialNumber: currentSchoolData.serialNumber,
            lastUpdated: currentSchoolData.lastUpdated
        };
        
        return info;
    };
    
    window.getSchoolUrlSafe = function(type, fallback = '') {
        const url = window.getSchoolUrl(type);
        const result = url || fallback;
        return result;
    };
    
    window.isSchoolDataLoaded = function() {
        const loaded = currentSchoolData !== null;
        return loaded;
    };
    
    window.refreshSchoolData = async function() {
        log('🔄 Refreshing school data...');
        localStorage.removeItem(CACHE_KEY);
        currentSchoolData = null;
        allSchoolsData = null;
        const result = await init();
        log('🔄 Refresh complete');
        return result;
    };
   
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                init().then(() => {
                    setupURLDATA();
                });
            }, 100);
        });
    } else {
        setTimeout(() => {
            init().then(() => {
                setupURLDATA();
            });
        }, 100);
    }
   
    function setupURLDATA() {
    const pageHasRepResURLs = typeof RepResURLs !== 'undefined' && RepResURLs !== null;
    
    if (currentSchoolData && currentSchoolData.urls) { 
        log('✅ Server data found - using server URLs');
        
        if (pageHasRepResURLs && typeof RepResURLs === 'object') {
            RepResURLs['FORM-ONE'] = currentSchoolData.urls.formOne;
            RepResURLs['FORM-TWO'] = currentSchoolData.urls.formTwo;
            RepResURLs['FORM-THREE'] = currentSchoolData.urls.formThree;
            RepResURLs['FORM-FOUR'] = currentSchoolData.urls.formFour;
        } else {
            window.RepResURLs = { 
                'FORM-ONE': currentSchoolData.urls.formOne,
                'FORM-TWO': currentSchoolData.urls.formTwo,
                'FORM-THREE': currentSchoolData.urls.formThree,
                'FORM-FOUR': currentSchoolData.urls.formFour 
            };
        }
        
    } else {
        log('⚠️ No server data found');
        
        if (pageHasRepResURLs) {
            log('✅ Using page fallback URLs');
        } else {
            log('❌ No URLs available - neither server nor page');
            window.RepResURLs = null;
        }
    }
    
    return typeof RepResURLs !== 'undefined' ? RepResURLs : null;
}
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
      const candNumber = currentSchoolData?.indexNumber
    ? `${currentSchoolData.indexNumber}-${index + 1}` : index + 1;
      const row = [
        candNumber, 
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
      
      const schoolHeader = document.createElement('div');
      schoolHeader.className = 'school-header';
      schoolHeader.innerHTML = `
        <h1 contenteditable="true">${(currentSchoolData?.indexNumber && currentSchoolData?.schoolName) 
      ? `${currentSchoolData.indexNumber} - ${currentSchoolData.schoolName}` 
      : 'Sunrise Secondary School'}</h1>
        <p contenteditable="true">Academic Year: 2024/2025</p>
        <p contenteditable="true" id="examTitle">Exam: ${examType || '-'}</p>
      `;
      resultDiv.appendChild(schoolHeader);

      const buttonGNMG = document.querySelector('.button-group');
      
      const existingExportBtn = buttonGNMG.querySelector('.export-btn');
      if (existingExportBtn) {
        existingExportBtn.remove();
      }
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

      const subjectTableWrapper = buildSubjectTable(students);
      resultDiv.appendChild(subjectTableWrapper);
      
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
  const divisionPoints = { 'I': 1.0, 'II': 2.0, 'III': 3.0, 'IV': 4.0, 'O': 5.0 };

  // Calculate subject averages
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

  // Calculate average subject GPA
  const subjectGPAs = [];
  Object.keys(subjectTotals).forEach(subject => {
    const avg = subjectTotals[subject] / subjectCounts[subject];
    subjectGPAs.push(avg);
  });

  const averageSubjectGPA = subjectGPAs.length > 0
    ? subjectGPAs.reduce((a, b) => a + b, 0) / subjectGPAs.length
    : 0;

  // Calculate average division GPA
  let totalDivisionPoints = 0;
  let validDivisionCount = 0;

  students.forEach(student => {
    const div = student.division;
    if (divisionPoints.hasOwnProperty(div)) {
      totalDivisionPoints += divisionPoints[div];
      validDivisionCount++;
    }
  });

  const averageDivisionGPA = validDivisionCount > 0
    ? totalDivisionPoints / validDivisionCount
    : 0;

  // Final school GPA: (average subject GPA + average division GPA) / 2
  const schoolGPA = (averageSubjectGPA > 0 && averageDivisionGPA > 0)
    ? (averageSubjectGPA + averageDivisionGPA) / 2
    : null;

  // Add GPA row
  if (schoolGPA !== null && !isNaN(schoolGPA)) {
    const gpaRow = document.createElement('tr');
    const gpaCell = document.createElement('td');
    gpaCell.colSpan = Object.keys(divisionCount).length + 1;
    gpaCell.style.fontWeight = 'bold';
    gpaCell.style.textAlign = 'center';
    gpaCell.style.padding = '5px';

    // Grade category from GPA
    let gpaGrade = '';
    let gpaComment = '';
    if (schoolGPA > 4.6) {
      gpaGrade = 'F'; gpaComment = 'Fail'; gpaCell.style.backgroundColor = '#ffcccc';
    } else if (schoolGPA > 3.6) {
      gpaGrade = 'D'; gpaComment = 'Satisfactory'; gpaCell.style.backgroundColor = '#ffe0b2';
    } else if (schoolGPA > 2.6) {
      gpaGrade = 'C'; gpaComment = 'Good'; gpaCell.style.backgroundColor = '#fff9c4';
    } else if (schoolGPA > 1.6) {
      gpaGrade = 'B'; gpaComment = 'Very Good'; gpaCell.style.backgroundColor = '#c8e6c9';
    } else {
      gpaGrade = 'A'; gpaComment = 'Excellent'; gpaCell.style.backgroundColor = '#b2dfdb';
    }

    gpaCell.textContent = `SCHOOL GPA: ${schoolGPA.toFixed(4)} → Grade ${gpaGrade} (${gpaComment})`;
    gpaRow.appendChild(gpaCell);
    tbody.appendChild(gpaRow);
  }

  divisionTable.appendChild(thead);
  divisionTable.appendChild(tbody);
  
  // Add style for division table if not already present
  if (!document.getElementById('division-table-style')) {
    const style = document.createElement('style');
    style.id = 'division-table-style';
    style.textContent = `
      table.division-table th,
      table.division-table td {
        font-size: clamp(8px, 0.95vw, 12px);
      }
    `;
    document.head.appendChild(style);
  }
  
  return divisionTable;
}


    
// ---------------------Results Table---------------------
function buildStudentTable(students) {
  const selectedValue = document.getElementById("resultType").value;
  const includePosition = document.getElementById('positionToggle').value === 'show';
  const SchoolI = document.getElementById('schoolIndexInput').value.trim().toUpperCase();
  const studentTable = document.createElement('table');
  studentTable.className = 'student-results-table';
  
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
  const stdPos = students.filter(s => s.point >= 7 && s.point <= 35)
                          .sort((a, b) => a.point - b.point);
  stdPos.forEach((s, i) => {
    s.position = i + 1;
  });
  
  students.forEach((student, i) => {
    const tr = document.createElement('tr');

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

    const candiNumber = currentSchoolData?.indexNumber
      ? `${currentSchoolData.indexNumber}-${String(i + 1).padStart(4, '0')}` 
      : `${SchoolI} - ${String(i + 1).padStart(4, '0')} `;
      
    const cells = [
      `<td>${candiNumber}</td>`,
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

  const allRows = studentTable.querySelectorAll('tr');
  allRows.forEach(row => {
    const cells = row.querySelectorAll('td, th');
    if (cells.length > 0) {
      cells[0].style.width = '8%'; 
      cells[0].style.textAlign = 'center';
      cells[0].style.padding = '2px 4px';
      
      cells[1].style.width = '15%';    
      cells[1].style.textAlign = 'left';
      cells[1].style.padding = '2px 4px';

      cells[2].style.width = '5%';     
      cells[2].style.textAlign = 'center';
      cells[2].style.padding = '1px 4px';

      cells[3].style.width = '5%';    
      cells[3].style.textAlign = 'center';
      cells[3].style.padding = '2px 4px';

      cells[4].style.width = '5%';     
      cells[4].style.textAlign = 'center';
      cells[4].style.padding = '2px 4px';

      if (includePosition) {
        cells[5].style.width = '5%';  
        cells[5].style.textAlign = 'center';
        cells[5].style.padding = '2px 4px';

        cells[6].style.width = 'auto';
        cells[6].style.padding = '2px 4px';
      } else {
        cells[5].style.width = 'auto';
        cells[5].style.padding = '2px 4px';
      }
    }
  });

  // Add style for student table if not already present
  if (!document.getElementById('student-table-style')) {
    const style = document.createElement('style');
    style.id = 'student-table-style';
    style.textContent = `
      table.student-results-table th,
      table.student-results-table td {
        font-size: clamp(7px, 0.8vw, 12px);
      }
    `;
    document.head.appendChild(style);
  }

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
    finalGPAs[subject] = avgGPA ? avgGPA.toFixed(4) : 'N/A';

    const a = subjectAverages[subject];
    const avg = a.count > 0 ? (a.total / a.count).toFixed(4) : 'N/A';
    finalAverages[subject] = avg;

    // Use GPA to determine grade comment
    let gradeComment = 'N/A';
    if (avgGPA !== null && !isNaN(avgGPA)) {
      if (avgGPA < 1.6) gradeComment = 'A (Excell)';
      else if (avgGPA < 2.6) gradeComment = 'B (V.Good)';
      else if (avgGPA < 3.6) gradeComment = 'C (Good)';
      else if (avgGPA < 4.6) gradeComment = 'D (Satisf)';
      else gradeComment = 'F (Fail)';
    }
    finalGradesWithComments[subject] = gradeComment;
  });

  // Calculate positions based on GPA (lower GPA = better position)
  const subjectsWithGPA = Object.keys(subjectStats).map(subject => ({
    subject: subject,
    gpa: parseFloat(finalGPAs[subject])
  })).filter(item => !isNaN(item.gpa));

  subjectsWithGPA.sort((a, b) => a.gpa - b.gpa);
  
  const subjectPositions = {};
  subjectsWithGPA.forEach((item, index) => {
    subjectPositions[item.subject] = index + 1;
  });

  const overallTable = document.createElement('table');
  overallTable.className = 'overall-analysis-table';
  
  
  const overallStats = {
    registered: { F: 0, M: 0 },
    sat: { F: 0, M: 0 },
    clean: { F: 0, M: 0 },
    absent: { F: 0, M: 0 },
    INC: { F: 0, M: 0 }
  };
  
  
  const divisionCount = {
    'I': { F: 0, M: 0 },
    'II': { F: 0, M: 0 },
    'III': { F: 0, M: 0 },
    'IV': { F: 0, M: 0 },
    'O': { F: 0, M: 0 }
  };
  
  students.forEach(student => {
    const gender = student.gender === 'F' ? 'F' : 'M';
    
    
    overallStats.registered[gender]++;
    
   
    if (Object.keys(student.scores || {}).length > 0) {
      overallStats.sat[gender]++;
    }
    
  
    if (student.point >= 7 && student.point <= 35) {
      overallStats.clean[gender]++;
    }
    
    
    if (Object.keys(student.scores || {}).length === 0) {
      overallStats.absent[gender]++;
    }

    const scores = Object.values(student.scores || {});
    if (scores.length > 0 && student.division === 'INC') {
      overallStats.INC[gender]++;
    }
    
    const div = student.division;
    if (divisionCount[div]) {
      divisionCount[div][gender]++;
    }
  });

  
  
  const centerSummaryTable = document.createElement('table');
  centerSummaryTable.className = 'center-summary-table';

  
  const passedCandidates = divisionCount['I'].F + divisionCount['I'].M + 
                           divisionCount['II'].F + divisionCount['II'].M + 
                           divisionCount['III'].F + divisionCount['III'].M + 
                           divisionCount['IV'].F + divisionCount['IV'].M;

  
  const totalCandidates = passedCandidates + divisionCount['O'].F + divisionCount['O'].M;

  
  const performancePercentage = totalCandidates > 0 
    ? ((passedCandidates / totalCandidates) * 100).toFixed(2) 
    : '0.00';

 
  const gradePoints = { A: 1.0, B: 2.0, C: 3.0, D: 4.0, F: 5.0 };
  const divisionPoints = { 'I': 1.0, 'II': 2.0, 'III': 3.0, 'IV': 4.0, 'O': 5.0 };

  const subjectTotals = {};
  const subjectCountsGPA = {};

  students.forEach(student => {
    Object.entries(student.scores || {}).forEach(([subject, s]) => {
      const grade = s.grade;
      if (gradePoints.hasOwnProperty(grade)) {
        if (!subjectTotals[subject]) {
          subjectTotals[subject] = 0;
          subjectCountsGPA[subject] = 0;
        }
        subjectTotals[subject] += gradePoints[grade];
        subjectCountsGPA[subject]++;
      }
    });
  });

  const subjectGPAsArray = [];
  Object.keys(subjectTotals).forEach(subject => {
    const avg = subjectTotals[subject] / subjectCountsGPA[subject];
    subjectGPAsArray.push(avg);
  });

  const averageSubjectGPA = subjectGPAsArray.length > 0
    ? subjectGPAsArray.reduce((a, b) => a + b, 0) / subjectGPAsArray.length
    : 0;

  let totalDivisionPoints = 0;
  let validDivisionCount = 0;

  students.forEach(student => {
    const div = student.division;
    if (divisionPoints.hasOwnProperty(div)) {
      totalDivisionPoints += divisionPoints[div];
      validDivisionCount++;
    }
  });

  const averageDivisionGPA = validDivisionCount > 0
    ? totalDivisionPoints / validDivisionCount
    : 0;

  const schoolGPAValue = (averageSubjectGPA > 0 && averageDivisionGPA > 0)
    ? (averageSubjectGPA + averageDivisionGPA) / 2
    : null;

  const schoolGPA = schoolGPAValue !== null ? schoolGPAValue.toFixed(4) : 'N/A';

  
  let schoolGradeComment = 'N/A';
  let schoolGPABackgroundColor = '';
  if (schoolGPAValue !== null && !isNaN(schoolGPAValue)) {
    if (schoolGPAValue < 1.6) {
      schoolGradeComment = 'A (Excell)';
      schoolGPABackgroundColor = '#006400';
    } else if (schoolGPAValue < 2.6) {
      schoolGradeComment = 'B (V.Good)';
      schoolGPABackgroundColor = '#00FF00';
    } else if (schoolGPAValue < 3.6) {
      schoolGradeComment = 'C (Good)';
      schoolGPABackgroundColor = '#ADFF2F';
    } else if (schoolGPAValue < 4.6) {
      schoolGradeComment = 'D (Satisf)';
      schoolGPABackgroundColor = '#FFA500';
    } else {
      schoolGradeComment = 'F (Fail)';
      schoolGPABackgroundColor = '#FF0000';
    }
  }

  
  const centerSummaryThead = document.createElement('thead');
  const centerSummaryHeaderRow = document.createElement('tr');

  ['METRIC', 'VALUE'].forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    centerSummaryHeaderRow.appendChild(th);
  });

  centerSummaryThead.appendChild(centerSummaryHeaderRow);
  centerSummaryTable.appendChild(centerSummaryThead);

  
  const centerSummaryTbody = document.createElement('tbody');

  
  const passedRow = document.createElement('tr');
  passedRow.innerHTML = `
    <td style="font-weight: bold;">TOTAL PASSED CANDIDATES (DIV I-IV)</td>
    <td style="text-align: center; font-weight: bold;">${passedCandidates}</td>
  `;
  centerSummaryTbody.appendChild(passedRow);

 
  const percentageRow = document.createElement('tr');
  percentageRow.innerHTML = `
    <td style="font-weight: bold;">PERFORMANCE PERCENTAGE</td>
    <td style="text-align: center; font-weight: bold;">${performancePercentage}%</td>
  `;
  centerSummaryTbody.appendChild(percentageRow);

  
  const gpaRow = document.createElement('tr');
  const gpaCell = document.createElement('td');
  gpaCell.style.fontWeight = 'bold';
  gpaCell.textContent = 'SCHOOL GPA';
  
  const gpaValueCell = document.createElement('td');
  gpaValueCell.style.textAlign = 'center';
  gpaValueCell.style.fontWeight = 'bold';
  gpaValueCell.textContent = `${schoolGPA} - ${schoolGradeComment}`;
  
  if (schoolGPABackgroundColor) {
    gpaValueCell.style.backgroundColor = schoolGPABackgroundColor;
    gpaValueCell.style.color = '#000000';
  }
  
  gpaRow.appendChild(gpaCell);
  gpaRow.appendChild(gpaValueCell);
  centerSummaryTbody.appendChild(gpaRow);

  centerSummaryTable.appendChild(centerSummaryTbody);
  
 
  const overallThead = document.createElement('thead');
  const overallHeaderRow = document.createElement('tr');
  
  const overallHeaders = ['CATEGORY', 'REGISTERED', 'SAT', 'CLEAN', 'ABSENT', 'INC', 
                          'DIV I', 'DIV II', 'DIV III', 'DIV IV', 'DIV 0'];
  
  overallHeaders.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    th.colSpan = header === 'CATEGORY' ? 1 : 3;
    overallHeaderRow.appendChild(th);
  });
  
  overallThead.appendChild(overallHeaderRow);
  
 
  const overallSubHeaderRow = document.createElement('tr');
  
  
  const categorySpacer = document.createElement('th');
  categorySpacer.textContent = '';
  overallSubHeaderRow.appendChild(categorySpacer);
  
  
  for (let i = 0; i < 10; i++) {
    ['F', 'M', 'T'].forEach(label => {
      const th = document.createElement('th');
      th.textContent = label;
      overallSubHeaderRow.appendChild(th);
    });
  }
  
  overallThead.appendChild(overallSubHeaderRow);
  overallTable.appendChild(overallThead);
  
 
  const overallTbody = document.createElement('tbody');
  const overallDataRow = document.createElement('tr');
  
 
  const categoryCell = document.createElement('td');
  categoryCell.textContent = 'TOTALS';
  categoryCell.style.fontWeight = 'bold';
  overallDataRow.appendChild(categoryCell);
  
 
  ['registered', 'sat', 'clean', 'absent', 'INC'].forEach(key => {
    const f = overallStats[key].F;
    const m = overallStats[key].M;
    const t = f + m;
    
    [f, m, t].forEach(val => {
      const td = document.createElement('td');
      td.textContent = val;
      overallDataRow.appendChild(td);
    });
  });
  
 
  ['I', 'II', 'III', 'IV', 'O'].forEach(div => {
    const f = divisionCount[div].F;
    const m = divisionCount[div].M;
    const t = f + m;
    
    [f, m, t].forEach(val => {
      const td = document.createElement('td');
      td.textContent = val;
      overallDataRow.appendChild(td);
    });
  });
  
  overallTbody.appendChild(overallDataRow);
  overallTable.appendChild(overallTbody);

  // === Build Subject Analysis Table ===
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

  // Grade headers A-F with colspan 3 (F, M, T)
  ['A', 'B', 'C', 'D', 'F'].forEach(grade => {
    const th = document.createElement('th');
    th.textContent = grade;
    th.colSpan = 3;
    gradeRow.appendChild(th);
  });

  // AVER, GPA, POS, GRADE
  ['AVER', 'GPA', 'POS', 'GRADE'].forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    th.rowSpan = 2;
    gradeRow.appendChild(th);
  });

  // Subheaders: F, M, T under each grade
  ['A', 'B', 'C', 'D', 'F'].forEach(() => {
    ['F', 'M', 'T'].forEach(label => {
      const subTh = document.createElement('th');
      subTh.textContent = label;
      genderRow.appendChild(subTh);
    });
  });

  thead.appendChild(gradeRow);
  thead.appendChild(genderRow);
  table.appendChild(thead);

 
  const tbody = document.createElement('tbody');
  const subjects = Object.keys(subjectStats);

  subjects.forEach(subject => {
    const row = document.createElement('tr');

    const subjectCell = document.createElement('td');
    subjectCell.textContent = subject;
    subjectCell.style.fontWeight = 'bold';
    row.appendChild(subjectCell);

    
    const satF = subjectCounts[subject]?.F || 0;
    const satM = subjectCounts[subject]?.M || 0;
    const total = satF + satM;

    [satF, satM, total].forEach(val => {
      const td = document.createElement('td');
      td.textContent = val;
      row.appendChild(td);
    });

   
    ['A', 'B', 'C', 'D', 'F'].forEach(grade => {
      const gradeF = subjectStats[subject][grade]['F'] || 0;
      const gradeM = subjectStats[subject][grade]['M'] || 0;
      const gradeTotal = gradeF + gradeM;

      [gradeF, gradeM, gradeTotal].forEach(val => {
        const td = document.createElement('td');
        td.textContent = val;
        row.appendChild(td);
      });
    });

    
    const tdAvg = document.createElement('td');
    tdAvg.textContent = finalAverages[subject];
    row.appendChild(tdAvg);

   
    const tdGPA = document.createElement('td');
    tdGPA.textContent = finalGPAs[subject];
    row.appendChild(tdGPA);

   
    const tdPos = document.createElement('td');
    tdPos.textContent = subjectPositions[subject] || '';
    row.appendChild(tdPos);

   
    const tdComment = document.createElement('td');
    const gradeText = finalGradesWithComments[subject];
    tdComment.textContent = gradeText;
    
    if (gradeText.startsWith('A')) {
      tdComment.style.backgroundColor = '#006400'; 
      tdComment.style.fontWeight = 'bold';
      tdComment.style.color = '#000000'; 
    } else if (gradeText.startsWith('B')) {
      tdComment.style.backgroundColor = '#00FF00';
      tdComment.style.fontWeight = 'bold';
      tdComment.style.color = '#000000'; 
    } else if (gradeText.startsWith('C')) {
      tdComment.style.backgroundColor = '#ADFF2F'; 
      tdComment.style.fontWeight = 'bold';
      tdComment.style.color = '#000000'; 
    } else if (gradeText.startsWith('D')) {
      tdComment.style.backgroundColor = '#FFA500'; 
      tdComment.style.fontWeight = 'bold';
      tdComment.style.color = '#000000'; 
    } else if (gradeText.startsWith('F')) {
      tdComment.style.backgroundColor = '#FF0000'; 
      tdComment.style.fontWeight = 'bold';
      tdComment.style.color = '#000000'; 
    }
    
    row.appendChild(tdComment);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);

 
  if (!document.getElementById('subject-table-style')) {
    const style = document.createElement('style');
    style.id = 'subject-table-style';
    style.textContent = `
      table.center-summary-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        text-align: center;
        margin-top: 10px;
        margin-bottom: 20px;
        table-layout: fixed;
        page-break-before: always;
      }

      table.center-summary-table th,
      table.center-summary-table td {
        border: 0.5px solid #000;
        padding: 6px 4px;
        white-space: nowrap;
        overflow: hidden;
        font-size: clamp(7px, 0.85vw, 12px);
      }

      table.center-summary-table th {
        font-weight: bold;
        text-align: center;
      }

      table.center-summary-table td {
        text-align: center;
      }

      table.center-summary-table td:first-child {
        text-align: left;
        font-weight: bold;
      }

      table.overall-analysis-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        text-align: center;
        margin-top: 10px;
        margin-bottom: 20px;
        table-layout: fixed;
      }

      table.overall-analysis-table th,
      table.overall-analysis-table td {
        border: 0.5px solid #000;
        padding: 6px 4px;
        white-space: nowrap;
        overflow: hidden;
        font-size: clamp(7px, 0.85vw, 12px);
      }

      table.overall-analysis-table th:nth-child(1),
      table.overall-analysis-table td:nth-child(1) {
        width: 8%;
        font-weight: bold;
        text-align: center;
      }

      table.overall-analysis-table th:not(:first-child),
      table.overall-analysis-table td:not(:first-child) {
        width: calc(92% / 30);
        text-align: center;
      }

      table.overall-analysis-table th {
        font-weight: bold;
      }

      table.overall-analysis-table td {
        text-align: center;
      }

      table.subject-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        text-align: center;
        margin-top: 10px;
        table-layout: fixed;
      }

      table.subject-table th,
      table.subject-table td {
        border: 0.5px solid #000;
        padding: 4px;
        white-space: nowrap;
        overflow: hidden;
        font-size: clamp(7px, 0.85vw, 12px);
      }

      table.subject-table th:nth-child(1),
      table.subject-table td:nth-child(1) {
        width: 6%;
        font-weight: bold;
        text-align: left;
      }

      table.subject-table th:nth-child(2),
      table.subject-table td:nth-child(2),
      table.subject-table th:nth-child(3),
      table.subject-table td:nth-child(3),
      table.subject-table th:nth-child(4),
      table.subject-table td:nth-child(4) {
        width: 3%;
        text-align: center;
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
      table.subject-table td:nth-child(14),
      table.subject-table th:nth-child(15),
      table.subject-table td:nth-child(15),
      table.subject-table th:nth-child(16),
      table.subject-table td:nth-child(16),
      table.subject-table th:nth-child(17),
      table.subject-table td:nth-child(17),
      table.subject-table th:nth-child(18),
      table.subject-table td:nth-child(18),
      table.subject-table th:nth-child(19),
      table.subject-table td:nth-child(19) {
        width: 5%;
        text-align: center;
      }

      table.subject-table th:nth-child(20),
      table.subject-table td:nth-child(20),
      table.subject-table th:nth-child(21),
      table.subject-table td:nth-child(21),
      table.subject-table th:nth-child(22),
      table.subject-table td:nth-child(22) {
        width: 3%;
        text-align: center;
      }

      table.subject-table th:nth-child(23),
      table.subject-table td:nth-child(23) {
        width: 13%;
        text-align: left;
      }
      
      @media print {
        table.subject-table td,
        table.overall-analysis-table td,
        table.center-summary-table td {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const wrapper = document.createElement('div');
  wrapper.appendChild(centerSummaryTable);
  wrapper.appendChild(overallTable);
  wrapper.appendChild(table);
  
  return wrapper;
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
      governmentHeader: "President's Office",
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
      outOf: "Out of",
      behavior: "Behavioral Assessment",
      aspect: "Aspect",
      rating: "Rating",
      remarks: "Remarks:",
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
      classLevels: {
        "FORM ONE": "FORM ONE",
        "FORM TWO": "FORM TWO",
        "FORM THREE": "FORM THREE",
        "FORM FOUR": "FORM FOUR",
        "FORM FIVE": "FORM FIVE",
        "FORM SIX": "FORM SIX",
        "STANDARD ONE": "STANDARD ONE",
        "STANDARD TWO": "STANDARD TWO",
        "STANDARD THREE": "STANDARD THREE",
        "STANDARD FOUR": "STANDARD FOUR",
        "STANDARD FIVE": "STANDARD FIVE",
        "STANDARD SIX": "STANDARD SIX",
        "STANDARD SEVEN": "STANDARD SEVEN"
      },
      termDates: "Term Dates",
      closes: "The term closed on",
      reopens: "and reopens on",
      requirements: "Requirements for Next Term",
      classComment: "Class Teacher's Comment",
      headComment: "Head of School's Comment",
      signature: "Signature",
      date: "Date",
      noDataHeader: "Student Not Found",
      noDataText: "No record was found for {name} in the eligible list.",
      noDataReason: "This may be due to a name mismatch or missing exam data.",
      noDataFollowUp: "Please ensure the name and exam results are correctly entered.",
      noDataFinal: "Contact the administrator for further assistance.",
      comments: {
        'A': "Excellent",
        'B': "Very Good",
        'C': "Good",
        'D': "Satisfactory",
        'F': "Fail"
      },
      remarksList: {
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
      academicPerformance: "academic performance",
      thisTerm: "this term.",
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
      outOf: "Kati ya",
      position: "Nafasi",
      behavior: "Tathmini ya Tabia",
      aspect: "Kipengele",
      rating: "Daraja",
      remarks: "Maoni:",
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
      classLevels: {
        "FORM ONE": "KIDATO CHA KWANZA",
        "FORM TWO": "KIDATO CHA PILI",
        "FORM THREE": "KIDATO CHA TATU",
        "FORM FOUR": "KIDATO CHA NNE",
        "FORM FIVE": "KIDATO CHA TANO",
        "FORM SIX": "KIDATO CHA SITA",
        "STANDARD ONE": "DARASA LA KWANZA",
        "STANDARD TWO": "DARASA LA PILI",
        "STANDARD THREE": "DARASA LA TATU",
        "STANDARD FOUR": "DARASA LA NNE",
        "STANDARD FIVE": "DARASA LA TANO",
        "STANDARD SIX": "DARASA LA SITA",
        "STANDARD SEVEN": "DARASA LA SABA"
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
        'B': "Nzuri Sana",
        'C': "Nzuri",
        'D': "Inaridhisha",
        'F': "Feli"
      },
      remarksList: {
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
      academicPerformance: "Matokeo ya kitaaluma",
      thisTerm: "kwa muhula huu.",
      encouragement: {
        encouraged: "Anahimizwa kuendelea kujitahidi.",
        necessary: "Ni muhimu kuboresha juhudi zake."
      }
    }
  };
  
  
function updateReport(index) {
    const lang = LANG[currentLang]; 
    const examType = document.getElementById('examType').value.trim();
    const examClass = document.getElementById('classType').value;
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
    const positionInfo = eligibleStudent ? `<strong>${eligibleStudent.position} ${lang.outOf} ${eligibleStudent.total}</strong>` : '';
    let discipline = 'C', cooperation = 'C', learning = 'C', sports = 'B';
    let participation = 'C', punctuality = 'C', leadership = 'C';
    let neatness = 'C', respect = 'C', creativity = 'C';
    let remark = lang.remarksList.followup;
  
    // Get translated class level
   const normalizedExamClass = examClass.replace(/-/g, ' ').toUpperCase();
   const translatedClass = lang.classLevels[normalizedExamClass] || examClass;
  
    let division = Number(student.point);
    if (division <= 17) {
      discipline = 'A'; cooperation = 'A'; learning = 'A'; sports = 'C';
      participation = 'A'; punctuality = 'A'; leadership = 'A';
      neatness = 'A'; respect = 'A'; creativity = 'B';
      remark = lang.remarksList.outstanding;
    } else if (division <= 21) {
      discipline = 'B'; cooperation = 'B'; learning = 'B'; sports = 'C';
      participation = 'B'; punctuality = 'B'; leadership = 'B';
      neatness = 'B'; respect = 'B'; creativity = 'B';
      remark = lang.remarksList.commendable;
    } else if (division <= 30) {
      discipline = 'C'; cooperation = 'C'; learning = 'C'; sports = 'A';
      participation = 'C'; punctuality = 'C'; leadership = 'C';
      neatness = 'C'; respect = 'C'; creativity = 'C';
      remark = lang.remarksList.satisfactory;
    }
  
    // Format report title with proper word order
    const reportTitleFormatted = currentLang === 'en' 
      ? `${translatedClass} ${lang.reportTitle} - ${month.toUpperCase()}`
      : `${lang.reportTitle} - ${translatedClass} - ${month.toUpperCase()}`;
  
    if (!eligibleStudent) {
      reportDiv.innerHTML = `
        <div style="text-align: center; color: #c62828; font-weight: 500; padding: 20px; border: 2px solid #ef5350; background: linear-gradient(135deg, #ffebee 0%, #fff5f5 100%); border-radius: 8px; box-shadow: 0 2px 8px rgba(198, 40, 40, 0.1);">
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
      <div style="position: relative; min-height: 100vh; overflow: hidden; background: #ffffff;">
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                    pointer-events: none; z-index: 1;">
          <div style="position: absolute; top: 50%; left: 50%; 
                      transform: translate(-50%, -50%) rotate(-45deg);
                      font-size: 60px; font-weight: bold; 
                      color: rgba(0, 0, 0, 0.02); white-space: nowrap;
                      user-select: none; pointer-events: none;">
            ${student.name.toUpperCase()}
          </div>
          <!-- Repeated watermark pattern -->
          <div style="position: absolute; top: 20%; left: 20%; 
                      transform: rotate(-45deg);
                      font-size: 30px; font-weight: bold; 
                      color: rgba(0, 0, 0, 0.02); white-space: nowrap;
                      user-select: none; pointer-events: none;">
            ${student.name.toUpperCase()}
          </div>
          <div style="position: absolute; top: 80%; left: 20%; 
                      transform: rotate(-45deg);
                      font-size: 30px; font-weight: bold; 
                      color: rgba(0, 0, 0, 0.02); white-space: nowrap;
                      user-select: none; pointer-events: none;">
            ${student.name.toUpperCase()}
          </div>
          <div style="position: absolute; top: 20%; left: 80%; 
                      transform: rotate(-45deg);
                      font-size: 30px; font-weight: bold; 
                      color: rgba(0, 0, 0, 0.02); white-space: nowrap;
                      user-select: none; pointer-events: none;">
            ${student.name.toUpperCase()}
          </div>
          <div style="position: absolute; top: 80%; left: 80%; 
                      transform: rotate(-45deg);
                      font-size: 30px; font-weight: bold; 
                      color: rgba(0, 0, 0, 0.02); white-space: nowrap;
                      user-select: none; pointer-events: none;">
            ${student.name.toUpperCase()}
          </div>
        </div>

        <!-- Main Content -->
        <div style="position: relative; z-index: 2; background: transparent;">
          <!-- Top Left Candidate Number -->
          <div style="position: absolute; top: 10px; left: 10px; 
                      font-size: 11px; font-weight: bold; 
                      color: #333333;
                      padding: 4px 8px;">
            ${
              currentSchoolData?.indexNumber
                ? `${currentSchoolData.indexNumber.toUpperCase()}-${String(index + 1).padStart(4, '0')}`
                : String(index + 1).padStart(4, '0')
            }
          </div>

          <!-- Top Right Candidate Number -->
          <div style="position: absolute; top: 10px; right: 10px; 
                      font-size: 11px; font-weight: bold; 
                      color: #333333;
                      padding: 4px 8px;">
            ${
              currentSchoolData?.indexNumber
                ? `${currentSchoolData.indexNumber.toUpperCase()}-${String(index + 1).padStart(4, '0')}`
                : String(index + 1).padStart(4, '0')
            }
          </div>

          <h2 style="text-align: center; margin: 40px 0 0 0; color: #1565c0;">${lang.governmentHeader}</h2>
          <h2 style="text-align: center; margin: 0; color: #1976d2;">${lang.localGov}</h2>
          <h4 style="text-align: center; margin: 10px 0; color: #424242; padding: 8px 0;">
            ${
              (currentSchoolData?.schoolName && currentSchoolData?.indexNumber)
                ? `${currentSchoolData.schoolName.toUpperCase()} - ${currentSchoolData.indexNumber.toUpperCase()}`
                : `${schoolName.toUpperCase()} - ${schoolIndex.toUpperCase()}`
            }
          </h4><br>
          <h4 style="text-align: center; margin: 5px 0; color: #0d47a1; padding: 4px 0; border-top: 2px solid #64b5f6; border-bottom: 2px solid #64b5f6;">${reportTitleFormatted}</h4><br>

          <p style="margin: 2px 0; color: #424242; line-height: 1.2;">
            ${lang.examNotice} <strong style="color: #1565c0;">${student.name}</strong><br>
            ${lang.satFor} ${examType.toUpperCase()} ${lang.at} <strong style="color: #1565c0;">${
              (currentSchoolData?.schoolName && currentSchoolData?.indexNumber)
                ? `${currentSchoolData.indexNumber.toUpperCase()}`
                : `${schoolName.toUpperCase()} - ${schoolIndex.toUpperCase()}`
            }</strong>.<br>
            ${lang.academicStanding}
          </p>

          <div style="display: flex; gap: 20px; margin-top: 5px; flex-wrap: wrap;">
            <div style="flex: 2; width: 600px;">
              <h4 style="color: #0d47a1; padding: 8px 0; margin-bottom: 8px;">${lang.performanceTitle}</h4><br>
              <table class="report-table" style="width: 100%; border-collapse: collapse; margin-top: -20px; border: none;">
                <thead>
                  <tr style="background: #e3f2fd; color: #0d47a1;">
                    <th style="padding: 8px; border: 1px solid #90caf9;">${lang.subject}</th>
                    <th style="padding: 8px; border: 1px solid #90caf9;">${lang.mark}</th>
                    <th style="padding: 8px; border: 1px solid #90caf9;">${lang.comment}</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    Object.entries(student.scores).map(([subject, s], idx) => {
                      if (s.mark == null || s.mark === '') return '';
                      const rowBg = idx % 2 === 0 ? '#f5f5f5' : '#ffffff';
                      return `
                        <tr style="background: ${rowBg};">
                          <td style="padding: 6px; border: 1px solid #e0e0e0; color: #424242;">${subject}</td>
                          <td style="padding: 6px; border: 1px solid #e0e0e0; color: #1565c0; font-weight: 600;">${s.mark} - '${s.grade}'</td>
                          <td style="padding: 6px; border: 1px solid #e0e0e0; color: #616161; font-style: italic;">(${lang.comments[s.grade] || '-'})</td>
                        </tr>`;
                    }).join('')
                  }
                  <tr style="background: #f9f9f9;"><td colspan="3" style="text-align: center; padding: 4px; color: #424242;">*********************************************************************************</td></tr>
                  <tr style="background: #ffffff;"><td colspan="3" style="padding: 8px; color: #424242; border: 1px solid #e0e0e0;"> ${lang.points}: <b style="color: #d84315;">${student.point}</b> &nbsp;&nbsp;&nbsp;&nbsp; ${lang.division}: <b style="color: #d84315;">${student.division}</b></td></tr>
                  <tr style="background: #ffffff;"><td colspan="3" style="padding: 8px; color: #424242; border: 1px solid #e0e0e0;"> ${lang.position}: ${positionInfo.toUpperCase()}</td></tr>
                </tbody>
              </table>
            </div>

            <div style="flex: 1; width: 300px;">
              <h4 style="color: #0d47a1; padding: 8px 0; margin-bottom: 8px;">${lang.behavior}</h4><br>
              <table class="behavior-table" style="width: 100%; border-collapse: collapse; margin-top: -20px;">
                <thead>
                  <tr style="background: #e8eaf6; color: #0d47a1;">
                    <th style="border: 1px solid #9fa8da; padding: 8px;">${lang.aspect}</th>
                    <th style="border: 1px solid #9fa8da; padding: 8px;">${lang.rating}</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries({
                    discipline, cooperation, learning, sports, participation,
                    punctuality, leadership, neatness, respect, creativity
                  }).map(([key, val], idx) => {
                    const rowBg = idx % 2 === 0 ? '#fafafa' : '#ffffff';
                    return `
                    <tr style="background: ${rowBg};">
                      <td style="border: 1px solid #e0e0e0; padding: 6px; color: #424242;">${lang.behaviorAspects[key]}</td>
                      <td style="border: 1px solid #e0e0e0; padding: 6px; text-align: center; font-weight: bold; color: #424242;">${val}</td>
                    </tr>`}).join('')}
                  <tr style="background: #ffffff;"><td colspan="2" style="border: 1px solid #e0e0e0; padding: 8px;"><strong style="color: #424242;">${lang.remarks}</strong> <span style="color: #424242;">${remark}</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style="margin-top: 6px; font-size: 14px; line-height: 1.6; color: #424242;">
            <p style="padding: 8px 0;"><strong style="color: #1565c0;">${lang.termDates}:</strong> ${lang.closes} <strong style="color: #1565c0;">${closingDate}</strong> ${lang.reopens} <strong style="color: #1565c0;">${openingDate}</strong>.</p>

            <p style="padding: 4px 0;"><strong style="color: #1565c0;">${lang.requirements}:</strong></p>
            <ul style="margin-left: 5px; margin-top: -15px; color: #424242;">${formattedRequirements}</ul>

            <p style="padding: 5px 0; margin-top: 4px;">
              <strong style="color: #1565c0;">${lang.classComment}:</strong> 
              ${lang.classCommentIntro(
                `<i>${student.name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</i>`
              )} ${
                student.point <= 12 ? lang.performanceLevels.strong :
                student.point <= 21 ? lang.performanceLevels.moderate :
                lang.performanceLevels.weak
              } ${lang.academicPerformance} ${lang.thisTerm}
              ${
                student.point <= 28
                  ? lang.encouragement.encouraged
                  : lang.encouragement.necessary
              }
              <br><strong style="color: #1565c0;">${lang.signature}:</strong> ${classTeacher} &nbsp; | &nbsp; <strong style="color: #1565c0;">${lang.date}:</strong> ${closingDate}
            </p>

            <p style="padding: 10px 0; margin-top: 8px;">
              <strong style="color: #1565c0;">${lang.headComment}:</strong> 
              ${
                student.point <= 13
                  ? lang.remarksList.outstanding
                  : student.point <= 17
                  ? lang.remarksList.commendable
                  : student.point <= 24
                  ? lang.remarksList.satisfactory
                  : lang.remarksList.followup
              } ${lang.headSupportNote}
              <br><strong style="color: #1565c0;">${lang.signature}:</strong> ${headmaster} &nbsp; | &nbsp; <strong style="color: #1565c0;">${lang.date}:</strong> ${closingDate}
            </p>


          </div>
        </div>
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
      scale: 2,             
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
