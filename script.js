// ==============================================
// CONFIGURAÇÃO DO FIREBASE
// ==============================================
const firebaseConfig = {
    apiKey: "AIzaSyCeAkDlLb3cAnYQvpo2BwHSB8qktUq7Zbg",
    authDomain: "eclipsexploits.firebaseapp.com",
    databaseURL: "https://eclipsexploits-default-rtdb.firebaseio.com",
    projectId: "eclipsexploits",
    storageBucket: "eclipsexploits.firebasestorage.app",
    messagingSenderId: "126850895726",
    appId: "1:126850895726:web:94e544d9f2d373671abb7f",
    measurementId: "G-LH6C7CXH10"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// ==============================================
// VARIÁVEIS GLOBAIS
// ==============================================
let currentUser = null;
let isAdmin = false;
let onlineUsers = new Map();
let messageCooldown = false;
const COOLDOWN_TIME = 5000;
let lastMessageTime = 0;
let devToolsOpened = false;

// ==============================================
// ELEMENTOS DOM
// ==============================================
const elements = {
    devtoolsDetected: document.getElementById('devtools-detected'),
    dashboardPanel: document.getElementById('dashboardPanel'),
    closeDashboard: document.getElementById('closeDashboard'),
    loginBtn: document.getElementById('loginBtn'),
    userAvatar: document.getElementById('userAvatar'),
    loginModal: document.getElementById('loginModal'),
    loginForm: document.getElementById('loginForm'),
    scriptsList: document.getElementById('scriptsList'),
    chatSection: document.getElementById('chat'),
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    sendMessageBtn: document.getElementById('sendMessageBtn'),
    onlineCount: document.getElementById('onlineCount'),
    navLinks: document.querySelector('.nav-links'),
    mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
    logoutBtn: document.getElementById('logoutBtn')
};

// ==============================================
// FUNÇÕES AUXILIARES
// ==============================================
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// ==============================================
// INICIALIZAÇÃO
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 EclipseXploits Studio Iniciando...");
    
    // Setup event listeners
    setupEventListeners();
    
    // Verificar estado de autenticação
    checkAuthState();
    
    // Carregar scripts
    loadScripts();
    
    // Setup chat
    setupChat();
    
    // Setup anti-devtools
    setupAntiDevTools();
    
    // Setup online users
    setupOnlineUsers();
    
    console.log("✅ Sistema inicializado!");
});

// ==============================================
// EVENT LISTENERS
// ==============================================
function setupEventListeners() {
    // Login button
    elements.loginBtn.addEventListener('click', () => {
        elements.loginModal.style.display = 'flex';
    });
    
    // Close buttons
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            if (e.target.id === 'closeDashboard') {
                elements.dashboardPanel.style.display = 'none';
            } else {
                elements.loginModal.style.display = 'none';
            }
        });
    });
    
    // Login form
    elements.loginForm.addEventListener('submit', handleLoginSubmit);
    
    // Chat
    elements.sendMessageBtn.addEventListener('click', sendMessage);
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Logout
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', logoutUser);
    }
    
    // Mobile menu
    if (elements.mobileMenuBtn) {
        elements.mobileMenuBtn.addEventListener('click', () => {
            elements.navLinks.classList.toggle('active');
        });
    }
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.getAttribute('href');
            
            if (target === '#chat') {
                showChatSection();
            } else {
                // Esconder todas as sections
                document.querySelectorAll('section').forEach(section => {
                    section.style.display = 'none';
                });
                
                // Mostrar section alvo
                const targetSection = document.querySelector(target);
                if (targetSection) {
                    targetSection.style.display = 'block';
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
                
                // Fechar mobile menu
                if (window.innerWidth <= 768) {
                    elements.navLinks.classList.remove('active');
                }
            }
        });
    });
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target === elements.loginModal) {
            elements.loginModal.style.display = 'none';
        }
        if (e.target === elements.dashboardPanel) {
            elements.dashboardPanel.style.display = 'none';
        }
    });
}

