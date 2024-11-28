document.addEventListener('DOMContentLoaded', () => {
    loadRecentDocuments();

    // Arşiv görüntüleme butonu için event listener
    const viewArchiveBtn = document.getElementById('viewArchiveBtn');
    if (viewArchiveBtn) {
        viewArchiveBtn.addEventListener('click', () => {
            // TODO: Arşiv görüntüleme fonksiyonu eklenecek
            alert('Arşiv görüntüleme özelliği yakında eklenecek!');
        });
    }
});

function loadRecentDocuments() {
    const recentDocsList = document.getElementById('recentDocsList');
    if (!recentDocsList) return;

    // localStorage'dan belgeleri al
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');

    // Son eklenen 6 belgeyi göster
    const recentDocs = documents.slice(0, 6);

    if (recentDocs.length === 0) {
        recentDocsList.innerHTML = `
            <div class="empty-state">
                <p>Henüz belge eklenmemiş</p>
            </div>
        `;
        return;
    }

    // Belgeleri listele
    recentDocsList.innerHTML = recentDocs.map(doc => `
        <div class="document-card">
            <div class="document-icon">
                <i class="material-icons">${getDocumentIcon(doc.type)}</i>
            </div>
            <div class="document-info">
                <h4>${doc.name}</h4>
                <p>${formatDate(doc.date)}</p>
            </div>
        </div>
    `).join('');
}

function getDocumentIcon(type) {
    const icons = {
        'pdf': 'picture_as_pdf',
        'doc': 'description',
        'docx': 'description',
        'image': 'image',
        'other': 'insert_drive_file'
    };
    return icons[type] || icons.other;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}
