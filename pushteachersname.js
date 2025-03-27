 const classButton = document.getElementById("classButtons");
const formContainer = document.querySelector(".form-container1");

function initializeForm(formType) {
    const formRows = document.getElementById('formRows');
    const namesInput = document.getElementById('namesInput');
    const gendersInput = document.getElementById('gendersInput');
    const addRowBtn = document.getElementById('addRowBtn');
    const submitBtn = document.getElementById('submitBtn');
    const alertDiv = document.getElementById('alert');

    // Function to add a new row
    function addRow(name = '', gender = '') {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td contenteditable="true" placeholder="Full Name">${name}</td>
            <td contenteditable="true" placeholder="Subject">${gender}</td>
            <td><button class="delete-btn">Delete</button></td>
        `;
        formRows.appendChild(row);
        row.querySelector('.delete-btn').addEventListener('click', () => row.remove());
    }

    // Add initial empty row
    addRowBtn.addEventListener('click', () => addRow());

    // Handle paste functionality for bulk input
    function handlePaste(input, columnIndex) {
        input.addEventListener('paste', (event) => {
            event.preventDefault();
            const pasteData = (event.clipboardData || window.clipboardData).getData('text');
            const lines = pasteData.split(/\r?\n/).map(line => line.trim()).filter(line => line);

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
     
    sendNames();
    
    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        submitForm();
    });
}

// Handle form button clicks dynamically
document.querySelectorAll('.form-buttons').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        classButton.style.display = "none";
        formContainer.style.display = "block";

        const formType = e.target.dataset.formType; // Use data-form-type attribute to determine form type
        const instructions = document.getElementById('formInstructions');
        instructions.textContent = `Paste name on the left box and subject on the right box for ${formType.toUpperCase()}`;
        initializeForm(formType);
    });
});
