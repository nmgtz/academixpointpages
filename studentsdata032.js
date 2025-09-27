let selectedClass = '';
let nmgFURL = '';

const NMG_SCRIPT_ = 'https://script.google.com/macros/s/AKfycbxaMpVdGPtkJB94ADOer_FFNrVMIEuxLh4P-knZhBSx5YysMKg2tESUaPR5nhhExWsW/exec';
const CACHE_KEY = 'academixpoint_schools';
const CACHE_DURATION = 24 * 60 * 60 * 1000;

let currentSchoolData = null;
let allSchoolsData = null;
window.universalCodeUrl = null;

function getNameAPI() {
    return (currentSchoolData && currentSchoolData.urls && currentSchoolData.urls.teachers) 
        ? currentSchoolData.urls.teachers 
        : sendNamesStdURls;
}

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
    const pageHasnmgFurls = typeof nmgFurls !== 'undefined' && nmgFurls !== null;
    
    if (currentSchoolData && currentSchoolData.urls) { 
        log('✅ Server data found - using server URLs');
        
        if (pageHasnmgFurls && typeof nmgFurls === 'object') {
            nmgFurls['FORM-ONE'] = currentSchoolData.urls.formOne;
            nmgFurls['FORM-TWO'] = currentSchoolData.urls.formTwo;
            nmgFurls['FORM-THREE'] = currentSchoolData.urls.formThree;
            nmgFurls['FORM-FOUR'] = currentSchoolData.urls.formFour;
        } else {
            window.nmgFurls = { 
                'FORM-ONE': currentSchoolData.urls.formOne,
                'FORM-TWO': currentSchoolData.urls.formTwo,
                'FORM-THREE': currentSchoolData.urls.formThree,
                'FORM-FOUR': currentSchoolData.urls.formFour 
            };
        }
        
    } else {
        log('⚠️ No server data found');
        
        if (pageHasnmgFurls) {
            log('✅ Using page fallback URLs');
        } else {
            log('❌ No URLs available - neither server nor page');
            window.nmgFurls = null;
        }
    }
    
    return typeof nmgFurls !== 'undefined' ? nmgFurls : null;
}

const classSelector = document.getElementById('classSelector');

classSelector.addEventListener('change', () => {
  selectedClass = classSelector.value;
  if (nmgFurls[selectedClass]) {
    nmgFURL = nmgFurls[selectedClass];
    console.log('Selected Class:', selectedClass);
  } else {
    console.warn('Please it cannot access the intended Url');
  }
});

window.showSubjectDiv = function() {
  const subjectDiv = document.querySelector('.mySubject');
  const classSelectorContainer = document.getElementById('classSelectorContainer');
  const addSubjectsBtn = document.getElementById('addSubjectsBtn');
  const showDataBtn = document.getElementById('showDataBtn');

  // Show class dropdown
  if (classSelectorContainer) classSelectorContainer.style.display = 'block';

  // Toggle visibility of subjectDiv
  subjectDiv.style.display = subjectDiv.style.display === 'none' || subjectDiv.style.display === ''
    ? 'block'
    : 'none';

  if (addSubjectsBtn) addSubjectsBtn.style.display = 'none';
  if (showDataBtn) showDataBtn.style.display = 'none';
}

window.showDataSent = function() {
  const subjectDiv = document.querySelector('.mySubject');
  const classSelectorContainer = document.getElementById('classSelectorContainer');
  const addSubjectsBtn = document.getElementById('addSubjectsBtn');
  const showDataBtn = document.getElementById('showDataBtn');
  const button1 = document.getElementById('button1');

  window.showLoadingOverlay();

  
  if (subjectDiv) subjectDiv.style.display = 'none';

 
  if (classSelectorContainer) classSelectorContainer.style.display = 'block';

  if (addSubjectsBtn) addSubjectsBtn.style.display = 'none';
  if (showDataBtn) showDataBtn.style.display = 'none';
  if (button1) button1.style.display = 'block';

  window.getData();
  setTimeout(() => {
    window.hideLoadingOverlay();
  }, 5000);
}

window.showLoadingOverlay = function() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'flex';
}

window.hideLoadingOverlay = function() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'none';
}

const button1 = document.getElementById('button1');
button1.addEventListener("click", (e) => {
  window.showLoadingOverlay();
  window.getData();
  setTimeout(() => {
    window.hideLoadingOverlay();
  }, 5000);
});

