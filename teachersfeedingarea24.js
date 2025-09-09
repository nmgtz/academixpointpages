(function () {
  const buttonForAll = document.getElementById("classButtonsTchfa");

let buttonAllSub = [
  { text: "Form One", id: "formOne", type: "formI" },
  { text: "Form Two", id: "formTwo", type: "formII" },
  { text: "Form Three", id: "formThree", type: "formIII" },
  { text: "Form Four", id: "formFour", type: "formIV" }
];

buttonAllSub.forEach(button => {
  let btn = document.createElement("button");
  btn.className = "form-buttons";
  btn.id = button.id;
  btn.setAttribute("data-form-type", button.type);
  btn.textContent = button.text;

  buttonForAll.appendChild(btn);
});
     
let examinationTypeAll = document.getElementById("examType");
let examAlltype = [
    { value: "", innerCont: "[--- SELECT EXAMINATION TYPE ---]" },
    { value: "WEEKLY", innerCont: "WEEKLY TEST" },
    { value: "MONTHLY", innerCont: "MONTHLY TEST" },
    { value: "MIDTERM", innerCont: "MID-TERM EXAM" },
    { value: "TERMINAL", innerCont: "TERMINAL EXAM" },
    { value: "MIDTERM2", innerCont: "MID-TERM EXAM 2" },
    { value: "JOINT", innerCont: "JOINT EXAM" },
    { value: "ANNUAL", innerCont: "ANNUAL EXAM" },
    { value: "PREMOCK", innerCont: "PRE-MOCK EXAM" },
    { value: "MOCK", innerCont: "MOCK EXAM" },
    { value: "PRENECTA", innerCont: "PRE-NATIONAL EXAM" },
];

examAlltype.forEach(exam => {
 let examallOpt = document.createElement("option");
     examallOpt.value = exam.value;
     examallOpt.textContent = exam.innerCont;
     examinationTypeAll.appendChild(examallOpt);
});    

const classButton = document.getElementById("classButtonsTchfa");
const formContainer = document.querySelector(".form-container1");

document.querySelectorAll('.form-buttons').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
      
        classButton.style.display = "none";
        formContainer.style.display = "block";

        const formId = e.target.id;
      
        (formId === "formOne" ? universalCodeUrl = scriptUrlOne
        : formId === "formTwo" ? universalCodeUrl = scriptUrlTwo
        : formId === "formThree" ? universalCodeUrl = scriptUrlThree
        : formId === "formFour" ? universalCodeUrl = scriptUrlFour: null);
      
        excuteFormCodes();
        fetchAndPopulateSubjects(); 

        function fetchAndPopulateSubjects() {
            const subjectForClasses = document.getElementById("subject");
            subjectForClasses.innerHTML = "";

            const defaultOpt = document.createElement("option");
            defaultOpt.value = "";
            defaultOpt.textContent = "Select Subject";
            subjectForClasses.appendChild(defaultOpt);

            fetch(universalCodeUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        const headers = data.contentHead.slice(2);
                        const subjectSelect = document.getElementById("subject");
                        subjectSelect.innerHTML = `<option value="">[--- SELECT SUBJECT ---]</option>`;
                        
                        headers.forEach(subject => {
                            const option = document.createElement("option");
                            option.value = subject;
                            option.textContent = subject;
                            subjectSelect.appendChild(option);
                        });

                        const headerRow = document.getElementById('subject-headers');
                        headerRow.innerHTML = '';
                        headers.forEach(sub => {
                            const th = document.createElement('th');
                            th.textContent = sub;
                            headerRow.appendChild(th);
                        });
                    } else {
                        console.error('Failed to fetch subjects:', data.message);
                    }
                })
                .catch(err => {
                    console.error('Error fetching data:', err);
                });
        }
         
        function excuteFormCodes() {
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

            setTimeout(() => {
                overlay.style.display = 'none';
            }, 2000);
             
            const students = [];
            let currentStudentIndex = parseInt(localStorage.getItem('currentStudentIndex')) || 0;
            let studentMarks = JSON.parse(localStorage.getItem('studentMarks')) || {};

            // Speech Recognition Setup
            let recognition = null;
            let isListening = false;

            function initializeSpeechRecognition() {
                if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                    recognition = new SpeechRecognition();
                    
                    recognition.continuous = false;
                    recognition.interimResults = false;
                    recognition.lang = 'en-US';
                    
                    recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript.toLowerCase().trim();
    const processedValue = processSpeechInput(transcript);
    
    if (processedValue !== null) {
        document.getElementById('marks').value = processedValue;
        showSpeechFeedback(`Detected: ${processedValue}`, 'success');
        
        // Auto-save and advance to next student after 2 seconds
        setTimeout(() => {
            // Simply trigger the existing save function
            const saveButton = document.getElementById('saveMarksLocally');
            if (saveButton) {
                saveButton.click();
                
                
                setTimeout(() => {
                    if (currentStudentIndex < students.length - 1 && !isListening) {
                        startListening();
                    } else if (currentStudentIndex >= students.length - 1) {
                        showSpeechFeedback('All students completed!', 'success');
                        stopListening();
                    }
                }, 500);
            }
        }, 2000);
        
    } else {
        showSpeechFeedback('Could not understand. Please try again.', 'error');
    }
    
    // Don't stop listening here - let the timeout handle it
};
                    
                    recognition.onerror = function(event) {
                        console.error('Speech recognition error:', event.error);
                        showSpeechFeedback('Speech recognition error. Please try again.', 'error');
                        stopListening();
                    };
                    
                    recognition.onend = function() {
                        stopListening();
                    };
                }
            }

            function processSpeechInput(transcript) {
                // Number mapping for English and Swahili
                const numberMappings = {
                    // English numbers
                    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
                    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
                    'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13',
                    'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17',
                    'eighteen': '18', 'nineteen': '19', 'twenty': '20',
                    'thirty': '30', 'forty': '40', 'fifty': '50', 'sixty': '60',
                    'seventy': '70', 'eighty': '80', 'ninety': '90', 'hundred': '100',
                    
                    // Swahili numbers
                    'sifuri': '0', 'moja': '1', 'mbili': '2', 'tatu': '3', 'nne': '4',
                    'tano': '5', 'sita': '6', 'saba': '7', 'nane': '8', 'tisa': '9',
                    'kumi': '10', 'kumi na moja': '11', 'kumi na mbili': '12', 'kumi na tatu': '13',
                    'kumi na nne': '14', 'kumi na tano': '15', 'kumi na sita': '16',
                    'kumi na saba': '17', 'kumi na nane': '18', 'kumi na tisa': '19',
                    'ishirini': '20', 'thelathini': '30', 'arobaini': '40', 'hamsini': '50',
                    'sitini': '60', 'sabini': '70', 'themanini': '80', 'tisini': '90', 'mia': '100',
                    
                    // Absent markers
                    'absent': 'X', 'x': 'X', 'hapakuwepo': 'X', 'hakuwepo': 'X'
                };

                // Direct number mapping
                if (numberMappings[transcript]) {
                    return numberMappings[transcript];
                }

                // Extract numbers from transcript
                const numberMatch = transcript.match(/\d+/);
                if (numberMatch) {
                    const number = parseInt(numberMatch[0]);
                    if (number >= 0 && number <= 100) {
                        return number.toString();
                    }
                }

                // Handle compound numbers (like "twenty one", "thirty five")
                const words = transcript.split(' ');
                let total = 0;
                let hasNumber = false;

                for (let i = 0; i < words.length; i++) {
                    const word = words[i].trim();
                    if (numberMappings[word]) {
                        const value = parseInt(numberMappings[word]);
                        if (!isNaN(value)) {
                            total += value;
                            hasNumber = true;
                        }
                    }
                }

                if (hasNumber && total >= 0 && total <= 100) {
                    return total.toString();
                }

                return null;
            }

   function startListening() {
    if (recognition && !isListening) {
        isListening = true;
        updateMicButton(true);
        showSpeechFeedback('Listening... Speak now', 'listening');
        recognition.start();
    }
}

