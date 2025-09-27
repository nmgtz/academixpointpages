/**
 * AcademixPoint School Management System
 * Refined version with improved error handling, DOM safety, and modern patterns
 */

// ========================================
// CONFIGURATION & CONSTANTS
// ========================================
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbxaMpVdGPtkJB94ADOer_FFNrVMIEuxLh4P-knZhBSx5YysMKg2tESUaPR5nhhExWsW/exec',
  CACHE_KEY: 'academixpoint_schools',
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  MAX_SUBJECTS: 16,
  LOADING_TIMEOUT: 5000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

const SUBJECTS = [
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

// ========================================
// MAIN APPLICATION CLASS
// ========================================
class SchoolManagementSystem {
  constructor() {
    this.currentSchoolData = null;
    this.allSchoolsData = null;
    this.selectedClass = '';
    this.nmgFURL = '';
    this.allData = [];
    this.allHeaders = [];
    this.selectedSubjects = this.loadSelectedSubjects();
    this.dragStartIndex = null;
    this.isInitialized = false;
  }

  // ========================================
  // INITIALIZATION METHODS
  // ========================================
  async init() {
    try {
      await this.waitForDOM();
      
      const schoolIndex = this.extractSchoolIndexFromUrl();
      if (!schoolIndex) {
        this.log('❌ No school index found in URL');
        return false;
      }
      
      let schoolsData = this.loadFromCache();
      
      if (!schoolsData) {
        const result = await this.fetchSchoolDataWithRetry();
        if (result.success) {
          schoolsData = result.data;
          this.saveToCache(schoolsData);
        } else {
          this.showErrorMessage('Failed to load school data. Please refresh the page.');
          return false;
        }
      } else {
        this.log('💾 Using cached data');
      }
      
      if (schoolsData) {
        this.allSchoolsData = schoolsData;
        const success = this.setCurrentSchool(schoolIndex);
        if (success) {
          this.setupURLDATA();
          this.initializeEventListeners();
          this.initializeSubjects();
          this.isInitialized = true;
          this.log('🎯 School data initialized successfully');
          return true;
        }
      }
      
      return false;
      
    } catch (error) {
      this.log('💥 Critical initialization error');
      console.error('Initialization failed:', error);
      this.showErrorMessage('System initialization failed. Please refresh the page.');
      return false;
    }
  }

  waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }

  initializeEventListeners() {
    // Class selector
    const classSelector = this.safeGetElement('classSelector');
    if (classSelector) {
      classSelector.addEventListener('change', (e) => this.handleClassSelection(e));
    }

    // Main button
    const button1 = this.safeGetElement('button1');
    if (button1) {
      button1.addEventListener('click', () => this.handleDataDisplay());
    }

    // Check button
    const checkBtn = this.safeGetElement('checkBtn');
    if (checkBtn) {
      checkBtn.addEventListener('click', () => this.displayStudentDataOptions(false));
    }
  }

  initializeSubjects() {
    const subjectList = this.safeGetElement('subjectList');
    const selectedList = this.safeGetElement('selectedList');
    
    if (!subjectList || !selectedList) return;

    // Create subject elements
    SUBJECTS.forEach(subject => {
      const div = document.createElement('div');
      div.className = 'subject';
      div.textContent = subject.name;
      div.dataset.id = subject.id;

      // Check if already selected
      if (this.selectedSubjects.find(s => s.id === subject.id)) {
        div.classList.add('selected');
      }

      div.addEventListener('click', () => this.toggleSubject(subject.id, subject.name, div));
      subjectList.appendChild(div);
    });

    this.updateSelectedList();
  }

  // ========================================
  // UTILITY METHODS
  // ========================================
  safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element with id '${id}' not found`);
    }
    return element;
  }

  log(message, data = null) {
    console.log(`[AcademixPoint] ${message}`, data || '');
  }

  showLoadingOverlay() {
    const overlay = this.safeGetElement('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
  }

  hideLoadingOverlay() {
    const overlay = this.safeGetElement('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  showErrorMessage(message, duration = 5000) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed; top: 20px; right: 20px; 
      background: #dc3545; color: white; 
      padding: 15px 20px; border-radius: 8px; 
      z-index: 10000; max-width: 350px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      font-family: Arial, sans-serif;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, duration);
  }

  showSuccessMessage(message, duration = 3000) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
      position: fixed; top: 20px; right: 20px; 
      background: #28a745; color: white; 
      padding: 15px 20px; border-radius: 8px; 
      z-index: 10000; max-width: 350px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      font-family: Arial, sans-serif;
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, duration);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========================================
  // URL AND SCHOOL DATA METHODS
  // ========================================
  extractSchoolIndexFromUrl() {
    const url = window.location.href;
    const pathname = window.location.pathname;
    
    const primaryMatch = pathname.match(/\/p\/s(\d+)[-_]/i);
    if (primaryMatch) {
      return 'S' + primaryMatch[1];
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
        return 'S' + match[1];
      }
    }
    
    return null;
  }

  buildApiUrl() {
    const params = new URLSearchParams({
      page: this.getCurrentPageType(),
      referer: window.location.origin,
      domain: window.location.hostname,
      timestamp: Date.now().toString(),
      path: window.location.pathname
    });
    
    return `${CONFIG.API_URL}?${params.toString()}`;
  }

  getCurrentPageType() {
    const path = window.location.pathname.toLowerCase();
    
    if (path.includes('teachers')) return 'teachers-feeding-area';
    if (path.includes('student')) return 'student-feeding-area';
    if (path.includes('academix')) return 'academixpoint-page';
    return 'school-portal';
  }

  getNameAPI() {
    return (this.currentSchoolData && this.currentSchoolData.urls && this.currentSchoolData.urls.teachers) 
      ? this.currentSchoolData.urls.teachers 
      : window.sendNamesStdURls || null;
  }

  // ========================================
  // API METHODS WITH RETRY LOGIC
  // ========================================
  async fetchSchoolDataWithRetry() {
    for (let attempt = 1; attempt <= CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        this.log(`🔄 Fetching school data (attempt ${attempt}/${CONFIG.RETRY_ATTEMPTS})`);
        const result = await this.safeApiCall(this.buildApiUrl());
        
        if (result.success) {
          return result;
        }
        
        if (attempt < CONFIG.RETRY_ATTEMPTS) {
          await this.delay(CONFIG.RETRY_DELAY * attempt);
        }
        
      } catch (error) {
        this.log(`❌ Attempt ${attempt} failed: ${error.message}`);
        if (attempt === CONFIG.RETRY_ATTEMPTS) {
          return { success: false, error: error.message };
        }
        await this.delay(CONFIG.RETRY_DELAY * attempt);
      }
    }
    
    return { success: false, error: 'All retry attempts failed' };
  }

  async safeApiCall(url, options = {}) {
    try {
      this.showLoadingOverlay();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Unknown server error');
      }
      
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    } finally {
      this.hideLoadingOverlay();
    }
  }

  // ========================================
  // CACHE METHODS
  // ========================================
  loadFromCache() {
    try {
      const cached = localStorage.getItem(CONFIG.CACHE_KEY);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      const age = Date.now() - data.timestamp;
      
      if (data.timestamp && (age < CONFIG.CACHE_DURATION)) {
        this.log('✅ Using valid cached data');
        return data.schools;
      } else {
        localStorage.removeItem(CONFIG.CACHE_KEY);
        return null;
      }
      
    } catch (error) {
      this.log('💥 Cache load error');
      localStorage.removeItem(CONFIG.CACHE_KEY);
      return null;
    }
  }

  saveToCache(schoolsData) {
    try {
      const cacheData = {
        schools: schoolsData,
        timestamp: Date.now()
      };
      
      localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(cacheData));
      this.log('✅ Data cached successfully');
      
    } catch (error) {
      this.log('💥 Cache save error');
      console.error('Cache save error:', error);
    }
  }

  setCurrentSchool(schoolIndex) {
    if (!this.allSchoolsData || !schoolIndex) return false;
    
    const school = this.allSchoolsData[schoolIndex];
    if (!school) return false;
    
    this.currentSchoolData = school;
    this.log('✅ Current school configured');
    return true;
  }

  setupURLDATA() {
    const pageHasnmgFurls = typeof window.nmgFurls !== 'undefined' && window.nmgFurls !== null;
    
    if (this.currentSchoolData && this.currentSchoolData.urls) { 
      this.log('✅ Server data found - using server URLs');
      
      const urls = {
        'FORM-ONE': this.currentSchoolData.urls.formOne,
        'FORM-TWO': this.currentSchoolData.urls.formTwo,
        'FORM-THREE': this.currentSchoolData.urls.formThree,
        'FORM-FOUR': this.currentSchoolData.urls.formFour
      };
      
      if (pageHasnmgFurls && typeof window.nmgFurls === 'object') {
        Object.assign(window.nmgFurls, urls);
      } else {
        window.nmgFurls = urls;
      }
      
    } else {
      this.log('⚠️ No server data found');
      
      if (!pageHasnmgFurls) {
        this.log('❌ No URLs available');
        window.nmgFurls = null;
      }
    }
  }

  // ========================================
  // SUBJECT SELECTION METHODS
  // ========================================
  loadSelectedSubjects() {
    try {
      const stored = localStorage.getItem('selectedSubjects');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load selected subjects:', error);
      return [];
    }
  }

  saveSelectedSubjects() {
    try {
      localStorage.setItem('selectedSubjects', JSON.stringify(this.selectedSubjects));
    } catch (error) {
      console.warn('Failed to save selected subjects:', error);
    }
  }

  toggleSubject(id, name, div) {
    const index = this.selectedSubjects.findIndex(s => s.id === id);

    if (index !== -1) {
      this.selectedSubjects.splice(index, 1);
      div.classList.remove('selected');
    } else {
      if (this.selectedSubjects.length >= CONFIG.MAX_SUBJECTS) {
        this.showErrorMessage(`You can only select up to ${CONFIG.MAX_SUBJECTS} subjects.`);
        return;
      }
      this.selectedSubjects.push({ id, name });
      div.classList.add('selected');
    }

    this.updateSelectedList();
    this.saveSelectedSubjects();
  }

  updateSelectedList() {
    const selectedList = this.safeGetElement('selectedList');
    if (!selectedList) return;
    
    selectedList.innerHTML = '';
    this.selectedSubjects.forEach((subject, index) => {
      const item = document.createElement('div');
      item.className = 'selected-subject';
      item.draggable = true;
      item.textContent = `${index + 1}. ${subject.name}`;
      item.dataset.index = index;

      item.addEventListener('dragstart', (e) => this.dragStart(e));
      item.addEventListener('dragover', (e) => this.dragOver(e));
      item.addEventListener('drop', (e) => this.drop(e));

      selectedList.appendChild(item);
    });
  }

  // Drag and drop methods
  dragStart(e) {
    this.dragStartIndex = +e.target.dataset.index;
  }

  dragOver(e) {
    e.preventDefault();
  }

  drop(e) {
    const dropIndex = +e.target.dataset.index;
    const draggedItem = this.selectedSubjects[this.dragStartIndex];

    this.selectedSubjects.splice(this.dragStartIndex, 1);
    this.selectedSubjects.splice(dropIndex, 0, draggedItem);

    this.updateSelectedList();
    this.saveSelectedSubjects();
  }

  // ========================================
  // UI CONTROL METHODS
  // ========================================
  showSubjectDiv() {
    const subjectDiv = this.safeGetElement('mySubject') || document.querySelector('.mySubject');
    const classSelectorContainer = this.safeGetElement('classSelectorContainer');
    const addSubjectsBtn = this.safeGetElement('addSubjectsBtn');
    const showDataBtn = this.safeGetElement('showDataBtn');

    if (classSelectorContainer) classSelectorContainer.style.display = 'block';

    if (subjectDiv) {
      const isVisible = subjectDiv.style.display === 'block';
      subjectDiv.style.display = isVisible ? 'none' : 'block';
    }

    if (addSubjectsBtn) addSubjectsBtn.style.display = 'none';
    if (showDataBtn) showDataBtn.style.display = 'none';
  }

  showStudentsDiv() {
    this.initializeStudentForm();
  }

  showDataSent() {
    const subjectDiv = this.safeGetElement('mySubject') || document.querySelector('.mySubject');
    const classSelectorContainer = this.safeGetElement('classSelectorContainer');
    const addSubjectsBtn = this.safeGetElement('addSubjectsBtn');
    const showDataBtn = this.safeGetElement('showDataBtn');
    const button1 = this.safeGetElement('button1');

    this.showLoadingOverlay();

    if (subjectDiv) subjectDiv.style.display = 'none';
    if (classSelectorContainer) classSelectorContainer.style.display = 'block';
    if (addSubjectsBtn) addSubjectsBtn.style.display = 'none';
    if (showDataBtn) showDataBtn.style.display = 'none';
    if (button1) button1.style.display = 'block';

    this.getData();
    setTimeout(() => this.hideLoadingOverlay(), CONFIG.LOADING_TIMEOUT);
  }

  // ========================================
  // EVENT HANDLERS
  // ========================================
  handleClassSelection(e) {
    this.selectedClass = e.target.value;
    if (typeof window.nmgFurls !== 'undefined' && window.nmgFurls[this.selectedClass]) {
      this.nmgFURL = window.nmgFurls[this.selectedClass];
      this.log('Selected Class:', this.selectedClass);
    } else {
      console.warn('Cannot access URL for class:', this.selectedClass);
      this.showErrorMessage('Invalid class selection. Please try again.');
    }
  }

  async handleDataDisplay() {
    if (!this.nmgFURL) {
      this.showErrorMessage('Please select a class first.');
      return;
    }
    
    try {
      this.showLoadingOverlay();
      await this.getData();
    } catch (error) {
      this.showErrorMessage('Failed to load data. Please try again.');
    } finally {
      setTimeout(() => this.hideLoadingOverlay(), CONFIG.LOADING_TIMEOUT);
    }
  }

  // ========================================
  // STUDENT FORM METHODS
  // ========================================
  initializeStudentForm() {
    const nmgBody = document.querySelector('.nmg-body1');
    if (nmgBody) {
      nmgBody.style.display = 'block';
      const dataCont = document.querySelector('.dataCont');
      if (dataCont) {
        dataCont.innerHTML = nmgBody.innerHTML;
      }
    }

    // Initialize form buttons
    document.querySelectorAll('.form-buttons').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const formType = e.target.dataset.formType;
        this.setupStudentForm(formType);
      });
    });
  }

  setupStudentForm(formType) {
    const classButton = this.safeGetElement("classButtons");
    const formContainer = document.querySelector(".form-container1");

    if (classButton) classButton.style.display = "none";
    if (formContainer) formContainer.style.display = "block";

    const instructions = this.safeGetElement('formInstructions');
    if (instructions) {
      instructions.textContent = `Paste names in the left box and Gender in the right box for ${formType.toUpperCase()}`;
    }

    this.initializeForm(formType);
  }

  initializeForm(formType) {
    const formRows = this.safeGetElement('formRows');
    const namesInput = this.safeGetElement('namesInput');
    const gendersInput = this.safeGetElement('gendersInput');
    const addRowBtn = this.safeGetElement('addRowBtn');
    const submitBtn = this.safeGetElement('submitBtn');
    const alertDiv = this.safeGetElement('alert');

    if (!formRows) return;

    formRows.innerHTML = '';
    if (alertDiv) alertDiv.textContent = '';

    const addRow = (name = '', gender = '') => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td contenteditable="true" placeholder="Full Name">${name}</td>
        <td contenteditable="true" placeholder="Gender">${gender}</td>
        <td><button class="delete-btn" type="button">Delete</button></td>
      `;
      formRows.appendChild(row);
      
      const deleteBtn = row.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          if (formRows.children.length > 1) {
            row.remove();
          } else {
            this.showErrorMessage('At least one row must remain.');
          }
        });
      }
    };

    addRow(); // Add initial row

    if (addRowBtn) {
      addRowBtn.addEventListener('click', () => addRow());
    }

    // Handle paste functionality
    if (namesInput) {
      this.handlePaste(namesInput, 0, formRows, addRow);
    }
    if (gendersInput) {
      this.handlePaste(gendersInput, 1, formRows, addRow);
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => this.submitStudentData(e, formType, formRows, alertDiv));
    }
  }

  handlePaste(input, columnIndex, formRows, addRow) {
    input.addEventListener('paste', (event) => {
      event.preventDefault();
      const pasteData = (event.clipboardData || window.clipboardData).getData('text');
      const lines = pasteData.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      
      lines.forEach((line, index) => {
        if (formRows.children[index]) {
          const row = formRows.children[index];
          if (row.children[columnIndex]) {
            row.children[columnIndex].textContent = line;
          }
        } else {
          columnIndex === 0 ? addRow(line, '') : addRow('', line);
        }
      });
      
      input.value = '';
    });
  }

  async submitStudentData(e, formType, formRows, alertDiv) {
    e.preventDefault();

    const rows = formRows.querySelectorAll('tr');
    const formData = new URLSearchParams();
    let validRows = 0;

    rows.forEach((row, i) => {
      const name = row.children[0] ? row.children[0].textContent.trim().toUpperCase() : '';
      const gender = row.children[1] ? row.children[1].textContent.trim().toUpperCase() : '';
      
      if (name && gender) {
        formData.append(`data[${i}][type]`, formType);
        formData.append(`data[${i}][fullname]`, name);
        formData.append(`data[${i}][sex]`, gender);
        validRows++;
      }
    });

    if (validRows === 0) {
      if (alertDiv) {
        alertDiv.textContent = 'Please fill in at least one complete row before submitting.';
        alertDiv.style.color = 'red';
      }
      return;
    }

    try {
      if (alertDiv) {
        alertDiv.textContent = 'Submitting...';
        alertDiv.style.color = 'blue';
      }

      const namesAPI = this.getNameAPI();
      if (!namesAPI) {
        throw new Error('API endpoint not available');
      }

      const response = await fetch(namesAPI, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      this.showSuccessMessage('Student data submitted successfully!');
      this.displayStudentDataOptions(true);

    } catch (err) {
      if (alertDiv) {
        alertDiv.textContent = `Error: ${err.message}`;
        alertDiv.style.color = 'red';
      }
      this.showErrorMessage(`Submission failed: ${err.message}`);
    }
  }

  displayStudentDataOptions(showSuccess = true) {
    const formContainer = document.querySelector(".form-container1");
    if (!formContainer) return;

    formContainer.innerHTML = '';

    if (showSuccess) {
      const successDiv = document.createElement('div');
      successDiv.textContent = '✅ Data has been successfully submitted!';
      successDiv.style.cssText = `
        color: green; padding: 20px; text-align: center;
        font-size: 18px; font-weight: bold;
      `;
      formContainer.appendChild(successDiv);
    }

    // Create class selector
    const roleSelect = document.createElement('select');
    roleSelect.innerHTML = `
      <option value="">🔽 Select Class</option>
      <option value="formOne">Form I</option>
      <option value="formTwo">Form II</option>
      <option value="formThree">Form III</option>
      <option value="formFour">Form IV</option>
    `;
    roleSelect.style.cssText = `
      display: block; margin: 10px auto; padding: 10px;
      font-size: 16px; border-radius: 6px; border: 1px solid #ccc;
      max-width: 250px;
    `;

    // Create view button
    const viewBtn = document.createElement('button');
    viewBtn.textContent = "📄 See Submitted Data";
    viewBtn.style.cssText = `
      display: block; padding: 10px 20px; margin: 10px auto;
      background-color: #007BFF; color: white; border: none;
      border-radius: 6px; font-size: 16px; cursor: pointer;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    // Create back button
    const backBtn = document.createElement("button");
    backBtn.textContent = "Back & Add Data to Classes";
    backBtn.className = 'back-btn';
    backBtn.addEventListener('click', () => window.location.reload());

    formContainer.append(roleSelect, viewBtn, backBtn);

    viewBtn.addEventListener('click', () => this.viewSubmittedData(roleSelect.value, formContainer));
  }

  async viewSubmittedData(selectedRole, formContainer) {
    if (!selectedRole) {
      this.showErrorMessage("Please select a class role to view submitted data.");
      return;
    }

    formContainer.innerHTML = '';
    this.showLoadingOverlay();

    try {
      const namesAPI = this.getNameAPI();
      if (!namesAPI) {
        throw new Error('API endpoint not available');
      }

      const res = await fetch(`${namesAPI}?role=${selectedRole}`);
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await res.json();

      setTimeout(() => this.hideLoadingOverlay(), 3000);

      if (!data.success || !data.Students?.length) {
        throw new Error("No submitted data found for this class.");
      }

      this.displayStudentTable(data.Students, selectedRole, formContainer);

    } catch (error) {
      this.hideLoadingOverlay();
      const errorDiv = document.createElement("div");
      errorDiv.textContent = `⚠️ Failed to load data: ${error.message}`;
      errorDiv.style.cssText = `
        color: #842029; font-size: 16px; padding: 20px;
        text-align: center; border: 1px solid #f5c2c7;
        background-color: #f8d7da; border-radius: 8px;
        margin-top: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      `;
      formContainer.appendChild(errorDiv);

      // Add back button
      const backBtn = document.createElement("button");
      backBtn.textContent = "🔙 Back to Options";
      backBtn.className = "back-btn";
      backBtn.addEventListener('click', () => this.displayStudentDataOptions(false));
      formContainer.appendChild(backBtn);
    }
  }

  displayStudentTable(students, selectedRole, formContainer) {
    const table = document.createElement("table");
    table.style.cssText = `
      width: 100%; border-collapse: collapse; margin-top: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr style="background-color: #007BFF; color: white;">
        <th style="padding: 12px; border: 1px solid #ccc;">N/O</th>
        <th style="padding: 12px; border: 1px solid #ccc;">Full Name</th>
        <th style="padding: 12px; border: 1px solid #ccc;">Sex</th>
        <th style="padding: 12px; border: 1px solid #ccc;">Role</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    students.forEach((entry, i) => {
      const row = document.createElement("tr");
      row.style.backgroundColor = i % 2 === 0 ? '#f8f9fa' : 'white';
      row.innerHTML = `
        <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">${i + 1}</td>
        <td contenteditable="true" style="padding: 10px; border: 1px solid #ccc;">${entry.fullName}</td>
        <td contenteditable="true" style="padding: 10px; border: 1px solid #ccc; text-align: center;">${entry.sex}</td>
        <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">${selectedRole}</td>
      `;
      tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Create button container
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      display: flex; gap: 10px; margin-top: 15px;
      justify-content: center; flex-wrap: wrap;
    `;

    const backBtn = document.createElement("button");
    backBtn.textContent = "🔙 Back to See Other Classes";
    backBtn.className = "back-btn";
    backBtn.addEventListener('click', () => this.displayStudentDataOptions(false));

    const refreshBtn = document.createElement("button");
    refreshBtn.textContent = "🔄 Refresh Data";
    refreshBtn.className = "back-btn";
    refreshBtn.addEventListener('click', () => this.viewSubmittedData(selectedRole, formContainer));

    const homeBtn = document.createElement("button");
    homeBtn.textContent = "🏠 Back & Add Data to Classes";
    homeBtn.className = 'back-btn';
    homeBtn.addEventListener('click', () => window.location.reload());

    buttonContainer.append(backBtn, refreshBtn, homeBtn);
    formContainer.appendChild(table);
    formContainer.appendChild(buttonContainer);
  }

  // ========================================
  // SUBJECT SUBMISSION METHODS
  // ========================================
  async submitSubjects() {
    if (!this.selectedClass) {
      this.showErrorMessage("Please select a class before submitting subjects.");
      return;
    }
    
    if (!this.nmgFURL) {
      this.showErrorMessage("Invalid class selected. Please try again.");
      return;
    }

    if (this.selectedSubjects.length === 0) {
      this.showErrorMessage("Please select at least one subject before submitting.");
      return;
    }

    const subjectNames = this.selectedSubjects.map(s => s.name);
    const formData = new URLSearchParams();
    formData.append('mode', 'header');
    
    subjectNames.forEach((name, index) => {
      formData.append(`subject${index + 1}`, name);
    });

    try {
      this.showLoadingOverlay();
      
      const response = await fetch(this.nmgFURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const resData = await response.json();
      
      if (resData.status === 'success') {
        const mySubject = document.querySelector('.mySubject');
        if (mySubject) {
          mySubject.innerHTML = `
            <div style="color: green; font-size: 18px; font-weight: bold; text-align: center; padding: 20px;">
              ✅ Subjects have been successfully submitted!<br>
              Thank you for choosing our product!
            </div>
          `;
        }

        const button1 = this.safeGetElement('button1');
        if (button1) button1.style.display = 'block';

        this.showSuccessMessage('Subjects submitted successfully!');
        this.log('✅ Subjects submitted successfully');
      } else {
        throw new Error(resData.message || 'Submission failed');
      }

    } catch (error) {
      this.log('❌ Subject submission failed:', error.message);
      this.showErrorMessage(`Failed to submit subjects: ${error.message}`);
    } finally {
      setTimeout(() => this.hideLoadingOverlay(), 2000);
    }
  }

  // ========================================
  // DATA RETRIEVAL AND DISPLAY METHODS
  // ========================================
  async getData() {
    if (!this.nmgFURL) {
      this.showErrorMessage('Please select a class first.');
      return;
    }

    try {
      const response = await fetch(this.nmgFURL);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const resultsData = await response.json();
      const { content: data, status, message, contentHead: headers } = resultsData;

      if (status === 'success' && data && headers) {
        this.allData = data;
        this.allHeaders = headers;
        this.displayDataTable(data, headers);
        this.log('✅ Data retrieved successfully:', message);
      } else {
        throw new Error(message || 'No data available');
      }

    } catch (error) {
      this.log('❌ Data retrieval failed:', error.message);
      this.showErrorMessage(`Failed to load data: ${error.message}`);
    }
  }

  displayDataTable(data, headers) {
    const container = document.querySelector('.dataCont');
    if (!container) return;

    container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h2 style="color: #333; text-align: center; margin-bottom: 15px;">
          Student Details (Names, Gender and Subjects Per Student)
        </h2>
      </div>
      
      <div class="table-wrapper" style="overflow-x: auto; margin-bottom: 20px;">
        <table class="responsive-table" style="width: 100%; border-collapse: collapse; min-width: 600px;">
          <thead>
            <tr style="background-color: #007BFF; color: white;">
              ${headers.map(h => `<th style="padding: 12px; border: 1px solid #ccc; white-space: nowrap;">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map((row, index) => `
              <tr style="background-color: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
                ${headers.map((h, i) => 
                  `<td ${i >= 2 ? 'contenteditable="true"' : ''} style="padding: 10px; border: 1px solid #ccc; ${i >= 2 ? 'cursor: text;' : ''}">${row[h] || ''}</td>`
                ).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
        <button onclick="window.location.reload()" class="back-btn" style="background-color: #6c757d;">
          🔙 Back & Edit Subjects
        </button>
        <button onclick="schoolSystem.submitTableData()" class="submit-btn" style="background-color: #28a745;">
          📤 Submit Students Subjects
        </button>
        <button onclick="schoolSystem.getDataAndBuildUI()" class="submit-btn" style="background-color: #17a2b8;">
          📋 Get Students Names per Subject
        </button>
      </div>
    `;
  }

  async submitTableData() {
    const table = document.querySelector('.responsive-table');
    if (!table) {
      this.showErrorMessage('No table data found to submit.');
      return;
    }

    const rows = table.querySelectorAll('tbody tr');
    const payload = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const rowData = [];

      // Start from column index 2 (3rd column) - skip name and gender
      for (let i = 2; i < cells.length; i++) {
        rowData.push(cells[i].innerText.trim());
      }

      if (rowData.some(cell => cell !== '')) { // Only include rows with data
        payload.push(rowData);
      }
    });

    if (payload.length === 0) {
      this.showErrorMessage('No subject data to submit. Please fill in the subject columns.');
      return;
    }

    const formData = new URLSearchParams();
    formData.append('mode', 'data');
    formData.append('data', JSON.stringify(payload));

    try {
      this.showLoadingOverlay();

      const response = await fetch(this.nmgFURL, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        this.showSuccessMessage('Student subject data submitted successfully!');
        this.log('✅ Table data submitted successfully');
      } else {
        throw new Error(result.message || 'Submission failed');
      }

    } catch (error) {
      this.log('❌ Table submission failed:', error.message);
      this.showErrorMessage(`Failed to submit: ${error.message}`);
    } finally {
      setTimeout(() => this.hideLoadingOverlay(), 2000);
    }
  }

  async getDataAndBuildUI() {
    if (!this.nmgFURL || !this.selectedClass) {
      this.showErrorMessage("Please select a class first.");
      return;
    }

    try {
      this.showLoadingOverlay();
      
      const response = await fetch(this.nmgFURL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const { content, contentHead, status, message } = await response.json();

      if (status === 'success' && content && contentHead) {
        this.allData = content;
        this.allHeaders = contentHead;
        this.buildSubjectSelectorUI();
        this.log('✅ Subject data loaded successfully:', message);
      } else {
        throw new Error(message || 'No data available');
      }

    } catch (error) {
      this.log('❌ Subject data loading failed:', error.message);
      this.showErrorMessage(`Failed to load subject data: ${error.message}`);
    } finally {
      setTimeout(() => this.hideLoadingOverlay(), 1000);
    }
  }

  buildSubjectSelectorUI() {
    const container = document.querySelector('.dataCont');
    if (!container) return;

    container.innerHTML = '';

    // Title
    const title = document.createElement('h2');
    title.textContent = 'Select Subject to View Students';
    title.style.cssText = 'color: #333; text-align: center; margin-bottom: 20px;';

    // Subject selector
    const select = document.createElement('select');
    select.id = 'subjectSelect';
    select.style.cssText = `
      display: block; margin: 0 auto 20px; padding: 12px;
      font-size: 16px; border: 2px solid #007BFF; border-radius: 8px;
      background-color: white; min-width: 250px;
    `;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '📚 Select Subject';
    select.appendChild(defaultOption);

    // Add subjects (skip first 2 columns - name and gender)
    const subjects = this.allHeaders.slice(2);
    subjects.forEach(subject => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      select.appendChild(option);
    });

    select.addEventListener('change', () => this.handleSubjectSelection());

    // Result container
    const resultDiv = document.createElement('div');
    resultDiv.className = 'resultContainer';
    resultDiv.style.marginTop = '20px';

    // Back button
    const backBtn = document.createElement('button');
    backBtn.textContent = '🔙 Back to Data View';
    backBtn.className = 'back-btn';
    backBtn.style.cssText = `
      display: block; margin: 20px auto 0; padding: 10px 20px;
      background-color: #6c757d; color: white; border: none;
      border-radius: 6px; cursor: pointer;
    `;
    backBtn.addEventListener('click', () => {
      this.showLoadingOverlay();
      this.getData();
      setTimeout(() => this.hideLoadingOverlay(), 2000);
    });

    container.appendChild(title);
    container.appendChild(select);
    container.appendChild(resultDiv);
    container.appendChild(backBtn);
  }

  handleSubjectSelection() {
    const selectedSubject = this.safeGetElement("subjectSelect");
    if (!selectedSubject) return;

    const selectedValue = selectedSubject.value;
    if (!selectedValue) {
      const container = document.querySelector('.resultContainer');
      if (container) container.innerHTML = '';
      return;
    }

    const subjectIndex = this.allHeaders.indexOf(selectedValue);
    const nameColumn = this.allHeaders[0]; // First column for names

    const filteredNames = this.allData
      .filter(row => row[selectedValue] === 'V' || row[selectedValue] === 'v')
      .map(row => row[nameColumn])
      .filter(name => name && name.trim() !== '');

    this.displayFilteredNames(filteredNames, selectedValue);
  }

  displayFilteredNames(names, subject) {
    const container = document.querySelector('.resultContainer');
    if (!container) {
      console.error('Result container not found');
      return;
    }

    if (!names.length) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #6c757d;">
          <p style="font-size: 18px;">📝 No students found for "${subject}"</p>
          <p>Students need to have "V" marked in their subject column.</p>
        </div>
      `;
      return;
    }

    const tableHTML = `
      <div class="attendance-header" style="text-align: center; margin-bottom: 20px;">
        <h3 style="color: #007BFF; margin: 0;">
          📊 "${subject}" Examination Score Sheet
        </h3>
        <p style="color: #6c757d; margin: 10px 0 0;">Total Students: ${names.length}</p>
      </div>

      <div class="attendance-wrapper" style="overflow-x: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px;">
        <table class="attendance-table" style="width: 100%; border-collapse: collapse; background: white;">
          <thead>
            <tr style="background-color: #007BFF; color: white;">
              <th style="padding: 15px 10px; border: 1px solid #0056b3; width: 60px;">N/O</th>
              <th style="padding: 15px; border: 1px solid #0056b3; text-align: left;">Candidate's Names</th>
              <th style="padding: 15px; border: 1px solid #0056b3; width: 120px;">Signature</th>
              <th style="padding: 15px; border: 1px solid #0056b3; width: 100px;">Marks</th>
            </tr>
          </thead>
          <tbody>
            ${names.map((name, index) => `
              <tr style="background-color: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
                <td style="padding: 12px 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">
                  ${index + 1}
                </td>
                <td style="padding: 12px 15px; border: 1px solid #ddd; font-weight: 500;">
                  ${name}
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; height: 40px; background-color: #f8f9fa;">
                  <!-- Signature space -->
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background-color: #fff;">
                  <!-- Marks space -->
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="
          background-color: #28a745; color: white; border: none;
          padding: 10px 20px; border-radius: 6px; cursor: pointer;
          font-size: 14px; margin-right: 10px;
        ">
          🖨️ Print Score Sheet
        </button>
        <button onclick="schoolSystem.handleSubjectSelection()" style="
          background-color: #17a2b8; color: white; border: none;
          padding: 10px 20px; border-radius: 6px; cursor: pointer;
          font-size: 14px;
        ">
          🔄 Refresh List
        </button>
      </div>
    `;

    container.innerHTML = tableHTML;
  }

  // ========================================
  // PUBLIC API METHODS
  // ========================================
  getSchoolUrl(type) {
    if (!this.currentSchoolData || !this.currentSchoolData.urls) {
      return null;
    }
    return this.currentSchoolData.urls[type] || null;
  }

  getAllSchoolUrls() {
    if (!this.currentSchoolData || !this.currentSchoolData.urls) {
      return null;
    }
    return { ...this.currentSchoolData.urls };
  }

  getCurrentSchoolInfo() {
    if (!this.currentSchoolData) {
      return null;
    }
    
    return {
      name: this.currentSchoolData.schoolName,
      index: this.currentSchoolData.indexNumber,
      serialNumber: this.currentSchoolData.serialNumber,
      lastUpdated: this.currentSchoolData.lastUpdated
    };
  }

  getSchoolUrlSafe(type, fallback = '') {
    const url = this.getSchoolUrl(type);
    return url || fallback;
  }

  isSchoolDataLoaded() {
    return this.currentSchoolData !== null;
  }

  async refreshSchoolData() {
    this.log('🔄 Refreshing school data...');
    localStorage.removeItem(CONFIG.CACHE_KEY);
    this.currentSchoolData = null;
    this.allSchoolsData = null;
    this.isInitialized = false;
    
    const result = await this.init();
    this.log('🔄 Refresh complete');
    return result;
  }
}

// ========================================
// GLOBAL INITIALIZATION
// ========================================
const schoolSystem = new SchoolManagementSystem();

// Expose global functions for backward compatibility
window.getSchoolUrl = (type) => schoolSystem.getSchoolUrl(type);
window.getAllSchoolUrls = () => schoolSystem.getAllSchoolUrls();
window.getCurrentSchoolInfo = () => schoolSystem.getCurrentSchoolInfo();
window.getSchoolUrlSafe = (type, fallback) => schoolSystem.getSchoolUrlSafe(type, fallback);
window.isSchoolDataLoaded = () => schoolSystem.isSchoolDataLoaded();
window.refreshSchoolData = () => schoolSystem.refreshSchoolData();

// Expose main UI functions
window.showSubjectDiv = () => schoolSystem.showSubjectDiv();
window.showStudentsDiv = () => schoolSystem.showStudentsDiv();
window.showDataSent = () => schoolSystem.showDataSent();
window.submitSubjects = () => schoolSystem.submitSubjects();

// Initialize the system
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      schoolSystem.init().then((success) => {
        if (success) {
          console.log('🎉 School Management System initialized successfully');
        } else {
          console.warn('⚠️ School Management System initialization failed');
        }
      });
    }, 100);
  });
} else {
  setTimeout(() => {
    schoolSystem.init().then((success) => {
      if (success) {
        console.log('🎉 School Management System initialized successfully');
      } else {
        console.warn('⚠️ School Management System initialization failed');
      }
    });
  }, 100);
}

