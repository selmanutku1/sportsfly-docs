// DOM Elementleri
const documentGrid = document.getElementById('documentGrid');
const searchInput = document.getElementById('searchInput');
const documentTypeFilter = document.getElementById('documentTypeFilter');
const athleteFilter = document.getElementById('athleteFilter');
const dateFilter = document.getElementById('dateFilter');
const emptyState = document.getElementById('emptyState');
const navbarToggle = document.querySelector('.navbar-toggle');
const navbarMenu = document.querySelector('.navbar-menu');

// Mobil menü toggle
navbarToggle.addEventListener('click', () => {
    navbarMenu.classList.toggle('active');
});

// Örnek Belgeler (localStorage'dan gelecek)
let documents = JSON.parse(localStorage.getItem('documents')) || [];

// Örnek Sporcular (localStorage'dan gelecek)
let athletes = JSON.parse(localStorage.getItem('athletes')) || [];

// Sporcu filtresini doldur
function populateAthleteFilter() {
    const uniqueAthletes = [...new Set(documents.map(doc => doc.athlete))];
    athleteFilter.innerHTML = '<option value="">Sporcu</option>';
    uniqueAthletes.forEach(athlete => {
        athleteFilter.innerHTML += `<option value="${athlete}">${athlete}</option>`;
    });
}

// Belge kartı oluştur
function createDocumentCard(doc) {
    const card = document.createElement('div');
    card.className = 'document-card';
    card.innerHTML = `
        <div class="document-icon">
            <i class="material-icons">${getDocumentIcon(doc.type)}</i>
        </div>
        <div class="document-info">
            <h3>${getDocumentTypeName(doc.type)}</h3>
            <div class="athlete-name">${doc.athlete}</div>
            <div class="document-date">${formatDate(doc.date)}</div>
            ${doc.note ? `<div class="document-note">${doc.note}</div>` : ''}
            <div class="file-name">${doc.fileName}</div>
        </div>
        <div class="document-actions">
            <button class="btn-icon" onclick="viewDocument('${doc.id}')" title="Görüntüle">
                <i class="material-icons">visibility</i>
            </button>
            <button class="btn-icon" onclick="downloadDocument('${doc.id}')" title="İndir">
                <i class="material-icons">download</i>
            </button>
            <button class="btn-icon" onclick="deleteDocument('${doc.id}')" title="Sil">
                <i class="material-icons">delete</i>
            </button>
        </div>
    `;
    return card;
}

// Belge türüne göre ikon getir
function getDocumentIcon(type) {
    const icons = {
        'saglik-raporu': 'medical_services',
        'sporcu-lisansi': 'card_membership',
        'ogrenim-belgesi': 'school',
        'veli-izin': 'family_restroom',
        'ozgecmis': 'person',
        'sozlesme': 'description',
        'kimlik': 'badge',
        'vekaletname': 'gavel',
        'feragatname': 'assignment'
    };
    return icons[type] || 'description';
}

// Belge türü adını getir
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

// Tarihi formatla
function formatDate(date) {
    return new Date(date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Belgeleri filtrele
function filterDocuments() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = documentTypeFilter.value;
    const selectedAthlete = athleteFilter.value;
    const selectedDate = dateFilter.value;

    let filteredDocs = documents;

    // Arama filtresi
    if (searchTerm) {
        filteredDocs = filteredDocs.filter(doc =>
            doc.athlete.toLowerCase().includes(searchTerm) ||
            doc.fileName.toLowerCase().includes(searchTerm) ||
            (doc.note && doc.note.toLowerCase().includes(searchTerm))
        );
    }

    // Belge türü filtresi
    if (selectedType) {
        filteredDocs = filteredDocs.filter(doc => doc.type === selectedType);
    }

    // Sporcu filtresi
    if (selectedAthlete) {
        filteredDocs = filteredDocs.filter(doc => doc.athlete === selectedAthlete);
    }

    // Tarih filtresi
    if (selectedDate) {
        const now = new Date();
        const docDate = new Date();
        filteredDocs = filteredDocs.filter(doc => {
            const docDate = new Date(doc.date);
            switch (selectedDate) {
                case 'today':
                    return docDate.toDateString() === now.toDateString();
                case 'week':
                    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                    return docDate >= weekAgo;
                case 'month':
                    return docDate.getMonth() === now.getMonth() &&
                           docDate.getFullYear() === now.getFullYear();
                case 'year':
                    return docDate.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });
    }

    displayDocuments(filteredDocs);
}

// Belgeleri görüntüle
function displayDocuments(docs) {
    documentGrid.innerHTML = '';
    
    if (docs.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        docs.forEach(doc => {
            documentGrid.appendChild(createDocumentCard(doc));
        });
    }
}

// Belge görüntüle
function viewDocument(id) {
    const doc = documents.find(d => d.id === id);
    if (doc && doc.fileData) {
        const blob = dataURItoBlob(doc.fileData);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }
}

// Belge indir
function downloadDocument(id) {
    const doc = documents.find(d => d.id === id);
    if (doc && doc.fileData) {
        const blob = dataURItoBlob(doc.fileData);
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
        filterDocuments();
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

// Event Listeners
searchInput.addEventListener('input', filterDocuments);
documentTypeFilter.addEventListener('change', filterDocuments);
athleteFilter.addEventListener('change', filterDocuments);
dateFilter.addEventListener('change', filterDocuments);

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    populateAthleteFilter();
    filterDocuments();
});
