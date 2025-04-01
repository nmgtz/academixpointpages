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
     // Submit form data
    async function submitForm() {
        const rows = formRows.querySelectorAll('tr');
        const formData = new URLSearchParams();

        rows.forEach((row, index) => {
            const name = row.children[0].textContent.trim();
            const gender = row.children[1].textContent.trim();
            if (name && gender) {
                formData.append(`data[${index}][type]`, formType);
                formData.append(`data[${index}][fullname]`, name);
                formData.append(`data[${index}][sex]`, gender);
            }
        });

        if (formData.toString() === '') {
            alertDiv.textContent = 'Please fill in at least one row before submitting.';
            alertDiv.style.color = 'red';
            return;
        }

        try {
            alertDiv.textContent = 'Submitting...';
            alertDiv.style.color = 'blue';

            const response = await fetch(sendNamesURls, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });

            if (response.ok) {
                alertDiv.textContent = 'Data submitted successfully!';
                alertDiv.style.color = 'green';
            } else {
                throw new Error('Failed to submit data');
            }
        } catch (error) {
            alertDiv.textContent = `Error: ${error.message}`;
            alertDiv.style.color = 'red';
        }
    }
    
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
