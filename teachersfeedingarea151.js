(function() {
    'use strict';

    const NMG_SCRIPT_ = 'https://script.google.com/macros/s/AKfycbxaMpVdGPtkJB94ADOer_FFNrVMIEuxLh4P-knZhBSx5YysMKg2tESUaPR5nhhExWsW/exec';
    const CACHE_KEY = 'academixpoint_schools';
    const CACHE_DURATION = 24 * 60 * 60 * 1000;
    
    let currentSchoolData = null;
    let allSchoolsData = null;
    window.universalCodeUrl = null;
function getAPIUrl() {
    return (currentSchoolData && currentSchoolData.urls && currentSchoolData.urls.teachers) 
        ? currentSchoolData.urls.teachers 
        : appScriptUrl;
}
    function log(message, data = null) {
        console.log(`[AcademixPoint] ${message}` || '');
    }
    
    async function init() {
        try {
            const schoolIndex = extractSchoolIndexFromUrl();
            
            if (!schoolIndex) {
                log('❌ No school index found');
                return false;
            }
            
            let schoolsData = loadFromCache();
            
            if (!schoolsData) {
                log('💾 No saved data found');
                schoolsData = await fetchSchoolDataFromServer();
                if (schoolsData) {
                    log('✅ Data Loaded successfully');
                    saveToCache(schoolsData);
                } else {
                    log('❌ Failed to Load data');
                }
            } else {
                log('💾 Using Saved data');
            }
            
            if (schoolsData) {
                allSchoolsData = schoolsData;
                log('🏫 All schools data loaded successfully');
                const success = setCurrentSchool(schoolIndex);
                if (success) {
                    log('🎯 Current school set successfully');
                } else {
                    log('❌ Failed to set current school');
                }
                return success;
            }
            
        } catch (error) {
            log('💥 Error initializing school data:', error.message);
            console.error('Full error:', error);
        }
        
        return false;
    }
    
    function extractSchoolIndexFromUrl() {
        const url = window.location.href;
        const pathname = window.location.pathname;
        
        log('🔍 Analyzing URL:', url);
        log('🔍 Pathname:', pathname);
        
        const primaryMatch = pathname.match(/\/p\/s(\d+)[-_]/i);
        if (primaryMatch) {
            const index = 'S' + primaryMatch[1];
            log('✅ Primary pattern matched');
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
                log('✅ Fallback pattern matched');
                return index;
            }
        }
        
        log('❌ No school  matched');
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
        log('🔗 Built API URL:', apiUrl);
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
                log('✅ Server returned successful data');
                return result.data;
            } else {
                log('❌ Server returned error or no data');
                throw new Error(result.message || 'Unknown server error');
            }
            
        } catch (error) {
            log('💥 Fetch failed:', error.message);
            console.error('Full fetch error:', error);
            return null;
        }
    }
    
    function loadFromCache() {
        log('💾 Attempting to load from cache...');
        
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) {
                log('📭 No cached data found');
                return null;
            }
            
            log('📦 Cached data found, parsing...');
            const data = JSON.parse(cached);
            
            const age = Date.now() - data.timestamp;
            const ageHours = Math.floor(age / (1000 * 60 * 60));
            
            log('⏰ Cache age:', ageHours + ' hours');
            
            if (data.timestamp && (age < CACHE_DURATION)) {
                log('✅ Saved Data is valid, using Saved data');
                return data.schools;
            } else {
                log('⏰ Cache expired, removing...');
                localStorage.removeItem(CACHE_KEY);
                return null;
            }
            
        } catch (error) {
            log('💥 Cache load error:', error.message);
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
    }
    
    function saveToCache(schoolsData) {
        log('💾 Saving data to cache...');
        
        try {
            const cacheData = {
                schools: schoolsData,
                timestamp: Date.now()
            };
            
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
            log('✅ Data cached successfully');
            
        } catch (error) {
            log('💥 Cache save error:', error.message);
            console.error('Full cache error:', error);
        }
    }
    
    function setCurrentSchool(schoolIndex) {
        log('🎯 Setting current school:', schoolIndex);
        
        if (!allSchoolsData || !schoolIndex) {
            log('❌ Missing data');
            return false;
        }
        
        const school = allSchoolsData[schoolIndex];
        
        if (!school) {
            log('❌ School not found');
            return false;
        }
        
        currentSchoolData = school;
        
        return true;
    }
    
    window.getSchoolUrl = function(type) {
        
        if (!currentSchoolData || !currentSchoolData.urls) {
            log('❌ No school data');
            return null;
        }
        
        const url = currentSchoolData.urls[type];
        return url || null;
    };
    
    window.getAllSchoolUrls = function() {
       
        if (!currentSchoolData || !currentSchoolData.urls) {
            log('❌ No school data');
            return null;
        }
        
        const urls = { ...currentSchoolData.urls };
        return urls;
    };
    
    window.getCurrentSchoolInfo = function() {
        if (!currentSchoolData) {
            log('❌ No current school data');
            return null;
        }
        
        const info = {
            name: currentSchoolData.schoolName,
            index: currentSchoolData.indexNumber,
            serialNumber: currentSchoolData.serialNumber,
            lastUpdated: currentSchoolData.lastUpdated
        };
        
        log('✅ Returning school info');
        return info;
    };
    
    window.getSchoolUrlSafe = function(type, fallback = '') {
        const url = window.getSchoolUrl(type);
        const result = url || fallback;
        return result;
    };
    
    window.isSchoolDataLoaded = function() {
        const loaded = currentSchoolData !== null;
        log('❓ Data loaded check:', loaded);
        return loaded;
    };
    
    window.refreshSchoolData = async function() {
        log('🔄 Refreshing school data...');
        localStorage.removeItem(CACHE_KEY);
        currentSchoolData = null;
        allSchoolsData = null;
        const result = await init();
        log('🔄 Refresh complete:', result);
        return result;
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            log('📄 DOM loaded, starting initialization...');
            setTimeout(() => {
                init().then(() => {
                    setupFormButtons();
                });
            }, 100);
        });
    } else {
        log('📄 DOM already loaded, starting initialization...');
        setTimeout(() => {
            init().then(() => {
                setupFormButtons();
            });
        }, 100);
    }
    
    function setupFormButtons() {
        const buttonForAll = document.getElementById("classButtonsTchfa");
        
        if (!buttonForAll) {
            log('❌ Element with ID "classButtonsTchfa" not found');
            return;
        }
        
        let buttonAllSub = [];
        if (currentSchoolData && currentSchoolData.urls) {
            log('📊 Using school data URLs for form buttons');
            
            // Create buttons only for available URLs
            if (currentSchoolData.urls.formOne) {
                buttonAllSub.push({ text: "Form One", id: "formOne", type: "formI", url: currentSchoolData.urls.formOne });
            }
            if (currentSchoolData.urls.formTwo) {
                buttonAllSub.push({ text: "Form Two", id: "formTwo", type: "formII", url: currentSchoolData.urls.formTwo });
            }
            if (currentSchoolData.urls.formThree) {
                buttonAllSub.push({ text: "Form Three", id: "formThree", type: "formIII", url: currentSchoolData.urls.formThree });
            }
            if (currentSchoolData.urls.formFour) {
                buttonAllSub.push({ text: "Form Four", id: "formFour", type: "formIV", url: currentSchoolData.urls.formFour });
            }
            
            log('📊 Created buttons for available URLs:', buttonAllSub.length);
        }
        
        // Fallback to default buttons if no school data or no URLs
        if (buttonAllSub.length === 0) {
            log('📊 Using default form buttons (no school URLs available)');
            buttonAllSub = [
                { text: "Form One", id: "formOne", type: "formI" },
                { text: "Form Two", id: "formTwo", type: "formII" },
                { text: "Form Three", id: "formThree", type: "formIII" },
                { text: "Form Four", id: "formFour", type: "formIV" }
            ];
        }
        
        buttonAllSub.forEach(button => {
            let btn = document.createElement("button");
            btn.className = "form-buttons";
            btn.id = button.id;
            btn.setAttribute("data-form-type", button.type);
            btn.textContent = button.text;
            buttonForAll.appendChild(btn);
        });
        
        let examinationTypeAll = document.getElementById("examType");
        
        if (examinationTypeAll) {
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
                { value: "PRENECTA2", innerCont: "PRE-NATIONAL EXAM 2" },
            ];
            
            examAlltype.forEach(exam => {
                let examallOpt = document.createElement("option");
                examallOpt.value = exam.value;
                examallOpt.textContent = exam.innerCont;
                examinationTypeAll.appendChild(examallOpt);
            });
        }
        
        const classButton = document.getElementById("classButtonsTchfa");
        const formContainer = document.querySelector(".form-container1");
        
        document.querySelectorAll('.form-buttons').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                classButton.style.display = "none";
                formContainer.style.display = "block";
                const formId = e.target.id;
                
                // Try to get URL from school data first
                let formUrl = null;
                if (currentSchoolData && currentSchoolData.urls) {
                    switch(formId) {
                        case "formOne":
                            formUrl = currentSchoolData.urls.formOne;
                            break;
                        case "formTwo":
                            formUrl = currentSchoolData.urls.formTwo;
                            break;
                        case "formThree":
                            formUrl = currentSchoolData.urls.formThree;
                            break;
                        case "formFour":
                            formUrl = currentSchoolData.urls.formFour;
                            break;
                    }
                }
                
                // Use school URL if available, otherwise fallback to original logic
                if (formUrl) {
                    log('🔗 Using school URL for ' + formId + ':', formUrl);
                    universalCodeUrl = formUrl;
                } else {
                    log('🔗 Using fallback URLs for ' + formId);
                    // Fallback to original URL logic
                    (formId === "formOne" ? universalCodeUrl = scriptUrlOne
                    : formId === "formTwo" ? universalCodeUrl = scriptUrlTwo
                    : formId === "formThree" ? universalCodeUrl = scriptUrlThree
                    : formId === "formFour" ? universalCodeUrl = scriptUrlFour: null);
                }
                
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
            
            if (!document.querySelector('link[href*="bootstrap"]')) {
                const bootstrapCSS = document.createElement('link');
                bootstrapCSS.rel = 'stylesheet';
                bootstrapCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.5/font/bootstrap-icons.min.css';
                document.head.appendChild(bootstrapCSS);
            }

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

            // Enhanced Speech Recognition Variables
            let recognition = null;
            let isListening = false;
            let audioContext = null;
            let microphone = null;
            let analyser = null;

            function initializeSpeechRecognition() {
                // Enhanced browser compatibility check
                const SpeechRecognition = window.SpeechRecognition || 
                                          window.webkitSpeechRecognition || 
                                          window.mozSpeechRecognition || 
                                          window.msSpeechRecognition;
                
                if (!SpeechRecognition) {
                    console.warn('Speech recognition not supported on this device/browser');
                    createFallbackMicButton();
                    return;
                }

                try {
                    recognition = new SpeechRecognition();
                    
                    // Enhanced settings for better mobile support
                    recognition.continuous = false;
                    recognition.interimResults = false; // Disabled for better mobile performance
                    recognition.lang = 'en-US';
                    recognition.maxAlternatives = 1; // Reduced for better performance
                    
                    // Add grammars if supported (helps with number recognition)
                    if ('webkitSpeechGrammarList' in window) {
                        const grammar = '#JSGF V1.0; grammar numbers; public <number> = zero | one | two | three | four | five | six | seven | eight | nine | ten | eleven | twelve | thirteen | fourteen | fifteen | sixteen | seventeen | eighteen | nineteen | twenty | thirty | forty | fifty | sixty | seventy | eighty | ninety | hundred | absent | x;';
                        const speechRecognitionList = new webkitSpeechGrammarList();
                        speechRecognitionList.addFromString(grammar, 1);
                        recognition.grammars = speechRecognitionList;
                    }
                    
                    recognition.onstart = function() {
                        console.log('Speech recognition started');
                        updateMicButton(true);
                        showVolumeIndicator();
                    };
                    
                    recognition.onresult = function(event) {
                        let transcript = '';
                        let confidence = 0;
                        
                        if (event.results.length > 0) {
                            const result = event.results[event.results.length - 1];
                            if (result.length > 0) {
                                transcript = result[0].transcript;
                                confidence = result[0].confidence || 0.5; // Default confidence if not available
                            }
                        }
                        
                        transcript = transcript.toLowerCase().trim();
                        console.log(`Recognized: "${transcript}" (confidence: ${confidence})`);
                        
                        const processedValue = processSpeechInput(transcript);
                        
                        if (processedValue !== null) {
                            document.getElementById('marks').value = processedValue;
                            showSpeechFeedback(`Detected: ${processedValue} (${Math.round(confidence * 100)}%)`, 'success');
                            
                            setTimeout(() => {
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
                            }, 1500);
                            
                        } else {
                            showSpeechFeedback(`Could not understand: "${transcript}". Please try again.`, 'error');
                            setTimeout(() => {
                                if (isListening) {
                                    startListening();
                                }
                            }, 2000);
                        }
                    };
                    
                    recognition.onerror = function(event) {
                        console.error('Speech recognition error:', event.error);
                        let errorMessage = 'Speech recognition error: ';
                        switch(event.error) {
                            case 'no-speech':
                                errorMessage += 'No speech detected. Try speaking louder.';
                                break;
                            case 'audio-capture':
                                errorMessage += 'Microphone not accessible.';
                                break;
                            case 'not-allowed':
                                errorMessage += 'Microphone access denied.';
                                break;
                            case 'network':
                                errorMessage += 'Network error occurred.';
                                break;
                            case 'service-not-allowed':
                                errorMessage += 'Speech service not available.';
                                break;
                            default:
                                errorMessage += event.error;
                        }
                        showSpeechFeedback(errorMessage, 'error');
                        stopListening();
                    };
                    
                    recognition.onend = function() {
                        console.log('Speech recognition ended');
                        if (isListening) {
                            setTimeout(() => {
                                if (isListening) {
                                    try {
                                        recognition.start();
                                    } catch (e) {
                                        console.error('Error restarting recognition:', e);
                                        stopListening();
                                    }
                                }
                            }, 100);
                        } else {
                            stopListening();
                        }
                    };

                    initializeAudioContext();
                    
                } catch (error) {
                    console.error('Error initializing speech recognition:', error);
                    createFallbackMicButton();
                }
                
                // Initialize enhancements after speech recognition is set up
                setTimeout(() => {
                    initializeEnhancements();
                    setupNavigationButtons();
                }, 1500);
            }

            function createFallbackMicButton() {
                const marksInput = document.getElementById('marks');
                if (marksInput) {
                    const inputContainer = marksInput.parentElement;
                    
                    const buttonContainer = document.createElement('div');
                    buttonContainer.style.cssText = 'display: flex; align-items: center; margin-left: 10px;';
                    
                    const micButton = document.createElement('button');
                    micButton.type = 'button';
                    micButton.disabled = true;
                    micButton.style.cssText = `
                        padding: 12px 18px;
                        border: none;
                        border-radius: 8px;
                        background: #ccc;
                        color: #666;
                        cursor: not-allowed;
                        font-size: 14px;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        min-width: 100px;
                        justify-content: center;
                    `;

                    micButton.innerHTML = `
                        <i class="bi bi-mic-mute"></i>
                        <span>N/A</span>
                    `;
                    
                    micButton.title = 'Voice input not supported on this device/browser';
                    
                    buttonContainer.appendChild(micButton);
                    inputContainer.appendChild(buttonContainer);
                }
            }

            function initializeAudioContext() {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia({ 
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true,
                            sampleRate: 44100
                        } 
                    })
                    .then(function(stream) {
                        audioContext = new (window.AudioContext || window.webkitAudioContext)();
                        analyser = audioContext.createAnalyser();
                        microphone = audioContext.createMediaStreamSource(stream);
                        
                        analyser.fftSize = 256;
                        microphone.connect(analyser);
                        
                        console.log('Audio context initialized successfully');
                    })
                    .catch(function(err) {
                        console.error('Error accessing microphone:', err);
                    });
                }
            }

            function processSpeechInput(transcript) {
                // Enhanced number mappings for English and Swahili
                const numberMappings = {
                    // English numbers
                    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
                    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
                    'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13',
                    'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17',
                    'eighteen': '18', 'nineteen': '19', 'twenty': '20',
                    'twenty one': '21', 'twenty two': '22', 'twenty three': '23', 'twenty four': '24',
                    'twenty five': '25', 'twenty six': '26', 'twenty seven': '27', 'twenty eight': '28',
                    'twenty nine': '29', 'thirty': '30', 'forty': '40', 'fifty': '50', 
                    'sixty': '60', 'seventy': '70', 'eighty': '80', 'ninety': '90', 'hundred': '100',
                    
                    // Swahili numbers
                    'sifuri': '0', 'moja': '1', 'mbili': '2', 'tatu': '3', 'nne': '4',
                    'tano': '5', 'sita': '6', 'saba': '7', 'nane': '8', 'tisa': '9',
                    'kumi': '10', 'kumi na moja': '11', 'kumi na mbili': '12', 'kumi na tatu': '13',
                    'kumi na nne': '14', 'kumi na tano': '15', 'kumi na sita': '16',
                    'kumi na saba': '17', 'kumi na nane': '18', 'kumi na tisa': '19',
                    'ishirini': '20', 'thelathini': '30', 'arobaini': '40', 'hamsini': '50',
                    'sitini': '60', 'sabini': '70', 'themanini': '80', 'tisini': '90', 'mia': '100',
                    
                    // Absent markers
                    'absent': 'X', 'x': 'X', 'ex': 'X', 'cross': 'X',
                    'hapakuwepo': 'X', 'hakuwepo': 'X', 'hayupo': 'X'
                };

                // Direct mapping check
                if (numberMappings[transcript]) {
                    return numberMappings[transcript];
                }

                // Numeric extraction
                const numberMatch = transcript.match(/(\d+)/g);
                if (numberMatch) {
                    const number = parseInt(numberMatch[0]);
                    if (number >= 0 && number <= 100) {
                        return number.toString();
                    }
                }

                // Compound word processing
                const words = transcript.split(/\s+/);
                let total = 0;
                let hasNumber = false;

                for (let i = 0; i < words.length; i++) {
                    const word = words[i].trim().toLowerCase();
                    const nextWord = i < words.length - 1 ? words[i + 1].trim().toLowerCase() : '';
                    const compound = `${word} ${nextWord}`.trim();
                    
                    // Check compound words first
                    if (numberMappings[compound]) {
                        const value = parseInt(numberMappings[compound]);
                        if (!isNaN(value)) {
                            total = value; 
                            hasNumber = true;
                            i++; 
                            continue;
                        }
                    }
                    
                    if (numberMappings[word]) {
                        const value = parseInt(numberMappings[word]);
                        if (!isNaN(value)) {
                            if (value === 100) {
                                total = 100; 
                            } else if (value >= 20) {
                                total = value; // Reset total for tens
                            } else {
                                total += value;
                            }
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
                    
                    try {
                        recognition.start();
                    } catch (error) {
                        console.error('Error starting recognition:', error);
                        stopListening();
                    }
                }
            }

            function stopListening() {
                if (recognition && isListening) {
                    isListening = false;
                    updateMicButton(false);
                    hideVolumeIndicator();
                    
                    try {
                        recognition.stop();
                    } catch (error) {
                        console.error('Error stopping recognition:', error);
                    }
                }
            }

            function updateMicButton(listening) {
                const micButton = document.getElementById('micButton');
                const micIcon = document.getElementById('micIcon');
                const micText = document.getElementById('micText');
                const onAirIndicator = document.getElementById('onAirIndicator');
                
                if (micButton && micIcon && micText) {
                    if (listening) {
                        micIcon.className = 'bi bi-mic-fill';
                        micText.textContent = 'ON AIR';
                        micButton.style.background = 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)';
                        micButton.style.animation = 'pulse 1.5s infinite';
                        micButton.title = 'Continuous voice mode active - Click to stop';
                        
                        if (onAirIndicator) {
                            onAirIndicator.style.display = 'flex';
                            onAirIndicator.style.animation = 'blink 1s infinite';
                        }
                    } else {
                        micIcon.className = 'bi bi-mic';
                        micText.textContent = 'START';
                        micButton.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                        micButton.style.animation = 'none';
                        micButton.title = 'Click to start continuous voice input';
                        
                        if (onAirIndicator) {
                            onAirIndicator.style.display = 'none';
                            onAirIndicator.style.animation = 'none';
                        }
                    }
                }
            }

            function showVolumeIndicator() {
                let volumeIndicator = document.getElementById('volumeIndicator');
                if (!volumeIndicator && analyser) {
                    volumeIndicator = document.createElement('div');
                    volumeIndicator.id = 'volumeIndicator';
                    volumeIndicator.style.cssText = `
                        position: fixed;
                        top: 70px;
                        right: 20px;
                        width: 200px;
                        height: 50px;
                        background: rgba(0, 0, 0, 0.8);
                        border-radius: 25px;
                        display: flex;
                        align-items: center;
                        padding: 10px 15px;
                        color: white;
                        font-size: 12px;
                        z-index: 2000;
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    `;
                    
                    volumeIndicator.innerHTML = `
                        <i class="bi bi-volume-up" style="margin-right: 10px;"></i>
                        <div style="flex: 1; height: 8px; background: rgba(255,255,255,0.3); border-radius: 4px; position: relative;">
                            <div id="volumeBar" style="height: 100%; background: linear-gradient(90deg, #48bb78, #f6ad55, #f56565); border-radius: 4px; width: 0%; transition: width 0.1s ease;"></div>
                        </div>
                    `;
                    
                    document.body.appendChild(volumeIndicator);
                    
                    // Start volume monitoring
                    monitorVolume();
                }
            }

            function hideVolumeIndicator() {
                const volumeIndicator = document.getElementById('volumeIndicator');
                if (volumeIndicator) {
                    volumeIndicator.remove();
                }
            }

            function monitorVolume() {
                if (!analyser || !isListening) return;
                
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                
                function updateVolume() {
                    if (!isListening) return;
                    
                    analyser.getByteFrequencyData(dataArray);
                    
                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                    }
                    
                    const average = sum / bufferLength;
                    const volumePercent = Math.min((average / 128) * 100, 100);
                    
                    const volumeBar = document.getElementById('volumeBar');
                    if (volumeBar) {
                        volumeBar.style.width = volumePercent + '%';
                    }
                    
                    requestAnimationFrame(updateVolume);
                }
                
                updateVolume();
            }

            function showSpeechFeedback(message, type) {
                let feedbackElement = document.getElementById('speechFeedback');
                if (!feedbackElement) {
                    feedbackElement = document.createElement('div');
                    feedbackElement.id = 'speechFeedback';
                    feedbackElement.style.cssText = `
                        position: fixed;
                        top: 130px;
                        right: 20px;
                        padding: 15px 20px;
                        border-radius: 10px;
                        color: white;
                        z-index: 2000;
                        font-weight: 600;
                        transform: translateX(100%);
                        transition: transform 0.3s ease;
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        max-width: 300px;
                        font-size: 14px;
                    `;
                    document.body.appendChild(feedbackElement);
                }

                const colors = {
                    success: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                    error: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                    listening: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                };

                feedbackElement.style.background = colors[type] || colors.success;
                feedbackElement.innerHTML = `
                    <div style="display: flex; align-items: center;">
                        <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'mic'}" style="margin-right: 8px; font-size: 16px;"></i>
                        ${message}
                    </div>
                `;
                feedbackElement.style.transform = 'translateX(0)';

                setTimeout(() => {
                    feedbackElement.style.transform = 'translateX(100%)';
                }, type === 'listening' ? 2000 : 4000);
            }

            function createMicrophoneButton() {
                const marksInput = document.getElementById('marks');
                if (marksInput && recognition) {
                    const inputContainer = marksInput.parentElement;
                    
                    let micButton = document.getElementById('micButton');
                    if (!micButton) {
                        // Create button container
                        const buttonContainer = document.createElement('div');
                        buttonContainer.style.cssText = 'display: flex; align-items: center; margin-left: 10px;';
                        
                        // Create microphone button
                        micButton = document.createElement('button');
                        micButton.id = 'micButton';
                        micButton.type = 'button';
                        micButton.style.cssText = `
                            padding: 12px 18px;
                            border: none;
                            border-radius: 8px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 600;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            min-width: 100px;
                            justify-content: center;
                        `;

                        micButton.innerHTML = `
                            <i id="micIcon" class="bi bi-mic"></i>
                            <span id="micText">START</span>
                        `;

                        // Create on-air indicator
                        const onAirIndicator = document.createElement('div');
                        onAirIndicator.id = 'onAirIndicator';
                        onAirIndicator.style.cssText = `
                            display: none;
                            align-items: center;
                            background: #ff4444;
                            color: white;
                            padding: 4px 8px;
                            border-radius: 12px;
                            font-size: 10px;
                            font-weight: bold;
                            margin-left: 8px;
                            text-transform: uppercase;
                        `;
                        onAirIndicator.innerHTML = '<i class="bi bi-broadcast" style="margin-right: 4px;"></i>ON AIR';

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

                        buttonContainer.appendChild(micButton);
                        buttonContainer.appendChild(onAirIndicator);
                        inputContainer.appendChild(buttonContainer);

                        // Add animations CSS if not present
                        if (!document.getElementById('voiceAnimations')) {
                            const style = document.createElement('style');
                            style.id = 'voiceAnimations';
                            style.textContent = `
                                @keyframes pulse {
                                    0% { box-shadow: 0 4px 15px rgba(255, 68, 68, 0.3); }
                                    50% { box-shadow: 0 4px 25px rgba(255, 68, 68, 0.6); }
                                    100% { box-shadow: 0 4px 15px rgba(255, 68, 68, 0.3); }
                                }
                                @keyframes blink {
                                    0%, 50% { opacity: 1; }
                                    51%, 100% { opacity: 0.3; }
                                }
                            `;
                            document.head.appendChild(style);
                        }
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

                localStorage.setItem('teacherName', teacherName); // Enhanced: Store teacher name
                localStorage.setItem('subject', subject);
                localStorage.setItem('examType', examType);

                document.getElementById('teacherInfo').innerText = `Teacher: ${teacherName}, Subject: ${subject}, Exam Type: ${examType}`;
                displayStudent(currentStudentIndex);

                document.getElementById('teacherForm').style.display = 'none';
                document.getElementById('studentForm').style.display = 'block';
                
                // Initialize enhancements after form is visible
                setTimeout(() => {
                    createMicrophoneButton();
                    initializeEnhancements();
                    setupNavigationButtons();
                    autoFocusMarksInput(); // Ensure focus on form load
                }, 300);
            });

            function displayStudent(index) {
                const student = students[index];
                
                // Format index number with 4 digits (e.g., 0001, 0002, etc.)
                const indexNumber = String(index + 1).padStart(4, '0');
                
                // Display student name with index number
                document.getElementById('studentFullName').innerText = `${indexNumber}. ${student.fullName}`;
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
                        <li><strong>Unaweza pia kutumia kipaza sauti kuongea alama kwa Kiingereza au Kiswahili (imeboreka zaidi!)</strong></li>
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
                
                // Ensure microphone button and focus are available
                setTimeout(() => {
                    createMicrophoneButton();
                    autoFocusMarksInput();
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
                    
                    setTimeout(() => {
                        autoFocusMarksInput();
                    }, 100);
                }
            }

            function previousStudent() {
                if (currentStudentIndex > 0) {
                    currentStudentIndex--;
                    localStorage.setItem('currentStudentIndex', currentStudentIndex);
                    displayStudent(currentStudentIndex);
                    
                    // Ensure keyboard stays visible on mobile
                    setTimeout(() => {
                        autoFocusMarksInput();
                    }, 100);
                }
            }

            document.getElementById("previousStudent").onclick = function() {
                previousStudent();
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
               const dynamicUrl = getAPIUrl();
               const url = role ? `${dynamicUrl}?role=${role}` : dynamicUrl;

                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        localStorage.setItem('teachers', JSON.stringify(data.Teachers));
                        populateTeacherDropdown(data.Teachers);

                        if (role && data.Students) {
                            students.length = 0; // Clear existing students
                            data.Students.forEach(student => {
                                students.push({ fullName: student.fullName, sex: student.sex });
                            });
                            document.getElementById('totalStudents').innerText = students.length;
                            updateProgress();
                            console.log(`Loaded ${students.length} students for ${role}`);
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

            // Enhanced Student Search System
            function createSearchSystem() {
                const studentForm = document.getElementById('studentForm');
                if (!studentForm) return;
                
                // Check if search already exists
                if (document.getElementById('student-search-container')) {
                    return; // Already initialized
                }
                
                const searchContainer = document.createElement('div');
                searchContainer.id = 'student-search-container';
                searchContainer.style.cssText = `
                    margin: 15px 0;
                    padding: 15px;
                    background: #f8f9ff;
                    border-radius: 10px;
                    border: 1px solid #e0e6ff;
                `;

                searchContainer.innerHTML = `
                    <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                        <input type="text" id="student-search" placeholder="Search by name or number..." 
                               style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px;">
                        <button type="button" id="clear-search" style="padding: 10px 15px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            <i class="bi bi-x-circle"></i> Clear
                        </button>
                    </div>
                    <div id="search-results" style="max-height: 200px; overflow-y: auto; display: none;"></div>
                `;
                
                const studentInfo = studentForm.querySelector('#studentInfo') || studentForm.firstElementChild;
                studentForm.insertBefore(searchContainer, studentInfo);

                // Search functionality
                const searchInput = document.getElementById('student-search');
                const searchResults = document.getElementById('search-results');
                const clearSearch = document.getElementById('clear-search');

                searchInput.addEventListener('input', function() {
                    const query = this.value.toLowerCase().trim();
                    
                    if (query.length < 2) {
                        searchResults.style.display = 'none';
                        return;
                    }

                    const matches = students.filter((student, index) => {
                        const indexNumber = String(index + 1).padStart(4, '0');
                        return student.fullName.toLowerCase().includes(query) || 
                               indexNumber.includes(query);
                    });

                    if (matches.length > 0) {
                        searchResults.innerHTML = matches.map((student, matchIndex) => {
                            const originalIndex = students.findIndex(s => s.fullName === student.fullName);
                            const indexNumber = String(originalIndex + 1).padStart(4, '0');
                            const isMarked = studentMarks[student.fullName];
                            
                            return `
                                <div class="search-result-item" data-index="${originalIndex}" 
                                     style="padding: 10px; margin: 5px 0; background: white; border-radius: 5px; 
                                            cursor: pointer; border: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;
                                            ${isMarked ? 'background: #e8f5e8; border-color: #28a745;' : ''}">
                                    <div>
                                        <strong>${indexNumber}. ${student.fullName}</strong>
                                        <small style="color: #666; margin-left: 10px;">(${student.sex})</small>
                                    </div>
                                    <div style="font-size: 12px; color: ${isMarked ? '#28a745' : '#6c757d'};">
                                        ${isMarked ? `Marked: ${isMarked}` : 'Not marked'}
                                    </div>
                                </div>
                            `;
                        }).join('');
                        
                        searchResults.style.display = 'block';
                        searchResults.querySelectorAll('.search-result-item').forEach(item => {
                            item.addEventListener('click', function() {
                                const index = parseInt(this.getAttribute('data-index'));
                                currentStudentIndex = index;
                                localStorage.setItem('currentStudentIndex', currentStudentIndex);
                                displayStudent(currentStudentIndex);
                                searchInput.value = '';
                                searchResults.style.display = 'none';
                                autoFocusMarksInput();
                            });
                        });
                    } else {
                        searchResults.innerHTML = '<div style="padding: 10px; text-align: center; color: #666;">No students found</div>';
                        searchResults.style.display = 'block';
                    }
                });

                clearSearch.addEventListener('click', function() {
                    searchInput.value = '';
                    searchResults.style.display = 'none';
                });
                
                document.addEventListener('click', function(e) {
                    if (!searchContainer.contains(e.target)) {
                        searchResults.style.display = 'none';
                    }
                });
            }

            // Enhanced Report Generation System
            function calculateGrade(marks) {
                if (marks === 'X' || marks === '' || marks === null || marks === undefined) {
                    return '-';
                }
                
                const numericMarks = parseInt(marks);
                if (isNaN(numericMarks)) return '-';
                
                if (numericMarks >= 75) return 'A';
                if (numericMarks >= 65) return 'B';
                if (numericMarks >= 45) return 'C';
                if (numericMarks >= 30) return 'D';
                return 'F';
            }

            function generateReports() {
                const teacherName = localStorage.getItem('teacherName');
                const subject = localStorage.getItem('subject');
                const examType = localStorage.getItem('examType');
                
                // Prepare student data with grades and rankings
                const studentsWithMarks = students.map((student, index) => {
                    const marks = studentMarks[student.fullName] || '';
                    const grade = calculateGrade(marks);
                    const indexNumber = String(index + 1).padStart(4, '0');
                    
                    return {
                        candidateNumber: indexNumber,
                        name: student.fullName,
                        sex: student.sex,
                        marks: marks === '' ? '-' : marks,
                        grade: grade,
                        numericMarks: marks === 'X' || marks === '' ? -1 : parseInt(marks) || -1
                    };
                });

                // Calculate rankings
                const validStudents = studentsWithMarks.filter(s => s.numericMarks >= 0);
                validStudents.sort((a, b) => b.numericMarks - a.numericMarks);
                
                let currentPosition = 1;
                let previousMarks = null;
                let studentsAtPosition = 0;

                validStudents.forEach((student, index) => {
                    if (previousMarks !== null && student.numericMarks < previousMarks) {
                        currentPosition += studentsAtPosition;
                        studentsAtPosition = 1;
                    } else {
                        studentsAtPosition++;
                    }
                    
                    student.position = currentPosition;
                    previousMarks = student.numericMarks;
                });

                // Add positions back to main array
                studentsWithMarks.forEach(student => {
                    const validStudent = validStudents.find(vs => vs.candidateNumber === student.candidateNumber);
                    student.position = validStudent ? validStudent.position : '-';
                });

                // Generate both Excel and PDF reports
                generateExcelReport(studentsWithMarks, { teacherName, subject, examType });
                generatePDFReport(studentsWithMarks, { teacherName, subject, examType });
            }

            function generateExcelReport(data, metadata) {
                // Create CSV content
                const csvContent = [
                    // Header information
                    ['EXAMINATION RESULTS REPORT'],
                    ['Teacher:', metadata.teacherName],
                    ['Subject:', metadata.subject],
                    ['Exam Type:', metadata.examType],
                    ['Generated:', new Date().toLocaleString()],
                    [''],
                    // Table headers
                    ['Candidate No.', 'Student Name', 'Sex', 'Marks', 'Grade', 'Position'],
                    // Student data
                    ...data.map(student => [
                        student.candidateNumber,
                        student.name,
                        student.sex,
                        student.marks,
                        student.grade,
                        student.position
                    ]),
                    [''],
                    // Summary
                    ['SUMMARY:'],
                    ['Total Students:', data.length],
                    ['Students Marked:', data.filter(s => s.marks !== '-').length],
                    ['Grade A:', data.filter(s => s.grade === 'A').length],
                    ['Grade B:', data.filter(s => s.grade === 'B').length],
                    ['Grade C:', data.filter(s => s.grade === 'C').length],
                    ['Grade D:', data.filter(s => s.grade === 'D').length],
                    ['Grade F:', data.filter(s => s.grade === 'F').length],
                    ['Absent:', data.filter(s => s.marks === 'X').length]
                ];

                // Convert to CSV format
                const csv = csvContent.map(row => 
                    row.map(cell => `"${cell}"`).join(',')
                ).join('\n');

                // Download CSV file
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${metadata.subject}_${metadata.examType}_Results.csv`;
                link.click();
            }

            function generatePDFReport(data, metadata) {
                // Create HTML content for PDF
                const htmlContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Examination Results</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .info { margin-bottom: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                            th { background-color: #f0f0f0; font-weight: bold; }
                            .summary { margin-top: 20px; }
                            .grade-a { background-color: #d4edda; }
                            .grade-b { background-color: #cce5ff; }
                            .grade-c { background-color: #fff3cd; }
                            .grade-d { background-color: #f8d7da; }
                            .grade-f { background-color: #f5c6cb; }
                            @media print {
                                body { margin: 10px; }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>EXAMINATION RESULTS REPORT</h1>
                        </div>
                        
                        <div class="info">
                            <p><strong>Teacher:</strong> ${metadata.teacherName}</p>
                            <p><strong>Subject:</strong> ${metadata.subject}</p>
                            <p><strong>Exam Type:</strong> ${metadata.examType}</p>
                            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Candidate No.</th>
                                    <th>Student Name</th>
                                    <th>Sex</th>
                                    <th>Marks</th>
                                    <th>Grade</th>
                                    <th>Position</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.map(student => `
                                    <tr class="grade-${student.grade.toLowerCase()}">
                                        <td>${student.candidateNumber}</td>
                                        <td>${student.name}</td>
                                        <td>${student.sex}</td>
                                        <td>${student.marks}</td>
                                        <td>${student.grade}</td>
                                        <td>${student.position}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>

                        <div class="summary">
                            <h3>SUMMARY</h3>
                            <p><strong>Total Students:</strong> ${data.length}</p>
                            <p><strong>Students Marked:</strong> ${data.filter(s => s.marks !== '-').length}</p>
                            <p><strong>Grade A (75-100):</strong> ${data.filter(s => s.grade === 'A').length}</p>
                            <p><strong>Grade B (65-74):</strong> ${data.filter(s => s.grade === 'B').length}</p>
                            <p><strong>Grade C (45-64):</strong> ${data.filter(s => s.grade === 'C').length}</p>
                            <p><strong>Grade D (30-44):</strong> ${data.filter(s => s.grade === 'D').length}</p>
                            <p><strong>Grade F (0-29):</strong> ${data.filter(s => s.grade === 'F').length}</p>
                            <p><strong>Absent (X):</strong> ${data.filter(s => s.marks === 'X').length}</p>
                        </div>

                        <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print PDF</button>
                    </body>
                    </html>
                `;

                // Open in new window for printing
                const printWindow = window.open('', '_blank');
                printWindow.document.write(htmlContent);
                printWindow.document.close();
            }

            function addReportGenerationButton() {
                const studentForm = document.getElementById('studentForm');
                if (!studentForm) return;

                const submitButton = document.getElementById('submitAllMarks');
                if (!submitButton) return;
                
                // Check if button already exists
                if (document.getElementById('generateReports')) {
                    return; // Already added
                }

                const reportButton = document.createElement('button');
                reportButton.type = 'button';
                reportButton.id = 'generateReports';
                reportButton.style.cssText = `
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-left: 10px;
                    margin-top: 10px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                `;
                reportButton.innerHTML = '<i class="bi bi-file-earmark-spreadsheet"></i> Generate Reports';

                reportButton.addEventListener('click', function() {
                    const markedStudents = Object.keys(studentMarks).length;
                    if (markedStudents === 0) {
                        displayErrorMessage('No students have been marked. Please mark at least one student before generating reports.');
                        return;
                    }

                    showSuccessMessage('Generating Excel and PDF reports...');
                    setTimeout(generateReports, 500);
                });

                // Insert after submit button
                submitButton.parentNode.insertBefore(reportButton, submitButton.nextSibling);
            }

            function setupNavigationButtons() {
                const previousButton = document.getElementById("previousStudent");
                
                if (previousButton) {
                    // Clear any existing onclick handlers
                    previousButton.onclick = null;
                    
                    // Add proper event listener
                    previousButton.addEventListener('click', function() {
                        previousStudent();
                    });
                }
            }

            function initializeEnhancements() {
                addMobileOptimizations();
                setTimeout(createSearchSystem, 1000);
                setTimeout(addReportGenerationButton, 1000);
                initializeSpeechRecognition();
            }

            function addMobileOptimizations() {
                if (!document.getElementById('mobile-optimizations')) {
                    const style = document.createElement('style');
                    style.id = 'mobile-optimizations';
                    style.textContent = `
                        @media screen and (max-width: 768px) {
                            /* Prevent zoom on input focus */
                            input[type="text"], input[type="number"], select {
                                font-size: 16px !important;
                                transform-origin: top left;
                            }
                            
                            /* Better touch targets */
                            button {
                                min-height: 44px;
                                min-width: 44px;
                            }
                            
                            /* Prevent horizontal scroll */
                            body {
                                overflow-x: hidden;
                            }
                            
                            /* Better keyboard shortcuts container */
                            #keyboard-hints {
                                bottom: 10px;
                                right: 10px;
                                max-width: 280px;
                                font-size: 11px;
                            }
                            
                            /* Search container mobile optimization */
                            #student-search-container {
                                margin: 10px 0;
                                padding: 10px;
                            }
                            
                            #student-search {
                                font-size: 16px !important; /* Prevent zoom */
                            }
                        }
                    `;
                    document.head.appendChild(style);
                }
            }

            // Enhanced Keyboard Shortcuts System
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
                        
                    case ' ': 
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
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                    
                    if (isMobile) {
                        marksInput.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center',
                            inline: 'nearest'
                        });
                        
                        setTimeout(() => {
                            marksInput.focus();
                            marksInput.select();
                            setTimeout(() => {
                                if (document.activeElement !== marksInput) {
                                    marksInput.focus();
                                }
                            }, 100);
                        }, 300);
                    } else {
                        setTimeout(() => {
                            marksInput.focus();
                            marksInput.select();
                        }, 100);
                    }
                }
            }

            // Enhanced Numeric Input System
            function setupNumericInputShortcuts() {
                const marksInput = document.getElementById('marks');
                if (marksInput) {
                    marksInput.addEventListener('keydown', function(event) {
                        // Allow: backspace, delete, tab, escape, enter, home, end, left, right, down, up
                        if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(event.keyCode) !== -1 ||
                            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                            (event.keyCode === 65 && event.ctrlKey === true) ||
                            (event.keyCode === 67 && event.ctrlKey === true) ||
                            (event.keyCode === 86 && event.ctrlKey === true) ||
                            (event.keyCode === 88 && event.ctrlKey === true)) {
                            return;
                        }
                        
                        // Handle Enter key
                        if (event.keyCode === 13) {
                            event.preventDefault();
                            if (this.value.trim() !== '') {
                                document.getElementById('saveMarksLocally').click();
                            } else {
                                showTemporaryMessage('Please enter marks first!');
                            }
                            return;
                        }
                        
                        // Handle X key for absent
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
                        
                        // If already X, prevent other input
                        if (this.value.toUpperCase() === 'X') {
                            event.preventDefault();
                            return;
                        }
                        
                        // Ensure that it's a number and stop the keypress
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

            // Enhanced Event Listeners Setup
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

            // Enhanced button event listeners
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

            // Initialize on window load
            window.addEventListener('load', autoFocusMarksInput);
            
            // Initialize numeric input shortcuts
            setupNumericInputShortcuts();

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
                        z-index: 10000;
                        font-family: 'Inter', sans-serif;
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        opacity: 0;
                        transition: opacity 0.3s ease;
                        max-width: 300px;
                    `;
                    
                    hintsContainer.innerHTML = `
                        <div style="margin-bottom: 8px; font-weight: 600; color: #667eea;"><i class="bi bi-keyboard"></i> Keyboard Shortcuts:</div>
                        <div><i class="bi bi-arrow-return-left"></i> Enter / ↑ / → : Next Student</div>
                        <div><i class="bi bi-arrow-left"></i> ← / ↓ : Previous Student</div>
                        <div><i class="bi bi-escape"></i> Esc : Clear marks field</div>
                        <div><i class="bi bi-tab"></i> Tab : Focus marks input</div>
                        <div><i class="bi bi-mic"></i> Ctrl + Space : Voice input</div>
                        <div style="color: #f6ad55;"><i class="bi bi-x-lg"></i> X : Mark as absent</div>
                        <div style="color: #48bb78; margin-top: 8px; font-size: 11px;"><i class="bi bi-broadcast"></i> Voice: Enhanced sensitivity & auto-advance</div>
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

                    // Add close button
                    const closeButton = document.createElement('button');
                    closeButton.innerHTML = '<i class="bi bi-x"></i>';
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

            // Execute form code based on selected form
            (formId === "formOne" ? fetchTeacherAndStudentNames('formOne') :
            formId === "formTwo" ? fetchTeacherAndStudentNames('formTwo') :
            formId === "formThree" ? fetchTeacherAndStudentNames('formThree') :
            formId === "formFour" ? fetchTeacherAndStudentNames('formFour') : null);
        }

        // Initialize form based on selected form
        (formId === "formOne" ? fetchTeacherAndStudentNames('formOne') :
        formId === "formTwo" ? fetchTeacherAndStudentNames('formTwo') :
        formId === "formThree" ? fetchTeacherAndStudentNames('formThree') :
        formId === "formFour" ? fetchTeacherAndStudentNames('formFour') : null);
    });
});
     
        log('✅ Form buttons setup completed');
    }
})();