const subjects = [
  { id: "Civics", name: "CIV" },
  { id: "Kiswahili", name: "KISW" },
  { id: "Comp. Studies", name: "CS" },
  { id: "ICT", name: "ICT" },
  { id: "English Language", name: "ENG" },
  { id: "Basic Mathematics", name: "B/MATH" },
  { id: "Biology", name: "BIO" },
  { id: "Physics", name: "PHY" },
  { id: "Chemistry", name: "CHEM" },
  { id: "Geography", name: "GEO" },
  { id: "History", name: "HIST" },
  { id: "Historia ya Tanzania na Maadili", name: "H/ TZ NA MAADILI" },
  { id: "BUSINESS STUDIES", name: "BUSINESS STUDIES" },
  { id: "Bookkeeping", name: "B/K" },
  { id: "Commerce", name: "COMM" },
  { id: "Typing and Information Processing", name: "TIP" },
  { id: "Engineering Science", name: "ENG.SCI" },
  { id: "Technical Drawing", name: "TD" },
  { id: "Building Construction", name: "BC" },
  { id: "Electrical Installation", name: "EI" },
  { id: "Mechanical Engineering", name: "MECH" },
  { id: "Agriculture", name: "AGR" },
  { id: "Food and Nutrition", name: "F&N" },
  { id: "Elimu Ya Dini Ya Kiislam", name: "EDK" },
  { id: "French", name: "FRE" },
  { id: "Physical Education", name: "PE" },
  { id: "Arabic", name: "ARB" },
  { id: "Literature in English", name: "LIT" },
  { id: "Fine Art", name: "F/ART" }
];

const maxSelection = 16;
let selectedSubjects = JSON.parse(localStorage.getItem('selectedSubjects')) || [];
const subjectList = document.getElementById('subjectList');
const selectedList = document.getElementById('selectedList');

// Create subject elements
subjects.forEach(subject => {
  const div = document.createElement('div');
  div.className = 'subject';
  div.textContent = subject.name;
  div.dataset.id = subject.id;

  // Check if already selected and add selected class
  if (selectedSubjects.find(s => s.id === subject.id)) {
    div.classList.add('selected');
  }

  div.addEventListener('click', () => window.toggleSubject(subject.id, subject.name, div));

  subjectList.appendChild(div);
});

// After creating subject elements, update selected subjects view
window.updateSelectedList();

window.toggleSubject = function(id, name, div) {
  const index = selectedSubjects.findIndex(s => s.id === id);

  if (index !== -1) {
    selectedSubjects.splice(index, 1);
    div.classList.remove('selected');
  } else {
    if (selectedSubjects.length >= maxSelection) {
      alert('You can only select up to 13 subjects.');
      return;
    }
    selectedSubjects.push({ id, name });
    div.classList.add('selected');
  }

  window.updateSelectedList();
  localStorage.setItem('selectedSubjects', JSON.stringify(selectedSubjects));
}

// Update the list of selected subjects
window.updateSelectedList = function() {
  selectedList.innerHTML = '';
  selectedSubjects.forEach((subject, index) => {
    const item = document.createElement('div');
    item.className = 'selected-subject';
    item.draggable = true;
    item.textContent = `${index + 1}. ${subject.name}`;
    item.dataset.index = index;

    item.addEventListener('dragstart', window.dragStart);
    item.addEventListener('dragover', window.dragOver);
    item.addEventListener('drop', window.drop);

    selectedList.appendChild(item);
  });
}

let dragStartIndex;

window.dragStart = function(e) {
  dragStartIndex = +e.target.dataset.index;
}

window.dragOver = function(e) {
  e.preventDefault();
}

window.drop = function(e) {
  const dropIndex = +e.target.dataset.index;
  const draggedItem = selectedSubjects[dragStartIndex];

  selectedSubjects.splice(dragStartIndex, 1);
  selectedSubjects.splice(dropIndex, 0, draggedItem);

  window.updateSelectedList();
  localStorage.setItem('selectedSubjects', JSON.stringify(selectedSubjects));
}

