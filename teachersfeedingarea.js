   const classButton = document.getElementById("classButtons");
   const formContainer = document.querySelector(".form-container1");
    document.querySelectorAll('.form-buttons').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
      
      classButton.style.display = "none";
       formContainer.style.display = "block";

        const formId = e.target.id;
        if (formId === "formOne") {
     // Show the overlay message when the form button is clicked
        const overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        overlay.style.color = 'white';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.fontSize = '1.5em';
        overlay.innerText = 'Please wait...';
        document.body.appendChild(overlay);
 //Hide the overlay after 10 seconds
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 2000); // 2 seconds

      
             
const students = [];

let currentStudentIndex = parseInt(localStorage.getItem('currentStudentIndex')) || 0;
let studentMarks = JSON.parse(localStorage.getItem('studentMarks')) || {};


window.onload = function() {
  loadSavedData();
  //document.getElementById('totalStudents').innerText = students.length;
  updateProgress();
};
  


document.getElementById("goToStudentForm").addEventListener("click", (e) => {
  const teacherName = document.getElementById('teacherName').value;
  const subject = document.getElementById('subject').value;
  const examType = document.getElementById('examType').value;
  if (!teacherName || !subject || !examType) {
   alert('Please fill out all fields.');
    return;
  }

  localStorage.setItem('teacherName', teacherName);
  localStorage.setItem('subject', subject);
  localStorage.setItem('examType', examType);

  document.getElementById('teacherInfo').innerText = `Teacher: ${teacherName}, Subject: ${subject}, Exam Type: ${examType}`;
  displayStudent(currentStudentIndex);

  document.getElementById('teacherForm').style.display = 'none';
  document.getElementById('studentForm').style.display = 'block';
});

function displayStudent(index) {
  const student = students[index];
  document.getElementById('studentFullName').innerText = student.fullName;
  //document.getElementById('studentSex').innerText = student.sex;
  document.getElementById('marks').value = studentMarks[student.fullName] || '';

  // Explanation message to guide the user
  const explanationMessage = `
    Karibu! Tafadhali fuata hatua hizi kuingiza alama:
    <ol>
      <li>Jaza alama za mwanafunzi Kisha,</li>
      <li>Bonyeza kitufe cha "Next" kuhifadhi alama za mwanafunzi </li>
      <li>Endelea na mchakato huu kwa wanafunzi wote</li>
      <li>Baada ya kuingiza alama za wanafunzi wote, bonyeza "Submit" kutuma data kwa seva.</li>
      <li>Usitume matokeo kamahujajaza matokeo ya wanafunzi wako, na alama ni kuanzia "0 - 100", na "X" kwa mwanafunzi asiofanya mtihani</li>
    </ol>
    Hakikisha unaangalia tena alama kabla ya kutuma. Asante!
  `;

  // Get the explanation message container
  const messageElement = document.getElementById('expl-message');
  messageElement.innerHTML = explanationMessage;
  messageElement.style.display = 'none'; // Hide the message initially

  // Check if the toggle button already exists
  let toggleButton = document.getElementById('toggle-instructions');
  if (!toggleButton) {
    // Create and add the toggle button only if it doesn't exist
    toggleButton = document.createElement('button');
    toggleButton.innerText = 'SOMA MAELEKEZO'; // Start with "Show Instructions"
    toggleButton.id = 'toggle-instructions';
    toggleButton.style.marginTop = '10px';

    // Toggle function to show/hide the message
    toggleButton.onclick = function () {
      if (messageElement.style.display === 'none') {
        messageElement.style.display = 'block';
        toggleButton.innerText = 'FUNGA MAELEKEZO';
      } else {
        messageElement.style.display = 'none';
        toggleButton.innerText = 'SOMA MAELEKEZO';
      }
    };

    // Add the toggle button to the DOM
    messageElement.parentNode.insertBefore(toggleButton, messageElement.nextSibling);
  }

  // Reset toggle state on form submission
  document.querySelector('#studentInfo').addEventListener('submit', function () {
    messageElement.style.display = 'none'; // Hide the message
    toggleButton.innerText = 'SOMA MAELEKEZO'; // Reset toggle button state
  });
}


document.getElementById("saveMarksLocally").onclick = function() {
  const student = students[currentStudentIndex];
  const marks = document.getElementById('marks').value;
  const sanitizedMarks = marks.trim().toUpperCase();

  if (sanitizedMarks === '' || (sanitizedMarks !== 'X' && (isNaN(sanitizedMarks) || sanitizedMarks < 0 || sanitizedMarks > 100))) {
    displayErrorMessage('Please enter a valid number (0-100) or "X" for absent students.');
    return;
  }

  studentMarks[student.fullName] = sanitizedMarks;
  localStorage.setItem('studentMarks', JSON.stringify(studentMarks));
  showSuccessMessage(`Marks for ${student.fullName} have been saved locally!`);
  updateProgress();

  if (currentStudentIndex < students.length - 1) {
    nextStudent();
  }
}
  
