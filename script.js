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
// CONFIGURAÇÃO ADMIN EXCLUSIVA
// ==============================================
const ADMIN_EMAIL = "guizinbzsk@gmail.com";
let isAdminUser = false;

// ==============================================
// VARIÁVEIS GLOBAIS
// ==============================================
let currentUser = null;
let onlineUsers = new Map();
let messageCooldown = false;
const COOLDOWN_TIME = 3000;
let lastMessageTime = 0;
let devToolsOpened = false;
let isDarkTheme = true;
let isMusicPlaying = false;
let notifications = [];

// ==============================================
// ELEMENTOS DOM
// ==============================================
const elements = {
    // Core
    loadingScreen: document.getElementById('loadingScreen'),
    loadingProgress: document.getElementById('loadingProgress'),
    
    // Music & Theme
    backgroundMusic: document.getElementById('backgroundMusic'),
    musicToggle: document.getElementById('musicToggle'),
    themeToggle: document.getElementById('themeToggle'),
    
    // Auth
    loginBtn: document.getElementById('loginBtn'),
    userAvatar: document.getElementById('userAvatar'),
    loginModal: document.getElementById('loginModal'),
    loginForm: document.getElementById('loginForm'),
    
    // Scripts
    scriptsList: document.getElementById('scriptsList'),
    scriptSearch: document.getElementById('scriptSearch'),
    gameFilter: document.getElementById('gameFilter'),
    refreshScripts: document.getElementById('refreshScripts'),
    scriptsLoading: document.getElementById('scriptsLoading'),
    
    // Chat
    chatSection: document.getElementById('chat'),
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    sendMessageBtn: document.getElementById('sendMessageBtn'),
    onlineCount: document.getElementById('onlineCount'),
    messageCount: document.getElementById('messageCount'),
    emojiBtn: document.getElementById('emojiBtn'),
    
    // Stats
    totalScriptsCount: document.getElementById('totalScriptsCount'),
    onlineUsersCount: document.getElementById('onlineUsersCount'),
    totalDownloads: document.getElementById('totalDownloads'),
    footerOnline: document.getElementById('footerOnline'),
    footerScripts: document.getElementById('footerScripts'),
    serverTime: document.getElementById('serverTime'),
    
    // Ranking
    rankingList: document.getElementById('rankingList'),
    totalUsers: document.getElementById('totalUsers'),
    topUser: document.getElementById('topUser'),
    
    // Navigation
    navLinks: document.querySelector('.nav-links'),
    mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
    
    // Admin
    adminDashboardBtn: document.getElementById('adminDashboardBtn'),
    adminDashboard: document.getElementById('adminDashboard'),
    adminEmail: document.getElementById('adminEmail'),
    adminTotalUsers: document.getElementById('adminTotalUsers'),
    adminTotalMessages: document.getElementById('adminTotalMessages'),
    adminTotalScripts: document.getElementById('adminTotalScripts'),
    adminOnlineNow: document.getElementById('adminOnlineNow'),
    adminLogs: document.getElementById('adminLogs'),
    
    // Notifications
    notificationCenter: document.getElementById('notificationCenter'),
    notificationList: document.getElementById('notificationList'),
    clearNotifications: document.getElementById('clearNotifications'),
    
    // Modals
    supportModal: document.getElementById('supportModal'),
    devtoolsDetected: document.getElementById('devtools-detected')
};

// ==============================================
// INICIALIZAÇÃO
// ==============================================
document.addEventListener('DOMContentLoaded', async () => {
    // Simular carregamento
    simulateLoading();
    
    // Inicializar sistemas
    await initSystems();
    
    // Setup event listeners
    setupEventListeners();
    
    // Inicializar tema e música
    initThemeAndMusic();
    
    // Iniciar relógio
    updateServerTime();
    setInterval(updateServerTime, 1000);
    
    // Iniciar animações
    startAnimations();
    
    console.log("🚀 EclipseXploits Studio Iniciado!");
});

async function initSystems() {
    try {
        // Verificar autenticação
        await checkAuthState();
        
        // Carregar scripts
        await loadScripts();
        
        // Setup chat
        setupChat();
        
        // Setup anti-devtools
        setupAntiDevTools();
        
        // Setup online users
        setupOnlineUsers();
        
        // Carregar ranking
        await loadRanking();
        
        // Inicializar particles
        initParticles();
        
        // Esconder loading screen
        setTimeout(() => {
            elements.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                elements.loadingScreen.style.display = 'none';
            }, 500);
        }, 1500);
        
    } catch (error) {
        console.error("❌ Erro na inicialização:", error);
        addNotification("Erro ao carregar sistema", "error");
    }
}

function simulateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        elements.loadingProgress.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 200);
}

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

function updateServerTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR');
    elements.serverTime.textContent = timeStr;
}

// ==============================================
// EVENT LISTENERS
// ==============================================
function setupEventListeners() {
    // Music toggle
    elements.musicToggle.addEventListener('click', toggleMusic);
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Login button
    elements.loginBtn.addEventListener('click', () => {
        elements.loginModal.style.display = 'flex';
    });
    
    // Close buttons
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) modal.style.display = 'none';
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
                scrollToSection(target.substring(1));
            }
            
            // Fechar mobile menu
            if (window.innerWidth <= 768) {
                elements.navLinks.classList.remove('active');
            }
        });
    });
    
    // Script search
    if (elements.scriptSearch) {
        elements.scriptSearch.addEventListener('input', filterScripts);
    }
    
    // Game filter
    if (elements.gameFilter) {
        elements.gameFilter.addEventListener('change', filterScripts);
    }
    
    // Refresh scripts
    if (elements.refreshScripts) {
        elements.refreshScripts.addEventListener('click', loadScripts);
    }
    
    // Admin dashboard button
    if (elements.adminDashboardBtn) {
        elements.adminDashboardBtn.addEventListener('click', () => {
            elements.adminDashboard.classList.toggle('active');
        });
    }
    
    // Clear notifications
    if (elements.clearNotifications) {
        elements.clearNotifications.addEventListener('click', clearAllNotifications);
    }
    
    // Ranking tabs
    document.querySelectorAll('.ranking-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.ranking-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            loadRanking(this.dataset.tab);
        });
    });
    
    // Password toggle
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
        if (!e.target.closest('.admin-dashboard') && !e.target.closest('#adminDashboardBtn')) {
            elements.adminDashboard.classList.remove('active');
        }
    });
}

// ==============================================
// TEMA E MÚSICA
// ==============================================
function initThemeAndMusic() {
    // Carregar preferências salvas
    const savedTheme = localStorage.getItem('theme');
    const savedMusic = localStorage.getItem('music');
    
    if (savedTheme === 'light') {
        toggleTheme();
    }
    
    if (savedMusic === 'on') {
        toggleMusic();
    }
}

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('light-theme');
    
    const icon = elements.themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
    
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
}

function toggleMusic() {
    isMusicPlaying = !isMusicPlaying;
    
    const icon = elements.musicToggle.querySelector('i');
    icon.classList.toggle('fa-volume-up');
    icon.classList.toggle('fa-volume-mute');
    
    if (isMusicPlaying) {
        elements.backgroundMusic.volume = 0.3;
        elements.backgroundMusic.play().catch(() => {
            addNotification("Clique em qualquer lugar para habilitar áudio", "info");
        });
    } else {
        elements.backgroundMusic.pause();
    }
    
    localStorage.setItem('music', isMusicPlaying ? 'on' : 'off');
}

// ==============================================
// ANIMAÇÕES E PARTÍCULAS
// ==============================================
function startAnimations() {
    // Animar elementos flutuantes
    const floaters = document.querySelectorAll('.floating-element');
    floaters.forEach((floater, index) => {
        floater.style.animationDelay = `${index * 0.5}s`;
    });
    
    // Intersection Observer para animações
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.feature-card, .script-card').forEach(card => {
        observer.observe(card);
    });
}

function initParticles() {
    particlesJS("particles-js", {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#6d28d9" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#6d28d9",
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" }
            }
        }
    });
}

// ==============================================
// AUTENTICAÇÃO (APENAS 1 ADMIN)
// ==============================================
function checkAuthState() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log("✅ Usuário autenticado:", user.email);
                currentUser = user;
                
                // VERIFICAR SE É O ADMIN EXCLUSIVO
                isAdminUser = user.email === ADMIN_EMAIL;
                
                if (isAdminUser) {
                    console.log("👑 USUÁRIO É O ADMIN EXCLUSIVO");
                    await setupAdminUser();
                }
                
                // Atualizar UI
                updateUIForLoggedInUser(user);
                
                // Setup user presence
                setupUserPresence(user.uid);
                
                // Registrar login
                await registerUserLogin(user);
                
            } else {
                console.log("🚪 Usuário não autenticado");
                currentUser = null;
                isAdminUser = false;
                updateUIForGuest();
            }
            resolve();
        });
    });
}

