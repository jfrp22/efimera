// Elementos del DOM
const localIdInput = document.getElementById('localId');
const remoteIdInput = document.getElementById('remoteId');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chat = document.getElementById('chat');
const statusElement = document.getElementById('status');

// Variables de estado
let peer;
let conn;
let localId = generateId();

// Inicialización
localIdInput.value = localId;

// Generar ID aleatorio
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Configurar PeerJS
function setupPeer() {
    // Usamos un servidor de seńalización público (puedes crear el tuyo)
    peer = new Peer(localId);
    
    peer.on('open', (id) => {
        localId = id;
        localIdInput.value = id;
        updateStatus('Conectado. Esperando conexión...');
        connectBtn.disabled = false;
    });
    
    peer.on('connection', (connection) => {
        conn = connection;
        setupConnection();
    });
    
    peer.on('error', (err) => {
        console.error('Error:', err);
        updateStatus('Error: ' + err.message, true);
    });
    
    peer.on('disconnected', () => {
        updateStatus('Desconectado. Reconectando...');
        peer.reconnect();
    });
    
    peer.on('close', () => {
        resetConnection();
        updateStatus('Desconectado');
    });
}

// Configurar conexión
function setupConnection() {
    conn.on('open', () => {
        updateStatus('Conectado a ' + conn.peer);
        messageInput.disabled = false;
        sendBtn.disabled = false;
        disconnectBtn.disabled = false;
        connectBtn.disabled = true;
        
        addSystemMessage('Conexión establecida');
    });
    
    conn.on('data', (data) => {
        addMessage(data.message, false);
    });
    
    conn.on('close', () => {
        addSystemMessage('Conexión cerrada');
        resetConnection();
    });
    
    conn.on('error', (err) => {
        console.error('Error en conexión:', err);
        updateStatus('Error: ' + err.message, true);
    });
}

// Conectar a otro peer
connectBtn.addEventListener('click', () => {
    const remoteId = remoteIdInput.value.trim();
    if (!remoteId) return;
    
    conn = peer.connect(remoteId);
    setupConnection();
    updateStatus('Conectando a ' + remoteId + '...');
});

// Desconectar
disconnectBtn.addEventListener('click', () => {
    if (conn) conn.close();
    resetConnection();
});

// Enviar mensaje
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !conn || !conn.open) return;
    
    conn.send({ type: 'message', message });
    addMessage(message, true);
    messageInput.value = '';
}

// Ańadir mensaje al chat
function addMessage(message, isSent) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isSent ? 'sent' : 'received');
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
        ${message}
        <span class="message-time">${timeString}</span>
    `;
    
    chat.appendChild(messageElement);
    chat.scrollTop = chat.scrollHeight;
}

// Ańadir mensaje del sistema
function addSystemMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.style.alignSelf = 'center';
    messageElement.style.background = 'none';
    messageElement.style.color = '#6c757d';
    messageElement.style.fontStyle = 'italic';
    messageElement.textContent = text;
    
    chat.appendChild(messageElement);
    chat.scrollTop = chat.scrollHeight;
}

// Actualizar estado
function updateStatus(text, isError = false) {
    statusElement.textContent = text;
    statusElement.style.color = isError ? 'var(--danger)' : '#6c757d';
}

// Resetear conexión
function resetConnection() {
    if (conn) conn.close();
    conn = null;
    messageInput.disabled = true;
    sendBtn.disabled = true;
    disconnectBtn.disabled = true;
    connectBtn.disabled = false;
}

// Inicializar PeerJS cuando se carga la biblioteca
function init() {
    // Cargar PeerJS dinámicamente
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/peerjs@1.4.7/dist/peerjs.min.js';
    script.onload = setupPeer;
    document.head.appendChild(script);
}

// Iniciar la aplicación
init();
