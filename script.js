// ==============================================
// CONFIGURAÇÃO SEGURA
// ==============================================

// Configuração básica do Firebase (em produção, carregue do backend)
const firebaseConfig = {
    // Em produção, pegue essas credenciais do seu backend
    apiKey: "AIzaSyCeAkDlLb3cAnYQvpo2BwHSB8qktUq7Zbg",
    authDomain: "eclipsexploits.firebaseapp.com",
    databaseURL: "https://eclipsexploits-default-rtdb.firebaseio.com",
    projectId: "eclipsexploits",
    storageBucket: "eclipsexploits.firebasestorage.app",
    messagingSenderId: "126850895726",
    appId: "1:126850895726:web:94e544d9f2d373671abb7f"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Variáveis globais
let currentUser = null;
let isAdmin = false;

// ==============================================
// SEGURANÇA BÁSICA
// ==============================================

// 1. Evitar DevTools básico
function setupBasicSecurity() {
    // Detectar F12
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J')) {
            e.preventDefault();
            document.getElementById('devtools-detected').style.display = 'flex';
        }
    });
    
    // Desativar console em produção
    if (window.location.hostname !== 'localhost') {
        console.log = () => {};
    }
}

// 2. Sanitizar inputs
function sanitizeInput(text) {
    return text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .trim();
}

// 3. Validar se é admin (NO BACKEND - isso é apenas UI)
async function verifyAdmin(userId) {
    try {
        // Em produção, isso deve ser verificado no backend
        const snapshot = await database.ref('admins/' + userId).once('value');
        return snapshot.exists() && snapshot.val() === true;
    } catch (error) {
        console.error('Erro ao verificar admin:', error);
        return false;
    }
}

// ==============================================
// AUTENTICAÇÃO
// ==============================================

async function handleLogin(email, password) {
    try {
        // Sanitizar inputs
        email = sanitizeInput(email);
        password = sanitizeInput(password);
        
        // Rate limiting básico
        const attempts = localStorage.getItem(`login_attempts_${email}`) || 0;
        if (attempts > 5) {
            showNotification('Muitas tentativas. Tente novamente mais tarde.', 'error');
            return;
        }
        
        // Login com Firebase
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        
        // Verificar se não está banido
        const userRef = database.ref('users/' + currentUser.uid);
        const snapshot = await userRef.once('value');
        
        if (snapshot.exists() && snapshot.val().isBanned) {
            await auth.signOut();
            showNotification('Usuário banido', 'error');
            return;
        }
        
        // Verificar se é admin
        isAdmin = await verifyAdmin(currentUser.uid);
        
        showNotification('Login realizado!', 'success');
        updateUI();
        closeModal('loginModal');
        
        // Limpar tentativas
        localStorage.removeItem(`login_attempts_${email}`);
        
    } catch (error) {
        // Registrar tentativa
        const attempts = parseInt(localStorage.getItem(`login_attempts_${email}`) || '0') + 1;
        localStorage.setItem(`login_attempts_${email}`, attempts);
        
        showNotification('Erro no login: ' + error.message, 'error');
    }
}

async function handleRegister(email, password, username) {
    try {
        // Sanitizar
        email = sanitizeInput(email);
        password = sanitizeInput(password);
        username = sanitizeInput(username);
        
        // Criar usuário
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Salvar dados do usuário
        await database.ref('users/' + userCredential.user.uid).set({
            email: email,
            username: username,
            createdAt: Date.now(),
            isBanned: false,
            isAdmin: false
        });
        
        showNotification('Conta criada com sucesso!', 'success');
        showLogin();
        
    } catch (error) {
        showNotification('Erro ao criar conta: ' + error.message, 'error');
    }
}

// ==============================================
// CHAT SEGURO
// ==============================================

async function sendMessage() {
    if (!currentUser) {
        showNotification('Faça login para enviar mensagens', 'warning');
        return;
    }
    
    const input = document.getElementById('chatInput');
    let text = input.value.trim();
    
    if (!text) return;
    
    // Sanitizar mensagem
    text = sanitizeInput(text);
    
    // Limitar tamanho
    if (text.length > 500) {
        showNotification('Mensagem muito longa (máx: 500 caracteres)', 'warning');
        return;
    }
    
    // Cooldown básico
    const lastMessage = localStorage.getItem('last_message_time') || 0;
    if (Date.now() - lastMessage < 5000) {
        showNotification('Aguarde 5 segundos entre mensagens', 'warning');
        return;
    }
    
    try {
        // Verificar se está mutado
        const userRef = database.ref('users/' + currentUser.uid);
        const snapshot = await userRef.once('value');
        
        if (snapshot.exists() && snapshot.val().isMuted) {
            showNotification('Você está mutado', 'error');
            return;
        }
        
        // Enviar mensagem
        await database.ref('chat').push({
            text: text,
            userId: currentUser.uid,
            username: currentUser.email.split('@')[0],
            timestamp: Date.now()
        });
        
        input.value = '';
        localStorage.setItem('last_message_time', Date.now());
        
    } catch (error) {
        showNotification('Erro ao enviar mensagem', 'error');
    }
}

