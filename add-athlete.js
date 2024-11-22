document.addEventListener('DOMContentLoaded', function() {
    // Form submit işlemi
    const form = document.getElementById('addAthleteForm');
    form.addEventListener('submit', handleFormSubmit);

    // Dosya yükleme alanları için görsel geri bildirim
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', handleFileSelect);
    });

    // Telefon numarası formatı
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', formatPhoneNumber);
});

function handleFormSubmit(event) {
    event.preventDefault();

    // Form verilerini topla
    const formData = new FormData(event.target);
    const athleteData = {
        id: generateUniqueId(),
        name: formData.get('athleteName'),
        birthDate: formData.get('birthDate'),
        branch: formData.get('branch'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
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
        createdAt: new Date().toISOString()
    };

    // Mevcut sporcuları al
    let athletes = JSON.parse(localStorage.getItem('athletes') || '[]');
    
    // Yeni sporcuyu ekle
    athletes.push(athleteData);
    
    // LocalStorage'a kaydet
    localStorage.setItem('athletes', JSON.stringify(athletes));

    // Başarı mesajı göster
    showNotification('Sporcu başarıyla eklendi!', 'success');

    // Ana sayfaya yönlendir
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function handleFileSelect(event) {
    const input = event.target;
    const label = input.parentElement;
    
    if (input.files && input.files[0]) {
        label.style.borderColor = 'var(--success-color)';
        label.querySelector('i').style.color = 'var(--success-color)';
    } else {
        label.style.borderColor = 'var(--border-color)';
        label.querySelector('i').style.color = 'var(--primary-color)';
    }
}

function formatPhoneNumber(event) {
    let input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 10) {
        value = value.slice(0, 10);
    }
    
    input.value = value;
}

function getDocumentStatus(documentId) {
    const input = document.getElementById(documentId);
    return input.files && input.files[0] ? 'uploaded' : 'missing';
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
