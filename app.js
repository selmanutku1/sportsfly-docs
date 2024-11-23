// Belge türlerine göre form şablonları
const documentTemplates = {
    'feragatname': 'https://docs.google.com/document/d/10yH1SYsJ3oN7-nS_A-W-RJ0CwkS6wLByVH1RKrQwZ84/edit?usp=sharing',
    'vekaletname': 'https://docs.google.com/document/d/10yH1SYsJ3oN7-nS_A-W-RJ0CwkS6wLByVH1RKrQwZ84/edit?usp=sharing'
};

// Belge türüne göre isim getir
function getDocumentTypeName(type) {
    const names = {
        'saglik-raporu': 'Sağlık Raporu',
        'sporcu-lisansi': 'Sporcu Lisansı',
        'ogrenim-belgesi': 'Öğrenim Belgesi',
        'veli-izin': 'Veli İzin Belgesi',
        'ozgecmis': 'Özgeçmiş',
        'sozlesme': 'Sözleşme',
        'kimlik': 'Kimlik Fotokopisi',
        'vekaletname': 'Vekaletname',
        'feragatname': 'Feragatname'
    };
    return names[type] || type;
}

// Belge durumu simgesini al
function getStatusIcon(status) {
    switch(status) {
        case 'pending':
            return 'hourglass_empty';
        case 'approved':
            return 'check_circle';
        case 'rejected':
            return 'cancel';
        default:
            return 'radio_button_unchecked';
    }
}

// Belge durumu metnini al
function getStatusText(status) {
    switch(status) {
        case 'pending':
            return 'Onay Bekliyor';
        case 'approved':
            return 'Onaylandı';
        case 'rejected':
            return 'Reddedildi';
        default:
            return 'Onay Bekleniyor';
    }
}

// Belge kartı oluştur
function createDocumentCard(doc) {
    const card = document.createElement('div');
    card.className = 'document-card';
    
    const hasTemplate = documentTemplates.hasOwnProperty(doc.type);
    
    card.innerHTML = `
        <div class="document-icon">
            <i class="material-icons">description</i>
        </div>
        <div class="document-info">
            <h3>${getDocumentTypeName(doc.type)}</h3>
            <div class="athlete-name">${doc.athlete}</div>
            <div class="document-date">${formatDate(doc.date)}</div>
            ${doc.note ? `<div class="document-note">${doc.note}</div>` : ''}
            <div class="file-name">${doc.fileName}</div>
        </div>
        <div class="document-actions">
            ${hasTemplate ? `
                <button class="btn-icon btn-template" onclick="window.open('${documentTemplates[doc.type]}', '_blank')" title="Form Şablonu">
                    <i class="material-icons">description</i>
                </button>
                <button class="btn-icon btn-request" onclick="requestApproval('${doc.id}')" title="Onay Talep Et">
                    <i class="material-icons">send</i>
                </button>
            ` : ''}
            <button class="btn-icon" onclick="viewDocument('${doc.id}')" title="Görüntüle">
                <i class="material-icons">visibility</i>
            </button>
            <button class="btn-icon" onclick="downloadDocument('${doc.id}')" title="İndir">
                <i class="material-icons">download</i>
            </button>
            <button class="btn-icon btn-delete" onclick="deleteDocument('${doc.id}')" title="Sil">
                <i class="material-icons">delete</i>
            </button>
        </div>
        ${hasTemplate ? `
        <div class="document-status ${doc.status ? doc.status : ''}">
            <i class="material-icons">${getStatusIcon(doc.status)}</i>
            <span>${getStatusText(doc.status)}</span>
        </div>
        ` : ''}
    `;
    
    return card;
}

// Onay talep et
function requestApproval(docId) {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const docIndex = documents.findIndex(doc => doc.id === docId);
    
    if (docIndex !== -1) {
        documents[docIndex].status = 'pending';
        localStorage.setItem('documents', JSON.stringify(documents));
        displayDocuments(documents);
        
        showNotification('Onay talebi gönderildi');
    }
}

// Bildirim göster
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="material-icons">info</i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Belgeleri görüntüle
function displayDocuments(docs) {
    const documentGrid = document.getElementById('documentGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!docs.length) {
        documentGrid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    documentGrid.innerHTML = '';
    
    docs.forEach(doc => {
        documentGrid.appendChild(createDocumentCard(doc));
    });
}

// Belge görüntüle
function viewDocument(id) {
    const doc = documents.find(d => d.id === id);
    if (doc && doc.file) {
        const blob = dataURItoBlob(doc.file);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }
}

// Belge indir
function downloadDocument(id) {
    const doc = documents.find(d => d.id === id);
    if (doc && doc.file) {
        const blob = dataURItoBlob(doc.file);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Belge sil
function deleteDocument(id) {
    if (confirm('Bu belgeyi silmek istediğinizden emin misiniz?')) {
        documents = documents.filter(doc => doc.id !== id);
        localStorage.setItem('documents', JSON.stringify(documents));
        populateAthleteFilter();
        displayDocuments(documents);
        showNotification('Belge başarıyla silindi');
    }
}

// Data URI'yi Blob'a çevir
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

// Tarih formatla
function formatDate(date) {
    return new Date(date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Event Listeners
searchInput.addEventListener('input', () => {
    applyFilters.click();
});

documentTypeFilter.addEventListener('change', () => {
    applyFilters.click();
});

athleteFilter.addEventListener('change', () => {
    applyFilters.click();
});

dateFilter.addEventListener('change', () => {
    applyFilters.click();
});

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    documents = JSON.parse(localStorage.getItem('documents') || '[]');
    populateAthleteFilter();
    displayDocuments(documents);
});
