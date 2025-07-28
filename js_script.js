// משתנים גלובליים
let markers = [];
let rabbisData = []; // מאגר הרבנים מהגוגל שיטס
let isAddingMarker = false;

// --- 1. לוגיקת הוספת כפתור מזהה על תמונה ---

// מאזין לכפתור "הוסף רב"
addMarkerBtn.addEventListener('click', () => {
    isAddingMarker = true;
    statusDiv.innerText = 'בחר את מיקום הרב על התמונה';
    mainImage.style.cursor = 'crosshair';
});

// מאזין ללחיצה על התמונה
mainImage.addEventListener('click', function(e) {
    if (!isAddingMarker) return;
    const rect = mainImage.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100; // אחוזים מהתמונה
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // צור כפתור מזהה
    const marker = document.createElement('div');
    marker.className = 'rabbi-marker';
    marker.style.position = 'absolute';
    marker.style.left = x + '%';
    marker.style.top = y + '%';
    marker.style.transform = 'translate(-50%, -50%)';
    marker.style.zIndex = 10;
    marker.innerHTML = '📍';

    // מאזין לציפייה – הצגת הכפתור רק במעבר עכבר
    marker.style.opacity = 0; // בהתחלה מוסתר

    marker.addEventListener('mouseenter', () => {
        marker.style.opacity = 1;
    });
    marker.addEventListener('mouseleave', () => {
        marker.style.opacity = 0;
    });

    // מאזין לפתיחת טופס הוספת פרטי רב
    marker.addEventListener('click', (ev) => {
        ev.stopPropagation();
        openRabbiForm(x, y, marker);
    });

    // הוספת הכפתור לתמונה
    imageWrapper.appendChild(marker);
    markers.push({x, y, marker});
    isAddingMarker = false;
    mainImage.style.cursor = 'default';

    // הכפתור נעלם מהתמונה, יופיע רק במעבר עכבר
    marker.style.opacity = 0;

    // הצג אותו כשעוברים עם עכבר מעל המיקום
    marker.parentElement.addEventListener('mousemove', function(event) {
        const mouseX = ((event.clientX - rect.left) / rect.width) * 100;
        const mouseY = ((event.clientY - rect.top) / rect.height) * 100;
        // בדוק אם העכבר קרוב לנקודה (רדיוס 2%)
        if (Math.abs(mouseX - x) < 2 && Math.abs(mouseY - y) < 2) {
            marker.style.opacity = 1;
        } else {
            marker.style.opacity = 0;
        }
    });
});

// -- טופס הוספת פרטי רב --
function openRabbiForm(x, y, marker) {
    // בנה טופס דינמי או השתמש ב-HTML קיים
    markerForm.classList.remove('hidden');
    markerForm.innerHTML = `
        <h3>הוספת רב</h3>
        <input type="text" id="rabbiFirstName" placeholder="שם" required><br>
        <input type="text" id="rabbiLastName" placeholder="שם משפחה" required><br>
        <input type="text" id="rabbanitName" placeholder="שם רבנית"><br>
        <input type="text" id="rabbiRole" placeholder="מכהן בתפקיד"><br>
        <input type="text" id="rabbiField" placeholder="תחום עיסוק מרכזי"><br>
        <input type="url" id="rabbiSite" placeholder="אתר"><br>
        <input type="tel" id="rabbiPhone" placeholder="טלפון"><br>
        <input type="text" id="rabbiImage" placeholder="קישור לתמונה"><br>
        <button id="saveRabbiBtn">שמור</button>
        <button id="cancelRabbiBtn">ביטול</button>
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
        // הוסף לרשימה המקומית
        rabbisData.push(rabbi);
        markerForm.classList.add('hidden');
        statusDiv.innerText = 'הרב נוסף!';
        marker.style.opacity = 0; // הסמן נעלם מהתמונה
        // כאן תוכל להוסיף שמירה לשרת/גוגל שיטס אם תרצה
    };

    document.getElementById('cancelRabbiBtn').onclick = () => {
        markerForm.classList.add('hidden');
        statusDiv.innerText = 'בוטל';
    };
}

// --- 2. תצוגת מאגר הרבנים ---

// מאזין לכפתור "מאגר הרבנים"
profilesList.addEventListener('click', showRabbiDatabase);

function showRabbiDatabase() {
    // טען את הנתונים מהגוגל שיטס (קריאה בלבד)
    fetch('https://opensheet.elk.sh/1Lj1mqwBp6Q8cOXmCHYKJxJ_wPnlssduwbgj_MdSUcCk/Sheet1')
      .then(res => res.json())
      .then(data => {
          rabbisData = data;
          renderRabbiTable(data);
      });
}

// הצגת טבלה עם אפשרות חיפוש וסינון
function renderRabbiTable(data) {
    // הצג טופס חיפוש וסינון
    profileModal.classList.remove('hidden');
    modalContent.innerHTML = `
        <input id="searchField" type="text" placeholder="חיפוש">
        <select id="filterField">
            <option value="">כל הקטגוריות</option>
            <option value="רב">רב</option>
            <option value="ראש ישיבה">ראש ישיבה</option>
            <!-- הוסף עוד לפי הצורך -->
        </select>
        <table>
            <thead>
                <tr>
                    <th>שם</th><th>שם משפחה</th><th>רבנית</th><th>תפקיד</th><th>תחום</th><th>אתר</th><th>טלפון</th><th>תמונה</th>
                </tr>
            </thead>
            <tbody id="rabbisTableBody"></tbody>
        </table>
    `;

    function updateTable() {
        const search = document.getElementById('searchField').value.toLowerCase();
        const filter = document.getElementById('filterField').value;
        const filtered = data.filter(r => {
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
                <td><a href="${r.site||'#'}" target="_blank">אתר</a></td>
                <td>${r.phone||''}</td>
                <td>${r.image ? `<img src="${r.image}" width="50">` : ''}</td>
            </tr>`
        ).join('');
    }
    updateTable();

    document.getElementById('searchField').oninput = updateTable;
    document.getElementById('filterField').onchange = updateTable;
}

// --- עיצוב CSS מומלץ לסמן ---
/*
.rabbi-marker {
  width: 28px; height: 28px;
  background: rgba(255,255,255,0.8);
  border-radius: 50%;
  border: 2px solid #333;
  color: #c00;
  font-size: 20px;
  text-align: center;
  line-height: 28px;
  cursor: pointer;
  transition: opacity 0.2s;
  position: absolute;
}
*/
