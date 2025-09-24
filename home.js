document.addEventListener('DOMContentLoaded', function () {
    const registerButton = document.getElementById('register-btn');
    const savePreferencesButton = document.getElementById('save-preferences-btn');

    if (registerButton) {
        registerButton.addEventListener('click', registerUser);
    }

    if (savePreferencesButton) {
        savePreferencesButton.addEventListener('click', savePreferences);
    }

    const preferenceCards = document.querySelectorAll('.preference-item.card');
    preferenceCards.forEach(card => {
        card.addEventListener('click', toggleCardSelection);
    });
    
    // Add real-time validation
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    
    if (nameField) {
        nameField.addEventListener('input', function() {
            if (this.classList.contains('input-error') && this.value.trim().length >= 2) {
                this.classList.remove('input-error');
                document.getElementById('name-error').textContent = '';
            }
        });
    }
    
    if (emailField) {
        emailField.addEventListener('input', function() {
            if (this.classList.contains('input-error') && validateEmail(this.value.trim())) {
                this.classList.remove('input-error');
                document.getElementById('email-error').textContent = '';
            }
        });
    }
});

function registerUser() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    
    // Clear previous errors
    clearErrors();
    
    let hasErrors = false;

    console.log("Name:", name, "Email:", email);
    
    // Validate name
    if (!name) {
        showError('name', 'Name is required');
        hasErrors = true;
    } else if (name.length < 2) {
        showError('name', 'Name must be at least 2 characters long');
        hasErrors = true;
    }
    
    // Validate email
    if (!email) {
        showError('email', 'Email is required');
        hasErrors = true;
    } else if (!validateEmail(email)) {
        showError('email', 'Please enter a valid email address');
        hasErrors = true;
    }
    
    if (!hasErrors) {
        localStorage.setItem('user_name', name);
        localStorage.setItem('user_email', email);

        console.log("Registration successful!");

        // Hide registration form and show preferences
        document.querySelector('.registration-container').style.display = 'none';
        document.querySelector('.preferences-container').style.display = 'block';
    }
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + '-error');
    
    field.classList.add('input-error');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearErrors() {
    const errorFields = document.querySelectorAll('.input-error');
    const errorMessages = document.querySelectorAll('.error-message');
    
    errorFields.forEach(field => {
        field.classList.remove('input-error');
    });
    
    errorMessages.forEach(message => {
        message.textContent = '';
    });
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function savePreferences() {
    const selectedPreferences = [];
    const checkboxes = document.querySelectorAll('#preferences-form input[type="checkbox"]:checked');

    checkboxes.forEach(checkbox => selectedPreferences.push(checkbox.value));

    console.log("Selected Preferences:", selectedPreferences);

    if (selectedPreferences.length > 0) {
        localStorage.setItem('preferred_categories', JSON.stringify(selectedPreferences));

        console.log("Preferences saved!");
        
        // Show success message briefly before redirecting
        const button = document.getElementById('save-preferences-btn');
        const originalText = button.textContent;
        button.textContent = 'Saving...';
        button.disabled = true;
        
        setTimeout(() => {
            window.location.href = "mainpage.html";
        }, 500);
    } else {
        // Highlight preference form to show error
        const preferencesForm = document.getElementById('preferences-form');
        preferencesForm.style.border = '2px solid #ff4444';
        
        // Show error message
        let errorMsg = document.getElementById('preferences-error');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.id = 'preferences-error';
            errorMsg.className = 'error-message';
            errorMsg.style.textAlign = 'center';
            errorMsg.style.marginTop = '10px';
            preferencesForm.parentNode.appendChild(errorMsg);
        }
        errorMsg.textContent = 'Please select at least one news category';
        
        // Remove error styling after 3 seconds
        setTimeout(() => {
            preferencesForm.style.border = '';
            if (errorMsg) errorMsg.textContent = '';
        }, 3000);
    }
}

function toggleCardSelection(event) {
    const card = event.currentTarget; 
    const checkbox = card.querySelector('input[type="checkbox"]'); 

    if (checkbox) {
        checkbox.checked = !checkbox.checked; 
        card.classList.toggle('selected', checkbox.checked); 
    }
}


const homeLink = document.getElementById("home-link");
const contactLink = document.getElementById("contact-link");

const mainContent = document.getElementById("main-content");
const footerContent = document.getElementById("footer-content");


homeLink.addEventListener("click", function() {
    mainContent.style.display = "block";
    footerContent.style.display = "none";
});

contactLink.addEventListener("click", function() {
    mainContent.style.display = "none";
    footerContent.style.display = "block";
});


