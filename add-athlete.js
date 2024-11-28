// DOM Elements
const athleteForm = document.getElementById('addAthleteForm');
const nameInput = document.getElementById('athleteName');
const birthDateInput = document.getElementById('birthDate');
const branchInput = document.getElementById('branch');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');
const addressInput = document.getElementById('address');

// Initialize the form
document.addEventListener('DOMContentLoaded', () => {
    setupPhoneInput();
    setupFormValidation();
    setupFormSubmission();
    setMaxBirthDate();
});

// Setup phone input formatting
function setupPhoneInput() {
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 3) {
                value = `(${value}`;
            } else if (value.length <= 6) {
                value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else if (value.length <= 8) {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)} ${value.slice(6)}`;
            } else {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)} ${value.slice(6, 8)} ${value.slice(8, 10)}`;
            }
        }
        e.target.value = value;
    });
}

// Setup form validation
function setupFormValidation() {
    // Name validation
    nameInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[0-9]/g, '');
    });

    // Phone validation
    phoneInput.addEventListener('blur', (e) => {
        const phoneNumber = e.target.value.replace(/\D/g, '');
        if (phoneNumber.length !== 10) {
            showError('Lütfen geçerli bir telefon numarası girin.');
            e.target.focus();
        }
    });

    // Email validation
    emailInput.addEventListener('blur', (e) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(e.target.value)) {
            showError('Lütfen geçerli bir e-posta adresi girin.');
            e.target.focus();
        }
    });
}

// Set maximum birth date to today
function setMaxBirthDate() {
    const today = new Date().toISOString().split('T')[0];
    birthDateInput.setAttribute('max', today);
}

// Setup form submission
function setupFormSubmission() {
    athleteForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const formData = getFormData();
            saveAthlete(formData);
            showSuccess('Sporcu başarıyla kaydedildi!');
            redirectToHome();
        } catch (error) {
            showError(error.message);
        }
    });
}

// Get form data
function getFormData() {
    const formData = {
        id: generateUniqueId(),
        name: nameInput.value.trim(),
        birthDate: birthDateInput.value,
        branch: branchInput.value,
        phone: phoneInput.value.replace(/\D/g, ''),
        email: emailInput.value.trim(),
        address: addressInput.value.trim(),
        documents: {
            healthReport: getDocumentStatus('healthReport'),
            license: getDocumentStatus('license'),
            education: getDocumentStatus('education'),
            parentPermission: getDocumentStatus('parentPermission'),
            resume: getDocumentStatus('resume'),
            contract: getDocumentStatus('contract'),
            idCopy: getDocumentStatus('idCopy'),
            powerOfAttorney: getDocumentStatus('powerOfAttorney'),
            waiver: getDocumentStatus('waiver')
        },
        registrationDate: new Date().toISOString()
    };

    validateFormData(formData);
    return formData;
}

// Validate form data
function validateFormData(data) {
    if (!data.name) throw new Error('Lütfen sporcu adını girin.');
    if (!data.birthDate) throw new Error('Lütfen doğum tarihini girin.');
    if (!data.branch) throw new Error('Lütfen spor dalını seçin.');
    if (!data.phone) throw new Error('Lütfen telefon numarası girin.');
    if (!data.email) throw new Error('Lütfen e-posta adresi girin.');
    if (!data.address) throw new Error('Lütfen adres bilgisi girin.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        throw new Error('Lütfen geçerli bir e-posta adresi girin.');
    }

    if (data.phone.length !== 10) {
        throw new Error('Lütfen geçerli bir telefon numarası girin.');
    }
}

// Save athlete to localStorage
function saveAthlete(athleteData) {
    const athletes = JSON.parse(localStorage.getItem('athletes')) || [];
    athletes.push(athleteData);
    localStorage.setItem('athletes', JSON.stringify(athletes));
}

// Helper Functions
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showSuccess(message) {
    alert(message);
}

function showError(message) {
    alert(message);
}

function redirectToHome() {
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function getDocumentStatus(documentId) {
    const input = document.getElementById(documentId);
    return input.files && input.files[0] ? 'uploaded' : 'missing';
}
