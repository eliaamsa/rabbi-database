// מערך לשמירת נתוני הסמנים
let markers = [];
let currentMarker = null;
let isAddingMarker = false;
let zoomLevel = 1;
let currentScrollX = 0;
let currentScrollY = 0;

// יסודות עמוד
const imageWrapper = document.getElementById('imageWrapper');
const mainImage = document.getElementById('mainImage');
const addMarkerBtn = document.getElementById('addMarkerBtn');
const editMarkerBtn = document.getElementById('editMarkerBtn');
const deleteMarkerBtn = document.getElementById('deleteMarkerBtn');
const saveAllBtn = document.getElementById('saveAllBtn');
const loadAllBtn = document.getElementById('loadAllBtn');
const markerForm = document.getElementById('markerForm');
const saveMarkerBtn = document.getElementById('saveMarkerBtn');
const cancelMarkerBtn = document.getElementById('cancelMarkerBtn');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const clearSearchButton = document.getElementById('clearSearchButton');
const statusDiv = document.getElementById('status');
const profileSearchInput = document.getElementById('profileSearchInput');
const profileSearchButton = document.getElementById('profileSearchButton');
const clearProfileSearchButton = document.getElementById('clearProfileSearchButton');
const profilesList = document.getElementById('profilesList');
const profileModal = document.getElementById('profileModal');
const modalContent = document.getElementById('modalContent');
const modalTitle = document.getElementById('modalTitle');

// יסודות הזום
const zoomIn = document.getElementById('zoomIn');
const zoomOut = document.getElementById('zoomOut');
const zoomReset = document.getElementById('zoomReset');

// מעבר בין לשוניות
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('tab-active', 'bg-gray-200', 'font-bold'));
        tabs.forEach(t => t.classList.add('bg-gray-100'));
        tabContents.forEach(tc => tc.classList.add('hidden'));
        
        tab.classList.remove('bg-gray-100');
        tab.classList.add('tab-active', 'bg-gray-200', 'font-bold');
        
        const targetTab = tab.getAttribute('data-tab') + 'Tab';
        document.getElementById(targetTab).classList.remove('hidden');
        
        // עדכון רשימת הפרופילים אם נבחרה הלשונית המתאימה
        if (tab.getAttribute('data-tab') === 'profiles') {
            updateProfilesList();
        }
    });
});