// Updated submitAllMarks function
document.getElementById("submitAllMarks").onclick = function() {
  const teacherName = localStorage.getItem('teacherName');
  const subject = localStorage.getItem('subject');
  const examType = localStorage.getItem('examType');

  const studentNames = [];
  const marks = [];
  let markedStudents = 0; // Count students with valid marks

  // Validate student marks
  for (const [studentName, mark] of Object.entries(studentMarks)) {
    const sanitizedMark = mark.trim().toUpperCase();
    if (sanitizedMark === "X" || (!isNaN(sanitizedMark) && sanitizedMark >= 0 && sanitizedMark <= 100)) {
      studentNames.push(studentName);
      marks.push(sanitizedMark);
      markedStudents++;
    }
  }

  // Check if no students are marked
  if (markedStudents === 0) {
    displayErrorMessage('No students have been marked. Please mark at least one student before submitting.');
    return;
  }

  // Show confirmation modal
  showModal("marks", markedStudents, () => {
    const formData = new URLSearchParams();
    formData.append('teacherName', teacherName);
    formData.append('subject', subject);
    formData.append('examType', examType);
    formData.append('data[studentName]', studentNames.join(','));
    formData.append('data[marks]', marks.join(','));

    fetch(scriptUrlOne, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        console.log(`Response Status: ${response.status}`);
        return response.text();
      })
      .then(responseText => {
        console.log('Server response:', responseText);
        showSuccessMessage('All marked students\' marks have been submitted successfully!');
      })
      .catch(error => {
        console.error('Submission error:', error);
        displayErrorMessage('Error submitting marks. Please try again.');
      });
  });
}

// Modal Handler Function
function showModal(actionType, markedStudents, onConfirm) {
  const modal = document.getElementById("confirmation-modal");
  const confirmButton = document.getElementById("confirm-action");
  const cancelButton = document.getElementById("cancel-action");
  const confirmationMessage = document.getElementById("confirmation-message");

  // Set modal message based on action type
  if (actionType === "marks") {
    confirmationMessage.textContent = `You are about to submit marks for ${markedStudents} students. Do you want to proceed?`;
  } else if (actionType === "clearAll") {
    confirmationMessage.textContent = "This action will permanently clear all data. Are you sure you want to proceed?";
  } else {
    confirmationMessage.textContent = "Are you sure you want to proceed?";
  }

  // Display modal
  modal.style.display = "block";

  // Handle confirm action
  confirmButton.onclick = function () {
    console.log("Action confirmed. Executing callback...");
    onConfirm();
    modal.style.display = "none"; // Close modal
  };

  // Handle cancel action
  cancelButton.onclick = function () {
    console.log("Action canceled.");
    showSuccessMessage(`${actionType === "marks" ? "Submission" : actionType === "clearAll" ? "Clear All" : "Action"} canceled by user.`);
    modal.style.display = "none"; // Close modal
  };
}
  
function displayErrorMessage(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.innerText = message;
  errorMessage.style.display = 'block';
  setTimeout(() => { errorMessage.style.display = 'none'; }, 3000);
}

function showSuccessMessage(message) {
  const successMessage = document.getElementById('successMessage');
  successMessage.innerText = message;
  successMessage.style.display = 'block';
  setTimeout(() => { successMessage.style.display = 'none'; }, 3000);
}

function updateProgress() {
  const totalStudents = students.length;
  const completed = Object.keys(studentMarks).length;
  const progressPercent = (completed / totalStudents) * 100;

  document.getElementById('progress').style.width = progressPercent + '%';
  document.getElementById('progressText').innerText = completed;
}

function nextStudent() {
  if (currentStudentIndex < students.length - 1) {
    currentStudentIndex++;
    localStorage.setItem('currentStudentIndex', currentStudentIndex);
    displayStudent(currentStudentIndex);
  }
}

document.getElementById("previousStudent").onclick = function() {
  if (currentStudentIndex > 0) {
    currentStudentIndex--;
    localStorage.setItem('currentStudentIndex', currentStudentIndex);
    displayStudent(currentStudentIndex);
  }
}

function loadSavedData() {
  const teacherName = localStorage.getItem('teacherName');
  const subject = localStorage.getItem('subject');
  const examType = localStorage.getItem('examType');

  if (teacherName && subject && examType) {
    document.getElementById('teacherForm').style.display = 'none';
    document.getElementById('studentForm').style.display = 'block';

    document.getElementById('teacherInfo').innerText = `Teacher: ${teacherName}, Subject: ${subject}, Exam Type: ${examType}`;
    displayStudent(currentStudentIndex);
  }
}

document.getElementById("clearAll").onclick = function() {
  showModal("clearAll", null, () => {
    // Logic to clear data
    studentMarks = {};
    currentStudentIndex = 0;
    localStorage.clear();
    updateProgress();
    displayStudent(currentStudentIndex);

    showSuccessMessage("All data has been cleared successfully!");
  });
}
// Function to fetch teacher names and student names from the web app
function fetchTeacherAndStudentNames(role = null) {
  // Construct the URL with the role parameter if provided
  const url = role ? `${appScriptUrl}?role=${role}` : appScriptUrl;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Store teachers in localStorage as a fallback
      localStorage.setItem('teachers', JSON.stringify(data.Teachers));

      // Populate the teacher dropdown with the data from the 'Teachers' array
      populateTeacherDropdown(data.Teachers);

      // If role is provided, handle students
      if (role && data.Students) {
        // Populate the student dropdown with the data from the 'Students' array
        data.Students.forEach(student => {
          students.push({ fullName: student });
        });
      }
    })
    .catch(() => {
      // On failure, use the fallback data from localStorage for teachers
      const fallbackTeachers = JSON.parse(localStorage.getItem('teachers') || '[]');
      if (fallbackTeachers.length > 0) {
        populateTeacherDropdown(fallbackTeachers);
      } else {
        console.error('Failed to fetch teachers and no fallback data available.');
      }
    });
}



