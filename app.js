// Sabit veriler
const REQUIRED_DOCUMENTS = {
    healthReport: 'Sağlık Raporu',
    license: 'Sporcu Lisansı',
    education: 'Öğrenim Belgesi',
    parentPermission: 'Veli İzin Belgesi',
    resume: 'Özgeçmiş',
    contract: 'Sözleşme',
    idCopy: 'Kimlik Fotokopisi',
    powerOfAttorney: 'Vekaletname',
    waiver: 'Feragatname'
};

// DOM elementleri
const searchInput = document.getElementById('searchInput');
const documentTypeSelect = document.getElementById('documentType');
const athleteSelect = document.getElementById('athleteFilter');
const dateFilter = document.getElementById('dateFilter');
const documentGrid = document.getElementById('documentGrid');

// Filtreleme olayları
searchInput.addEventListener('input', filterDocuments);
documentTypeSelect.addEventListener('change', filterDocuments);
athleteSelect.addEventListener('change', filterDocuments);
dateFilter.addEventListener('change', filterDocuments);

// Sporcu listesini yükle
function loadAthletes() {
    const athleteSelect = document.getElementById('athleteFilter');
    const athletes = JSON.parse(localStorage.getItem('athletes') || '[]');

    athletes.forEach(athlete => {
        const option = document.createElement('option');
        option.value = athlete.id;
        option.textContent = athlete.name;
        athleteSelect.appendChild(option);
    });
}

// Belgeleri yükle ve göster
function loadAndDisplayDocuments() {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const athletes = JSON.parse(localStorage.getItem('athletes') || '[]');
    const documentGrid = document.getElementById('documentGrid');
    
    // Grid'i temizle
    documentGrid.innerHTML = '';

    // Belgeleri göster
    documents.forEach(doc => {
        const athlete = athletes.find(a => a.id === doc.athleteId);
        const card = createDocumentCard(doc, athlete);
        documentGrid.appendChild(card);
    });
}

// Belge kartı oluştur
function createDocumentCard(doc, athlete) {
    const card = document.createElement('div');
    card.className = 'document-card';
    
    const documentTypes = {
        healthReport: { icon: 'local_hospital', name: 'Sağlık Raporu' },
        license: { icon: 'card_membership', name: 'Sporcu Lisansı' },
        education: { icon: 'school', name: 'Öğrenim Belgesi' },
        parentPermission: { icon: 'family_restroom', name: 'Veli İzin Belgesi' },
        resume: { icon: 'description', name: 'Özgeçmiş' },
        contract: { icon: 'assignment', name: 'Sözleşme' },
        idCopy: { icon: 'badge', name: 'Kimlik Fotokopisi' },
        powerOfAttorney: { icon: 'gavel', name: 'Vekaletname' },
        waiver: { icon: 'note_alt', name: 'Feragatname' }
    };

    const docType = documentTypes[doc.type];
    
    card.innerHTML = `
        <div class="document-icon">
            <i class="material-icons">${docType.icon}</i>
        </div>
        <div class="document-info">
            <h3>${docType.name}</h3>
            <p class="athlete-name">${athlete ? athlete.name : 'Sporcu Bulunamadı'}</p>
            <p class="document-date">${formatDate(doc.date)}</p>
            ${doc.note ? `<p class="document-note">${doc.note}</p>` : ''}
            <p class="file-name">${doc.fileName}</p>
        </div>
        <div class="document-actions">
            <button class="btn-icon" onclick="viewDocument('${doc.id}')">
                <i class="material-icons">visibility</i>
            </button>
            <button class="btn-icon" onclick="downloadDocument('${doc.id}')">
                <i class="material-icons">download</i>
            </button>
            <button class="btn-icon" onclick="deleteDocument('${doc.id}')">
                <i class="material-icons">delete</i>
            </button>
        </div>
    `;

    return card;
}

// Belgeleri filtrele
function filterDocuments() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = documentTypeSelect.value;
    const selectedAthlete = athleteSelect.value;
    const selectedDate = dateFilter.value;

    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const athletes = JSON.parse(localStorage.getItem('athletes') || '[]');
    const documentGrid = document.getElementById('documentGrid');
    
    // Grid'i temizle
    documentGrid.innerHTML = '';

    // Filtreleme
    const filteredDocs = documents.filter(doc => {
        const athlete = athletes.find(a => a.id === doc.athleteId);
        const athleteName = athlete ? athlete.name.toLowerCase() : '';
        
        // Metin araması
        const matchesSearch = !searchTerm || 
            doc.fileName.toLowerCase().includes(searchTerm) ||
            athleteName.includes(searchTerm) ||
            (doc.note && doc.note.toLowerCase().includes(searchTerm));

        // Belge türü filtresi
        const matchesType = !selectedType || doc.type === selectedType;

        // Sporcu filtresi
        const matchesAthlete = !selectedAthlete || doc.athleteId === selectedAthlete;

        // Tarih filtresi
        const matchesDate = !selectedDate || isDateInRange(doc.date, selectedDate);

        return matchesSearch && matchesType && matchesAthlete && matchesDate;
    });

    // Filtrelenmiş belgeleri göster
    filteredDocs.forEach(doc => {
        const athlete = athletes.find(a => a.id === doc.athleteId);
        const card = createDocumentCard(doc, athlete);
        documentGrid.appendChild(card);
    });
}

// Tarih aralığı kontrolü
function isDateInRange(dateStr, range) {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(range) {
        case 'today':
            return date >= today;
        case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return date >= weekAgo;
        case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return date >= monthAgo;
        case 'year':
            const yearAgo = new Date(today);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return date >= yearAgo;
        default:
            return true;
    }
}

// Tarih formatlama
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('tr-TR', options);
}

// Belge görüntüleme
function viewDocument(docId) {
    // Belge görüntüleme işlevi
    alert('Belge görüntüleme özelliği henüz eklenmedi.');
}

// Belge indirme
function downloadDocument(docId) {
    // Belge indirme işlevi
    alert('Belge indirme özelliği henüz eklenmedi.');
}

// Belge silme
function deleteDocument(docId) {
    if (confirm('Bu belgeyi silmek istediğinize emin misiniz?')) {
        let documents = JSON.parse(localStorage.getItem('documents') || '[]');
        documents = documents.filter(doc => doc.id !== docId);
        localStorage.setItem('documents', JSON.stringify(documents));
        loadAndDisplayDocuments();
        showNotification('Belge başarıyla silindi!', 'success');
    }
}

// Bildirim gösterme
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

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    loadAthletes();
    loadAndDisplayDocuments();
});