// ==============================================
// AUTENTICAÇÃO
// ==============================================
function checkAuthState() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log("✅ Usuário autenticado:", user.email);
            currentUser = user;
            
            // Verificar se é admin
            await checkAdminStatus(user.uid);
            
            // Atualizar UI
            updateUIForLoggedInUser(user);
            
            // Setup user presence
            setupUserPresence(user.uid);
            
        } else {
            console.log("🚪 Usuário não autenticado");
            currentUser = null;
            isAdmin = false;
            updateUIForGuest();
        }
    });
}

async function checkAdminStatus(userId) {
    try {
        const snapshot = await database.ref('admins/' + userId).once('value');
        isAdmin = snapshot.exists() && snapshot.val() === true;
        
        if (isAdmin) {
            console.log("👑 Usuário é admin");
            showDashboard();
        }
    } catch (error) {
        console.error("❌ Erro ao verificar admin:", error);
        isAdmin = false;
    }
}

function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showNotification('Preencha todos os campos', 'error');
        return;
    }
    
    // Rate limiting básico
    const attempts = parseInt(localStorage.getItem(`login_attempts_${email}`) || '0');
    if (attempts > 5) {
        showNotification('Muitas tentativas. Tente novamente mais tarde.', 'error');
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("✅ Login bem-sucedido");
            elements.loginModal.style.display = 'none';
            showNotification('Login realizado com sucesso!', 'success');
            elements.loginForm.reset();
            
            // Limpar tentativas
            localStorage.removeItem(`login_attempts_${email}`);
        })
        .catch((error) => {
            console.error("❌ Erro no login:", error);
            
            // Registrar tentativa
            const attempts = parseInt(localStorage.getItem(`login_attempts_${email}`) || '0') + 1;
            localStorage.setItem(`login_attempts_${email}`, attempts.toString());
            
            let errorMessage = '';
            switch(error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Email inválido';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'Usuário não encontrado';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Senha incorreta';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            showNotification('Erro: ' + errorMessage, 'error');
        });
}

// ==============================================
// UI FUNCTIONS
// ==============================================
function updateUIForLoggedInUser(user) {
    // Mostrar avatar, esconder login button
    elements.loginBtn.style.display = 'none';
    elements.userAvatar.style.display = 'flex';
    
    // Set avatar initial
    const initial = user.email ? user.email.charAt(0).toUpperCase() : 'U';
    elements.userAvatar.textContent = initial;
    elements.userAvatar.title = user.email;
    
    // Show logout button
    if (elements.logoutBtn) {
        elements.logoutBtn.style.display = 'block';
    }
    
    // Add online indicator
    elements.userAvatar.classList.add('online');
    
    // Habilitar chat
    if (elements.chatInput) {
        elements.chatInput.disabled = false;
        elements.chatInput.placeholder = "Digite sua mensagem... (Enter para enviar)";
        elements.sendMessageBtn.disabled = false;
    }
}

function updateUIForGuest() {
    // Mostrar login button, esconder avatar
    elements.loginBtn.style.display = 'block';
    elements.userAvatar.style.display = 'none';
    
    // Hide logout button
    if (elements.logoutBtn) {
        elements.logoutBtn.style.display = 'none';
    }
    
    // Desabilitar chat
    if (elements.chatInput) {
        elements.chatInput.disabled = true;
        elements.chatInput.placeholder = "Faça login para usar o chat";
        elements.sendMessageBtn.disabled = true;
    }
    
    // Remover online indicator
    elements.userAvatar.classList.remove('online');
}

function showChatSection() {
    if (!currentUser) {
        showNotification('Faça login para acessar o chat', 'warning');
        elements.loginModal.style.display = 'flex';
        return;
    }
    
    // Esconder outras sections
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar chat
    elements.chatSection.style.display = 'block';
    
    // Focus no input
    if (elements.chatInput) {
        elements.chatInput.focus();
    }
}

