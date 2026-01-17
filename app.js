import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, serverTimestamp, query, limitToLast, onValue, onDisconnect, set } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDMGU5X7BBp-C6tIl34Uuu5N9MXAVFTn7c",
    authDomain: "paper-house-inc.firebaseapp.com",
    projectId: "paper-house-inc",
    storageBucket: "paper-house-inc.firebasestorage.app",
    messagingSenderId: "658389836376",
    appId: "1:658389836376:web:2ab1e2743c593f4ca8e02d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const chatRef = ref(db, 'global_chat');

// Telegram Data
const tg = window.Telegram.WebApp;
tg.expand();
const userName = tg.initDataUnsafe?.user?.first_name || "Guest";
const userId = String(tg.initDataUnsafe?.user?.id || "guest_" + Math.floor(Math.random() * 1000));

// --- PRESENCE SYSTEM ---
const userStatusRef = ref(db, `/status/${userId}`);
const connectedRef = ref(db, '.info/connected');

onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
        // When I'm connected, set my status to online
        set(userStatusRef, { state: 'online', name: userName });
        // If I close the app/lose internet, automatically set me to offline
        onDisconnect(userStatusRef).set({ state: 'offline', name: userName });
    }
});

// --- CHAT LOGIC ---
const chatBox = document.getElementById('chat-box');
const msgInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

function sendMessage() {
    const text = msgInput.value.trim();
    if (text === "") return;
    push(chatRef, { userId, name: userName, text, timestamp: serverTimestamp() });
    msgInput.value = "";
}

sendBtn.onclick = sendMessage;
msgInput.onkeypress = (e) => { if(e.key === 'Enter') sendMessage(); };

// --- DISPLAY MESSAGES ---
const chatQuery = query(chatRef, limitToLast(50));
onChildAdded(chatQuery, (snapshot) => {
    const data = snapshot.val();
    const msgId = snapshot.key;
    renderMessage(data, msgId);
});

function renderMessage(data, msgId) {
    const isMe = data.userId === userId;
    const date = data.timestamp ? new Date(data.timestamp) : new Date();
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const div = document.createElement('div');
    div.className = `msg ${isMe ? 'me' : 'others'}`;
    // We add a unique class to the dot based on user ID so we can update it live
    div.innerHTML = `
        <span class="user-name">
            <span class="status-dot dot-${data.userId}"></span>
            ${data.name}
        </span>
        <span class="text">${data.text}</span>
        <span class="time">${timeString}</span>
    `;

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;

    // --- LIVE STATUS TRACKER FOR THIS MESSAGE ---
    const statusWatcher = ref(db, `/status/${data.userId}`);
    onValue(statusWatcher, (snap) => {
        const status = snap.val();
        const dots = document.querySelectorAll(`.dot-${data.userId}`);
        dots.forEach(dot => {
            if (status && status.state === 'online') {
                dot.classList.add('online');
            } else {
                dot.classList.remove('online');
            }
        });
    });
}
