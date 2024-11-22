document.addEventListener('DOMContentLoaded', function() {
    // Form ve dosya yükleme alanı
    const form = document.getElementById('addDocumentForm');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('documentFile');
    const fileInfo = document.querySelector('.file-info');
    const athleteSelect = document.getElementById('athlete');

    // Sporcu listesini yükle
    loadAthletes();

    // Form submit işlemi
    form.addEventListener('submit', handleFormSubmit);

    // Dosya sürükle-bırak işlemleri
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
        if (files.length > 0) {
            fileInput.files = files;
            updateFileInfo(files[0]);
        }
    });

    // Dosya seçimi değiştiğinde
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            updateFileInfo(e.target.files[0]);
        }
    });
});

function loadAthletes() {
    const athleteSelect = document.getElementById('athlete');
    const athletes = JSON.parse(localStorage.getItem('athletes') || '[]');

    athletes.forEach(athlete => {
        const option = document.createElement('option');
        option.value = athlete.id;
        option.textContent = athlete.name;
        athleteSelect.appendChild(option);
    });
}

function handleFormSubmit(event) {
    event.preventDefault();

    // Form verilerini topla
    const formData = new FormData(event.target);
    const documentData = {
        id: generateUniqueId(),
        type: formData.get('documentType'),
        athleteId: formData.get('athlete'),
        date: formData.get('documentDate'),
        note: formData.get('documentNote'),
        fileName: formData.get('documentFile').name,
        uploadDate: new Date().toISOString()
    };

    // Mevcut belgeleri al
    let documents = JSON.parse(localStorage.getItem('documents') || '[]');
    
    // Yeni belgeyi ekle
    documents.push(documentData);
    
    // LocalStorage'a kaydet
    localStorage.setItem('documents', JSON.stringify(documents));

    // Başarı mesajı göster
    showNotification('Belge başarıyla eklendi!', 'success');

    // Ana sayfaya yönlendir
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function updateFileInfo(file) {
    const fileInfo = document.querySelector('.file-info');
    const size = (file.size / 1024 / 1024).toFixed(2); // MB cinsinden
    fileInfo.textContent = `${file.name} (${size} MB)`;
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showNotification(message, type = 'info') {
    // Mevcut bildirimi kaldır
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Yeni bildirimi oluştur
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Bildirimi sayfaya ekle
    document.body.appendChild(notification);

    // CSS ekle
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: var(--border-radius);
            background: var(--surface-color);
            color: var(--text-color);
            box-shadow: var(--shadow);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        }
        
        .notification.success {
            background: var(--success-color);
            color: white;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    // Bildirimi otomatik kaldır
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 3000);
}