async function setupAdminUser() {
    // Garantir que apenas este email seja admin
    try {
        await database.ref('admins').set({
            [currentUser.uid]: true
        });
        
        // Mostrar botão do dashboard
        elements.adminDashboardBtn.style.display = 'flex';
        elements.adminEmail.textContent = currentUser.email;
        
        // Carregar stats admin
        loadAdminStats();
        
        // Carregar logs
        loadAdminLogs();
        
        addNotification("Painel Admin habilitado", "success");
        
    } catch (error) {
        console.error("❌ Erro ao configurar admin:", error);
    }
}

async function registerUserLogin(user) {
    try {
        const userRef = database.ref('users/' + user.uid);
        const snapshot = await userRef.once('value');
        
        if (!snapshot.exists()) {
            // Novo usuário
            await userRef.set({
                email: user.email,
                username: user.email.split('@')[0],
                displayName: user.email.split('@')[0],
                createdAt: Date.now(),
                isBanned: false,
                isMuted: false,
                isAdmin: isAdminUser,
                lastLogin: Date.now(),
                totalLogins: 1,
                messagesSent: 0,
                scriptsDownloaded: 0,
                level: 1,
                xp: 0
            });
            
            addNotification("Bem-vindo à comunidade!", "success");
            
        } else {
            // Atualizar último login
            await userRef.update({
                lastLogin: Date.now(),
                totalLogins: snapshot.val().totalLogins + 1 || 1
            });
            
            if (isAdminUser) {
                addNotification("Bem-vindo de volta, Admin!", "success");
            }
        }
        
    } catch (error) {
        console.error("❌ Erro ao registrar login:", error);
    }
}

function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        addNotification('Preencha todos os campos', 'error');
        return;
    }
    
    // Rate limiting
    const attempts = parseInt(localStorage.getItem(`login_attempts_${email}`) || '0');
    if (attempts > 5) {
        addNotification('Muitas tentativas. Tente novamente em 15 minutos.', 'error');
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("✅ Login bem-sucedido");
            elements.loginModal.style.display = 'none';
            
            // Limpar tentativas
            localStorage.removeItem(`login_attempts_${email}`);
            
            // Limpar formulário
            elements.loginForm.reset();
            
        })
        .catch((error) => {
            console.error("❌ Erro no login:", error);
            
            // Registrar tentativa
            const attempts = parseInt(localStorage.getItem(`login_attempts_${email}`) || '0') + 1;
            localStorage.setItem(`login_attempts_${email}`, attempts.toString());
            
            let errorMessage = 'Erro ao fazer login';
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
                case 'auth/too-many-requests':
                    errorMessage = 'Muitas tentativas. Tente mais tarde.';
                    break;
            }
            
            addNotification(errorMessage, 'error');
        });
}

// ==============================================
// UI FUNCTIONS
// ==============================================
function updateUIForLoggedInUser(user) {
    // Mostrar avatar, esconder login button
    elements.loginBtn.style.display = 'none';
    elements.userAvatar.style.display = 'flex';
    
    // Set avatar
    const initial = user.email ? user.email.charAt(0).toUpperCase() : 'U';
    elements.userAvatar.textContent = initial;
    elements.userAvatar.title = user.email;
    
    // Add admin badge se for admin
    if (isAdminUser) {
        elements.userAvatar.innerHTML += '<span class="admin-badge">A</span>';
    }
    
    // Habilitar chat
    if (elements.chatInput) {
        elements.chatInput.disabled = false;
        elements.chatInput.placeholder = "Digite sua mensagem... (Enter para enviar)";
        elements.sendMessageBtn.disabled = false;
        elements.emojiBtn.disabled = false;
    }
    
    // Notificação de boas-vindas
    if (isAdminUser) {
        addNotification(`Bem-vindo, Admin ${user.email.split('@')[0]}!`, 'success');
    } else {
        addNotification(`Bem-vindo, ${user.email.split('@')[0]}!`, 'success');
    }
}

function updateUIForGuest() {
    // Mostrar login button, esconder avatar
    elements.loginBtn.style.display = 'block';
    elements.userAvatar.style.display = 'none';
    
    // Esconder dashboard admin
    elements.adminDashboardBtn.style.display = 'none';
    elements.adminDashboard.classList.remove('active');
    
    // Desabilitar chat
    if (elements.chatInput) {
        elements.chatInput.disabled = true;
        elements.chatInput.placeholder = "Faça login para usar o chat";
        elements.sendMessageBtn.disabled = true;
        elements.emojiBtn.disabled = true;
    }
}

function showChatSection() {
    if (!currentUser) {
        addNotification('Faça login para acessar o chat', 'warning');
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
        setTimeout(() => {
            elements.chatInput.focus();
        }, 100);
    }
}