// Function to populate the teacher dropdown
function populateTeacherDropdown(teachers) {
  const teacherSelect = document.getElementById('teacherName');
  teacherSelect.innerHTML = '<option value="" disabled selected>Select Teacher Name</option>';  // Reset the dropdown

  // Loop through each teacher name and create an option element
  teachers.forEach(teacher => {
    const option = document.createElement('option');
    option.value = teacher;
    option.textContent = teacher;
    teacherSelect.appendChild(option);
  });
}
  
 
 // Fetch teacher names when the page loads
     fetchTeacherAndStudentNames('formOne');
  
        } else if(formId === "formTwo") {
     // Show the overlay message when the form button is clicked
        const overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        overlay.style.color = 'white';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.fontSize = '1.5em';
        overlay.innerText = 'Please wait...';
        document.body.appendChild(overlay);
 //Hide the overlay after 10 seconds
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 2000); // 2 seconds

      
             
const students = [];

let currentStudentIndex = parseInt(localStorage.getItem('currentStudentIndex')) || 0;
let studentMarks = JSON.parse(localStorage.getItem('studentMarks')) || {};


window.onload = function() {
  loadSavedData();
  //document.getElementById('totalStudents').innerText = students.length;
  updateProgress();
};
  


document.getElementById("goToStudentForm").addEventListener("click", (e) => {
  const teacherName = document.getElementById('teacherName').value;
  const subject = document.getElementById('subject').value;
  const examType = document.getElementById('examType').value;
  if (!teacherName || !subject || !examType) {
   alert('Please fill out all fields.');
    return;
  }

  localStorage.setItem('teacherName', teacherName);
  localStorage.setItem('subject', subject);
  localStorage.setItem('examType', examType);

  document.getElementById('teacherInfo').innerText = `Teacher: ${teacherName}, Subject: ${subject}, Exam Type: ${examType}`;
  displayStudent(currentStudentIndex);

  document.getElementById('teacherForm').style.display = 'none';
  document.getElementById('studentForm').style.display = 'block';
});

function displayStudent(index) {
  const student = students[index];
  document.getElementById('studentFullName').innerText = student.fullName;
  //document.getElementById('studentSex').innerText = student.sex;
  document.getElementById('marks').value = studentMarks[student.fullName] || '';

  // Explanation message to guide the user
  const explanationMessage = `
    Karibu! Tafadhali fuata hatua hizi kuingiza alama:
    <ol>
      <li>Jaza alama za mwanafunzi Kisha,</li>
      <li>Bonyeza kitufe cha "Next" kuhifadhi alama za mwanafunzi </li>
      <li>Endelea na mchakato huu kwa wanafunzi wote</li>
      <li>Baada ya kuingiza alama za wanafunzi wote, bonyeza "Submit" kutuma data kwa seva.</li>
      <li>Usitume matokeo kamahujajaza matokeo ya wanafunzi wako, na alama ni kuanzia "0 - 100", na "X" kwa mwanafunzi asiofanya mtihani</li>
    </ol>
    Hakikisha unaangalia tena alama kabla ya kutuma. Asante!
  `;

  // Get the explanation message container
  const messageElement = document.getElementById('expl-message');
  messageElement.innerHTML = explanationMessage;
  messageElement.style.display = 'none'; // Hide the message initially

  // Check if the toggle button already exists
  let toggleButton = document.getElementById('toggle-instructions');
  if (!toggleButton) {
    // Create and add the toggle button only if it doesn't exist
    toggleButton = document.createElement('button');
    toggleButton.innerText = 'SOMA MAELEKEZO'; // Start with "Show Instructions"
    toggleButton.id = 'toggle-instructions';
    toggleButton.style.marginTop = '10px';

    // Toggle function to show/hide the message
    toggleButton.onclick = function () {
      if (messageElement.style.display === 'none') {
        messageElement.style.display = 'block';
        toggleButton.innerText = 'FUNGA MAELEKEZO';
      } else {
        messageElement.style.display = 'none';
        toggleButton.innerText = 'SOMA MAELEKEZO';
      }
    };

    // Add the toggle button to the DOM
    messageElement.parentNode.insertBefore(toggleButton, messageElement.nextSibling);
  }

  // Reset toggle state on form submission
  document.querySelector('#studentInfo').addEventListener('submit', function () {
    messageElement.style.display = 'none'; // Hide the message
    toggleButton.innerText = 'SOMA MAELEKEZO'; // Reset toggle button state
  });
}


document.getElementById("saveMarksLocally").onclick = function() {
  const student = students[currentStudentIndex];
  const marks = document.getElementById('marks').value;
  const sanitizedMarks = marks.trim().toUpperCase();

  if (sanitizedMarks === '' || (sanitizedMarks !== 'X' && (isNaN(sanitizedMarks) || sanitizedMarks < 0 || sanitizedMarks > 100))) {
    displayErrorMessage('Please enter a valid number (0-100) or "X" for absent students.');
    return;
  }

  studentMarks[student.fullName] = sanitizedMarks;
  localStorage.setItem('studentMarks', JSON.stringify(studentMarks));
  showSuccessMessage(`Marks for ${student.fullName} have been saved locally!`);
  updateProgress();

  if (currentStudentIndex < students.length - 1) {
    nextStudent();
  }
}
  