window.submitSubjects = async function() {
  if (!selectedClass) {
    alert("Please select a class before submitting subjects.");
    return;
  }
  if (!nmgFURL) {
    alert("Invalid class selected.");
    return;
  }
  const subjectNames = selectedSubjects.map(s => s.name);
  const formData = new URLSearchParams();
  formData.append('mode', 'header');
  subjectNames.forEach((name, index) => {
    formData.append(`subject${index + 1}`, name);
  });
  try {
    const res = await fetch(nmgFURL,{
      method : 'POST',
      headers : {'Content-Type' : 'application/x-www-form-urlencoded'},
      body : formData
    });
    if(res.ok) {
      window.showLoadingOverlay();
      const resData = await res.json();
      document.querySelector('.mySubject').textContent = 'Data Has been Successful Submited! Thank you for choosing our Product!';
      setTimeout(() => {
        window.hideLoadingOverlay();
      }, 5000);
      console.log('Success :: ', 'Data Submitted!');
      document.getElementById('button1').style.display = 'block';
    } else {
      console.log('Error101 :: ', 'something went wrong!');
    }
  } catch(err) {
    console.error('Error :: ', err.message);
  }
}

window.getData = async function() {
  try {
    const results = await fetch(nmgFURL);
    if(results.ok) {
      const resultsData = await results.json();

      const data = resultsData.content;
      const  status = resultsData.status;
      const message = resultsData.message;
      const headers = resultsData.contentHead;

      if (status === 'success') {
        const container = document.querySelector('.dataCont');
        container.innerHTML = `
          <h2>Student Details (Names,Gender and Subjects Per Student)</h2>
          <div class="table-wrapper">
            <table class="responsive-table">
              <thead>
                <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
              </thead>
              <tbody>
                 ${data.map(row => `
                    <tr>
                      ${headers.map((h, i) => 
                        `<td ${i >= 2 ? 'contenteditable="true"' : ''}>${row[h]}</td>`
                      ).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <button onclick="window.location.reload()" class="back-btn">Back & Edit Subjects</button>
            <button onclick="window.submitTableData()" class="submit-btn">Submit Students Subjects</button>
            <button onclick="window.getDataAndBuildUI()" class="submit-btn">Get Students Names per subjects</button>

          `;

        console.log('Congrats :', message);
        
      }
      else {
        console.log('Error101 :: ','an error Occured')
      }
    } else {
      console.log('Internal Error :: ','an Internal error Occured')
    }
  } catch(err) {
    console.error('Error :: ', err.message)
  }
}

window.submitTableData = async function() {
  const table = document.querySelector('.responsive-table');
  const rows = table.querySelectorAll('tbody tr');
  const payload = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const rowData = [];

    // Start from column index 2 (3rd column)
    for (let i = 2; i < cells.length; i++) {
      rowData.push(cells[i].innerText.trim());
    }

    payload.push(rowData);
  });

  // Encode and send using x-www-form-urlencoded
  const formData = new URLSearchParams();
  formData.append('mode', 'data');
  formData.append('data', JSON.stringify(payload));

  try {
    const response = await fetch(nmgFURL, {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const result = await response.json();
    if (result.status === 'success') {
      alert('Data successfully submitted!');
    } else {
      alert('Failed to submit: ' + result.message);
    }
  } catch (err) {
    console.error('Submission error:', err);
    alert('Something went wrong during submission.');
  }
}

let allData = []; 
let allHeaders = []; 

window.getDataAndBuildUI = async function() {
  if (!nmgFURL || !selectedClass) {
    alert("Please select a class first.");
    return;
  }
  try {
    const res = await fetch(nmgFURL);
    if (!res.ok) throw new Error("Fetch failed");

    const { content, contentHead, status } = await res.json();

    if (status === 'success') {
      allData = content;
      allHeaders = contentHead;

      const container = document.querySelector('.dataCont');
      container.innerHTML = ''; 

      
      const select = document.createElement('select');
      select.id = 'subjectSelect';
      select.onchange = window.handleSubjectSelection;

      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select Subject';
      select.appendChild(defaultOption);

      const subjects = contentHead.slice(2);
      subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        select.appendChild(option);
      });

      
      const resultDiv = document.createElement('div');
      resultDiv.className = 'resultContainer';

      
      container.appendChild(select);
      container.appendChild(resultDiv);

    } else {
      console.error("Server returned error status");
    }

  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

window.handleSubjectSelection = function() {
  const selectedSubject = document.getElementById("subjectSelect").value;
  if (!selectedSubject) return;

  const subjectIndex = allHeaders.indexOf(selectedSubject);
  const nameColumn = allHeaders[0]; // First column assumed to be names

  const filteredNames = allData
    .filter(row => row[selectedSubject] === 'V')
    .map(row => row[nameColumn]);

  window.displayFilteredNames(filteredNames, selectedSubject);
}

window.displayFilteredNames = function(names, subject) {
  const container = document.querySelector('.resultContainer');

  if (!container) {
    console.error('Container not found');
    return;
  }

  if (!names.length) {
    container.innerHTML = `<p>No entries found for "${subject}".</p>`;
    return;
  }

  // Visible table with scrollable container
  const visibleTable = `
    <br><div class="attendance-header">
  <h3>"${subject}" Examination Score Sheet</h3>
</div>

<div class="attendance-wrapper">
  <div class="table-scroll">
    <table class="attendance-table">
      <thead>
        <tr>
          <th>N/O</th>
          <th>Cand's Names</th>
          <th>Signature</th>
          <th>Marks</th>
        </tr>
      </thead>
      <tbody>
            ${names.map((name, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${name}</td>
                <td style="height: 30px;"></td>
                <td></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = `
    ${visibleTable}
   
  `;
}

window.showStudentsDiv = function() {
(function() {
  
  const nmgBody = document.querySelector('.nmg-body1');
       nmgBody.style.display= 'block';
  document.querySelector('.dataCont').innerHTML = nmgBody.innerHTML;
  const classButton = document.getElementById("classButtons");
const formContainer = document.querySelector(".form-container1");

  let savedFormType = ""; // to be used for fetch when showing submitted data

  function initializeForm(formType) {
    savedFormType = formType;
    const formRows = document.getElementById('formRows');
    const namesInput = document.getElementById('namesInput');
    const gendersInput = document.getElementById('gendersInput');
    const addRowBtn = document.getElementById('addRowBtn');
    const submitBtn = document.getElementById('submitBtn');
    const alertDiv = document.getElementById('alert');

    formRows.innerHTML = ''; // Clear old rows
    alertDiv.textContent = '';

    function addRow(name = '', gender = '') {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td contenteditable="true" placeholder="Full Name">${name}</td>
        <td contenteditable="true" placeholder="Gender">${gender}</td>
        <td><button class="delete-btn">Delete</button></td>
      `;
      formRows.appendChild(row);
      row.querySelector('.delete-btn').addEventListener('click', () => row.remove());
    }

    addRow(); 

    addRowBtn.onclick = () => addRow();

    function handlePaste(input, columnIndex) {
      input.addEventListener('paste', (event) => {
        event.preventDefault();
        const pasteData = (event.clipboardData || window.clipboardData).getData('text');
        const lines = pasteData.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        lines.forEach((line, index) => {
          const row = formRows.children[index];
          if (row) {
            row.children[columnIndex].textContent = line;
          } else {
            columnIndex === 0 ? addRow(line, '') : addRow('', line);
          }
        });
        input.value = '';
      });
    }

    handlePaste(namesInput, 0);
    handlePaste(gendersInput, 1);

    submitBtn.onclick = async (e) => {
      e.preventDefault();

      const rows = formRows.querySelectorAll('tr');
      const formData = new URLSearchParams();

      rows.forEach((row, i) => {
        const name = row.children[0].textContent.trim().toUpperCase();
        const gender = row.children[1].textContent.trim().toUpperCase();
        if (name && gender) {
          formData.append(`data[${i}][type]`, formType);
          formData.append(`data[${i}][fullname]`, name);
          formData.append(`data[${i}][sex]`, gender);
        }
      });

      if (!formData.toString()) {
        alertDiv.textContent = 'Please fill in at least one row before submitting.';
        alertDiv.style.color = 'red';
        return;
      }

      try {
        alertDiv.textContent = 'Submitting...';
        alertDiv.style.color = 'blue';
        const nameAPI = getNameAPI();
        const response = await fetch(nameAPI, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });

        if (!response.ok) throw new Error('Submission failed.');
          
       displayButton();

      } catch (err) {
        alertDiv.textContent = `Error: ${err.message}`;
        alertDiv.style.color = 'red';
      }
    };
  }
    
         function displayButton(showSuccess = true) {
  formContainer.innerHTML = '';

  if (showSuccess) {
    const successDiv = document.createElement('div');
    successDiv.textContent = '✅ Data has been successfully submitted!';
    Object.assign(successDiv.style, {
      color: 'green',
      padding: '20px',
      textAlign: 'center',
      fontSize: '18px',
      fontWeight: 'bold'
    });
    formContainer.appendChild(successDiv);
  }


const roleSelect = document.createElement('select');
roleSelect.innerHTML = `
  <option value="">🔽 Select Class</option>
  <option value="formOne">Form I</option>
  <option value="formTwo">Form II</option>
  <option value="formThree">Form III</option>
  <option value="formFour">Form IV</option>
`;
Object.assign(roleSelect.style, {
  display: 'block',
  margin: '10px auto',
  padding: '10px',
  fontSize: '16px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  maxWidth: '250px'
});

const viewBtn = document.createElement('button');
viewBtn.textContent = "📄 See Submitted Data";
Object.assign(viewBtn.style, {
  display: "block",
  padding: '10px 20px',
  margin: '10px auto',
  backgroundColor: '#007BFF',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '16px',
  cursor: 'pointer',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
});
const butn = document.createElement("button");
butn.textContent = "Back & Add Data to Classes";
butn.setAttribute('class','back-btn');
butn.onclick = () => window.location.reload();

           
formContainer.append(roleSelect, viewBtn,butn);
           
  viewBtn.addEventListener('click', async () => {
  const selectedRole = roleSelect.value;

  if (!selectedRole) {
    alert("Please select a class role to view submitted data.");
    return;
  }

  formContainer.innerHTML = '';
    window.showLoadingOverlay();
  try {
    const nameAPI = getNameAPI();
    const res = await fetch(`${nameAPI}?role=${selectedRole}`);
    const data = await res.json();
    
 setTimeout(() => {
    window.hideLoadingOverlay();
  }, 3000);
    
    if (!data.success || !data.Students?.length) {
      throw new Error("No submitted data found.");
    }

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginTop = "20px";

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr style="background-color: #007BFF; color: white;">
        <th style="padding: 10px; border: 1px solid #ccc;">N/O</th>
        <th style="padding: 10px; border: 1px solid #ccc;">Full Name</th>
        <th style="padding: 10px; border: 1px solid #ccc;">Sex</th>
        <th style="padding: 10px; border: 1px solid #ccc;">Role</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    data.Students.forEach((entry, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td  style="padding: 10px; border: 1px solid #ccc;">${i + 1}</td>
        <td contenteditable="true" style="padding: 10px; border: 1px solid #ccc;">${entry.fullName}</td>
        <td contenteditable="true" style="padding: 10px; border: 1px solid #ccc;">${entry.sex}</td>
        <td  style="padding: 10px; border: 1px solid #ccc;">${selectedRole}</td>
      `;
      tbody.appendChild(row);
    });
    
    const divBtn = document.createElement("div");
const backBtn = document.createElement("button");

backBtn.textContent = "🔙 Back to See Other Classes";
backBtn.className = "back-btn"; 
backBtn.onclick = () => displayButton(false);  
    
const butn = document.createElement("button");
butn.textContent = "Back & Add Data to Classes";
butn.setAttribute('class','back-btn');
butn.onclick = () => window.location.reload();
    
divBtn.appendChild(backBtn);
table.appendChild(tbody);
formContainer.appendChild(table);
formContainer.appendChild(divBtn);
formContainer.appendChild(butn);

  } catch (error) {
    const errorDiv = document.createElement("div");
    errorDiv.textContent = `⚠️ Failed to load data: ${error.message}`;
    Object.assign(errorDiv.style, {
      color: '#842029',
      fontSize: '16px',
      padding: '20px',
      textAlign: 'center',
      border: '1px solid #f5c2c7',
      backgroundColor: '#f8d7da',
      borderRadius: '8px',
      marginTop: '20px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
    });
    formContainer.appendChild(errorDiv);
  }
});
         
         }
         
  document.getElementById('checkBtn').addEventListener('click', (e) => {
    displayButton(false);
  });
         
  // Setup buttons
  document.querySelectorAll('.form-buttons').forEach(button => {
    button.addEventListener('click', e => {
      e.preventDefault();
      const formType = e.target.dataset.formType;
      classButton.style.display = "none";
      formContainer.style.display = "block";

      const instructions = document.getElementById('formInstructions');
      instructions.textContent = `Paste name on the left box and Gender on the right box for ${formType.toUpperCase()}`;

      initializeForm(formType);
    });
  });
         
 function showLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'flex';
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'none';
}

  })();

}