function loadChatMessages() {
    database.ref('chat').limitToLast(50).on('value', (snapshot) => {
        const messagesDiv = document.getElementById('chatMessages');
        messagesDiv.innerHTML = '';
        
        if (!snapshot.exists()) return;
        
        snapshot.forEach((childSnapshot) => {
            const msg = childSnapshot.val();
            const msgElement = document.createElement('div');
            msgElement.className = 'message';
            msgElement.innerHTML = `
                <strong>${msg.username}:</strong> ${msg.text}
                <small>${new Date(msg.timestamp).toLocaleTimeString()}</small>
            `;
            messagesDiv.appendChild(msgElement);
        });
        
        // Scroll para baixo
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

// ==============================================
// SCRIPTS
// ==============================================

async function loadScripts() {
    try {
        const snapshot = await database.ref('scripts').limitToLast(20).once('value');
        const scriptsDiv = document.getElementById('scriptsList');
        scriptsDiv.innerHTML = '';
        
        if (!snapshot.exists()) {
            scriptsDiv.innerHTML = '<p>Nenhum script disponível</p>';
            return;
        }
        
        snapshot.forEach((childSnapshot) => {
            const script = childSnapshot.val();
            const scriptCard = document.createElement('div');
            scriptCard.className = 'script-card';
            scriptCard.innerHTML = `
                <h3 class="script-title">${script.title || 'Sem título'}</h3>
                <p class="script-content">${script.description || 'Sem descrição'}</p>
                <button onclick="copyScript('${childSnapshot.key}')" class="btn btn-primary">
                    <i class="fas fa-copy"></i> Copiar
                </button>
            `;
            scriptsDiv.appendChild(scriptCard);
        });
        
    } catch (error) {
        console.error('Erro ao carregar scripts:', error);
    }
}

async function copyScript(scriptId) {
    try {
        const snapshot = await database.ref('scripts/' + scriptId).once('value');
        const script = snapshot.val();
        
        if (!script || !script.code) {
            showNotification('Script não encontrado', 'error');
            return;
        }
        
        // Copiar para clipboard
        await navigator.clipboard.writeText(script.code);
        showNotification('Script copiado!', 'success');
        
    } catch (error) {
        showNotification('Erro ao copiar script', 'error');
    }
}

// ==============================================
// UI FUNCTIONS
// ==============================================

function updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    const userAvatar = document.getElementById('userAvatar');
    
    if (currentUser) {
        loginBtn.style.display = 'none';
        userAvatar.style.display = 'flex';
        userAvatar.textContent = currentUser.email.charAt(0).toUpperCase();
        userAvatar.title = currentUser.email;
    } else {
        loginBtn.style.display = 'block';
        userAvatar.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    // Criar notificação simples
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        z-index: 10000;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    openModal('loginModal');
}

function showRegister() {
    if (!document.getElementById('registerForm')) {
        const form = document.createElement('form');
        form.id = 'registerForm';
        form.innerHTML = `
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
                <a href="#" onclick="showLogin()">Já tem conta? Login</a>
            </p>
        `;
        document.querySelector('#loginModal .modal-content').appendChild(form);
    }
    
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

async function registerUser() {
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const username = document.getElementById('regUsername').value;
    
    if (!email || !password || !username) {
        showNotification('Preencha todos os campos', 'error');
        return;
    }
    
    await handleRegister(email, password, username);
}

function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// ==============================================
// EVENT LISTENERS
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    // Segurança
    setupBasicSecurity();
    
    // Event Listeners
    document.getElementById('loginBtn').addEventListener('click', () => openModal('loginModal'));
    
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        await handleLogin(email, password);
    });
    
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Navegação
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.getAttribute('href').substring(1);
            
            // Esconder todas as sections
            document.querySelectorAll('section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Mostrar section alvo
            document.getElementById(target).style.display = 'block';
            
            // Scroll suave
            scrollToSection(target);
        });
    });
    
    // Verificar auth state
    auth.onAuthStateChanged(async (user) => {
        currentUser = user;
        
        if (user) {
            // Verificar ban
            const userRef = database.ref('users/' + user.uid);
            const snapshot = await userRef.once('value');
            
            if (snapshot.exists() && snapshot.val().isBanned) {
                await auth.signOut();
                showNotification('Usuário banido', 'error');
                return;
            }
            
            // Carregar chat se estiver na seção
            loadChatMessages();
        }
        
        updateUI();
    });
    
    // Carregar scripts
    loadScripts();
});