// Updated submitAllMarks function
document.getElementById("submitAllMarks").onclick = function() {
  const teacherName = localStorage.getItem('teacherName');
  const subject = localStorage.getItem('subject');
  const examType = localStorage.getItem('examType');

  const studentNames = [];
  const marks = [];
  let markedStudents = 0; // Count students with valid marks

  // Validate student marks
  for (const [studentName, mark] of Object.entries(studentMarks)) {
    const sanitizedMark = mark.trim().toUpperCase();
    if (sanitizedMark === "X" || (!isNaN(sanitizedMark) && sanitizedMark >= 0 && sanitizedMark <= 100)) {
      studentNames.push(studentName);
      marks.push(sanitizedMark);
      markedStudents++;
    }
  }

  // Check if no students are marked
  if (markedStudents === 0) {
    displayErrorMessage('No students have been marked. Please mark at least one student before submitting.');
    return;
  }

  // Show confirmation modal
  showModal("marks", markedStudents, () => {

    const formData = new URLSearchParams();
    formData.append('teacherName', teacherName);
    formData.append('subject', subject);
    formData.append('examType', examType);
    formData.append('data[studentName]', studentNames.join(','));
    formData.append('data[marks]', marks.join(','));

    fetch(scriptUrlTwo, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        console.log(`Response Status: ${response.status}`);
        return response.text();
      })
      .then(responseText => {
        console.log('Server response:', responseText);
        showSuccessMessage('All marked students\' marks have been submitted successfully!');
      })
      .catch(error => {
        console.error('Submission error:', error);
        displayErrorMessage('Error submitting marks. Please try again.');
      });
  });
}

// Modal Handler Function
function showModal(actionType, markedStudents, onConfirm) {
  const modal = document.getElementById("confirmation-modal");
  const confirmButton = document.getElementById("confirm-action");
  const cancelButton = document.getElementById("cancel-action");
  const confirmationMessage = document.getElementById("confirmation-message");

  // Set modal message based on action type
  if (actionType === "marks") {
    confirmationMessage.textContent = `You are about to submit marks for ${markedStudents} students. Do you want to proceed?`;
  } else if (actionType === "clearAll") {
    confirmationMessage.textContent = "This action will permanently clear all data. Are you sure you want to proceed?";
  } else {
    confirmationMessage.textContent = "Are you sure you want to proceed?";
  }

  // Display modal
  modal.style.display = "block";

  // Handle confirm action
  confirmButton.onclick = function () {
    console.log("Action confirmed. Executing callback...");
    onConfirm();
    modal.style.display = "none"; // Close modal
  };

  // Handle cancel action
  cancelButton.onclick = function () {
    console.log("Action canceled.");
    showSuccessMessage(`${actionType === "marks" ? "Submission" : actionType === "clearAll" ? "Clear All" : "Action"} canceled by user.`);
    modal.style.display = "none"; // Close modal
  };
}
  
function displayErrorMessage(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.innerText = message;
  errorMessage.style.display = 'block';
  setTimeout(() => { errorMessage.style.display = 'none'; }, 3000);
}

function showSuccessMessage(message) {
  const successMessage = document.getElementById('successMessage');
  successMessage.innerText = message;
  successMessage.style.display = 'block';
  setTimeout(() => { successMessage.style.display = 'none'; }, 3000);
}

function updateProgress() {
  const totalStudents = students.length;
  const completed = Object.keys(studentMarks).length;
  const progressPercent = (completed / totalStudents) * 100;

  document.getElementById('progress').style.width = progressPercent + '%';
  document.getElementById('progressText').innerText = completed;
}

function nextStudent() {
  if (currentStudentIndex < students.length - 1) {
    currentStudentIndex++;
    localStorage.setItem('currentStudentIndex', currentStudentIndex);
    displayStudent(currentStudentIndex);
  }
}

document.getElementById("previousStudent").onclick = function() {
  if (currentStudentIndex > 0) {
    currentStudentIndex--;
    localStorage.setItem('currentStudentIndex', currentStudentIndex);
    displayStudent(currentStudentIndex);
  }
}

function loadSavedData() {
  const teacherName = localStorage.getItem('teacherName');
  const subject = localStorage.getItem('subject');
  const examType = localStorage.getItem('examType');

  if (teacherName && subject && examType) {
    document.getElementById('teacherForm').style.display = 'none';
    document.getElementById('studentForm').style.display = 'block';

    document.getElementById('teacherInfo').innerText = `Teacher: ${teacherName}, Subject: ${subject}, Exam Type: ${examType}`;
    displayStudent(currentStudentIndex);
  }
}

document.getElementById("clearAll").onclick = function() {
  showModal("clearAll", null, () => {
    // Logic to clear data
    studentMarks = {};
    currentStudentIndex = 0;
    localStorage.clear();
    updateProgress();
    displayStudent(currentStudentIndex);

    showSuccessMessage("All data has been cleared successfully!");
  });
}
// Function to fetch teacher names and student names from the web app
function fetchTeacherAndStudentNames(role = null) {
  // Construct the URL with the role parameter if provided
  const url = role ? `${appScriptUrl}?role=${role}` : appScriptUrl;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Store teachers in localStorage as a fallback
      localStorage.setItem('teachers', JSON.stringify(data.Teachers));

      // Populate the teacher dropdown with the data from the 'Teachers' array
      populateTeacherDropdown(data.Teachers);

      // If role is provided, handle students
      if (role && data.Students) {
        // Populate the student dropdown with the data from the 'Students' array
        data.Students.forEach(student => {
          students.push({ fullName: student });
        });
      }
    })
    .catch(() => {
      // On failure, use the fallback data from localStorage for teachers
      const fallbackTeachers = JSON.parse(localStorage.getItem('teachers') || '[]');
      if (fallbackTeachers.length > 0) {
        populateTeacherDropdown(fallbackTeachers);
      } else {
        console.error('Failed to fetch teachers and no fallback data available.');
      }
    });
}



