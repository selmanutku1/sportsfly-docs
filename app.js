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
            ${doc.approver ? `
                <div class="approval-info">
                    <div>Onaylayacak: ${doc.approver}</div>
                    ${doc.approvalNote ? `<div>Not: ${doc.approvalNote}</div>` : ''}
                    ${doc.approvalComment ? `<div>Yorum: ${doc.approvalComment}</div>` : ''}
                </div>
            ` : ''}
        </div>
        <div class="document-actions">
            <button class="btn-icon btn-request" onclick="requestApproval('${doc.id}')" title="Onay Talep Et">
                <i class="material-icons">send</i>
            </button>
            ${doc.status === 'pending' ? `
                <button class="btn-icon btn-approve" onclick="showApprovalModal('${doc.id}')" title="Onayla/Reddet">
                    <i class="material-icons">gavel</i>
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
            <div class="document-status ${doc.status || ''}">
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
        const doc = documents[docIndex];
        
        // Onay talebi modalını göster
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Onay Talebi</h2>
                <p><strong>${doc.athlete}</strong> sporcusunun <strong>${getDocumentTypeName(doc.type)}</strong> belgesi için onay talebi</p>
                <div class="form-group">
                    <label for="approverEmail">Onaylayacak Kişinin E-posta Adresi:</label>
                    <input type="email" id="approverEmail" required>
                </div>
                <div class="form-group">
                    <label for="approvalNote">Not (Opsiyonel):</label>
                    <textarea id="approvalNote" rows="3"></textarea>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="closeModal()">İptal</button>
                    <button class="btn btn-primary" onclick="sendApprovalRequest('${docId}')">Onay Talep Et</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        setTimeout(() => modal.classList.add('show'), 10);
    }
}

// Modalı kapat
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

// Onay talebini gönder
function sendApprovalRequest(docId) {
    const approverEmail = document.getElementById('approverEmail').value;
    const approvalNote = document.getElementById('approvalNote').value;
    
    if (!approverEmail) {
        showNotification('Lütfen onaylayacak kişinin e-posta adresini girin', 'error');
        return;
    }
    
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const docIndex = documents.findIndex(doc => doc.id === docId);
    
    if (docIndex !== -1) {
        documents[docIndex].status = 'pending';
        documents[docIndex].approver = approverEmail;
        documents[docIndex].approvalNote = approvalNote;
        documents[docIndex].approvalRequestDate = new Date().toISOString();
        
        localStorage.setItem('documents', JSON.stringify(documents));
        displayDocuments(documents);
        
        // E-posta gönderme simülasyonu
        simulateSendEmail(documents[docIndex], approverEmail);
        
        closeModal();
        showNotification('Onay talebi gönderildi');
    }
}

// Onay/Red modalını göster
function showApprovalModal(docId) {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const doc = documents.find(d => d.id === docId);
    
    if (!doc) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Belge Onayı</h2>
            <p><strong>${doc.athlete}</strong> sporcusunun <strong>${getDocumentTypeName(doc.type)}</strong> belgesi</p>
            ${doc.approvalNote ? `<p class="approval-note">Not: ${doc.approvalNote}</p>` : ''}
            <div class="form-group">
                <label for="approvalComment">Yorum (Opsiyonel):</label>
                <textarea id="approvalComment" rows="3"></textarea>
            </div>
            <div class="modal-actions">
                <button class="btn btn-danger" onclick="respondToApproval('${docId}', 'rejected')">Reddet</button>
                <button class="btn btn-secondary" onclick="closeModal()">İptal</button>
                <button class="btn btn-success" onclick="respondToApproval('${docId}', 'approved')">Onayla</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    setTimeout(() => modal.classList.add('show'), 10);
}

// Onay/Red cevabı
function respondToApproval(docId, response) {
    const comment = document.getElementById('approvalComment').value;
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const docIndex = documents.findIndex(doc => doc.id === docId);
    
    if (docIndex !== -1) {
        documents[docIndex].status = response;
        documents[docIndex].approvalComment = comment;
        documents[docIndex].approvalDate = new Date().toISOString();
        
        localStorage.setItem('documents', JSON.stringify(documents));
        displayDocuments(documents);
        
        closeModal();
        showNotification(`Belge ${response === 'approved' ? 'onaylandı' : 'reddedildi'}`);
    }
}

// E-posta gönderme simülasyonu
function simulateSendEmail(doc, approverEmail) {
    console.log(`Onay talebi e-postası gönderiliyor...
        Kime: ${approverEmail}
        Konu: Belge Onay Talebi - ${doc.athlete}
        İçerik: ${doc.athlete} sporcusunun ${getDocumentTypeName(doc.type)} belgesi için onay bekleniyor.
        ${doc.approvalNote ? 'Not: ' + doc.approvalNote : ''}
    `);
}

// Bildirim göster
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="material-icons">${type === 'success' ? 'check_circle' : 'error'}</i>
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