// ==============================================
// SCRIPT SYSTEM
// ==============================================
async function loadScripts() {
    try {
        console.log("📥 Carregando scripts...");
        const snapshot = await database.ref('scripts').orderByChild('date').limitToLast(20).once('value');
        
        if (!elements.scriptsList) return;
        elements.scriptsList.innerHTML = '';
        
        if (!snapshot.exists()) {
            elements.scriptsList.innerHTML = `
                <div style="text-align: center; padding: 50px; color: var(--gray);">
                    <i class="fas fa-code" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <h3>Nenhum script disponível</h3>
                </div>
            `;
            return;
        }
        
        const scripts = [];
        snapshot.forEach((childSnapshot) => {
            scripts.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        // Ordenar por data (mais recente primeiro)
        scripts.sort((a, b) => b.date - a.date);
        
        // Mostrar scripts
        scripts.forEach((script) => {
            const scriptCard = createScriptCard(script);
            elements.scriptsList.appendChild(scriptCard);
        });
        
        console.log(`✅ ${scripts.length} scripts carregados`);
        
    } catch (error) {
        console.error("❌ Erro ao carregar scripts:", error);
        if (elements.scriptsList) {
            elements.scriptsList.innerHTML = `
                <div style="text-align: center; padding: 50px; color: var(--danger);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
                    <p>Erro ao carregar scripts</p>
                </div>
            `;
        }
    }
}

function createScriptCard(script) {
    const div = document.createElement('div');
    div.className = 'script-card';
    
    const date = new Date(script.date || Date.now());
    const dateStr = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    div.innerHTML = `
        <div class="script-header">
            <div class="script-title">${script.title || 'Script sem título'}</div>
            <div class="script-date">${dateStr}</div>
        </div>
        <div class="script-content">${script.description || 'Sem descrição'}</div>
        <div class="script-actions">
            <button onclick="downloadScript('${script.id}')" class="btn btn-primary btn-sm">
                <i class="fas fa-download"></i> Baixar
            </button>
            <button onclick="copyScript('${script.id}')" class="btn btn-secondary btn-sm">
                <i class="fas fa-copy"></i> Copiar
            </button>
        </div>
    `;
    
    return div;
}

// ==============================================
// SCRIPT ACTIONS
// ==============================================
window.downloadScript = async function(scriptId) {
    if (!currentUser) {
        showNotification('Faça login para baixar scripts', 'warning');
        elements.loginModal.style.display = 'flex';
        return;
    }
    
    try {
        const snapshot = await database.ref('scripts/' + scriptId).once('value');
        const script = snapshot.val();
        
        if (!script) {
            showNotification('Script não encontrado', 'error');
            return;
        }
        
        // Criar download
        const blob = new Blob([script.code || ''], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(script.title || 'script').replace(/[^a-z0-9]/gi, '_')}.lua`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Download iniciado!', 'success');
        
        // Incrementar contador de downloads
        database.ref('scripts/' + scriptId + '/downloads').transaction((current) => {
            return (current || 0) + 1;
        });
        
    } catch (error) {
        console.error("❌ Erro ao baixar script:", error);
        showNotification('Erro ao baixar script', 'error');
    }
};

window.copyScript = async function(scriptId) {
    try {
        const snapshot = await database.ref('scripts/' + scriptId).once('value');
        const script = snapshot.val();
        
        if (!script || !script.code) {
            showNotification('Script não encontrado', 'error');
            return;
        }
        
        await navigator.clipboard.writeText(script.code);
        showNotification('Código copiado para a área de transferência!', 'success');
        
    } catch (error) {
        showNotification('Erro ao copiar script', 'error');
    }
};

// ==============================================
// CHAT SYSTEM
// ==============================================
function setupChat() {
    // Carregar mensagens
    loadChatMessages();
    
    // Ouvir novas mensagens
    database.ref('chat').limitToLast(100).on('child_added', (snapshot) => {
        const message = snapshot.val();
        message.id = snapshot.key;
        addMessageToChat(message);
    });
}

async function loadChatMessages() {
    if (!elements.chatMessages) return;
    
    try {
        const snapshot = await database.ref('chat').limitToLast(50).once('value');
        elements.chatMessages.innerHTML = '';
        
        if (!snapshot.exists()) {
            elements.chatMessages.innerHTML = `
                <div style="text-align: center; padding: 50px; color: var(--gray);">
                    <i class="fas fa-comments"></i>
                    <p>Nenhuma mensagem ainda</p>
                </div>
            `;
            return;
        }
        
        const messages = [];
        snapshot.forEach((childSnapshot) => {
            messages.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        // Ordenar por timestamp
        messages.sort((a, b) => a.timestamp - b.timestamp);
        
        // Adicionar todas as mensagens
        messages.forEach((message) => {
            addMessageToChat(message);
        });
        
        // Scroll para baixo
        scrollChatToBottom();
        
    } catch (error) {
        console.error("❌ Erro ao carregar chat:", error);
    }
}

function addMessageToChat(message) {
    if (!elements.chatMessages) return;
    
    // Remover placeholder se existir
    const placeholder = elements.chatMessages.querySelector('div[style*="text-align: center"]');
    if (placeholder) {
        placeholder.remove();
    }
    
    const messageElement = createMessageElement(message);
    elements.chatMessages.appendChild(messageElement);
    
    // Auto-scroll se estiver no fundo
    const isAtBottom = elements.chatMessages.scrollHeight - elements.chatMessages.clientHeight <= elements.chatMessages.scrollTop + 50;
    if (isAtBottom) {
        scrollChatToBottom();
    }
}

function createMessageElement(message) {
    const isCurrentUser = currentUser && message.userId === currentUser.uid;
    const userName = message.userName || message.userId?.substring(0, 8) || 'Usuário';
    const time = new Date(message.timestamp);
    const timeStr = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const div = document.createElement('div');
    div.className = `message ${isCurrentUser ? 'self' : ''}`;
    
    const avatarHTML = `
        <div class="message-avatar">
            ${userName.charAt(0).toUpperCase()}
        </div>
    `;
    
    const contentHTML = `
        <div class="message-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="font-weight: 700; color: ${isCurrentUser ? 'var(--accent)' : 'var(--light)'}">
                    ${userName} ${isCurrentUser ? '(Você)' : ''}
                </div>
                <div style="font-size: 0.85rem; color: var(--gray);">${timeStr}</div>
            </div>
            <div class="message-text">${message.text}</div>
        </div>
    `;
    
    if (isCurrentUser) {
        div.innerHTML = contentHTML + avatarHTML;
    } else {
        div.innerHTML = avatarHTML + contentHTML;
    }
    
    return div;
}

async function sendMessage() {
    if (!currentUser) {
        showNotification('Faça login para enviar mensagens', 'warning');
        elements.loginModal.style.display = 'flex';
        return;
    }
    
    const text = elements.chatInput.value.trim();
    if (!text) {
        showNotification('Digite uma mensagem', 'warning');
        return;
    }
    
    // Verificar cooldown
    const now = Date.now();
    if (messageCooldown && now - lastMessageTime < COOLDOWN_TIME) {
        const remaining = Math.ceil((COOLDOWN_TIME - (now - lastMessageTime)) / 1000);
        showNotification(`Aguarde ${remaining} segundos para enviar outra mensagem`, 'warning');
        return;
    }
    
    // Verificar se está banido/mutado
    try {
        const snapshot = await database.ref('users/' + currentUser.uid).once('value');
        const userData = snapshot.val();
        
        if (userData && userData.isBanned) {
            showNotification('Você está banido do chat', 'error');
            return;
        }
        
        if (userData && userData.isMuted) {
            showNotification('Você está mutado do chat', 'warning');
            return;
        }
        
        // Enviar mensagem
        const messageData = {
            text: text,
            timestamp: now,
            userId: currentUser.uid,
            userName: currentUser.email.split('@')[0],
            isAdmin: isAdmin
        };
        
        await database.ref('chat').push(messageData);
        
        // Limpar input
        elements.chatInput.value = '';
        
        // Set cooldown
        lastMessageTime = now;
        messageCooldown = true;
        
        // Limpar cooldown após tempo
        setTimeout(() => {
            messageCooldown = false;
        }, COOLDOWN_TIME);
        
    } catch (error) {
        console.error("❌ Erro ao enviar mensagem:", error);
        showNotification('Erro ao enviar mensagem', 'error');
    }
}

function scrollChatToBottom() {
    if (elements.chatMessages) {
        setTimeout(() => {
            elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
        }, 100);
    }
}

// ==============================================
// ONLINE USERS SYSTEM
// ==============================================
function setupOnlineUsers() {
    // Listen for online users
    database.ref('online_users').on('value', (snapshot) => {
        onlineUsers.clear();
        
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const user = childSnapshot.val();
                onlineUsers.set(user.userId, user);
            });
            
            // Update online count
            const onlineCount = snapshot.numChildren();
            if (elements.onlineCount) {
                elements.onlineCount.textContent = `${onlineCount} online`;
            }
            
            // Update dashboard
            const onlineUsersElement = document.getElementById('onlineUsers');
            if (onlineUsersElement) {
                onlineUsersElement.textContent = onlineCount;
            }
        }
    });
}

function setupUserPresence(userId) {
    if (!userId) return;
    
    // Set user as online
    const userPresenceRef = database.ref('online_users/' + userId);
    
    userPresenceRef.set({
        userId: userId,
        email: currentUser.email,
        name: currentUser.displayName || currentUser.email.split('@')[0],
        lastSeen: Date.now(),
        online: true,
        isAdmin: isAdmin
    });
    
    // Update lastSeen periodically
    const updateInterval = setInterval(() => {
        if (currentUser) {
            userPresenceRef.update({
                lastSeen: Date.now()
            });
        } else {
            clearInterval(updateInterval);
        }
    }, 30000);
    
    // Remove on disconnect
    userPresenceRef.onDisconnect().remove();
}

// ==============================================
// NOTIFICATION SYSTEM
// ==============================================
function showNotification(message, type = 'info') {
    // Remover notificações existentes
    const existing = document.querySelectorAll('.notification-toast');
    existing.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' :
                type === 'error' ? 'exclamation-circle' :
                type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}" style="font-size: 1.5rem;"></i>
        <div>${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remover após 5 segundos
    setTimeout(() => {
        notification.style.animation = 'notificationSlide 0.5s cubic-bezier(0.4, 0, 0.2, 1) reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 500);
    }, 5000);
}

// ==============================================
// ANTI-DEVTOOLS PROTECTION
// ==============================================
function setupAntiDevTools() {
    // Detectar F12, Ctrl+Shift+I, Ctrl+Shift+J
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J')) {
            e.preventDefault();
            triggerDevToolsDetection();
        }
    });
    
    // Detectar devtools por dimensões da janela
    const checkDevTools = setInterval(() => {
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        
        if ((widthThreshold || heightThreshold) && !devToolsOpened) {
            devToolsOpened = true;
            triggerDevToolsDetection();
            clearInterval(checkDevTools);
        }
    }, 1000);
}

function triggerDevToolsDetection() {
    if (devToolsOpened) return;
    
    devToolsOpened = true;
    
    // Mostrar warning
    elements.devtoolsDetected.style.display = 'flex';
    
    // Tentar fechar/redirecionar após 3 segundos
    setTimeout(() => {
        try {
            window.open('', '_self').close();
        } catch (e) {
            // Se não conseguir fechar, redirecionar
            setTimeout(() => {
                window.location.href = 'about:blank';
            }, 1000);
        }
    }, 3000);
}

// ==============================================
// ADMIN FUNCTIONS (SÓ PARA ADMINS)
// ==============================================
function showDashboard() {
    if (!isAdmin) return;
    
    elements.dashboardPanel.style.display = 'block';
    loadDashboardStats();
}

async function loadDashboardStats() {
    if (!isAdmin) return;
    
    try {
        // Total scripts
        const scriptsSnapshot = await database.ref('scripts').once('value');
        const totalScripts = document.getElementById('totalScripts');
        if (totalScripts) {
            totalScripts.textContent = scriptsSnapshot.numChildren() || 0;
        }
        
        // Total messages
        const messagesSnapshot = await database.ref('chat').once('value');
        const totalMessages = document.getElementById('totalMessages');
        if (totalMessages) {
            totalMessages.textContent = messagesSnapshot.numChildren() || 0;
        }
        
        // Daily visits
        const today = new Date().toDateString();
        const visitsSnapshot = await database.ref('daily_visits/' + today).once('value');
        const dailyVisits = document.getElementById('dailyVisits');
        if (dailyVisits) {
            dailyVisits.textContent = visitsSnapshot.val() || 0;
        }
        
    } catch (error) {
        console.error("❌ Erro ao carregar stats:", error);
    }
}

// ==============================================
// HELPER FUNCTIONS
// ==============================================
function registerVisit() {
    const today = new Date().toDateString();
    
    // Registrar visita diária
    database.ref('daily_visits/' + today).transaction((current) => {
        return (current || 0) + 1;
    }).catch(console.error);
}

// Registrar primeira visita
registerVisit();

// Função para mostrar/registrar usuários
window.showRegister = function() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    if (!document.getElementById('registerForm')) {
        const registerHTML = `
            <div id="registerForm">
                <div class="form-group">
                    <input type="text" id="regUsername" class="form-control" placeholder="Nome de usuário" required>
                </div>
                <div class="form-group">
                    <input type="email" id="regEmail" class="form-control" placeholder="Email" required>
                </div>
                <div class="form-group">
                    <input type="password" id="regPassword" class="form-control" placeholder="Senha" required>
                </div>
                <button type="button" onclick="registerUser()" class="btn btn-primary">CRIAR CONTA</button>
                <p style="margin-top: 15px; text-align: center;">
                    <a href="#" onclick="showLoginForm()" style="color: var(--primary);">Já tem conta? Login</a>
                </p>
            </div>
        `;
        
        loginForm.insertAdjacentHTML('afterend', registerHTML);
    }
    
    loginForm.style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
};

window.showLoginForm = function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
};

window.registerUser = async function() {
    const email = document.getElementById('regEmail')?.value.trim();
    const password = document.getElementById('regPassword')?.value;
    const username = document.getElementById('regUsername')?.value.trim();
    
    if (!email || !password || !username) {
        showNotification('Preencha todos os campos', 'error');
        return;
    }
    
    try {
        // Criar usuário no Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Salvar dados do usuário no Realtime Database
        await database.ref('users/' + userCredential.user.uid).set({
            email: email,
            username: username,
            displayName: username,
            createdAt: Date.now(),
            isAdmin: false,
            isBanned: false,
            isMuted: false,
            avatar: null,
            bio: ''
        });
        
        showNotification('Conta criada com sucesso!', 'success');
        showLoginForm();
        
        // Limpar formulário
        document.getElementById('regEmail').value = '';
        document.getElementById('regPassword').value = '';
        document.getElementById('regUsername').value = '';
        
    } catch (error) {
        console.error("❌ Erro ao criar conta:", error);
        
        let errorMessage = '';
        switch(error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Email já cadastrado';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Email inválido';
                break;
            case 'auth/weak-password':
                errorMessage = 'Senha muito fraca';
                break;
            default:
                errorMessage = error.message;
        }
        
        showNotification('Erro: ' + errorMessage, 'error');
    }
};

// Logout function
window.logoutUser = async function() {
    try {
        // Remover da lista de online users
        if (currentUser) {
            await database.ref('online_users/' + currentUser.uid).remove();
        }
        
        // Fazer logout
        await auth.signOut();
        showNotification('Logout realizado!', 'info');
        
    } catch (error) {
        console.error("❌ Erro ao fazer logout:", error);
        showNotification('Erro ao fazer logout', 'error');
    }
};

console.log("🎉 EclipseXploits Studio carregado com todas as funcionalidades!");