// Function to populate the teacher dropdown
function populateTeacherDropdown(teachers) {
  const teacherSelect = document.getElementById('teacherName');
  teacherSelect.innerHTML = '<option value="" disabled selected>Select Teacher Name</option>';  // Reset the dropdown

  // Loop through each teacher name and create an option element
  teachers.forEach(teacher => {
    const option = document.createElement('option');
    option.value = teacher;
    option.textContent = teacher;
    teacherSelect.appendChild(option);
  });
}
  
 
 // Fetch teacher names when the page loads
     fetchTeacherAndStudentNames('formTwo');
  
        } else if(formId === "formThree") {
     // Show the overlay message when the form button is clicked
        const overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        overlay.style.color = 'white';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.fontSize = '1.5em';
        overlay.innerText = 'Please wait...';
        document.body.appendChild(overlay);
 //Hide the overlay after 10 seconds
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 2000); // 2 seconds

      
             
const students = [];

let currentStudentIndex = parseInt(localStorage.getItem('currentStudentIndex')) || 0;
let studentMarks = JSON.parse(localStorage.getItem('studentMarks')) || {};


window.onload = function() {
  loadSavedData();
  //document.getElementById('totalStudents').innerText = students.length;
  updateProgress();
};
  


document.getElementById("goToStudentForm").addEventListener("click", (e) => {
  const teacherName = document.getElementById('teacherName').value;
  const subject = document.getElementById('subject').value;
  const examType = document.getElementById('examType').value;
  if (!teacherName || !subject || !examType) {
   alert('Please fill out all fields.');
    return;
  }

  localStorage.setItem('teacherName', teacherName);
  localStorage.setItem('subject', subject);
  localStorage.setItem('examType', examType);

  document.getElementById('teacherInfo').innerText = `Teacher: ${teacherName}, Subject: ${subject}, Exam Type: ${examType}`;
  displayStudent(currentStudentIndex);

  document.getElementById('teacherForm').style.display = 'none';
  document.getElementById('studentForm').style.display = 'block';
});

function displayStudent(index) {
  const student = students[index];
  document.getElementById('studentFullName').innerText = student.fullName;
  //document.getElementById('studentSex').innerText = student.sex;
  document.getElementById('marks').value = studentMarks[student.fullName] || '';

  // Explanation message to guide the user
  const explanationMessage = `
    Karibu! Tafadhali fuata hatua hizi kuingiza alama:
    <ol>
      <li>Jaza alama za mwanafunzi Kisha,</li>
      <li>Bonyeza kitufe cha "Next" kuhifadhi alama za mwanafunzi </li>
      <li>Endelea na mchakato huu kwa wanafunzi wote</li>
      <li>Baada ya kuingiza alama za wanafunzi wote, bonyeza "Submit" kutuma data kwa seva.</li>
      <li>Usitume matokeo kamahujajaza matokeo ya wanafunzi wako, na alama ni kuanzia "0 - 100", na "X" kwa mwanafunzi asiofanya mtihani</li>
    </ol>
    Hakikisha unaangalia tena alama kabla ya kutuma. Asante!
  `;

  // Get the explanation message container
  const messageElement = document.getElementById('expl-message');
  messageElement.innerHTML = explanationMessage;
  messageElement.style.display = 'none'; // Hide the message initially

  // Check if the toggle button already exists
  let toggleButton = document.getElementById('toggle-instructions');
  if (!toggleButton) {
    // Create and add the toggle button only if it doesn't exist
    toggleButton = document.createElement('button');
    toggleButton.innerText = 'SOMA MAELEKEZO'; // Start with "Show Instructions"
    toggleButton.id = 'toggle-instructions';
    toggleButton.style.marginTop = '10px';

    // Toggle function to show/hide the message
    toggleButton.onclick = function () {
      if (messageElement.style.display === 'none') {
        messageElement.style.display = 'block';
        toggleButton.innerText = 'FUNGA MAELEKEZO';
      } else {
        messageElement.style.display = 'none';
        toggleButton.innerText = 'SOMA MAELEKEZO';
      }
    };

    // Add the toggle button to the DOM
    messageElement.parentNode.insertBefore(toggleButton, messageElement.nextSibling);
  }

  // Reset toggle state on form submission
  document.querySelector('#studentInfo').addEventListener('submit', function () {
    messageElement.style.display = 'none'; // Hide the message
    toggleButton.innerText = 'SOMA MAELEKEZO'; // Reset toggle button state
  });
}


document.getElementById("saveMarksLocally").onclick = function() {
  const student = students[currentStudentIndex];
  const marks = document.getElementById('marks').value;
  const sanitizedMarks = marks.trim().toUpperCase();

  if (sanitizedMarks === '' || (sanitizedMarks !== 'X' && (isNaN(sanitizedMarks) || sanitizedMarks < 0 || sanitizedMarks > 100))) {
    displayErrorMessage('Please enter a valid number (0-100) or "X" for absent students.');
    return;
  }

  studentMarks[student.fullName] = sanitizedMarks;
  localStorage.setItem('studentMarks', JSON.stringify(studentMarks));
  showSuccessMessage(`Marks for ${student.fullName} have been saved locally!`);
  updateProgress();

  if (currentStudentIndex < students.length - 1) {
    nextStudent();
  }
}
  
// Updated submitAllMarks function
document.getElementById("submitAllMarks").onclick = function() {
  const teacherName = localStorage.getItem('teacherName');
  const subject = localStorage.getItem('subject');
  const examType = localStorage.getItem('examType');

  const studentNames = [];
  const marks = [];
  let markedStudents = 0; // Count students with valid marks

  // Validate student marks
  for (const [studentName, mark] of Object.entries(studentMarks)) {
    const sanitizedMark = mark.trim().toUpperCase();
    if (sanitizedMark === "X" || (!isNaN(sanitizedMark) && sanitizedMark >= 0 && sanitizedMark <= 100)) {
      studentNames.push(studentName);
      marks.push(sanitizedMark);
      markedStudents++;
    }
  }

  // Check if no students are marked
  if (markedStudents === 0) {
    displayErrorMessage('No students have been marked. Please mark at least one student before submitting.');
    return;
  }

  // Show confirmation modal
  showModal("marks", markedStudents, () => {
    const formData = new URLSearchParams();
    formData.append('teacherName', teacherName);
    formData.append('subject', subject);
    formData.append('examType', examType);
    formData.append('data[studentName]', studentNames.join(','));
    formData.append('data[marks]', marks.join(','));

    fetch(scriptUrlThree, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        console.log(`Response Status: ${response.status}`);
        return response.text();
      })
      .then(responseText => {
        console.log('Server response:', responseText);
        showSuccessMessage('All marked students\' marks have been submitted successfully!');
      })
      .catch(error => {
        console.error('Submission error:', error);
        displayErrorMessage('Error submitting marks. Please try again.');
      });
  });
}

