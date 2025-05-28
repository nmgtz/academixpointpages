 
function showSubjectDiv() {
  const subjectDiv = document.querySelector('.mySubject');
  const addSubjectsBtn = document.getElementById('addSubjectsBtn');
  const showDataBtn = document.getElementById('showDataBtn');

  // Toggle visibility of subjectDiv
  if (subjectDiv.style.display === 'none' || subjectDiv.style.display === '') {
    subjectDiv.style.display = 'block';
  } else {
    subjectDiv.style.display = 'none';
  }

  if (addSubjectsBtn) addSubjectsBtn.style.display = 'none';
  if (showDataBtn) showDataBtn.style.display = 'none';
}


function showDataSent() {
  const subjectDiv = document.querySelector('.mySubject');
  const addSubjectsBtn = document.getElementById('addSubjectsBtn');
  const showDataBtn = document.getElementById('showDataBtn');
  const button1 = document.getElementById('button1');

  showLoadingOverlay();

 
  if (subjectDiv) subjectDiv.style.display = 'none';
  if (addSubjectsBtn) addSubjectsBtn.style.display = 'none';
  if (showDataBtn) showDataBtn.style.display = 'none';
  if (subjectDiv) subjectDiv.style.display = 'block';
    if (button1) button1.style.display = 'block';
     getData(); 
 
  setTimeout(() => {
    hideLoadingOverlay();
  }, 5000);
}

function showLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'flex';
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'none';
}


    button1.addEventListener("click", (e) => {
   
    
      getData();

});
    
   const subjects = [
  { id: "Civics", name: "CIV" },
  { id: "Kiswahili", name: "KISW" },
  { id: "English Language", name: "ENG" },
  { id: "Basic Mathematics", name: "B/MATH" },
  { id: "Biology", name: "BIO" },
  { id: "Physics", name: "PHY" },
  { id: "Chemistry", name: "CHEM" },
  { id: "Geography", name: "GEO" },
  { id: "History", name: "HIST" },
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

  div.addEventListener('click', () => toggleSubject(subject.id, subject.name, div));

  subjectList.appendChild(div);
});

// After creating subject elements, update selected subjects view
updateSelectedList();
    function toggleSubject(id, name, div) {
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

      updateSelectedList();
      localStorage.setItem('selectedSubjects', JSON.stringify(selectedSubjects));
    }

    // Update the list of selected subjects
    function updateSelectedList() {
      selectedList.innerHTML = '';
      selectedSubjects.forEach((subject, index) => {
        const item = document.createElement('div');
        item.className = 'selected-subject';
        item.draggable = true;
        item.textContent = `${index + 1}. ${subject.name}`;
        item.dataset.index = index;

        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragover', dragOver);
        item.addEventListener('drop', drop);

        selectedList.appendChild(item);
      });
    }

    let dragStartIndex;

    function dragStart(e) {
      dragStartIndex = +e.target.dataset.index;
    }

    function dragOver(e) {
      e.preventDefault();
    }

    function drop(e) {
      const dropIndex = +e.target.dataset.index;
      const draggedItem = selectedSubjects[dragStartIndex];

      selectedSubjects.splice(dragStartIndex, 1);
      selectedSubjects.splice(dropIndex, 0, draggedItem);

      updateSelectedList();
      localStorage.setItem('selectedSubjects', JSON.stringify(selectedSubjects));
    }

    async function submitSubjects() {
      
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
         showLoadingOverlay();
        const resData = await res.json();
        document.querySelector('.mySubject').textContent = 'Data Has been Successful Submited! Thank you for choosing our Product!';
          setTimeout(() => {
    hideLoadingOverlay();
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
   
    async function getData() {
  try {
    const results = await fetch(nmgFURL);
  if(results.ok) {
    const resultsData = await results.json();

    const data = resultsData.content;
    const  status = resultsData.status;
    const message = resultsData.message;
    const headers = resultsData.contentHead;

   if (status === 'success') {
  const container = document.querySelector('.mySubject');
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
          <button onclick="submitTableData()" class="submit-btn">Submit Students Subjects</button>
          <button onclick="getDataAndBuildUI()" class="submit-btn">Get Students Names per subjects</button>

        `;

  console.log('Congrats :', message);
  console.log('Congrats :', headers);
  console.log('Data from Server :', data);
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
async function submitTableData() {
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

async function getDataAndBuildUI() {
  try {
    const res = await fetch(nmgFURL);
    if (!res.ok) throw new Error("Fetch failed");

    const { content, contentHead, status } = await res.json();

    if (status === 'success') {
      allData = content;
      allHeaders = contentHead;

      const container = document.querySelector('.mySubject');
      container.innerHTML = ''; 

      
      const select = document.createElement('select');
      select.id = 'subjectSelect';
      select.onchange = handleSubjectSelection;

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

function handleSubjectSelection() {
  const selectedSubject = document.getElementById("subjectSelect").value;
  if (!selectedSubject) return;

  const subjectIndex = allHeaders.indexOf(selectedSubject);
  const nameColumn = allHeaders[0]; // First column assumed to be names

  const filteredNames = allData
    .filter(row => row[selectedSubject] === 'V')
    .map(row => row[nameColumn]);

  displayFilteredNames(filteredNames, selectedSubject);
}
function displayFilteredNames(names, subject) {
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

    
   
function showStudentsDiv() {
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

        const response = await fetch(sendNamesStdURls, {
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
    showLoadingOverlay();
  try {
    const res = await fetch(`${sendNamesStdURls}?role=${selectedRole}`);
    const data = await res.json();
    
 setTimeout(() => {
    hideLoadingOverlay();
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
