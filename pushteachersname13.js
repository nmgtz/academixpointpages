(function() {
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
              formContainer.innerHTML = "";
                const messageDiv = document.createElement("div");
                const messageButton = document.createElement("button");
                messageButton.textContent = "See submitted Data";
                messageButton.style.padding = '10px 20px';
                messageButton.style.marginTop = '10px';
                messageButton.style.backgroundColor = '#007BFF';
                messageButton.style.color = 'white';
                messageButton.style.border = 'none';
                messageButton.style.borderRadius = '6px';
                messageButton.style.fontSize = '16px';
                messageButton.style.cursor = 'pointer';
                messageButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                messageButton.style.transition = 'background-color 0.3s ease';

                messageDiv.textContent = 'Data has been successfully submitted!'
                messageDiv.style.color = 'green';
                messageDiv.style.padding = '20px';
                messageDiv.style.textAlign = 'center';
                formContainer.appendChild(messageDiv);
                formContainer.appendChild(messageButton);
                messageButton.addEventListener("click", (e) => {
                  formContainer.innerHTML = "";
                  formContainer.textContent = "We're sorry, but your requested data can't be displayed at the moment. Our technical team is actively working to resolve the issue. Before taking further action, please check the task progress section to see if your submitted data has already been recorded. We appreciate your patience and apologize for any inconvenience!";
                  formContainer.style.color = '#842029';
                  formContainer.style.fontSize = '16px';
                  formContainer.style.padding = '20px';
                  formContainer.style.textAlign = 'center';
                  formContainer.style.border = '1px solid #f5c2c7';
                  formContainer.style.backgroundColor = '#f8d7da';
                  formContainer.style.borderRadius = '8px';
                  formContainer.style.marginTop = '20px';
                  formContainer.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
                  
                });

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
})();