// Modal Handler Function
function showModal(actionType, markedStudents, onConfirm) {
  const modal = document.getElementById("confirmation-modal");
  const confirmButton = document.getElementById("confirm-action");
  const cancelButton = document.getElementById("cancel-action");
  const confirmationMessage = document.getElementById("confirmation-message");

  // Set modal message based on action type
  if (actionType === "marks") {
    confirmationMessage.textContent = `You are about to submit marks for ${markedStudents} students. Do you want to proceed?`;
  } else if (actionType === "clearAll") {
    confirmationMessage.textContent = "This action will permanently clear all data. Are you sure you want to proceed?";
  } else {
    confirmationMessage.textContent = "Are you sure you want to proceed?";
  }

  // Display modal
  modal.style.display = "block";

  // Handle confirm action
  confirmButton.onclick = function () {
    console.log("Action confirmed. Executing callback...");
    onConfirm();
    modal.style.display = "none"; // Close modal
  };

  // Handle cancel action
  cancelButton.onclick = function () {
    console.log("Action canceled.");
    showSuccessMessage(`${actionType === "marks" ? "Submission" : actionType === "clearAll" ? "Clear All" : "Action"} canceled by user.`);
    modal.style.display = "none"; // Close modal
  };
}
  
function displayErrorMessage(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.innerText = message;
  errorMessage.style.display = 'block';
  setTimeout(() => { errorMessage.style.display = 'none'; }, 3000);
}

function showSuccessMessage(message) {
  const successMessage = document.getElementById('successMessage');
  successMessage.innerText = message;
  successMessage.style.display = 'block';
  setTimeout(() => { successMessage.style.display = 'none'; }, 3000);
}

function updateProgress() {
  const totalStudents = students.length;
  const completed = Object.keys(studentMarks).length;
  const progressPercent = (completed / totalStudents) * 100;

  document.getElementById('progress').style.width = progressPercent + '%';
  document.getElementById('progressText').innerText = completed;
}

function nextStudent() {
  if (currentStudentIndex < students.length - 1) {
    currentStudentIndex++;
    localStorage.setItem('currentStudentIndex', currentStudentIndex);
    displayStudent(currentStudentIndex);
  }
}

document.getElementById("previousStudent").onclick = function() {
  if (currentStudentIndex > 0) {
    currentStudentIndex--;
    localStorage.setItem('currentStudentIndex', currentStudentIndex);
    displayStudent(currentStudentIndex);
  }
}

function loadSavedData() {
  const teacherName = localStorage.getItem('teacherName');
  const subject = localStorage.getItem('subject');
  const examType = localStorage.getItem('examType');

  if (teacherName && subject && examType) {
    document.getElementById('teacherForm').style.display = 'none';
    document.getElementById('studentForm').style.display = 'block';

    document.getElementById('teacherInfo').innerText = `Teacher: ${teacherName}, Subject: ${subject}, Exam Type: ${examType}`;
    displayStudent(currentStudentIndex);
  }
}

document.getElementById("clearAll").onclick = function() {
  showModal("clearAll", null, () => {
    // Logic to clear data
    studentMarks = {};
    currentStudentIndex = 0;
    localStorage.clear();
    updateProgress();
    displayStudent(currentStudentIndex);

    showSuccessMessage("All data has been cleared successfully!");
  });
}
// Function to fetch teacher names and student names from the web app
function fetchTeacherAndStudentNames(role = null) {
  // Construct the URL with the role parameter if provided
  const url = role ? `${appScriptUrl}?role=${role}` : appScriptUrl;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Store teachers in localStorage as a fallback
      localStorage.setItem('teachers', JSON.stringify(data.Teachers));

      // Populate the teacher dropdown with the data from the 'Teachers' array
      populateTeacherDropdown(data.Teachers);

      // If role is provided, handle students
      if (role && data.Students) {
        // Populate the student dropdown with the data from the 'Students' array
        data.Students.forEach(student => {
          students.push({ fullName: student });
        });
      }
    })
    .catch(() => {
      // On failure, use the fallback data from localStorage for teachers
      const fallbackTeachers = JSON.parse(localStorage.getItem('teachers') || '[]');
      if (fallbackTeachers.length > 0) {
        populateTeacherDropdown(fallbackTeachers);
      } else {
        console.error('Failed to fetch teachers and no fallback data available.');
      }
    });
}



// Function to populate the teacher dropdown
function populateTeacherDropdown(teachers) {
  const teacherSelect = document.getElementById('teacherName');
  teacherSelect.innerHTML = '<option value="" disabled selected>Select Teacher Name</option>';  // Reset the dropdown

  // Loop through each teacher name and create an option element
  teachers.forEach(teacher => {
    const option = document.createElement('option');
    option.value = teacher;
    option.textContent = teacher;
    teacherSelect.appendChild(option);
  });
}
  
 
 // Fetch teacher names when the page loads
     fetchTeacherAndStudentNames('formThree');
  
        } else if(formId === "formFour") {
     // Show the overlay message when the form button is clicked
        const overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        overlay.style.color = 'white';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.fontSize = '1.5em';
        overlay.innerText = 'Please wait...';
        document.body.appendChild(overlay);
 //Hide the overlay after 10 seconds
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 2000); // 2 seconds

      
             