// ==============================================
// SCRIPT SYSTEM
// ==============================================
async function loadScripts() {
    try {
        elements.scriptsLoading.style.display = 'flex';
        
        console.log("📥 Carregando scripts...");
        const snapshot = await database.ref('scripts').orderByChild('date').limitToLast(50).once('value');
        
        if (!elements.scriptsList) return;
        elements.scriptsList.innerHTML = '';
        
        if (!snapshot.exists()) {
            elements.scriptsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-code" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <h3>Nenhum script disponível</h3>
                    <p>Seja o primeiro a adicionar um script!</p>
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
        
        // Atualizar contador
        elements.totalScriptsCount.textContent = scripts.length;
        elements.footerScripts.textContent = scripts.length;
        
        console.log(`✅ ${scripts.length} scripts carregados`);
        
    } catch (error) {
        console.error("❌ Erro ao carregar scripts:", error);
        if (elements.scriptsList) {
            elements.scriptsList.innerHTML = `
                <div class="empty-state error">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
                    <p>Erro ao carregar scripts</p>
                </div>
            `;
        }
    } finally {
        elements.scriptsLoading.style.display = 'none';
    }
}

function filterScripts() {
    const searchTerm = elements.scriptSearch.value.toLowerCase();
    const gameFilter = elements.gameFilter.value.toLowerCase();
    
    const scriptCards = document.querySelectorAll('.script-card');
    let visibleCount = 0;
    
    scriptCards.forEach(card => {
        const title = card.querySelector('.script-title').textContent.toLowerCase();
        const description = card.querySelector('.script-content').textContent.toLowerCase();
        const game = card.dataset.game || '';
        
        const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
        const matchesGame = !gameFilter || game.includes(gameFilter);
        
        if (matchesSearch && matchesGame) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Mostrar mensagem se não houver resultados
    if (visibleCount === 0) {
        const emptyState = document.querySelector('.empty-state') || createEmptyState();
        if (!document.querySelector('.empty-state')) {
            elements.scriptsList.appendChild(emptyState);
        }
    }
}

function createScriptCard(script) {
    const div = document.createElement('div');
    div.className = 'script-card';
    div.dataset.game = script.game ? script.game.toLowerCase() : '';
    
    const date = new Date(script.date || Date.now());
    const dateStr = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    const downloads = script.downloads || 0;
    const rating = script.rating || 5.0;
    
    div.innerHTML = `
        <div class="script-header">
            <div class="script-title">${script.title || 'Script sem título'}</div>
            <div class="script-meta">
                <span class="script-game">${script.game || 'Geral'}</span>
                <span class="script-date">${dateStr}</span>
            </div>
        </div>
        <div class="script-content">${script.description || 'Sem descrição'}</div>
        <div class="script-stats">
            <span class="stat"><i class="fas fa-download"></i> ${downloads}</span>
            <span class="stat"><i class="fas fa-star"></i> ${rating.toFixed(1)}</span>
            <span class="stat"><i class="fas fa-user"></i> ${script.author || 'Admin'}</span>
        </div>
        <div class="script-actions">
            <button onclick="downloadScript('${script.id}')" class="btn btn-primary">
                <i class="fas fa-download"></i> Baixar
            </button>
            <button onclick="copyScript('${script.id}')" class="btn btn-secondary">
                <i class="fas fa-copy"></i> Copiar
            </button>
            ${isAdminUser ? `
                <button onclick="adminEditScript('${script.id}')" class="btn btn-warning">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="adminDeleteScript('${script.id}')" class="btn btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            ` : ''}
        </div>
    `;
    
    return div;
}

// ==============================================
// SCRIPT ACTIONS
// ==============================================
window.downloadScript = async function(scriptId) {
    if (!currentUser) {
        addNotification('Faça login para baixar scripts', 'warning');
        elements.loginModal.style.display = 'flex';
        return;
    }
    
    try {
        const snapshot = await database.ref('scripts/' + scriptId).once('value');
        const script = snapshot.val();
        
        if (!script) {
            addNotification('Script não encontrado', 'error');
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
        
        addNotification('Download iniciado!', 'success');
        
        // Incrementar contador de downloads
        database.ref('scripts/' + scriptId + '/downloads').transaction((current) => {
            return (current || 0) + 1;
        });
        
        // Registrar download do usuário
        if (currentUser) {
            database.ref('users/' + currentUser.uid + '/scriptsDownloaded').transaction((current) => {
                return (current || 0) + 1;
            });
        }
        
    } catch (error) {
        console.error("❌ Erro ao baixar script:", error);
        addNotification('Erro ao baixar script', 'error');
    }
};

window.copyScript = async function(scriptId) {
    try {
        const snapshot = await database.ref('scripts/' + scriptId).once('value');
        const script = snapshot.val();
        
        if (!script || !script.code) {
            addNotification('Script não encontrado', 'error');
            return;
        }
        
        await navigator.clipboard.writeText(script.code);
        addNotification('Código copiado para a área de transferência!', 'success');
        
    } catch (error) {
        addNotification('Erro ao copiar script', 'error');
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
        updateMessageCount();
    });
}

async function loadChatMessages() {
    if (!elements.chatMessages) return;
    
    try {
        const snapshot = await database.ref('chat').limitToLast(50).once('value');
        elements.chatMessages.innerHTML = '';
        
        if (!snapshot.exists()) {
            elements.chatMessages.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-comments"></i>
                    <p>Nenhuma mensagem ainda</p>
                    <small>Seja o primeiro a enviar uma mensagem!</small>
                </div>
            `;
            updateMessageCount();
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
        updateMessageCount();
        
    } catch (error) {
        console.error("❌ Erro ao carregar chat:", error);
    }
}

function addMessageToChat(message) {
    if (!elements.chatMessages) return;
    
    // Remover placeholder se existir
    const placeholder = elements.chatMessages.querySelector('.empty-chat');
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
    div.className = `message ${isCurrentUser ? 'self' : ''} ${message.isAdmin ? 'admin' : ''}`;
    
    const avatarHTML = `
        <div class="message-avatar">
            ${userName.charAt(0).toUpperCase()}
            ${message.isAdmin ? '<span class="admin-badge">A</span>' : ''}
        </div>
    `;
    
    const contentHTML = `
        <div class="message-content">
            <div class="message-header">
                <div class="message-user">
                    <strong>${userName}</strong>
                    ${isCurrentUser ? '<span class="you-badge">Você</span>' : ''}
                    ${message.isAdmin ? '<span class="admin-badge">ADMIN</span>' : ''}
                </div>
                <div class="message-time">${timeStr}</div>
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
        addNotification('Faça login para enviar mensagens', 'warning');
        elements.loginModal.style.display = 'flex';
        return;
    }
    
    const text = elements.chatInput.value.trim();
    if (!text) {
        addNotification('Digite uma mensagem', 'warning');
        return;
    }
    
    // Verificar cooldown
    const now = Date.now();
    if (messageCooldown && now - lastMessageTime < COOLDOWN_TIME) {
        const remaining = Math.ceil((COOLDOWN_TIME - (now - lastMessageTime)) / 1000);
        addNotification(`Aguarde ${remaining} segundos para enviar outra mensagem`, 'warning');
        return;
    }
    
    // Verificar se está banido/mutado
    try {
        const snapshot = await database.ref('users/' + currentUser.uid).once('value');
        const userData = snapshot.val();
        
        if (userData && userData.isBanned) {
            addNotification('Você está banido do chat', 'error');
            return;
        }
        
        if (userData && userData.isMuted) {
            addNotification('Você está mutado do chat', 'warning');
            return;
        }
        
        // Enviar mensagem
        const messageData = {
            text: text,
            timestamp: now,
            userId: currentUser.uid,
            userName: currentUser.email.split('@')[0],
            isAdmin: isAdminUser
        };
        
        await database.ref('chat').push(messageData);
        
        // Limpar input
        elements.chatInput.value = '';
        
        // Set cooldown
        lastMessageTime = now;
        messageCooldown = true;
        
        // Registrar mensagem do usuário
        database.ref('users/' + currentUser.uid + '/messagesSent').transaction((current) => {
            return (current || 0) + 1;
        });
        
        // Limpar cooldown após tempo
        setTimeout(() => {
            messageCooldown = false;
        }, COOLDOWN_TIME);
        
    } catch (error) {
        console.error("❌ Erro ao enviar mensagem:", error);
        addNotification('Erro ao enviar mensagem', 'error');
    }
}

function scrollChatToBottom() {
    if (elements.chatMessages) {
        setTimeout(() => {
            elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
        }, 100);
    }
}

function updateMessageCount() {
    const messageCount = elements.chatMessages.children.length;
    elements.messageCount.textContent = `${messageCount} mensagens`;
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
            if (elements.onlineUsersCount) {
                elements.onlineUsersCount.textContent = onlineCount;
            }
            if (elements.footerOnline) {
                elements.footerOnline.textContent = onlineCount;
            }
            if (elements.adminOnlineNow && isAdminUser) {
                elements.adminOnlineNow.textContent = onlineCount;
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
        isAdmin: isAdminUser
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
// RANKING SYSTEM
// ==============================================
async function loadRanking(period = 'weekly') {
    try {
        const snapshot = await database.ref('users').once('value');
        
        if (!snapshot.exists()) {
            elements.rankingList.innerHTML = `
                <div class="empty-ranking">
                    <i class="fas fa-trophy"></i>
                    <p>Nenhum usuário ainda</p>
                </div>
            `;
            return;
        }
        
        const users = [];
        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            user.id = childSnapshot.key;
            
            // Calcular score baseado em atividade
            const score = (user.messagesSent || 0) * 10 + 
                         (user.scriptsDownloaded || 0) * 50 +
                         (user.totalLogins || 0) * 5;
            
            users.push({
                ...user,
                score: score
            });
        });
        
        // Ordenar por score
        users.sort((a, b) => b.score - a.score);
        
        // Atualizar total de usuários
        elements.totalUsers.textContent = users.length;
        
        // Atualizar top user
        if (users.length > 0) {
            elements.topUser.textContent = users[0].username || users[0].email.split('@')[0];
        }
        
        // Mostrar ranking
        elements.rankingList.innerHTML = '';
        users.slice(0, 10).forEach((user, index) => {
            const rankElement = createRankElement(user, index + 1);
            elements.rankingList.appendChild(rankElement);
        });
        
    } catch (error) {
        console.error("❌ Erro ao carregar ranking:", error);
    }
}

function createRankElement(user, position) {
    const div = document.createElement('div');
    div.className = 'rank-item';
    
    const medal = position <= 3 ? ['🥇', '🥈', '🥉'][position - 1] : position;
    
    div.innerHTML = `
        <div class="rank-position">${medal}</div>
        <div class="rank-user">
            <div class="rank-avatar">${user.username?.charAt(0) || user.email?.charAt(0) || 'U'}</div>
            <div class="rank-info">
                <div class="rank-name">${user.username || user.email.split('@')[0]}</div>
                <div class="rank-stats">
                    <span><i class="fas fa-comment"></i> ${user.messagesSent || 0}</span>
                    <span><i class="fas fa-download"></i> ${user.scriptsDownloaded || 0}</span>
                    <span><i class="fas fa-sign-in-alt"></i> ${user.totalLogins || 1}</span>
                </div>
            </div>
        </div>
        <div class="rank-score">${user.score || 0} pts</div>
    `;
    
    return div;
}

// ==============================================
// ADMIN FUNCTIONS (APENAS PARA guizinbzsk@gmail.com)
// ==============================================
async function loadAdminStats() {
    if (!isAdminUser) return;
    
    try {
        // Total users
        const usersSnapshot = await database.ref('users').once('value');
        elements.adminTotalUsers.textContent = usersSnapshot.numChildren() || 0;
        
        // Total messages
        const messagesSnapshot = await database.ref('chat').once('value');
        elements.adminTotalMessages.textContent = messagesSnapshot.numChildren() || 0;
        
        // Total scripts
        const scriptsSnapshot = await database.ref('scripts').once('value');
        elements.adminTotalScripts.textContent = scriptsSnapshot.numChildren() || 0;
        
    } catch (error) {
        console.error("❌ Erro ao carregar stats admin:", error);
    }
}

async function loadAdminLogs() {
    if (!isAdminUser) return;
    
    try {
        const snapshot = await database.ref('admin_logs').limitToLast(20).once('value');
        elements.adminLogs.innerHTML = '';
        
        if (!snapshot.exists()) {
            elements.adminLogs.innerHTML = '<div class="empty-logs">Nenhum log encontrado</div>';
            return;
        }
        
        const logs = [];
        snapshot.forEach((childSnapshot) => {
            logs.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        // Ordenar por data
        logs.sort((a, b) => b.timestamp - a.timestamp);
        
        // Mostrar logs
        logs.forEach(log => {
            const logElement = createLogElement(log);
            elements.adminLogs.appendChild(logElement);
        });
        
    } catch (error) {
        console.error("❌ Erro ao carregar logs:", error);
    }
}

function createLogElement(log) {
    const div = document.createElement('div');
    div.className = 'log-item';
    
    const time = new Date(log.timestamp);
    const timeStr = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    div.innerHTML = `
        <div class="log-content">
            <div class="log-action">${log.action || 'Ação desconhecida'}</div>
            <div class="log-details">${log.details || ''}</div>
        </div>
        <div class="log-time">${timeStr}</div>
    `;
    
    return div;
}

async function addAdminLog(action, details) {
    if (!isAdminUser) return;
    
    try {
        await database.ref('admin_logs').push({
            action: action,
            details: details,
            timestamp: Date.now(),
            admin: currentUser.email
        });
        
        // Recarregar logs
        loadAdminLogs();
        
    } catch (error) {
        console.error("❌ Erro ao adicionar log:", error);
    }
}

// Funções de controle admin
window.adminBanUser = async function() {
    if (!isAdminUser) return;
    
    const userId = prompt("Digite o ID do usuário para banir:");
    if (!userId) return;
    
    const reason = prompt("Motivo do banimento:");
    
    try {
        await database.ref('users/' + userId).update({
            isBanned: true,
            banReason: reason,
            bannedAt: Date.now(),
            bannedBy: currentUser.email
        });
        
        addNotification(`Usuário ${userId} banido`, 'success');
        addAdminLog('Banir Usuário', `Banido: ${userId} | Motivo: ${reason}`);
        
    } catch (error) {
        console.error("❌ Erro ao banir usuário:", error);
        addNotification('Erro ao banir usuário', 'error');
    }
};

window.adminAddScript = async function() {
    if (!isAdminUser) return;
    
    const title = prompt("Título do script:");
    if (!title) return;
    
    const description = prompt("Descrição:");
    const game = prompt("Jogo:");
    const code = prompt("Código do script:");
    
    try {
        await database.ref('scripts').push({
            title: title,
            description: description,
            game: game,
            code: code,
            author: currentUser.email,
            date: Date.now(),
            downloads: 0,
            rating: 5.0
        });
        
        addNotification('Script adicionado com sucesso!', 'success');
        addAdminLog('Adicionar Script', `Script: ${title} | Jogo: ${game}`);
        
        // Recarregar scripts
        loadScripts();
        
    } catch (error) {
        console.error("❌ Erro ao adicionar script:", error);
        addNotification('Erro ao adicionar script', 'error');
    }
};

window.adminClearChat = async function() {
    if (!isAdminUser) return;
    
    if (confirm("Tem certeza que deseja limpar todo o chat?")) {
        try {
            await database.ref('chat').remove();
            addNotification('Chat limpo com sucesso!', 'success');
            addAdminLog('Limpar Chat', 'Todas as mensagens foram removidas');
            
        } catch (error) {
            console.error("❌ Erro ao limpar chat:", error);
            addNotification('Erro ao limpar chat', 'error');
        }
    }
};

window.adminBroadcast = async function() {
    if (!isAdminUser) return;
    
    const message = prompt("Mensagem de anúncio:");
    if (!message) return;
    
    try {
        await database.ref('chat').push({
            text: `📢 ANÚNCIO: ${message}`,
            timestamp: Date.now(),
            userId: 'system',
            userName: 'Sistema',
            isAdmin: true,
            isSystem: true
        });
        
        addNotification('Anúncio enviado!', 'success');
        addAdminLog('Enviar Anúncio', `Mensagem: ${message}`);
        
    } catch (error) {
        console.error("❌ Erro ao enviar anúncio:", error);
        addNotification('Erro ao enviar anúncio', 'error');
    }
};

window.adminEditScript = async function(scriptId) {
    if (!isAdminUser) return;
    
    // Implementar edição de script
    addNotification('Edição de script em desenvolvimento', 'info');
};

window.adminDeleteScript = async function(scriptId) {
    if (!isAdminUser) return;
    
    if (confirm("Tem certeza que deseja excluir este script?")) {
        try {
            await database.ref('scripts/' + scriptId).remove();
            addNotification('Script excluído!', 'success');
            addAdminLog('Excluir Script', `Script ID: ${scriptId}`);
            
            // Recarregar scripts
            loadScripts();
            
        } catch (error) {
            console.error("❌ Erro ao excluir script:", error);
            addNotification('Erro ao excluir script', 'error');
        }
    }
};

// ==============================================
// NOTIFICATION SYSTEM
// ==============================================
function addNotification(message, type = 'info') {
    const notification = {
        id: Date.now(),
        message: message,
        type: type,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        read: false
    };
    
    notifications.unshift(notification);
    updateNotificationCenter();
    showNotificationToast(message, type);
    
    // Salvar notificações
    saveNotifications();
}

function showNotificationToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' :
                type === 'error' ? 'exclamation-circle' :
                type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Remover após 5 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 5000);
}

function updateNotificationCenter() {
    if (!elements.notificationList) return;
    
    elements.notificationList.innerHTML = '';
    
    if (notifications.length === 0) {
        elements.notificationList.innerHTML = `
            <div class="empty-notifications">
                <i class="fas fa-bell-slash"></i>
                <p>Nenhuma notificação</p>
            </div>
        `;
        return;
    }
    
    notifications.slice(0, 10).forEach(notification => {
        const notificationElement = createNotificationElement(notification);
        elements.notificationList.appendChild(notificationElement);
    });
}

function createNotificationElement(notification) {
    const div = document.createElement('div');
    div.className = `notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}`;
    
    const icon = notification.type === 'success' ? 'check-circle' :
                notification.type === 'error' ? 'exclamation-circle' :
                notification.type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    div.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-message">${notification.message}</div>
            <div class="notification-time">${notification.time}</div>
        </div>
        <button class="notification-close" onclick="removeNotification(${notification.id})">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    div.addEventListener('click', () => {
        notification.read = true;
        updateNotificationCenter();
        saveNotifications();
    });
    
    return div;
}

window.removeNotification = function(id) {
    notifications = notifications.filter(n => n.id !== id);
    updateNotificationCenter();
    saveNotifications();
};

window.clearAllNotifications = function() {
    notifications = [];
    updateNotificationCenter();
    saveNotifications();
};

function saveNotifications() {
    if (currentUser) {
        localStorage.setItem(`notifications_${currentUser.uid}`, JSON.stringify(notifications));
    }
}

function loadNotifications() {
    if (currentUser) {
        const saved = localStorage.getItem(`notifications_${currentUser.uid}`);
        if (saved) {
            notifications = JSON.parse(saved);
            updateNotificationCenter();
        }
    }
}

// ==============================================
// ANTI-DEVTOOLS PROTECTION
// ==============================================
function setupAntiDevTools() {
    // Detectar F12, Ctrl+Shift+I, Ctrl+Shift+J
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.shiftKey && e.key === 'C') ||
            (e.ctrlKey && e.shiftKey && e.key === 'U')) {
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
    
    // Log admin
    if (isAdminUser) {
        addAdminLog('DevTools Detectado', 'Tentativa de abrir ferramentas de desenvolvimento');
    }
    
    // Tentar fechar/redirecionar após 5 segundos
    setTimeout(() => {
        try {
            // Bloquear site
            document.body.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: black;
                    color: red;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 2rem;
                    text-align: center;
                    z-index: 99999;
                ">
                    <div>
                        <i class="fas fa-skull-crossbones" style="font-size: 4rem;"></i>
                        <h1>ACESSO BLOQUEADO</h1>
                        <p>Violou as regras de segurança</p>
                    </div>
                </div>
            `;
            
            // Tentar fechar a janela
            window.open('', '_self').close();
        } catch (e) {
            // Se não conseguir fechar, redirecionar
            setTimeout(() => {
                window.location.href = 'about:blank';
            }, 1000);
        }
    }, 5000);
}

