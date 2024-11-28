// DOM Elements
const documentForm = document.getElementById('documentForm');
const athleteSelect = document.getElementById('athlete');
const documentTypeSelect = document.getElementById('documentType');
const noteTextarea = document.getElementById('note');
const fileInput = document.getElementById('file');
const filePreview = document.getElementById('filePreview');

// Constants
const ALLOWED_FILE_TYPES = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'image/jpeg': 'JPEG',
    'image/jpg': 'JPG',
    'image/png': 'PNG'
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Initialize the form
document.addEventListener('DOMContentLoaded', () => {
    loadAthletes();
    setupFileUpload();
    setupFormSubmission();
});

// Load athletes from localStorage
function loadAthletes() {
    const athletes = JSON.parse(localStorage.getItem('athletes')) || [];
    
    athletes.forEach(athlete => {
        const option = document.createElement('option');
        option.value = athlete.id;
        option.textContent = `${athlete.name} ${athlete.surname}`;
        athleteSelect.appendChild(option);
    });
}

// Setup file upload functionality
function setupFileUpload() {
    const dropZone = fileInput.parentElement;

    // Drag and drop events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length) {
            handleFileSelection(files[0]);
        }
    });

    // Regular file input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileSelection(e.target.files[0]);
        }
    });
}

// Handle file selection
function handleFileSelection(file) {
    // Validate file type
    if (!ALLOWED_FILE_TYPES[file.type]) {
        showError('Desteklenmeyen dosya türü. Lütfen PDF, DOC, DOCX, JPG veya PNG dosyası yükleyin.');
        fileInput.value = '';
        return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        showError('Dosya boyutu çok büyük. Maksimum dosya boyutu 10MB olmalıdır.');
        fileInput.value = '';
        return;
    }

    // Update file preview
    filePreview.innerHTML = '';
    filePreview.classList.add('active');

    const fileInfo = document.createElement('div');
    fileInfo.innerHTML = `
        <div class="file-info">
            <i class="material-icons">${getFileIcon(file.type)}</i>
            <div>
                <strong>${file.name}</strong>
                <span>${formatFileSize(file.size)} - ${ALLOWED_FILE_TYPES[file.type]}</span>
            </div>
        </div>
    `;
    filePreview.appendChild(fileInfo);
}

// Setup form submission
function setupFormSubmission() {
    documentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const formData = await getFormData();
            saveDocument(formData);
            showSuccess('Belge başarıyla kaydedildi!');
            resetForm();
        } catch (error) {
            showError(error.message);
        }
    });
}

// Get form data
async function getFormData() {
    const athlete = athleteSelect.value;
    const documentType = documentTypeSelect.value;
    const note = noteTextarea.value.trim();
    const file = fileInput.files[0];

    if (!athlete) throw new Error('Lütfen bir sporcu seçin.');
    if (!documentType) throw new Error('Lütfen belge türü seçin.');
    if (!file) throw new Error('Lütfen bir dosya seçin.');

    const fileData = await readFileAsDataURL(file);

    return {
        id: generateUniqueId(),
        athleteId: athlete,
        type: documentType,
        note: note,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: fileData,
        uploadDate: new Date().toISOString(),
        status: 'pending',
        approvalStatus: null,
        approvalDate: null,
        approver: null,
        approvalNote: null
    };
}

// Save document to localStorage
function saveDocument(documentData) {
    const documents = JSON.parse(localStorage.getItem('documents')) || [];
    documents.push(documentData);
    localStorage.setItem('documents', JSON.stringify(documents));
}

// Helper Functions
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Dosya okunamadı.'));
        reader.readAsDataURL(file);
    });
}

function getFileIcon(fileType) {
    const icons = {
        'application/pdf': 'picture_as_pdf',
        'application/msword': 'description',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'description',
        'image/jpeg': 'image',
        'image/jpg': 'image',
        'image/png': 'image'
    };
    return icons[fileType] || 'insert_drive_file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showSuccess(message) {
    // Implement your success notification here
    alert(message);
}

function showError(message) {
    // Implement your error notification here
    alert(message);
}

function resetForm() {
    documentForm.reset();
    filePreview.innerHTML = '';
    filePreview.classList.remove('active');
}