const students = [];

let currentStudentIndex = parseInt(localStorage.getItem('currentStudentIndex')) || 0;
let studentMarks = JSON.parse(localStorage.getItem('studentMarks')) || {};


window.onload = function() {
  loadSavedData();
  //document.getElementById('totalStudents').innerText = students.length;
  updateProgress();
};
  


document.getElementById("goToStudentForm").addEventListener("click", (e) => {
  const teacherName = document.getElementById('teacherName').value;
  const subject = document.getElementById('subject').value;
  const examType = document.getElementById('examType').value;
  if (!teacherName || !subject || !examType) {
   alert('Please fill out all fields.');
    return;
  }

  localStorage.setItem('teacherName', teacherName);
  localStorage.setItem('subject', subject);
  localStorage.setItem('examType', examType);

  document.getElementById('teacherInfo').innerText = `Teacher: ${teacherName}, Subject: ${subject}, Exam Type: ${examType}`;
  displayStudent(currentStudentIndex);

  document.getElementById('teacherForm').style.display = 'none';
  document.getElementById('studentForm').style.display = 'block';
});

function displayStudent(index) {
  const student = students[index];
  document.getElementById('studentFullName').innerText = student.fullName;
  //document.getElementById('studentSex').innerText = student.sex;
  document.getElementById('marks').value = studentMarks[student.fullName] || '';

  // Explanation message to guide the user
  const explanationMessage = `
    Karibu! Tafadhali fuata hatua hizi kuingiza alama:
    <ol>
      <li>Jaza alama za mwanafunzi Kisha,</li>
      <li>Bonyeza kitufe cha "Next" kuhifadhi alama za mwanafunzi </li>
      <li>Endelea na mchakato huu kwa wanafunzi wote</li>
      <li>Baada ya kuingiza alama za wanafunzi wote, bonyeza "Submit" kutuma data kwa seva.</li>
      <li>Usitume matokeo kamahujajaza matokeo ya wanafunzi wako, na alama ni kuanzia "0 - 100", na "X" kwa mwanafunzi asiofanya mtihani</li>
    </ol>
    Hakikisha unaangalia tena alama kabla ya kutuma. Asante!
  `;

  // Get the explanation message container
  const messageElement = document.getElementById('expl-message');
  messageElement.innerHTML = explanationMessage;
  messageElement.style.display = 'none'; // Hide the message initially

  // Check if the toggle button already exists
  let toggleButton = document.getElementById('toggle-instructions');
  if (!toggleButton) {
    // Create and add the toggle button only if it doesn't exist
    toggleButton = document.createElement('button');
    toggleButton.innerText = 'SOMA MAELEKEZO'; // Start with "Show Instructions"
    toggleButton.id = 'toggle-instructions';
    toggleButton.style.marginTop = '10px';

    // Toggle function to show/hide the message
    toggleButton.onclick = function () {
      if (messageElement.style.display === 'none') {
        messageElement.style.display = 'block';
        toggleButton.innerText = 'FUNGA MAELEKEZO';
      } else {
        messageElement.style.display = 'none';
        toggleButton.innerText = 'SOMA MAELEKEZO';
      }
    };

    // Add the toggle button to the DOM
    messageElement.parentNode.insertBefore(toggleButton, messageElement.nextSibling);
  }

  // Reset toggle state on form submission
  document.querySelector('#studentInfo').addEventListener('submit', function () {
    messageElement.style.display = 'none'; // Hide the message
    toggleButton.innerText = 'SOMA MAELEKEZO'; // Reset toggle button state
  });
}


document.getElementById("saveMarksLocally").onclick = function() {
  const student = students[currentStudentIndex];
  const marks = document.getElementById('marks').value;
  const sanitizedMarks = marks.trim().toUpperCase();

  if (sanitizedMarks === '' || (sanitizedMarks !== 'X' && (isNaN(sanitizedMarks) || sanitizedMarks < 0 || sanitizedMarks > 100))) {
    displayErrorMessage('Please enter a valid number (0-100) or "X" for absent students.');
    return;
  }

  studentMarks[student.fullName] = sanitizedMarks;
  localStorage.setItem('studentMarks', JSON.stringify(studentMarks));
  showSuccessMessage(`Marks for ${student.fullName} have been saved locally!`);
  updateProgress();

  if (currentStudentIndex < students.length - 1) {
    nextStudent();
  }
}
  
// Updated submitAllMarks function
document.getElementById("submitAllMarks").onclick = function() {
  const teacherName = localStorage.getItem('teacherName');
  const subject = localStorage.getItem('subject');
  const examType = localStorage.getItem('examType');

  const studentNames = [];
  const marks = [];
  let markedStudents = 0; // Count students with valid marks

  // Validate student marks
  for (const [studentName, mark] of Object.entries(studentMarks)) {
    const sanitizedMark = mark.trim().toUpperCase();
    if (sanitizedMark === "X" || (!isNaN(sanitizedMark) && sanitizedMark >= 0 && sanitizedMark <= 100)) {
      studentNames.push(studentName);
      marks.push(sanitizedMark);
      markedStudents++;
    }
  }

  // Check if no students are marked
  if (markedStudents === 0) {
    displayErrorMessage('No students have been marked. Please mark at least one student before submitting.');
    return;
  }

  // Show confirmation modal
  showModal("marks", markedStudents, () => {
    const formData = new URLSearchParams();
    formData.append('teacherName', teacherName);
    formData.append('subject', subject);
    formData.append('examType', examType);
    formData.append('data[studentName]', studentNames.join(','));
    formData.append('data[marks]', marks.join(','));

    fetch(scriptUrlFour, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        console.log(`Response Status: ${response.status}`);
        return response.text();
      })
      .then(responseText => {
        console.log('Server response:', responseText);
        showSuccessMessage('All marked students\' marks have been submitted successfully!');
      })
      .catch(error => {
        console.error('Submission error:', error);
        displayErrorMessage('Error submitting marks. Please try again.');
      });
  });
}

