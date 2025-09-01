document.addEventListener('DOMContentLoaded', function () {
    const registerButton = document.getElementById('register-btn');
    const savePreferencesButton = document.getElementById('save-preferences-btn');

    registerButton.addEventListener('click', registerUser);

   
    savePreferencesButton.addEventListener('click', savePreferences);


    const preferenceCards = document.querySelectorAll('.preference-item.card');
    preferenceCards.forEach(card => {
        card.addEventListener('click', toggleCardSelection);
    });
});

function registerUser() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();

    console.log("Name:", name, "Email:", email);  
    if (name && validateEmail(email)) {
        localStorage.setItem('user_name', name);
        localStorage.setItem('user_email', email);

        console.log("Registration successful!");  

        
        document.querySelector('.registration-container').style.display = 'none';
        document.querySelector('.preferences-container').style.display = 'block';
    } else {
        alert('Please provide a valid name and email');
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function savePreferences() {
    const selectedPreferences = [];
    const checkboxes = document.querySelectorAll('#preferences-form input[type="checkbox"]:checked');

    console.log("Selected Preferences:", selectedPreferences);  

    checkboxes.forEach(checkbox => selectedPreferences.push(checkbox.value));

    if (selectedPreferences.length > 0) {
        localStorage.setItem('preferred_categories', JSON.stringify(selectedPreferences));

        console.log("Preferences saved!"); 
    window.location.href = "mainpage.html"; 
    } else {
        alert('Please select at least one preference');
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