// ==============================================
// FUNÇÕES EXTRAS
// ==============================================
window.showSupportModal = function() {
    elements.supportModal.style.display = 'flex';
};

window.showForgotPassword = function() {
    addNotification('Entre em contato com o admin para redefinir a senha', 'info');
};

window.showRegister = function() {
    const email = prompt("Digite seu email para registro:");
    if (!email) return;
    
    const password = prompt("Digite uma senha:");
    if (!password) return;
    
    const username = prompt("Digite um nome de usuário:");
    
    // Verificar se é tentativa de criar outro admin
    if (email === ADMIN_EMAIL) {
        addNotification('Este email é reservado para o administrador', 'error');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            addNotification('Conta criada com sucesso!', 'success');
            
            // Fazer login automaticamente
            auth.signInWithEmailAndPassword(email, password);
            
        })
        .catch((error) => {
            let errorMessage = 'Erro ao criar conta';
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
            }
            addNotification(errorMessage, 'error');
        });
};

window.logoutUser = async function() {
    try {
        // Remover da lista de online users
        if (currentUser) {
            await database.ref('online_users/' + currentUser.uid).remove();
        }
        
        // Fazer logout
        await auth.signOut();
        addNotification('Logout realizado!', 'info');
        
    } catch (error) {
        console.error("❌ Erro ao fazer logout:", error);
        addNotification('Erro ao fazer logout', 'error');
    }
};

// ==============================================
// INICIALIZAÇÃO COMPLETA
// ==============================================
console.log("🎉 EclipseXploits Studio - Sistema Premium Carregado!");
console.log("👑 Admin Exclusivo: guizinbzsk@gmail.com");
console.log("🔒 Sistema Restrito: Apenas 1 Admin");

// Habilitar áudio após interação do usuário
document.addEventListener('click', function initAudio() {
    if (isMusicPlaying && elements.backgroundMusic.paused) {
        elements.backgroundMusic.play().catch(console.error);
    }
    document.removeEventListener('click', initAudio);
}, { once: true });