// ========================================
// CSS STYLES (to be added to your HTML)
// ========================================
const styles = `
<style>
.back-btn, .submit-btn {
  padding: 10px 20px;
  margin: 5px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.back-btn {
  background-color: #6c757d;
  color: white;
}

.back-btn:hover {
  background-color: #5a6268;
}

.submit-btn {
  background-color: #007BFF;
  color: white;
}

.submit-btn:hover {
  background-color: #0056b3;
}

.subject {
  padding: 10px 15px;
  margin: 5px;
  background-color: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.subject:hover {
  background-color: #e9ecef;
  border-color: #007BFF;
}

.subject.selected {
  background-color: #007BFF;
  color: white;
  border-color: #0056b3;
}

.selected-subject {
  padding: 8px 12px;
  margin: 3px;
  background-color: #007BFF;
  color: white;
  border-radius: 4px;
  cursor: move;
  transition: background-color 0.3s ease;
}

.selected-subject:hover {
  background-color: #0056b3;
}

.table-wrapper {
  overflow-x: auto;
  margin: 20px 0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.responsive-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.responsive-table th,
.responsive-table td {
  padding: 12px;
  text-align: left;
  border: 1px solid #ddd;
}

.responsive-table th {
  background-color: #007BFF;
  color: white;
  font-weight: 600;
}

.responsive-table tbody tr:nth-child(even) {
  background-color: #f8f9fa;
}

.responsive-table tbody tr:hover {
  background-color: #e9ecef;
}

@media (max-width: 768px) {
  .back-btn, .submit-btn {
    width: 100%;
    margin: 5px 0;
  }
  
  .table-wrapper {
    font-size: 14px;
  }
  
  .responsive-table th,
  .responsive-table td {
    padding: 8px;
  }
}

#loadingOverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  color: white;
  font-size: 18px;
}
</style>
`;

// Add styles to document head
if (document.head && !document.querySelector('#school-system-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'school-system-styles';
  styleElement.textContent = styles.replace('<style>', '').replace('</style>', '');
  document.head.appendChild(styleElement);
}