// Modal Handler Function
function showModal(actionType, markedStudents, onConfirm) {
  const modal = document.getElementById("confirmation-modal");
  const confirmButton = document.getElementById("confirm-action");
  const cancelButton = document.getElementById("cancel-action");
  const confirmationMessage = document.getElementById("confirmation-message");

  // Set modal message based on action type
  if (actionType === "marks") {
    confirmationMessage.textContent = `You are about to submit marks for ${markedStudents} students. Do you want to proceed?`;
  } else if (actionType === "clearAll") {
    confirmationMessage.textContent = "This action will permanently clear all data. Are you sure you want to proceed?";
  } else {
    confirmationMessage.textContent = "Are you sure you want to proceed?";
  }

  // Display modal
  modal.style.display = "block";

  // Handle confirm action
  confirmButton.onclick = function () {
    console.log("Action confirmed. Executing callback...");
    onConfirm();
    modal.style.display = "none"; // Close modal
  };

  // Handle cancel action
  cancelButton.onclick = function () {
    console.log("Action canceled.");
    showSuccessMessage(`${actionType === "marks" ? "Submission" : actionType === "clearAll" ? "Clear All" : "Action"} canceled by user.`);
    modal.style.display = "none"; // Close modal
  };
}
  
function displayErrorMessage(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.innerText = message;
  errorMessage.style.display = 'block';
  setTimeout(() => { errorMessage.style.display = 'none'; }, 3000);
}

function showSuccessMessage(message) {
  const successMessage = document.getElementById('successMessage');
  successMessage.innerText = message;
  successMessage.style.display = 'block';
  setTimeout(() => { successMessage.style.display = 'none'; }, 3000);
}

function updateProgress() {
  const totalStudents = students.length;
  const completed = Object.keys(studentMarks).length;
  const progressPercent = (completed / totalStudents) * 100;

  document.getElementById('progress').style.width = progressPercent + '%';
  document.getElementById('progressText').innerText = completed;
}

function nextStudent() {
  if (currentStudentIndex < students.length - 1) {
    currentStudentIndex++;
    localStorage.setItem('currentStudentIndex', currentStudentIndex);
    displayStudent(currentStudentIndex);
  }
}

document.getElementById("previousStudent").onclick = function() {
  if (currentStudentIndex > 0) {
    currentStudentIndex--;
    localStorage.setItem('currentStudentIndex', currentStudentIndex);
    displayStudent(currentStudentIndex);
  }
}

function loadSavedData() {
  const teacherName = localStorage.getItem('teacherName');
  const subject = localStorage.getItem('subject');
  const examType = localStorage.getItem('examType');

  if (teacherName && subject && examType) {
    document.getElementById('teacherForm').style.display = 'none';
    document.getElementById('studentForm').style.display = 'block';

    document.getElementById('teacherInfo').innerText = `Teacher: ${teacherName}, Subject: ${subject}, Exam Type: ${examType}`;
    displayStudent(currentStudentIndex);
  }
}

document.getElementById("clearAll").onclick = function() {
  showModal("clearAll", null, () => {
    // Logic to clear data
    studentMarks = {};
    currentStudentIndex = 0;
    localStorage.clear();
    updateProgress();
    displayStudent(currentStudentIndex);

    showSuccessMessage("All data has been cleared successfully!");
  });
}
// Function to fetch teacher names and student names from the web app
function fetchTeacherAndStudentNames(role = null) {
  // Construct the URL with the role parameter if provided
  const url = role ? `${appScriptUrl}?role=${role}` : appScriptUrl;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Store teachers in localStorage as a fallback
      localStorage.setItem('teachers', JSON.stringify(data.Teachers));

      // Populate the teacher dropdown with the data from the 'Teachers' array
      populateTeacherDropdown(data.Teachers);

      // If role is provided, handle students
      if (role && data.Students) {
        // Populate the student dropdown with the data from the 'Students' array
        data.Students.forEach(student => {
          students.push({ fullName: student });
        });
      }
    })
    .catch(() => {
      // On failure, use the fallback data from localStorage for teachers
      const fallbackTeachers = JSON.parse(localStorage.getItem('teachers') || '[]');
      if (fallbackTeachers.length > 0) {
        populateTeacherDropdown(fallbackTeachers);
      } else {
        console.error('Failed to fetch teachers and no fallback data available.');
      }
    });
}



// Function to populate the teacher dropdown
function populateTeacherDropdown(teachers) {
  const teacherSelect = document.getElementById('teacherName');
  teacherSelect.innerHTML = '<option value="" disabled selected>Select Teacher Name</option>';  // Reset the dropdown

  // Loop through each teacher name and create an option element
  teachers.forEach(teacher => {
    const option = document.createElement('option');
    option.value = teacher;
    option.textContent = teacher;
    teacherSelect.appendChild(option);
  });
}
  
 
 // Fetch teacher names when the page loads
     fetchTeacherAndStudentNames('formFour');
  
        }
      
    });  });