// Update the stopListening function to handle continuous mode
function stopListening() {
    if (recognition && isListening) {
        isListening = false;
        updateMicButton(false);
        recognition.stop();
    }
}

// Modify the updateMicButton function to show continuous mode status
function updateMicButton(listening) {
    const micButton = document.getElementById('micButton');
    if (micButton) {
        if (listening) {
            micButton.innerHTML = '🔴';
            micButton.style.background = 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)';
            micButton.title = 'Continuous voice mode active - Click to stop';
        } else {
            micButton.innerHTML = '🎤';
            micButton.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            micButton.title = 'Click to start continuous voice input';
        }
    }
}
            function showSpeechFeedback(message, type) {
                let feedbackElement = document.getElementById('speechFeedback');
                if (!feedbackElement) {
                    feedbackElement = document.createElement('div');
                    feedbackElement.id = 'speechFeedback';
                    feedbackElement.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        padding: 10px 20px;
                        border-radius: 5px;
                        color: white;
                        z-index: 2000;
                        font-weight: 600;
                        transform: translateX(100%);
                        transition: transform 0.3s ease;
                    `;
                    document.body.appendChild(feedbackElement);
                }

                const colors = {
                    success: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                    error: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                    listening: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                };

                feedbackElement.style.background = colors[type] || colors.success;
                feedbackElement.textContent = message;
                feedbackElement.style.transform = 'translateX(0)';

                setTimeout(() => {
                    feedbackElement.style.transform = 'translateX(100%)';
                }, 3000);
            }

            function createMicrophoneButton() {
    const marksInput = document.getElementById('marks');
    if (marksInput && recognition) {
        const inputContainer = marksInput.parentElement;
        
        let micButton = document.getElementById('micButton');
        if (!micButton) {
            micButton = document.createElement('button');
            micButton.id = 'micButton';
            micButton.type = 'button';
            micButton.innerHTML = '🎤';
            micButton.title = 'Click to start continuous voice input';
            micButton.style.cssText = `
                margin-left: 10px;
                padding: 10px 15px;
                border: none;
                border-radius: 5px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            `;

            micButton.addEventListener('click', function() {
                if (isListening) {
                    stopListening();
                    showSpeechFeedback('Voice input stopped', 'success');
                } else {
                    startListening();
                }
            });

            micButton.addEventListener('mouseenter', function() {
                if (!isListening) {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }
            });

            micButton.addEventListener('mouseleave', function() {
                if (!isListening) {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                }
            });

            inputContainer.appendChild(micButton);
        }
    }
}

            window.onload = function() {
                loadSavedData();
                document.getElementById('totalStudents').innerText = students.length;
                updateProgress();
                initializeSpeechRecognition();
            };

            document.getElementById("goToStudentForm").addEventListener("click", (e) => {
                const teacherName = document.getElementById('teacherName').value;
                const subject = document.getElementById('subject').value;
                const examType = document.getElementById('examType').value;
                
                if (!teacherName || !subject || !examType) {
                    alert('Please fill out all fields.');
                    return;
                }

                localStorage.setItem('subject', subject);
                localStorage.setItem('examType', examType);

                document.getElementById('teacherInfo').innerText = `Teacher: ${teacherName}, Subject: ${subject}, Exam Type: ${examType}`;
                displayStudent(currentStudentIndex);

                document.getElementById('teacherForm').style.display = 'none';
                document.getElementById('studentForm').style.display = 'block';
                
                // Initialize microphone button after student form is displayed
                setTimeout(() => {
                    createMicrophoneButton();
                }, 100);
            });

            function displayStudent(index) {
                const student = students[index];
                document.getElementById('studentFullName').innerText = student.fullName;
                document.getElementById('studentSex').innerText = student.sex;
                document.getElementById('marks').value = studentMarks[student.fullName] || '';

                const explanationMessage = `
                    Karibu! Tafadhali fuata hatua hizi kuingiza alama:
                    <ol>
                        <li>Jaza alama za mwanafunzi Kisha,</li>
                        <li>Bonyeza kitufe cha "Next" kuhifadhi alama za mwanafunzi </li>
                        <li>Endelea na mchakato huu kwa wanafunzi wote</li>
                        <li>Baada ya kuingiza alama za wanafunzi wote, bonyeza "Submit" kutuma data kwa seva.</li>
                        <li>Usitume matokeo kamahujajaza matokeo ya wanafunzi wako, na alama ni kuanzia "0 - 100", na "X" kwa mwanafunzi asiofanya mtihani</li>
                        <li><strong>Unaweza pia kutumia kipaza sauti kuongea alama kwa Kiingereza au Kiswahili</strong></li>
                    </ol>
                    Hakikisha unaangalia tena alama kabla ya kutuma. Asante!
                `;

                const messageElement = document.getElementById('expl-message');
                messageElement.innerHTML = explanationMessage;
                messageElement.style.display = 'none';

                let toggleButton = document.getElementById('toggle-instructions');
                if (!toggleButton) {
                    toggleButton = document.createElement('button');
                    toggleButton.innerText = 'SOMA MAELEKEZO';
                    toggleButton.id = 'toggle-instructions';
                    toggleButton.style.marginTop = '10px';

                    toggleButton.onclick = function () {
                        if (messageElement.style.display === 'none') {
                            messageElement.style.display = 'block';
                            toggleButton.innerText = 'FUNGA MAELEKEZO';
                        } else {
                            messageElement.style.display = 'none';
                            toggleButton.innerText = 'SOMA MAELEKEZO';
                        }
                    };

                    messageElement.parentNode.insertBefore(toggleButton, messageElement.nextSibling);
                }

                document.querySelector('#studentInfo').addEventListener('submit', function () {
                    messageElement.style.display = 'none';
                    toggleButton.innerText = 'SOMA MAELEKEZO';
                });
                
                // Ensure microphone button is available
                setTimeout(() => {
                    createMicrophoneButton();
                }, 100);
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

            document.getElementById("submitAllMarks").onclick = function() {
                const teacherName = localStorage.getItem('teacherName');
                const subject = localStorage.getItem('subject');
                const examType = localStorage.getItem('examType');

                const studentNames = [];
                const marks = [];
                let markedStudents = 0;

                for (const [studentName, mark] of Object.entries(studentMarks)) {
                    const sanitizedMark = mark.trim().toUpperCase();
                    if (sanitizedMark === "X" || (!isNaN(sanitizedMark) && sanitizedMark >= 0 && sanitizedMark <= 100)) {
                        studentNames.push(studentName);
                        marks.push(sanitizedMark);
                        markedStudents++;
                    }
                }

                if (markedStudents === 0) {
                    displayErrorMessage('No students have been marked. Please mark at least one student before submitting.');
                    return;
                }

                showModal("marks", markedStudents, async () => {
                    const formData = new URLSearchParams();
                    formData.append('mode', 'marks');
                    formData.append('teacherName', teacherName);
                    formData.append('subject', subject);
                    formData.append('examType', examType);
                    formData.append('data[studentName]', studentNames.join(','));
                    formData.append('data[marks]', marks.join(','));

                    try { 
                        const response = await fetch(universalCodeUrl, {
                            method: 'POST',
                            headers : {'Content-Type':'application/x-www-form-urlencoded'},
                            body: formData,
                        });

                        const resData = await response.json();

                        if (response.ok) {
                            console.log(`Response Status: ${resData.status}`);
                            console.log('Server Response:', resData.message);

                            if (resData.message?.toLowerCase().includes('invalid subject') || resData.message?.toLowerCase().includes('invalid')) {
                                const errorMsg = `Error: Invalid subject detected. Please reload your browser and try again by selecting: 
                                TEACHER'S NAME > SUBJECT > TYPE OF EXAM, then re-submit the marks. 
                                NOTE: DO NOT clear all. 
                                If the issue persists, contact your school's academic master or IT expert.`;

                                displayErrorMessage(errorMsg);
                                return;
                            }

                            if (resData.status === 'success') {
                                console.log('Valid Server Response:', resData);
                                showSuccessMessage(`Success: ${resData.message}`);
                            } else {
                                console.warn('Server Error:', resData.message);
                                displayErrorMessage(`Network seems fine, but there might be a server-side issue: ${resData.message}`);
                            }
                        } else {
                            console.warn('Server responded but with an error status:', response.status);
                            displayErrorMessage(`Server error: ${resData.message}`);
                        }
                    } catch (error) {
                        console.error('Network or fetch error:', error);

                        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                            displayErrorMessage("Network error: Please check your internet connection and try again.");
                        } else {
                            displayErrorMessage("Unexpected error occurred. Please try again later or contact your school's IT support for assistance.");
                        }
                    }
                });
            }

            function showModal(actionType, markedStudents, onConfirm) {
                const modal = document.getElementById("confirmation-modal");
                const confirmButton = document.getElementById("confirm-action");
                const cancelButton = document.getElementById("cancel-action");
                const confirmationMessage = document.getElementById("confirmation-message");

                if (actionType === "marks") {
                    confirmationMessage.textContent = `You are about to submit marks for ${markedStudents} students. Do you want to proceed?`;
                } else if (actionType === "clearAll") {
                    confirmationMessage.textContent = "This action will permanently clear all data. Are you sure you want to proceed?";
                } else {
                    confirmationMessage.textContent = "Are you sure you want to proceed?";
                }

                modal.style.display = "block";

                confirmButton.onclick = function () {
                    console.log("Action confirmed. Executing callback...");
                    onConfirm();
                    modal.style.display = "none";
                };

                cancelButton.onclick = function () {
                    console.log("Action canceled.");
                    showSuccessMessage(`${actionType === "marks" ? "Submission" : actionType === "clearAll" ? "Clear All" : "Action"} canceled by user.`);
                    modal.style.display = "none";
                };
            }

            function displayErrorMessage(message) {
                const errorMessage = document.getElementById('errorMessage');
                errorMessage.innerText = message;
                errorMessage.style.display = 'block';
                setTimeout(() => { errorMessage.style.display = 'none'; }, 10000);
            }

            function showSuccessMessage(message) {
                const successMessage = document.getElementById('successMessage');
                successMessage.innerText = message;
                successMessage.style.display = 'block';
                setTimeout(() => { successMessage.style.display = 'none'; }, 5000);
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
                    studentMarks = {};
                    currentStudentIndex = 0;
                    localStorage.clear();
                    updateProgress();
                    displayStudent(currentStudentIndex);
                    showSuccessMessage("All data has been cleared successfully!");
                });
            }

            function fetchTeacherAndStudentNames(role = null) {
                const url = role ? `${appScriptUrl}?role=${role}` : appScriptUrl;

                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        localStorage.setItem('teachers', JSON.stringify(data.Teachers));
                        populateTeacherDropdown(data.Teachers);

                        if (role && data.Students) {
                            data.Students.forEach(student => {
                                students.push({ fullName: student.fullName, sex: student.sex });
                            });
                        }
                    })
                    .catch(() => {
                        const fallbackTeachers = JSON.parse(localStorage.getItem('teachers') || '[]');
                        if (fallbackTeachers.length > 0) {
                            populateTeacherDropdown(fallbackTeachers);
                        } else {
                            console.error('Failed to fetch teachers and no fallback data available.');
                        }
                    });
            }

            function populateTeacherDropdown(teachers) {
                const teacherSelect = document.getElementById('teacherName');
                teacherSelect.innerHTML = `<option value="" disabled selected>[--- SELECT TEACHER'S NAME ---]</option>`;

                teachers.forEach(teacher => {
                    const option = document.createElement('option');
                    option.value = teacher;
                    option.textContent = teacher;
                    teacherSelect.appendChild(option);
                });
            }

            (formId === "formOne" ? fetchTeacherAndStudentNames('formOne') :
            formId === "formTwo" ? fetchTeacherAndStudentNames('formTwo') :
            formId === "formThree" ? fetchTeacherAndStudentNames('formThree') :
            formId === "formFour" ? fetchTeacherAndStudentNames('formFour') : null);

            // Enhanced keyboard shortcuts with proper error handling
            function handleKeyboardShortcuts(event) {
                const studentForm = document.getElementById('studentForm');
                if (!studentForm || studentForm.style.display === 'none') {
                    return;
                }

                const modal = document.getElementById('confirmation-modal');
                if (modal && modal.style.display === 'block') {
                    return; 
                }

                const marksInput = document.getElementById('marks');
                const nextButton = document.getElementById('saveMarksLocally');
                const backButton = document.getElementById('previousStudent');
                
                if (!marksInput || !nextButton || !backButton) {
                    return;
                }

                // Prevent default for navigation keys to avoid page scrolling
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                    event.preventDefault();
                }

                switch(event.key) {
                    case 'Enter':
                        event.preventDefault();
                        if (marksInput.value.trim() !== '') {
                            nextButton.click();
                        } else {
                            marksInput.focus();
                            showTemporaryMessage('Please enter marks first!');
                        }
                        break;
                        
                    case 'ArrowRight':
                    case 'ArrowUp':
                        if (marksInput.value.trim() !== '') {
                            nextButton.click();
                        } else {
                            marksInput.focus();
                            showTemporaryMessage('Please enter marks first!');
                        }
                        break;
                        
                    case 'ArrowLeft':
                    case 'ArrowDown':
                        backButton.click();
                        break;
                        
                    case 'Escape':
                        marksInput.value = '';
                        marksInput.focus();
                        break;
                        
                    case 'Tab':
                        if (event.target !== marksInput) {
                            event.preventDefault();
                            marksInput.focus();
                        }
                        break;
                        
                    case ' ': // Spacebar for microphone
                        if (event.target === marksInput && event.ctrlKey) {
                            event.preventDefault();
                            const micButton = document.getElementById('micButton');
                            if (micButton) {
                                micButton.click();
                            }
                        }
                        break;
                }
            }

            function showTemporaryMessage(message) {
                const errorMessage = document.getElementById('errorMessage');
                if (!errorMessage) return;
                
                const originalMessage = errorMessage.textContent;
                const originalDisplay = errorMessage.style.display;
                
                errorMessage.textContent = message;
                errorMessage.style.display = 'block';
                errorMessage.style.background = 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)';
                
                setTimeout(() => {
                    errorMessage.textContent = originalMessage;
                    errorMessage.style.display = originalDisplay;
                    errorMessage.style.background = 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)';
                }, 2000);
            }

            function autoFocusMarksInput() {
                const studentForm = document.getElementById('studentForm');
                const marksInput = document.getElementById('marks');
                
                if (studentForm && studentForm.style.display !== 'none' && marksInput) {
                    setTimeout(() => {
                        marksInput.focus();
                        marksInput.select(); 
                    }, 100);
                }
            }

            // Set up event listeners for keyboard shortcuts
            document.addEventListener('keydown', handleKeyboardShortcuts);

            // Observer for form display changes
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const studentForm = document.getElementById('studentForm');
                        if (studentForm && studentForm.style.display !== 'none') {
                            autoFocusMarksInput();
                        }
                    }
                });
            });

            const studentForm = document.getElementById('studentForm');
            if (studentForm) {
                observer.observe(studentForm, {
                    attributes: true,
                    attributeFilter: ['style']
                });
            }

            // Auto-focus after navigation
            const nextButtonElement = document.getElementById('saveMarksLocally');
            const backButtonElement = document.getElementById('previousStudent');
            
            if (nextButtonElement) {
                nextButtonElement.addEventListener('click', function() {
                    setTimeout(autoFocusMarksInput, 100);
                });
            }
            
            if (backButtonElement) {
                backButtonElement.addEventListener('click', function() {
                    setTimeout(autoFocusMarksInput, 100);
                });
            }

            // Initial focus setup
            window.addEventListener('load', autoFocusMarksInput);
            
            // Enhanced numeric input with speech support
            function setupNumericInputShortcuts() {
                const marksInput = document.getElementById('marks');
                if (marksInput) {
                    marksInput.addEventListener('keydown', function(event) {
                        // Allow control keys
                        if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(event.keyCode) !== -1 ||
                            (event.keyCode === 65 && event.ctrlKey === true) ||
                            (event.keyCode === 67 && event.ctrlKey === true) ||
                            (event.keyCode === 86 && event.ctrlKey === true) ||
                            (event.keyCode === 88 && event.ctrlKey === true)) {
                            return;
                        }
                        
                        // Handle Enter key specifically for form submission
                        if (event.keyCode === 13) {
                            event.preventDefault();
                            if (this.value.trim() !== '') {
                                document.getElementById('saveMarksLocally').click();
                            } else {
                                showTemporaryMessage('Please enter marks first!');
                            }
                            return;
                        }
                        
                        // Allow X or x for absent students
                        if (event.keyCode === 88 || event.keyCode === 120) {
                            const currentValue = this.value;
                            if (currentValue === '' || currentValue.toUpperCase() === 'X') {
                                setTimeout(() => {
                                    this.value = 'X';
                                }, 0);
                                return;
                            } else {
                                event.preventDefault();
                            }
                            return;
                        }
                        
                        // Prevent X input if numbers already exist
                        if (this.value.toUpperCase() === 'X') {
                            event.preventDefault();
                            return;
                        }
                        
                        // Only allow numbers
                        if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
                            event.preventDefault();
                        }
                    });
                    
                    // Enhanced paste handling
                    marksInput.addEventListener('paste', function(event) {
                        event.preventDefault();
                        const pastedText = (event.clipboardData || window.clipboardData).getData('text').trim();
                        
                        if (pastedText.toUpperCase() === 'X') {
                            this.value = 'X';
                        } else if (/^\d+$/.test(pastedText)) {
                            const number = parseInt(pastedText);
                            if (number >= 0 && number <= 100) {
                                this.value = pastedText;
                            }
                        }
                    });

                    // Input validation on change
                    marksInput.addEventListener('input', function(event) {
                        const value = this.value;
                        if (value !== '' && value.toUpperCase() !== 'X') {
                            const number = parseInt(value);
                            if (isNaN(number) || number < 0 || number > 100) {
                                this.style.borderColor = '#ff4444';
                                showTemporaryMessage('Please enter a number between 0-100 or X for absent');
                            } else {
                                this.style.borderColor = '';
                            }
                        } else {
                            this.style.borderColor = '';
                        }
                    });
                }
            }

            // Initialize numeric input shortcuts
            setupNumericInputShortcuts();

            // Enhanced keyboard shortcut hints
            function addKeyboardShortcutHints() {
                const studentFormElement = document.getElementById('studentForm');
                if (studentFormElement) {
                    const hintsContainer = document.createElement('div');
                    hintsContainer.id = 'keyboard-hints';
                    hintsContainer.style.cssText = `
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        background: rgba(0, 0, 0, 0.9);
                        color: white;
                        padding: 15px;
                        border-radius: 10px;
                        font-size: 12px;
                        z-index: 1000;
                        font-family: 'Inter', sans-serif;
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        opacity: 0;
                        transition: opacity 0.3s ease;
                        max-width: 300px;
                    `;
                    
                    hintsContainer.innerHTML = `
                        <div style="margin-bottom: 8px; font-weight: 600; color: #667eea;">Keyboard Shortcuts:</div>
                        <div>• Enter / ↑ / → : Next Student</div>
                        <div>• ← / ↓ : Previous Student</div>
                        <div>• Esc : Clear marks field</div>
                        <div>• Tab : Focus marks input</div>
                        <div>• Ctrl + Space : Voice input</div>
                        <div style="color: #f6ad55;">• X : Mark as absent</div>
                        <div style="color: #48bb78; margin-top: 8px; font-size: 11px;">🎤 Voice: Continuous mode (auto-advances in 2s)</div>
                    `;
                    
                    document.body.appendChild(hintsContainer);
                    
                    const showHints = () => {
                        const studentFormEl = document.getElementById('studentForm');
                        if (studentFormEl && studentFormEl.style.display !== 'none') {
                            hintsContainer.style.opacity = '1';
                        } else {
                            hintsContainer.style.opacity = '0';
                        }
                    };
                    
                    const observer = new MutationObserver(showHints);
                    observer.observe(studentFormElement, { attributes: true, attributeFilter: ['style'] });
                    
                    showHints();
                    
                    let hideTimer;
                    const resetHideTimer = () => {
                        clearTimeout(hideTimer);
                        if (studentFormElement.style.display !== 'none') {
                            hintsContainer.style.opacity = '1';
                            hideTimer = setTimeout(() => {
                                hintsContainer.style.opacity = '0.3';
                            }, 15000);
                        }
                    };
                    
                    document.addEventListener('keydown', resetHideTimer);
                    document.addEventListener('mousemove', resetHideTimer);
                    resetHideTimer();

                    // Add close button for hints
                    const closeButton = document.createElement('button');
                    closeButton.innerHTML = '×';
                    closeButton.style.cssText = `
                        position: absolute;
                        top: 5px;
                        right: 8px;
                        background: none;
                        border: none;
                        color: #ccc;
                        font-size: 16px;
                        cursor: pointer;
                        padding: 0;
                        line-height: 1;
                    `;
                    closeButton.onclick = () => {
                        hintsContainer.style.display = 'none';
                    };
                    hintsContainer.style.position = 'relative';
                    hintsContainer.appendChild(closeButton);
                }
            }

            // Initialize keyboard hints
            addKeyboardShortcutHints();
            
            // Initialize speech recognition
            initializeSpeechRecognition();
        }

        (formId === "formOne" ? fetchTeacherAndStudentNames('formOne') :
        formId === "formTwo" ? fetchTeacherAndStudentNames('formTwo') :
        formId === "formThree" ? fetchTeacherAndStudentNames('formThree') :
        formId === "formFour" ? fetchTeacherAndStudentNames('formFour') : null);
    });
});

})();
