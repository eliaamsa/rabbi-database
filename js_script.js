// אתחול משתנים ל־DOM
const addMarkerBtn = document.getElementById('addMarkerBtn');
const statusDiv = document.getElementById('status');
const mainImage = document.getElementById('mainImage');
const imageWrapper = document.getElementById('imageWrapper');
const markerForm = document.getElementById('markerForm');
const profilesList = document.getElementById('profilesList');
const profileModal = document.getElementById('profileModal');
const modalContent = document.getElementById('modalContent');

// משתנים גלובליים
let markers = [];
let rabbisData = [];
let isAddingMarker = false;

// --- טאב סוויצ'ינג ---
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('tab-active', 'bg-gray-200'));
        this.classList.add('tab-active', 'bg-gray-200');
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
        if (this.dataset.tab === 'map') document.getElementById('mapTab').classList.remove('hidden');
        if (this.dataset.tab === 'profiles') document.getElementById('profilesTab').classList.remove('hidden');
        if (this.dataset.tab === 'info') document.getElementById('infoTab').classList.remove('hidden');
    });
});

// --- הוספת מזהה על התמונה ---
addMarkerBtn.addEventListener('click', () => {
    isAddingMarker = true;
    statusDiv.innerText = 'בחר את מיקום הרב על התמונה';
    mainImage.style.cursor = 'crosshair';
});

// הוספת סמן ע"ג תמונה
mainImage.addEventListener('click', function(e) {
    if (!isAddingMarker) return;
    const rect = mainImage.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // צור סמן
    const marker = document.createElement('div');
    marker.className = 'rabbi-marker';
    marker.style.left = x + '%';
    marker.style.top = y + '%';
    marker.innerHTML = '📍';

    // מאזין לפתיחת טופס
    marker.addEventListener('click', (ev) => {
        ev.stopPropagation();
        openRabbiForm(x, y, marker);
    });

    imageWrapper.appendChild(marker);
    markers.push({x, y, marker});
    isAddingMarker = false;
    mainImage.style.cursor = 'default';
    statusDiv.innerText = '';
});

// טופס הוספת פרטי רב
function openRabbiForm(x, y, marker) {
    markerForm.classList.remove('hidden');
    markerForm.innerHTML = `
        <h3 class="text-xl font-bold mb-2">הוספת רב</h3>
        <input type="text" id="rabbiFirstName" class="border px-2 py-1 mb-1 w-full" placeholder="שם פרטי" required><br>
        <input type="text" id="rabbiLastName" class="border px-2 py-1 mb-1 w-full" placeholder="שם משפחה" required><br>
        <input type="text" id="rabbanitName" class="border px-2 py-1 mb-1 w-full" placeholder="שם רבנית"><br>
        <input type="text" id="rabbiRole" class="border px-2 py-1 mb-1 w-full" placeholder="מכהן בתפקיד"><br>
        <input type="text" id="rabbiField" class="border px-2 py-1 mb-1 w-full" placeholder="תחום עיסוק"><br>
        <input type="url" id="rabbiSite" class="border px-2 py-1 mb-1 w-full" placeholder="אתר"><br>
        <input type="tel" id="rabbiPhone" class="border px-2 py-1 mb-1 w-full" placeholder="טלפון"><br>
        <input type="text" id="rabbiImage" class="border px-2 py-1 mb-1 w-full" placeholder="קישור לתמונה"><br>
        <div class="flex justify-end mt-2">
          <button id="cancelRabbiBtn" class="bg-gray-400 hover:bg-gray-500 text-white px-4 py-1 rounded ml-2">ביטול</button>
          <button id="saveRabbiBtn" class="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded">שמור</button>
        </div>
    `;

    document.getElementById('saveRabbiBtn').onclick = () => {
        const rabbi = {
            firstName: document.getElementById('rabbiFirstName').value,
            lastName: document.getElementById('rabbiLastName').value,
            rabbanit: document.getElementById('rabbanitName').value,
            role: document.getElementById('rabbiRole').value,
            field: document.getElementById('rabbiField').value,
            site: document.getElementById('rabbiSite').value,
            phone: document.getElementById('rabbiPhone').value,
            image: document.getElementById('rabbiImage').value,
            x, y
        };
        rabbisData.push(rabbi);
        markerForm.classList.add('hidden');
        statusDiv.innerText = 'הרב נוסף!';
        marker.style.opacity = 1;
    };

    document.getElementById('cancelRabbiBtn').onclick = () => {
        markerForm.classList.add('hidden');
        statusDiv.innerText = 'בוטל';
    };
}

// --- הצגת מאגר הרבנים (פרופילים) ---
profilesList.addEventListener('click', function(e) {
    // הצגת מודל עם טבלת רבנים
    showRabbiDatabase();
});

function showRabbiDatabase() {
    profileModal.classList.remove('hidden');
    modalContent.innerHTML = generateRabbiTable(rabbisData);
    // חיפוש וסינון
    if (document.getElementById('searchField'))
        document.getElementById('searchField').oninput = updateTable;
    if (document.getElementById('filterField'))
        document.getElementById('filterField').onchange = updateTable;
    updateTable();

    // סגירת מודל
    profileModal.querySelector('.close-modal').onclick = () => {
        profileModal.classList.add('hidden');
    };
}

function generateRabbiTable(data) {
    return `
        <input id="searchField" type="text" placeholder="חיפוש" class="border px-2 py-1 mb-2 w-full">
        <select id="filterField" class="border px-2 py-1 mb-2 w-full">
            <option value="">כל הקטגוריות</option>
            <option value="רב">רב</option>
            <option value="ראש ישיבה">ראש ישיבה</option>
        </select>
        <table class="w-full border">
            <thead>
                <tr>
                    <th>שם</th><th>שם משפחה</th><th>רבנית</th><th>תפקיד</th><th>תחום</th><th>אתר</th><th>טלפון</th><th>תמונה</th>
                </tr>
            </thead>
            <tbody id="rabbisTableBody"></tbody>
        </table>
    `;
}

function updateTable() {
    const search = (document.getElementById('searchField')?.value || '').toLowerCase();
    const filter = document.getElementById('filterField')?.value || '';
    const filtered = rabbisData.filter(r => {
        const match =
            (!search || Object.values(r).some(v => (v||'').toLowerCase().includes(search))) &&
            (!filter || (r.role||'').includes(filter));
        return match;
    });
    document.getElementById('rabbisTableBody').innerHTML = filtered.map(r =>
        `<tr>
            <td>${r.firstName||''}</td>
            <td>${r.lastName||''}</td>
            <td>${r.rabbanit||''}</td>
            <td>${r.role||''}</td>
            <td>${r.field||''}</td>
            <td>${r.site ? `<a href="${r.site}" target="_blank">אתר</a>` : ''}</td>
            <td>${r.phone||''}</td>
            <td>${r.image ? `<img src="${r.image}" width="50">` : ''}</td>
        </tr>`
    ).join('');
}

// --- סגירת מודל בלחיצה חוץ ---
window.addEventListener('mousedown', function(e) {
    if (!profileModal.classList.contains('hidden') && !profileModal.firstElementChild.contains(e.target)) {
        profileModal.classList.add('hidden');
    }
});