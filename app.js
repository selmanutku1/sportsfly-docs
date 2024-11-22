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
const athletesGrid = document.getElementById('athletesGrid');
const filterButtons = document.querySelectorAll('.filter-buttons button');

// Örnek sporcu verileri (localStorage'dan gelecek)
let athletes = JSON.parse(localStorage.getItem('athletes')) || [];

// Sporcu kartı oluştur
function createAthleteCard(athlete) {
    const card = document.createElement('div');
    card.className = 'athlete-card';
    
    const missingDocs = getMissingDocuments(athlete.documents);
    const statusClass = missingDocs.length === 0 ? 'status-complete' : 'status-missing';
    const statusText = missingDocs.length === 0 ? 'Belgeleri Tam' : `${missingDocs.length} Eksik Belge`;

    card.innerHTML = `
        <div class="athlete-header">
            <div class="athlete-avatar">
                <i class="material-icons">person</i>
            </div>
            <div class="athlete-info">
                <h3>${athlete.name}</h3>
                <p>${athlete.branch}</p>
            </div>
        </div>
        <div class="document-status ${statusClass}">
            <i class="material-icons">${missingDocs.length === 0 ? 'check_circle' : 'warning'}</i>
            ${statusText}
        </div>
    `;

    card.addEventListener('click', () => {
        window.location.href = `athlete-details.html?id=${athlete.id}`;
    });

    return card;
}

// Eksik belgeleri bul
function getMissingDocuments(documents) {
    return Object.keys(REQUIRED_DOCUMENTS).filter(doc => !documents[doc]);
}

// Sporcuları filtrele
function filterAthletes(filter = 'all') {
    return athletes.filter(athlete => {
        const missingDocs = getMissingDocuments(athlete.documents);
        switch(filter) {
            case 'missing':
                return missingDocs.length > 0;
            case 'complete':
                return missingDocs.length === 0;
            default:
                return true;
        }
    });
}

// Sporcuları ara
function searchAthletes(query) {
    return athletes.filter(athlete => 
        athlete.name.toLowerCase().includes(query.toLowerCase()) ||
        athlete.branch.toLowerCase().includes(query.toLowerCase())
    );
}

// Sporcu listesini güncelle
function updateAthletesList(filteredAthletes) {
    athletesGrid.innerHTML = '';
    if (filteredAthletes.length === 0) {
        athletesGrid.innerHTML = '<p class="no-results">Sporcu bulunamadı.</p>';
        return;
    }
    filteredAthletes.forEach(athlete => {
        athletesGrid.appendChild(createAthleteCard(athlete));
    });
}

// Event listeners
searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    const activeFilter = document.querySelector('.filter-buttons button.active')?.dataset.filter || 'all';
    const filtered = filterAthletes(activeFilter);
    const searched = searchAthletes(query);
    const result = filtered.filter(athlete => searched.includes(athlete));
    updateAthletesList(result);
});

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const filter = button.dataset.filter;
        const query = searchInput.value;
        const filtered = filterAthletes(filter);
        const searched = searchAthletes(query);
        const result = filtered.filter(athlete => searched.includes(athlete));
        updateAthletesList(result);
    });
});

// Mobil menü toggle
const menuToggle = document.querySelector('.menu-toggle');
const navbarMenu = document.querySelector('.navbar-menu');

if (menuToggle && navbarMenu) {
    menuToggle.addEventListener('click', () => {
        navbarMenu.classList.toggle('active');
    });
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    updateAthletesList(athletes);
});
