import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMGU5X7BBp-C6tIl34Uuu5N9MXAVFTn7c",
  authDomain: "paper-house-inc.firebaseapp.com",
  projectId: "paper-house-inc",
  storageBucket: "paper-house-inc.firebasestorage.app",
  messagingSenderId: "658389836376",
  appId: "1:658389836376:web:2ab1e2743c593f4ca8e02d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, 'messages');

// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand(); // Make the app full screen

// Get User Data from Telegram
const userName = tg.initDataUnsafe?.user?.first_name || "Anonymous User";
const userId = tg.initDataUnsafe?.user?.id || "guest";

const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// --- FUNCTION: Send Message ---
function sendMessage() {
    const text = messageInput.value.trim();
    if (text === "") return;

    push(messagesRef, {
        userId: userId,
        name: userName,
        text: text,
        timestamp: serverTimestamp()
    });

    messageInput.value = "";
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// --- FUNCTION: Listen for Messages ---
onChildAdded(messagesRef, (data) => {
    const msg = data.val();
    displayMessage(msg);
});

function displayMessage(msg) {
    const div = document.createElement('div');
    const isMe = msg.userId === userId;
    
    div.classList.add('message');
    div.classList.add(isMe ? 'me' : 'others');

    div.innerHTML = `
        <span class="user-name">${msg.name}</span>
        <div class="text">${msg.text}</div>
    `;

    chatContainer.appendChild(div);
    
    // Auto-scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
