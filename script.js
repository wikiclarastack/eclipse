// ==============================================
// SISTEMA PRINCIPAL - ECLIPSEXPLOITS STUDIO
// ==============================================

// Inicializar Firebase
firebase.initializeApp(SYSTEM_CONFIG.FIREBASE_CONFIG);
const auth = firebase.auth();
const database = firebase.database();

// Variáveis globais
let currentUser = null;
let isAdminUser = false;
let onlineUsers = new Map();
let messageCooldown = false;
let lastMessageTime = 0;
let currentReplyTo = null;
let userIP = null;
let adminMode = false;
let securityLogs = [];

// ==============================================
// INICIALIZAÇÃO DO SISTEMA
// ==============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 EclipseXploits Studio Iniciando...");
    
    // Obter IP do usuário
    userIP = await getClientIP();
    console.log("🌐 IP do Usuário:", userIP);
    
    // Inicializar sistemas
    initParticles();
    setupEventListeners();
    initThemeAndMusic();
    setupAnimations();
    
    // Verificar autenticação
    checkAuthState();
    
    // Carregar dados iniciais
    loadScripts();
    loadRanking();
    setupChat();
    setupOnlineUsers();
    
    // Iniciar relógio do servidor
    updateServerTime();
    setInterval(updateServerTime, 1000);
    
    // Verificar segurança inicial
    setTimeout(() => {
        checkInitialSecurity();
    }, 3000);
    
    // Esconder loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
        }, 500);
    }, 1500);
    
    console.log("✅ Sistema inicializado com sucesso!");
});

// ==============================================
// PARTÍCULAS E ANIMAÇÕES
// ==============================================

function initParticles() {
    if (typeof particlesJS === 'undefined') return;
    
    particlesJS("particles-js", {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#6d28d9" },
            shape: { type: "circle" },
            opacity: { value: 0.3, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
            size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.1, sync: false } },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#6d28d9",
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: { enable: false, rotateX: 600, rotateY: 1200 }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "grab" },
                onclick: { enable: true, mode: "push" },
                resize: true
            },
            modes: {
                grab: { distance: 140, line_linked: { opacity: 0.5 } },
                push: { particles_nb: 4 }
            }
        },
        retina_detect: true
    });
}

function setupAnimations() {
    // Adicionar classe de animação aos elementos
    const elements = document.querySelectorAll('.feature-card, .stat-card, .script-card');
    elements.forEach((el, index) => {
        el.classList.add('reveal');
        setTimeout(() => {
            el.classList.add('active');
        }, index * 100);
    });
    
    // Configurar observador de interseção
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    
    // Observar todos os elementos com classe reveal
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ==============================================
// EVENT LISTENERS
// ==============================================

function setupEventListeners() {
    // Navegação
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('href').substring(1);
            showSection(section);
        });
    });
    
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('href').substring(1);
            showSection(section);
            document.getElementById('mobileMenu').style.display = 'none';
        });
    });
    
    // Menu mobile
    document.getElementById('mobileMenuBtn').addEventListener('click', function() {
        const menu = document.getElementById('mobileMenu');
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });
    
    // Login/Registro
    document.getElementById('loginBtn').addEventListener('click', showLoginModal);
    document.getElementById('loginForm').addEventListener('submit', handleLoginSubmit);
    document.getElementById('registerForm').addEventListener('submit', handleRegisterSubmit);
    
    // Toggle password visibility
    document.getElementById('toggleLoginPassword').addEventListener('click', function() {
        togglePasswordVisibility('loginPassword', this);
    });
    
    document.getElementById('toggleRegPassword').addEventListener('click', function() {
        togglePasswordVisibility('regPassword', this);
    });
    
    // Chat
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    document.getElementById('closeChat').addEventListener('click', function() {
        showSection('home');
    });
    
    // Busca de scripts
    document.getElementById('scriptSearch').addEventListener('input', filterScripts);
    document.getElementById('gameFilter').addEventListener('change', filterScripts);
    document.getElementById('sortFilter').addEventListener('change', filterScripts);
    document.getElementById('clearSearch').addEventListener('click', function() {
        document.getElementById('scriptSearch').value = '';
        filterScripts();
    });
    document.getElementById('refreshScripts').addEventListener('click', loadScripts);
    
    // Theme & Music
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('musicToggle').addEventListener('click', toggleMusic);
    
    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
        el.addEventListener('click', function() {
            const modalId = this.closest('.modal')?.id || 
                           this.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
            if (modalId) closeModal(modalId);
        });
    });
    
    // Settings tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showSettingsTab(tabName);
        });
    });
    
    // Admin tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showAdminTab(tabName);
        });
    });
    
    // Admin float button
    document.getElementById('adminFloatBtn').addEventListener('click', openAdminPanel);
    
    // Delete reason select
    document.getElementById('deleteReason').addEventListener('change', function() {
        document.getElementById('customReasonGroup').style.display = 
            this.value === 'Outros' ? 'block' : 'none';
    });
    
    // Anti DevTools
    setupDevToolsDetection();
    
    // User avatar hover
    const avatarContainer = document.getElementById('userAvatarContainer');
    if (avatarContainer) {
        avatarContainer.addEventListener('mouseenter', function() {
            document.getElementById('profileDropdown').style.display = 'block';
        });
        
        avatarContainer.addEventListener('mouseleave', function(e) {
            // Verificar se o mouse ainda está sobre o dropdown
            const dropdown = document.getElementById('profileDropdown');
            setTimeout(() => {
                if (!dropdown.matches(':hover') && !this.matches(':hover')) {
                    dropdown.style.display = 'none';
                }
            }, 100);
        });
    }
}

// ==============================================
// NAVEGAÇÃO E SEÇÕES
// ==============================================

function showSection(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Remover classe active de todos os links
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Mostrar seção alvo
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        setTimeout(() => {
            targetSection.classList.add('active');
        }, 50);
        
        // Adicionar classe active ao link correspondente
        document.querySelectorAll(`[href="#${sectionId}"]`).forEach(link => {
            link.classList.add('active');
        });
        
        // Se for o chat, fazer scroll para baixo
        if (sectionId === 'chat') {
            setTimeout(scrollChatToBottom, 100);
            document.getElementById('chatInput')?.focus();
        }
    }
}

// ==============================================
// TEMA E MÚSICA
// ==============================================

function initThemeAndMusic() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedMusic = localStorage.getItem('music') || 'off';
    
    // Aplicar tema
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    updateThemeIcon();
    
    // Configurar música
    if (savedMusic === 'on') {
        // Criar elemento de áudio se não existir
        if (!document.getElementById('backgroundMusic')) {
            const audio = document.createElement('audio');
            audio.id = 'backgroundMusic';
            audio.loop = true;
            // Adicionar source de música (pode ser um arquivo local)
            const source = document.createElement('source');
            source.src = 'music/background.mp3';
            source.type = 'audio/mpeg';
            audio.appendChild(source);
            document.body.appendChild(audio);
        }
        
        const music = document.getElementById('backgroundMusic');
        if (music) {
            music.volume = 0.1;
            music.play().catch(() => {
                console.log("Áudio precisa de interação do usuário");
            });
        }
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeIcon();
    
    // Salvar nas configurações do usuário
    if (currentUser) {
        database.ref('users/' + currentUser.uid + '/settings/theme').set(
            isLight ? 'light' : 'dark'
        );
    }
}

function updateThemeIcon() {
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        const isLight = document.body.classList.contains('light-theme');
        icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function toggleMusic() {
    const icon = document.querySelector('#musicToggle i');
    const music = document.getElementById('backgroundMusic');
    
    if (!music) {
        // Criar elemento de áudio
        const audio = document.createElement('audio');
        audio.id = 'backgroundMusic';
        audio.loop = true;
        const source = document.createElement('source');
        source.src = 'music/background.mp3';
        source.type = 'audio/mpeg';
        audio.appendChild(source);
        document.body.appendChild(audio);
    }
    
    const currentMusic = document.getElementById('backgroundMusic');
    
    if (currentMusic.paused) {
        currentMusic.volume = 0.1;
        currentMusic.play().catch(() => {
            showNotification("Clique para habilitar áudio", "info");
        });
        localStorage.setItem('music', 'on');
        if (icon) icon.className = 'fas fa-volume-up';
    } else {
        currentMusic.pause();
        localStorage.setItem('music', 'off');
        if (icon) icon.className = 'fas fa-volume-mute';
    }
    
    // Salvar nas configurações do usuário
    if (currentUser) {
        database.ref('users/' + currentUser.uid + '/settings/music').set(
            currentMusic.paused ? 'off' : 'on'
        );
    }
}

// ==============================================
// AUTENTICAÇÃO E ADMIN
// ==============================================

function checkAuthState() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log("✅ Usuário autenticado:", user.email);
            currentUser = user;
            
            // VERIFICAÇÃO DE ADMIN EXCLUSIVO
            await verifyAdminStatus(user);
            
            // Atualizar UI
            updateUIForLoggedInUser(user);
            
            // Setup user presence
            setupUserPresence(user.uid);
            
            // Carregar dados do usuário
            loadUserData(user.uid);
            
        } else {
            console.log("🚪 Usuário não autenticado");
            currentUser = null;
            isAdminUser = false;
            updateUIForGuest();
        }
    });
}

async function verifyAdminStatus(user) {
    // Apenas guizinbzsk@gmail.com pode ser admin
    const isRealAdmin = user.email === SYSTEM_CONFIG.ADMIN_EMAIL;
    
    try {
        const snapshot = await database.ref('admins/' + user.uid).once('value');
        const isMarkedAdmin = snapshot.exists() && snapshot.val() === true;
        
        // SE NÃO É O ADMIN OFICIAL MAS ESTÁ MARCADO COMO ADMIN -> BANIR
        if (!isRealAdmin && isMarkedAdmin) {
            console.warn("⚠️ USUÁRIO FALSO ADMIN DETECTADO:", user.email);
            
            // Registrar evento de segurança
            await logSecurityEvent(
                "ADMIN_FRAUD", 
                `Usuário ${user.email} tentou se passar por admin`,
                user.uid,
                userIP
            );
            
            // Banir imediatamente por IP
            await banUserByIP(userIP, "Tentativa de acesso administrativo não autorizado");
            
            // Banir conta
            await database.ref('users/' + user.uid).update({
                isBanned: true,
                banReason: "Tentativa de acesso administrativo não autorizado",
                bannedAt: Date.now(),
                bannedBy: "Sistema de Segurança",
                bannedIP: userIP
            });
            
            // Remover status de admin
            await database.ref('admins/' + user.uid).remove();
            
            // Forçar logout
            await auth.signOut();
            showNotification("Conta banida por violação de segurança", "error");
            return;
        }
        
        // Se for o admin oficial, garantir que está marcado como admin
        if (isRealAdmin && !isMarkedAdmin) {
            await database.ref('admins/' + user.uid).set(true);
            await database.ref('users/' + user.uid + '/isAdmin').set(true);
        }
        
        isAdminUser = isRealAdmin;
        
        if (isAdminUser) {
            console.log("👑 ADMIN OFICIAL DETECTADO");
            setupAdminUser();
        }
        
    } catch (error) {
        console.error("❌ Erro ao verificar admin:", error);
        isAdminUser = false;
    }
}

async function loadUserData(userId) {
    try {
        const snapshot = await database.ref('users/' + userId).once('value');
        if (snapshot.exists()) {
            const userData = snapshot.val();
            
            // Atualizar login count
            const totalLogins = (userData.totalLogins || 0) + 1;
            await database.ref('users/' + userId).update({
                lastLogin: Date.now(),
                totalLogins: totalLogins,
                lastIP: userIP
            });
        }
    } catch (error) {
        console.error("❌ Erro ao carregar dados do usuário:", error);
    }
}

// ==============================================
// LOGS DE SEGURANÇA
// ==============================================

async function logSecurityEvent(type, description, userId = null, ip = null) {
    try {
        const timestamp = Date.now();
        const logData = {
            type: type,
            description: description,
            userId: userId,
            ip: ip || userIP,
            timestamp: timestamp,
            date: new Date(timestamp).toISOString()
        };
        
        // Log local
        securityLogs.push(logData);
        console.warn(`🔒 SEGURANÇA: ${type} - ${description}`);
        
        // Log no Firebase
        await database.ref('security_logs').push(logData);
        
        // Enviar para webhook do Discord se for evento crítico
        if (type.includes('FRAUD') || type.includes('BAN') || type.includes('ADMIN')) {
            await sendSecurityWebhook(type, description, userId, ip);
        }
        
        // Atualizar painel admin se estiver aberto
        if (adminMode) {
            updateSecurityLogs();
        }
        
    } catch (error) {
        console.error("❌ Erro ao registrar evento de segurança:", error);
    }
}

async function sendSecurityWebhook(type, description, userId, ip) {
    try {
        const webhookData = {
            embeds: [{
                title: "🔒 ALERTA DE SEGURANÇA - ECLIPSEXPLOITS",
                description: description,
                color: 0xFF0000,
                fields: [
                    {
                        name: "Tipo",
                        value: type,
                        inline: true
                    },
                    {
                        name: "ID do Usuário",
                        value: userId || "Desconhecido",
                        inline: true
                    },
                    {
                        name: "IP",
                        value: ip || "Desconhecido",
                        inline: true
                    },
                    {
                        name: "Timestamp",
                        value: new Date().toISOString(),
                        inline: true
                    }
                ],
                footer: {
                    text: "EclipseXploits Security System"
                },
                timestamp: new Date().toISOString()
            }]
        };
        
        await fetch(SYSTEM_CONFIG.SECURITY_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookData)
        });
    } catch (error) {
        console.error("❌ Erro ao enviar webhook:", error);
    }
}

async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'unknown';
    }
}

function checkInitialSecurity() {
    // Verificar se há usuários marcados como admin não autorizados
    database.ref('admins').once('value').then(snapshot => {
        snapshot.forEach(child => {
            const userId = child.key;
            if (child.val() === true) {
                // Verificar se é o admin oficial
                database.ref('users/' + userId).once('value').then(userSnap => {
                    const userData = userSnap.val();
                    if (userData && userData.email !== SYSTEM_CONFIG.ADMIN_EMAIL) {
                        console.warn("⚠️ Admin não autorizado detectado:", userData.email);
                        // Banir automaticamente
                        database.ref('users/' + userId).update({
                            isBanned: true,
                            banReason: "Admin falso detectado pelo sistema",
                            bannedAt: Date.now(),
                            bannedBy: "Sistema Automático"
                        });
                        
                        // Remover status de admin
                        database.ref('admins/' + userId).remove();
                        
                        logSecurityEvent(
                            "AUTO_BAN_FAKE_ADMIN",
                            `Usuário ${userData.email} banido por ser admin falso`,
                            userId
                        );
                    }
                });
            }
        });
    });
}

// ==============================================
// SISTEMA DE BANIMENTO POR IP
// ==============================================

async function banUserByIP(ip, reason, duration = 0) {
    try {
        const banData = {
            ip: ip,
            reason: reason,
            bannedAt: Date.now(),
            bannedBy: currentUser ? currentUser.email : "Sistema",
            duration: duration, // 0 = permanente
            isActive: true
        };
        
        if (duration > 0) {
            banData.expiresAt = Date.now() + duration;
        }
        
        // Salvar no banco de dados
        await database.ref('ip_bans').push(banData);
        
        // Log de segurança
        await logSecurityEvent(
            "IP_BAN",
            `IP ${ip} banido por: ${reason} (${duration > 0 ? 'Temporário' : 'Permanente'})`,
            currentUser?.uid,
            ip
        );
        
        return true;
    } catch (error) {
        console.error("❌ Erro ao banir por IP:", error);
        return false;
    }
}

async function checkIPBan(ip) {
    try {
        const snapshot = await database.ref('ip_bans').orderByChild('ip').equalTo(ip).once('value');
        if (!snapshot.exists()) return false;
        
        let isBanned = false;
        snapshot.forEach(child => {
            const ban = child.val();
            if (ban.isActive) {
                if (ban.duration === 0) {
                    // Banimento permanente
                    isBanned = true;
                } else if (ban.expiresAt > Date.now()) {
                    // Banimento temporário ainda ativo
                    isBanned = true;
                } else {
                    // Banimento expirado
                    database.ref('ip_bans/' + child.key).update({ isActive: false });
                }
            }
        });
        
        return isBanned;
    } catch (error) {
        console.error("❌ Erro ao verificar ban de IP:", error);
        return false;
    }
}

// ==============================================
// ADMIN FUNCTIONS
// ==============================================

function setupAdminUser() {
    // Mostrar botão do dashboard
    const adminBtn = document.getElementById('adminFloatBtn');
    if (adminBtn) {
        adminBtn.style.display = 'flex';
        adminBtn.addEventListener('click', openAdminPanel);
    }
    
    // Configurar email admin
    const adminEmail = document.getElementById('adminEmailDisplay');
    if (adminEmail && currentUser) {
        adminEmail.textContent = currentUser.email;
    }
    
    showNotification("Painel Admin habilitado", "success");
}

function openAdminPanel() {
    if (!isAdminUser) return;
    
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.add('active');
    adminMode = true;
    
    // Carregar dados do admin
    loadAdminStats();
    loadUsersList();
    loadSecurityLogs();
    loadBansList();
}

function closeAdminPanel() {
    document.getElementById('adminPanel').classList.remove('active');
    adminMode = false;
}

async function loadAdminStats() {
    if (!isAdminUser) return;
    
    try {
        // Total de usuários
        const usersSnapshot = await database.ref('users').once('value');
        document.getElementById('adminTotalUsers').textContent = usersSnapshot.numChildren();
        
        // Total de mensagens
        const messagesSnapshot = await database.ref('chat').once('value');
        document.getElementById('adminTotalMessages').textContent = messagesSnapshot.numChildren();
        
        // Total de scripts
        const scriptsSnapshot = await database.ref('scripts').once('value');
        document.getElementById('adminTotalScripts').textContent = scriptsSnapshot.numChildren();
        
        // Total de banidos
        const bansSnapshot = await database.ref('ip_bans').once('value');
        let bannedCount = 0;
        bansSnapshot.forEach(child => {
            if (child.val().isActive) bannedCount++;
        });
        document.getElementById('adminBannedUsers').textContent = bannedCount;
        
        // Atualizar estatísticas de segurança
        updateSecurityStats();
        
    } catch (error) {
        console.error("❌ Erro ao carregar stats admin:", error);
    }
}

async function loadUsersList() {
    if (!isAdminUser) return;
    
    try {
        const usersList = document.getElementById('adminUsersList');
        if (!usersList) return;
        
        const snapshot = await database.ref('users').orderByChild('createdAt').once('value');
        usersList.innerHTML = '';
        
        if (!snapshot.exists()) {
            usersList.innerHTML = '<div class="empty-state">Nenhum usuário registrado</div>';
            return;
        }
        
        const users = [];
        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            user.id = childSnapshot.key;
            users.push(user);
        });
        
        // Ordenar por data de criação (mais recentes primeiro)
        users.sort((a, b) => b.createdAt - a.createdAt);
        
        // Mostrar usuários
        users.forEach((user) => {
            const userElement = createUserAdminElement(user);
            usersList.appendChild(userElement);
        });
        
    } catch (error) {
        console.error("❌ Erro ao carregar lista de usuários:", error);
    }
}

function createUserAdminElement(user) {
    const div = document.createElement('div');
    div.className = 'user-admin-item';
    div.dataset.userId = user.id;
    
    // Determinar status
    let statusBadge, statusClass;
    if (user.isBanned) {
        statusBadge = '<span class="badge badge-danger">BANIDO</span>';
        statusClass = 'banned';
    } else if (user.isMuted) {
        statusBadge = '<span class="badge badge-warning">MUTADO</span>';
        statusClass = 'muted';
    } else {
        statusBadge = '<span class="badge badge-success">ATIVO</span>';
        statusClass = 'active';
    }
    
    // Badge de admin
    const adminBadge = user.email === SYSTEM_CONFIG.ADMIN_EMAIL ? 
        '<span class="badge badge-admin">👑 ADMIN</span>' : '';
    
    // Data de criação formatada
    const createdDate = new Date(user.createdAt || Date.now());
    const createdStr = createdDate.toLocaleDateString('pt-BR');
    
    div.innerHTML = `
        <div class="user-info">
            <div class="user-avatar-small">${user.username?.charAt(0) || user.email?.charAt(0) || 'U'}</div>
            <div class="user-details">
                <div class="user-name">${user.username || user.email.split('@')[0]}</div>
                <div class="user-email">${user.email}</div>
                <div class="user-meta">
                    <span class="user-date"><i class="fas fa-calendar"></i> ${createdStr}</span>
                    <span class="user-ip"><i class="fas fa-network-wired"></i> ${user.lastIP || 'N/A'}</span>
                </div>
                <div class="user-stats">
                    ${statusBadge} ${adminBadge}
                    <span class="badge badge-info">Mensagens: ${user.messagesSent || 0}</span>
                </div>
            </div>
        </div>
        <div class="user-actions">
            ${!user.isBanned ? `
                <button onclick="adminBanUser('${user.id}')" class="btn btn-danger btn-sm" title="Banir">
                    <i class="fas fa-ban"></i>
                </button>
                <button onclick="adminMuteUser('${user.id}')" class="btn btn-warning btn-sm" title="Mutuar">
                    <i class="fas fa-volume-mute"></i>
                </button>
            ` : `
                <button onclick="adminUnbanUser('${user.id}')" class="btn btn-success btn-sm" title="Desbanir">
                    <i class="fas fa-check-circle"></i>
                </button>
            `}
            <button onclick="adminViewUser('${user.id}')" class="btn btn-info btn-sm" title="Ver Detalhes">
                <i class="fas fa-eye"></i>
            </button>
            <button onclick="adminDeleteUser('${user.id}')" class="btn btn-dark btn-sm" title="Excluir">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    if (statusClass) {
        div.classList.add(statusClass);
    }
    
    return div;
}

// ==============================================
// FUNÇÕES ADMIN - BANIMENTO
// ==============================================

window.adminBanUser = async function(userId) {
    if (!isAdminUser) return;
    
    const reason = prompt("Motivo do banimento:");
    if (!reason) return;
    
    const duration = prompt("Duração em dias (0 para permanente):");
    if (duration === null) return;
    
    const days = parseInt(duration) || 0;
    const banDuration = days * 24 * 60 * 60 * 1000; // Converter para milissegundos
    
    try {
        // Obter dados do usuário
        const userSnapshot = await database.ref('users/' + userId).once('value');
        const user = userSnapshot.val();
        
        if (!user) {
            showNotification("Usuário não encontrado", "error");
            return;
        }
        
        // Banir conta
        await database.ref('users/' + userId).update({
            isBanned: true,
            banReason: reason,
            bannedAt: Date.now(),
            bannedBy: currentUser.email,
            banDuration: banDuration,
            bannedIP: user.lastIP || 'unknown'
        });
        
        // Se tiver duração, marcar expiração
        if (banDuration > 0) {
            setTimeout(async () => {
                await database.ref('users/' + userId).update({
                    isBanned: false,
                    banReason: null,
                    bannedAt: null,
                    bannedBy: null
                });
                showNotification(`Banimento do usuário ${user.email} expirou`, "info");
            }, banDuration);
        }
        
        // Banir por IP também
        if (user.lastIP && user.lastIP !== 'unknown') {
            await banUserByIP(user.lastIP, reason + " (via banimento de conta)", banDuration);
        }
        
        // Log de segurança
        await logSecurityEvent(
            "USER_BAN",
            `Usuário ${user.email} banido por: ${reason} (${days > 0 ? days + ' dias' : 'Permanente'})`,
            userId,
            user.lastIP
        );
        
        showNotification('Usuário banido com sucesso!', "success");
        
        // Recarregar lista
        loadUsersList();
        loadAdminStats();
        
    } catch (error) {
        console.error("❌ Erro ao banir usuário:", error);
        showNotification('Erro ao banir usuário', "error");
    }
};

window.adminUnbanUser = async function(userId) {
    if (!isAdminUser) return;
    
    if (!confirm('Desbanir este usuário?')) return;
    
    try {
        await database.ref('users/' + userId).update({
            isBanned: false,
            banReason: null,
            bannedAt: null,
            bannedBy: null,
            banDuration: null
        });
        
        showNotification('Usuário desbanido com sucesso!', "success");
        loadUsersList();
        
    } catch (error) {
        console.error("❌ Erro ao desbanir usuário:", error);
        showNotification('Erro ao desbanir usuário', "error");
    }
};

window.adminMuteUser = async function(userId) {
    if (!isAdminUser) return;
    
    const duration = prompt("Duração do mute em minutos (0 = permanente):");
    if (duration === null) return;
    
    const minutes = parseInt(duration) || 0;
    const muteDuration = minutes * 60 * 1000;
    
    try {
        const muteData = {
            isMuted: true,
            mutedAt: Date.now(),
            mutedBy: currentUser.email,
            muteReason: prompt("Motivo do mute:") || "Sem motivo especificado"
        };
        
        if (minutes > 0) {
            muteData.muteUntil = Date.now() + muteDuration;
        }
        
        await database.ref('users/' + userId).update(muteData);
        
        showNotification('Usuário mutado com sucesso!', "success");
        loadUsersList();
        
        // Se tiver duração, marcar para auto-remover
        if (minutes > 0) {
            setTimeout(async () => {
                await database.ref('users/' + userId).update({
                    isMuted: false,
                    mutedAt: null,
                    mutedBy: null,
                    muteReason: null,
                    muteUntil: null
                });
                showNotification(`Mute do usuário expirou`, "info");
            }, muteDuration);
        }
        
    } catch (error) {
        console.error("❌ Erro ao mutar usuário:", error);
        showNotification('Erro ao mutar usuário', "error");
    }
};

window.adminViewUser = async function(userId) {
    if (!isAdminUser) return;
    
    try {
        const snapshot = await database.ref('users/' + userId).once('value');
        const user = snapshot.val();
        
        if (!user) {
            showNotification("Usuário não encontrado", "error");
            return;
        }
        
        const info = `
👤 DETALHES DO USUÁRIO
━━━━━━━━━━━━━━━━━━━━
📧 Email: ${user.email}
👤 Username: ${user.username || 'N/A'}
🆔 ID: ${userId}
🌐 IP: ${user.lastIP || 'N/A'}
📅 Criado em: ${new Date(user.createdAt).toLocaleDateString()}
🕒 Último login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
📊 Logins totais: ${user.totalLogins || 0}
💬 Mensagens: ${user.messagesSent || 0}
⬇️ Downloads: ${user.scriptsDownloaded || 0}
⭐ Pontos: ${user.xp || 0}
━━━━━━━━━━━━━━━━━━━━
🔒 STATUS: ${user.isBanned ? '🚫 BANIDO' : user.isMuted ? '🔇 MUTADO' : '✅ ATIVO'}
${user.isBanned ? `📝 Motivo do ban: ${user.banReason || 'N/A'}\n🕒 Banido em: ${new Date(user.bannedAt).toLocaleString()}` : ''}
${user.isMuted ? `📝 Motivo do mute: ${user.muteReason || 'N/A'}` : ''}
━━━━━━━━━━━━━━━━━━━━
📝 Bio: ${user.bio || 'Nenhuma bio definida.'}
        `;
        
        alert(info);
        
    } catch (error) {
        console.error("❌ Erro ao visualizar usuário:", error);
        showNotification('Erro ao visualizar usuário', "error");
    }
};

window.adminDeleteUser = async function(userId) {
    if (!isAdminUser) return;
    
    if (!confirm('ATENÇÃO: Esta ação é irreversível!\n\nExcluir permanentemente este usuário?')) return;
    
    try {
        // Verificar se não é o admin principal
        const snapshot = await database.ref('users/' + userId).once('value');
        const user = snapshot.val();
        
        if (user.email === SYSTEM_CONFIG.ADMIN_EMAIL) {
            showNotification("Não é possível excluir o administrador principal", "error");
            return;
        }
        
        // Excluir usuário
        await database.ref('users/' + userId).remove();
        
        // Remover das mensagens online
        await database.ref('online_users/' + userId).remove();
        
        // Remover status de admin se existir
        await database.ref('admins/' + userId).remove();
        
        // Log de segurança
        await logSecurityEvent(
            "USER_DELETE",
            `Usuário ${user.email} excluído permanentemente`,
            userId,
            user.lastIP
        );
        
        showNotification('Usuário excluído permanentemente!', "success");
        loadUsersList();
        
    } catch (error) {
        console.error("❌ Erro ao excluir usuário:", error);
        showNotification('Erro ao excluir usuário', "error");
    }
};

// ==============================================
// PAINEL DE BANIMENTOS
// ==============================================

async function loadBansList() {
    if (!isAdminUser) return;
    
    try {
        const bansList = document.getElementById('adminBansList');
        if (!bansList) return;
        
        const snapshot = await database.ref('ip_bans').orderByChild('bannedAt').once('value');
        bansList.innerHTML = '';
        
        if (!snapshot.exists()) {
            bansList.innerHTML = '<div class="empty-state">Nenhum banimento registrado</div>';
            return;
        }
        
        const bans = [];
        snapshot.forEach((childSnapshot) => {
            const ban = childSnapshot.val();
            ban.id = childSnapshot.key;
            bans.push(ban);
        });
        
        // Ordenar por data (mais recentes primeiro)
        bans.sort((a, b) => b.bannedAt - a.bannedAt);
        
        // Mostrar banimentos
        bans.forEach((ban) => {
            const banElement = createBanElement(ban);
            bansList.appendChild(banElement);
        });
        
    } catch (error) {
        console.error("❌ Erro ao carregar lista de banimentos:", error);
    }
}

function createBanElement(ban) {
    const div = document.createElement('div');
    div.className = 'ban-item';
    div.dataset.banId = ban.id;
    
    const bannedDate = new Date(ban.bannedAt);
    const bannedStr = bannedDate.toLocaleDateString('pt-BR') + ' ' + bannedDate.toLocaleTimeString('pt-BR');
    
    let durationText = 'Permanente';
    if (ban.duration > 0) {
        const days = Math.floor(ban.duration / (24 * 60 * 60 * 1000));
        const hours = Math.floor((ban.duration % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        durationText = `${days}d ${hours}h`;
        
        if (ban.expiresAt) {
            const expiresDate = new Date(ban.expiresAt);
            durationText += ` (Expira: ${expiresDate.toLocaleDateString('pt-BR')})`;
        }
    }
    
    const statusBadge = ban.isActive ? 
        '<span class="badge badge-danger">ATIVO</span>' : 
        '<span class="badge badge-secondary">EXPIRADO</span>';
    
    div.innerHTML = `
        <div class="ban-info">
            <div class="ban-ip">
                <i class="fas fa-network-wired"></i>
                <strong>${ban.ip}</strong>
            </div>
            <div class="ban-reason">${ban.reason}</div>
            <div class="ban-meta">
                <span class="ban-date"><i class="fas fa-calendar"></i> ${bannedStr}</span>
                <span class="ban-by"><i class="fas fa-user"></i> ${ban.bannedBy}</span>
                <span class="ban-duration"><i class="fas fa-clock"></i> ${durationText}</span>
            </div>
        </div>
        <div class="ban-actions">
            ${ban.isActive ? `
                <button onclick="unbanIP('${ban.id}', '${ban.ip}')" class="btn btn-success btn-sm">
                    <i class="fas fa-check-circle"></i> Remover
                </button>
            ` : ''}
            <button onclick="deleteBan('${ban.id}', '${ban.ip}')" class="btn btn-dark btn-sm">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    if (!ban.isActive) {
        div.classList.add('expired');
    }
    
    return div;
}

window.unbanIP = async function(banId, ip) {
    if (!isAdminUser) return;
    
    if (!confirm(`Remover banimento do IP ${ip}?`)) return;
    
    try {
        await database.ref('ip_bans/' + banId).update({ isActive: false });
        
        showNotification(`Banimento do IP ${ip} removido!`, "success");
        
        // Log de segurança
        await logSecurityEvent(
            "IP_UNBAN",
            `IP ${ip} desbanido manualmente`,
            currentUser.uid,
            ip
        );
        
        loadBansList();
        
    } catch (error) {
        console.error("❌ Erro ao remover banimento:", error);
        showNotification('Erro ao remover banimento', "error");
    }
};

window.deleteBan = async function(banId, ip) {
    if (!isAdminUser) return;
    
    if (!confirm(`Excluir permanentemente o registro de banimento do IP ${ip}?`)) return;
    
    try {
        await database.ref('ip_bans/' + banId).remove();
        
        showNotification(`Registro de banimento excluído!`, "success");
        loadBansList();
        
    } catch (error) {
        console.error("❌ Erro ao excluir banimento:", error);
        showNotification('Erro ao excluir banimento', "error");
    }
};

window.banByIPAdmin = async function() {
    if (!isAdminUser) return;
    
    const ipInput = document.getElementById('banIPInput').value.trim();
    const reasonInput = document.getElementById('banReasonInput').value.trim();
    const durationSelect = document.getElementById('banDuration');
    const duration = parseInt(durationSelect.value);
    
    if (!ipInput || !reasonInput) {
        showNotification("Preencha o IP e o motivo", "error");
        return;
    }
    
    // Validar formato do IP (simplificado)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ipInput)) {
        showNotification("Formato de IP inválido", "error");
        return;
    }
    
    try {
        await banUserByIP(ipInput, reasonInput, duration);
        
        // Limpar formulário
        document.getElementById('banIPInput').value = '';
        document.getElementById('banReasonInput').value = '';
        document.getElementById('banDuration').value = '3600000';
        
        showNotification(`IP ${ipInput} banido com sucesso!`, "success");
        
        // Recarregar lista
        loadBansList();
        loadAdminStats();
        
    } catch (error) {
        console.error("❌ Erro ao banir por IP:", error);
        showNotification('Erro ao banir por IP', "error");
    }
};

// ==============================================
// PAINEL DE SEGURANÇA
// ==============================================

async function loadSecurityLogs() {
    if (!isAdminUser) return;
    
    try {
        const logsContainer = document.getElementById('securityLogs');
        if (!logsContainer) return;
        
        const snapshot = await database.ref('security_logs').orderByChild('timestamp').limitToLast(50).once('value');
        logsContainer.innerHTML = '';
        
        if (!snapshot.exists()) {
            logsContainer.innerHTML = '<div class="empty-state">Nenhum log de segurança</div>';
            return;
        }
        
        const logs = [];
        snapshot.forEach((childSnapshot) => {
            const log = childSnapshot.val();
            log.id = childSnapshot.key;
            logs.push(log);
        });
        
        // Ordenar por timestamp (mais recentes primeiro)
        logs.sort((a, b) => b.timestamp - a.timestamp);
        
        // Mostrar logs
        logs.forEach((log) => {
            const logElement = createLogElement(log);
            logsContainer.appendChild(logElement);
        });
        
        updateSecurityStats();
        
    } catch (error) {
        console.error("❌ Erro ao carregar logs de segurança:", error);
    }
}

function createLogElement(log) {
    const div = document.createElement('div');
    div.className = 'log-item';
    
    const date = new Date(log.timestamp);
    const dateStr = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
    
    // Determinar ícone baseado no tipo
    let icon = 'info-circle';
    let colorClass = 'info';
    
    if (log.type.includes('BAN') || log.type.includes('FRAUD')) {
        icon = 'ban';
        colorClass = 'danger';
    } else if (log.type.includes('WARNING') || log.type.includes('SUSPICIOUS')) {
        icon = 'exclamation-triangle';
        colorClass = 'warning';
    } else if (log.type.includes('ERROR')) {
        icon = 'times-circle';
        colorClass = 'error';
    } else if (log.type.includes('ADMIN')) {
        icon = 'crown';
        colorClass = 'admin';
    }
    
    div.innerHTML = `
        <div class="log-icon ${colorClass}">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="log-content">
            <div class="log-header">
                <span class="log-type ${colorClass}">${log.type}</span>
                <span class="log-date">${dateStr}</span>
            </div>
            <div class="log-description">${log.description}</div>
            <div class="log-meta">
                ${log.userId ? `<span class="log-user"><i class="fas fa-user"></i> ${log.userId.substring(0, 8)}...</span>` : ''}
                ${log.ip && log.ip !== 'unknown' ? `<span class="log-ip"><i class="fas fa-network-wired"></i> ${log.ip}</span>` : ''}
            </div>
        </div>
    `;
    
    return div;
}

function updateSecurityStats() {
    if (!isAdminUser) return;
    
    // Contar diferentes tipos de logs
    let threats = 0;
    let warnings = 0;
    let suspicious = 0;
    
    securityLogs.forEach(log => {
        if (log.type.includes('BAN') || log.type.includes('FRAUD')) {
            threats++;
        } else if (log.type.includes('WARNING')) {
            warnings++;
        } else if (log.type.includes('SUSPICIOUS')) {
            suspicious++;
        }
    });
    
    document.getElementById('securityThreats').textContent = threats;
    document.getElementById('securityWarnings').textContent = warnings;
    document.getElementById('securitySuspicious').textContent = suspicious;
}

window.banAllFakeAdmins = async function() {
    if (!isAdminUser) return;
    
    if (!confirm('Verificar e banir todos os falsos administradores?')) return;
    
    try {
        let bannedCount = 0;
        
        const snapshot = await database.ref('admins').once('value');
        snapshot.forEach(child => {
            const userId = child.key;
            if (child.val() === true) {
                // Verificar se é o admin oficial
                database.ref('users/' + userId).once('value').then(userSnap => {
                    const userData = userSnap.val();
                    if (userData && userData.email !== SYSTEM_CONFIG.ADMIN_EMAIL) {
                        // Banir
                        database.ref('users/' + userId).update({
                            isBanned: true,
                            banReason: "Admin falso detectado pelo sistema",
                            bannedAt: Date.now(),
                            bannedBy: currentUser.email
                        });
                        
                        // Remover status de admin
                        database.ref('admins/' + userId).remove();
                        
                        bannedCount++;
                        
                        logSecurityEvent(
                            "AUTO_BAN_FAKE_ADMIN",
                            `Usuário ${userData.email} banido por ser admin falso`,
                            userId,
                            userData.lastIP
                        );
                    }
                });
            }
        });
        
        setTimeout(() => {
            showNotification(`${bannedCount} falsos administradores banidos!`, "success");
            loadUsersList();
            loadAdminStats();
        }, 1000);
        
    } catch (error) {
        console.error("❌ Erro ao banir falsos admins:", error);
        showNotification('Erro ao banir falsos admins', "error");
    }
};

window.scanForThreats = async function() {
    if (!isAdminUser) return;
    
    showNotification("Verificando ameaças...", "info");
    
    try {
        let threatCount = 0;
        
        // Verificar usuários sem IP
        const usersSnapshot = await database.ref('users').once('value');
        usersSnapshot.forEach(child => {
            const user = child.val();
            if (!user.lastIP || user.lastIP === 'unknown') {
                threatCount++;
                logSecurityEvent(
                    "SUSPICIOUS_USER",
                    `Usuário ${user.email} sem IP registrado`,
                    child.key
                );
            }
        });
        
        // Verificar múltiplas contas do mesmo IP
        const ipMap = new Map();
        usersSnapshot.forEach(child => {
            const user = child.val();
            if (user.lastIP && user.lastIP !== 'unknown') {
                if (!ipMap.has(user.lastIP)) {
                    ipMap.set(user.lastIP, []);
                }
                ipMap.get(user.lastIP).push(user.email);
            }
        });
        
        ipMap.forEach((emails, ip) => {
            if (emails.length > 3) { // Mais de 3 contas do mesmo IP
                threatCount++;
                logSecurityEvent(
                    "SUSPICIOUS_IP",
                    `IP ${ip} tem ${emails.length} contas: ${emails.join(', ')}`,
                    null,
                    ip
                );
            }
        });
        
        showNotification(`Verificação completa: ${threatCount} ameaças encontradas`, 
                        threatCount > 0 ? "warning" : "success");
        
        // Recarregar logs
        loadSecurityLogs();
        
    } catch (error) {
        console.error("❌ Erro ao verificar ameaças:", error);
        showNotification('Erro ao verificar ameaças', "error");
    }
};

// ==============================================
// SISTEMA DE CHAT COM REPLY
// ==============================================

function setupChat() {
    // Carregar mensagens
    loadChatMessages();
    
    // Ouvir novas mensagens
    database.ref('chat').limitToLast(SYSTEM_CONFIG.CHAT_CONFIG.MAX_MESSAGES).on('child_added', (snapshot) => {
        const message = snapshot.val();
        message.id = snapshot.key;
        addMessageToChat(message);
    });
    
    // Configurar evento de clique para reply
    document.getElementById('chatMessages').addEventListener('click', function(e) {
        const messageElement = e.target.closest('.message');
        if (messageElement && isAdminUser) {
            const messageId = messageElement.dataset.messageId;
            const messageText = messageElement.querySelector('.message-text')?.textContent;
            
            if (messageText) {
                setupReply(messageId, messageText.substring(0, 100) + (messageText.length > 100 ? '...' : ''));
            }
        }
    });
}

async function loadChatMessages() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    try {
        const snapshot = await database.ref('chat').limitToLast(50).orderByChild('timestamp').once('value');
        chatMessages.innerHTML = '';
        
        if (!snapshot.exists()) {
            chatMessages.innerHTML = `
                <div class="empty-chat">
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
        
        // Adicionar mensagens
        messages.forEach((message) => {
            addMessageToChat(message);
        });
        
        scrollChatToBottom();
        
        // Atualizar contador
        document.getElementById('totalMessages').textContent = messages.length;
        
    } catch (error) {
        console.error("❌ Erro ao carregar chat:", error);
    }
}

function addMessageToChat(message) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    // Remover placeholder se existir
    const placeholder = chatMessages.querySelector('.empty-chat');
    if (placeholder) {
        placeholder.remove();
    }
    
    const messageElement = createMessageElement(message);
    chatMessages.appendChild(messageElement);
    
    scrollChatToBottom();
    
    // Atualizar contador
    const messageCount = chatMessages.querySelectorAll('.message').length;
    document.getElementById('totalMessages').textContent = messageCount;
}

function createMessageElement(message) {
    const isCurrentUser = currentUser && message.userId === currentUser.uid;
    const isAdminMessage = message.isAdmin || false;
    const userName = message.userName || 'Usuário';
    const time = new Date(message.timestamp);
    const timeStr = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const div = document.createElement('div');
    div.className = `message ${isCurrentUser ? 'message-self' : ''} ${isAdminMessage ? 'message-admin' : ''}`;
    div.dataset.messageId = message.id;
    
    // Verificar se é mensagem de sistema (deleção)
    const isSystemMessage = message.userId === 'system';
    
    // Avatar HTML
    const avatarHTML = `
        <div class="message-avatar">
            ${isSystemMessage ? '🤖' : userName.charAt(0).toUpperCase()}
            ${isAdminMessage ? '<div class="admin-crown">👑</div>' : ''}
        </div>
    `;
    
    // Reply indicator
    let replyHTML = '';
    if (message.replyTo) {
        const replyText = message.replyText || 'Mensagem anterior';
        replyHTML = `
            <div class="message-reply">
                <i class="fas fa-reply"></i>
                <span class="reply-text">${escapeHtml(replyText)}</span>
            </div>
        `;
    }
    
    // Message actions (apenas para admin)
    let actionsHTML = '';
    if (isAdminUser && !isSystemMessage) {
        actionsHTML = `
            <div class="message-actions">
                <button onclick="showDeleteMessageModal('${message.id}')" class="message-action-btn" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
                <button onclick="setupReply('${message.id}', '${escapeHtml(message.text.substring(0, 50))}')" class="message-action-btn" title="Responder">
                    <i class="fas fa-reply"></i>
                </button>
            </div>
        `;
    }
    
    const contentHTML = `
        <div class="message-content">
            <div class="message-header">
                <div class="message-user">
                    <strong>${isSystemMessage ? '🤖 Sistema' : escapeHtml(userName)}</strong>
                    ${isCurrentUser ? '<span class="you-badge">Você</span>' : ''}
                    ${isAdminMessage ? '<span class="admin-badge">ADMIN</span>' : ''}
                </div>
                <div class="message-time">${timeStr}</div>
            </div>
            ${replyHTML}
            <div class="message-text">${escapeHtml(message.text)}</div>
            ${actionsHTML}
        </div>
    `;
    
    if (isCurrentUser) {
        div.innerHTML = contentHTML + avatarHTML;
    } else {
        div.innerHTML = avatarHTML + contentHTML;
    }
    
    // Adicionar animação
    div.style.animation = 'slideInLeft 0.3s ease';
    
    return div;
}

function setupReply(messageId, messageText) {
    if (!isAdminUser) return;
    
    currentReplyTo = {
        id: messageId,
        text: messageText
    };
    
    // Mostrar preview do reply
    const replyPreview = document.getElementById('replyPreview');
    const replyText = document.getElementById('replyText');
    
    replyText.textContent = messageText;
    replyPreview.style.display = 'block';
    
    // Focar no input
    document.getElementById('chatInput').focus();
    
    showNotification('Modo resposta ativado. Digite sua resposta e pressione Enter.', 'info');
}

function cancelReply() {
    currentReplyTo = null;
    document.getElementById('replyPreview').style.display = 'none';
    document.getElementById('chatInput').focus();
}

async function sendMessage() {
    if (!currentUser) {
        showNotification('Faça login para enviar mensagens', 'warning');
        showLoginModal();
        return;
    }
    
    const chatInput = document.getElementById('chatInput');
    const text = chatInput.value.trim();
    
    if (!text) {
        showNotification('Digite uma mensagem', 'warning');
        return;
    }
    
    // Verificar cooldown
    const now = Date.now();
    if (messageCooldown && now - lastMessageTime < SYSTEM_CONFIG.CHAT_CONFIG.COOLDOWN_TIME) {
        const remaining = Math.ceil((SYSTEM_CONFIG.CHAT_CONFIG.COOLDOWN_TIME - (now - lastMessageTime)) / 1000);
        showNotification(`Aguarde ${remaining}s para enviar outra mensagem`, 'warning');
        return;
    }
    
    // Verificar se está banido/mutado
    try {
        const snapshot = await database.ref('users/' + currentUser.uid).once('value');
        const userData = snapshot.val();
        
        if (userData?.isBanned) {
            showNotification('Você está banido do chat', 'error');
            return;
        }
        
        if (userData?.isMuted) {
            showNotification('Você está mutado do chat', 'warning');
            return;
        }
        
        // Verificar banimento por IP
        const isIPBanned = await checkIPBan(userIP);
        if (isIPBanned) {
            showNotification('Seu IP está banido do chat', 'error');
            return;
        }
        
        // Preparar dados da mensagem
        const messageData = {
            text: text,
            timestamp: now,
            userId: currentUser.uid,
            userName: currentUser.email.split('@')[0],
            isAdmin: isAdminUser,
            userIP: userIP
        };
        
        // Adicionar reply se existir
        if (currentReplyTo) {
            messageData.replyTo = currentReplyTo.id;
            messageData.replyText = currentReplyTo.text;
        }
        
        // Enviar mensagem
        await database.ref('chat').push(messageData);
        
        // Limpar input e reply
        chatInput.value = '';
        cancelReply();
        
        // Set cooldown
        lastMessageTime = now;
        messageCooldown = true;
        
        // Registrar mensagem no perfil do usuário
        database.ref('users/' + currentUser.uid + '/messagesSent').transaction((current) => {
            return (current || 0) + 1;
        });
        
        // Limpar cooldown
        setTimeout(() => {
            messageCooldown = false;
        }, SYSTEM_CONFIG.CHAT_CONFIG.COOLDOWN_TIME);
        
    } catch (error) {
        console.error("❌ Erro ao enviar mensagem:", error);
        showNotification('Erro ao enviar mensagem', 'error');
    }
}

// ==============================================
// DELETE MESSAGE SYSTEM
// ==============================================

let currentDeleteMessageId = null;

window.showDeleteMessageModal = function(messageId) {
    if (!isAdminUser) return;
    
    currentDeleteMessageId = messageId;
    showModal('deleteMessageModal');
};

window.confirmDeleteMessage = async function() {
    if (!isAdminUser || !currentDeleteMessageId) return;
    
    const reasonSelect = document.getElementById('deleteReason');
    let reason = reasonSelect.value;
    
    if (reason === 'Outros') {
        reason = document.getElementById('customReason').value.trim();
        if (!reason) {
            showNotification('Digite um motivo', 'warning');
            return;
        }
    } else if (!reason) {
        showNotification('Selecione um motivo', 'warning');
        return;
    }
    
    try {
        // Obter a mensagem antes de deletar
        const snapshot = await database.ref('chat/' + currentDeleteMessageId).once('value');
        const message = snapshot.val();
        
        if (!message) {
            showNotification('Mensagem não encontrada', 'error');
            return;
        }
        
        // Deletar mensagem
        await database.ref('chat/' + currentDeleteMessageId).remove();
        
        // Enviar mensagem do sistema sobre a deleção
        const systemMessage = {
            text: `🚫 Um admin deletou uma mensagem por: ${reason}`,
            timestamp: Date.now(),
            userId: 'system',
            userName: 'Sistema',
            isAdmin: true,
            deletedMessage: {
                originalUser: message.userName,
                originalText: message.text.substring(0, 50) + (message.text.length > 50 ? '...' : ''),
                deletedBy: currentUser.email,
                reason: reason
            }
        };
        
        await database.ref('chat').push(systemMessage);
        
        // Log de segurança
        await logSecurityEvent(
            "CHAT_DELETE",
            `Admin ${currentUser.email} deletou mensagem de ${message.userName}. Motivo: ${reason}`,
            message.userId,
            message.userIP
        );
        
        showNotification('Mensagem excluída', 'success');
        closeModal('deleteMessageModal');
        
        // Limpar formulário
        document.getElementById('deleteReason').value = '';
        document.getElementById('customReason').value = '';
        document.getElementById('customReasonGroup').style.display = 'none';
        currentDeleteMessageId = null;
        
    } catch (error) {
        console.error("❌ Erro ao excluir mensagem:", error);
        showNotification('Erro ao excluir mensagem', 'error');
    }
};

window.clearAllChat = async function() {
    if (!isAdminUser) return;
    
    if (!confirm('Tem certeza que deseja limpar TODO o chat?\n\nEsta ação é irreversível!')) return;
    
    try {
        // Obter todas as mensagens
        const snapshot = await database.ref('chat').once('value');
        const messages = [];
        snapshot.forEach(child => {
            messages.push({
                id: child.key,
                ...child.val()
            });
        });
        
        // Deletar todas as mensagens
        await database.ref('chat').remove();
        
        // Enviar mensagem do sistema
        await database.ref('chat').push({
            text: `💥 Chat limpo por um administrador. ${messages.length} mensagens removidas.`,
            timestamp: Date.now(),
            userId: 'system',
            userName: 'Sistema',
            isAdmin: true
        });
        
        // Log de segurança
        await logSecurityEvent(
            "CHAT_CLEAR",
            `Admin ${currentUser.email} limpou todo o chat. ${messages.length} mensagens removidas.`,
            currentUser.uid,
            userIP
        );
        
        showNotification(`Chat limpo! ${messages.length} mensagens removidas.`, 'success');
        
    } catch (error) {
        console.error("❌ Erro ao limpar chat:", error);
        showNotification('Erro ao limpar chat', 'error');
    }
};

window.muteAllUsers = async function() {
    if (!isAdminUser) return;
    
    const duration = prompt("Duração do mute para todos os usuários (em minutos, 0 = cancelar):");
    if (!duration || duration === '0') return;
    
    const minutes = parseInt(duration);
    if (isNaN(minutes) || minutes <= 0) {
        showNotification('Duração inválida', 'error');
        return;
    }
    
    if (!confirm(`Mutuar TODOS os usuários por ${minutes} minutos?\n\nEsta ação afetará todos os usuários online!`)) return;
    
    try {
        let mutedCount = 0;
        
        const snapshot = await database.ref('users').once('value');
        const updates = {};
        
        snapshot.forEach(child => {
            const userId = child.key;
            const userData = child.val();
            
            // Não mutar admins
            if (userData.email !== SYSTEM_CONFIG.ADMIN_EMAIL) {
                updates[userId + '/isMuted'] = true;
                updates[userId + '/mutedAt'] = Date.now();
                updates[userId + '/mutedBy'] = currentUser.email;
                updates[userId + '/muteReason'] = 'Mute global aplicado pelo admin';
                updates[userId + '/muteUntil'] = Date.now() + (minutes * 60 * 1000);
                mutedCount++;
            }
        });
        
        await database.ref('users').update(updates);
        
        // Enviar mensagem no chat
        await database.ref('chat').push({
            text: `🔇 O administrador mutou todos os usuários por ${minutes} minutos.`,
            timestamp: Date.now(),
            userId: 'system',
            userName: 'Sistema',
            isAdmin: true
        });
        
        // Log de segurança
        await logSecurityEvent(
            "GLOBAL_MUTE",
            `Admin ${currentUser.email} mutou todos os ${mutedCount} usuários por ${minutes} minutos`,
            currentUser.uid,
            userIP
        );
        
        showNotification(`${mutedCount} usuários mutados por ${minutes} minutos`, 'success');
        
        // Auto-remover mute após o tempo
        setTimeout(async () => {
            const unmuteUpdates = {};
            snapshot.forEach(child => {
                const userId = child.key;
                const userData = child.val();
                
                if (userData.email !== SYSTEM_CONFIG.ADMIN_EMAIL) {
                    unmuteUpdates[userId + '/isMuted'] = false;
                    unmuteUpdates[userId + '/mutedAt'] = null;
                    unmuteUpdates[userId + '/mutedBy'] = null;
                    unmuteUpdates[userId + '/muteReason'] = null;
                    unmuteUpdates[userId + '/muteUntil'] = null;
                }
            });
            
            await database.ref('users').update(unmuteUpdates);
            
            await database.ref('chat').push({
                text: `🔊 Mute global removido. Todos os usuários podem falar novamente.`,
                timestamp: Date.now(),
                userId: 'system',
                userName: 'Sistema',
                isAdmin: true
            });
            
            showNotification('Mute global removido', 'info');
            
        }, minutes * 60 * 1000);
        
    } catch (error) {
        console.error("❌ Erro ao mutar todos os usuários:", error);
        showNotification('Erro ao mutar usuários', 'error');
    }
};

// ==============================================
// ONLINE USERS SYSTEM
// ==============================================

function setupOnlineUsers() {
    database.ref('online_users').on('value', (snapshot) => {
        onlineUsers.clear();
        
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                onlineUsers.set(childSnapshot.key, childSnapshot.val());
            });
            
            // Atualizar contador
            const onlineCount = snapshot.numChildren();
            updateOnlineCount(onlineCount);
        }
    });
}

function updateOnlineCount(count) {
    const elements = [
        'onlineUsers',
        'chatOnlineCount', 
        'footerOnline',
        'adminOnlineNow'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = count;
    });
}

function setupUserPresence(userId) {
    if (!userId) return;
    
    const userPresenceRef = database.ref('online_users/' + userId);
    
    // Definir usuário como online
    userPresenceRef.set({
        userId: userId,
        email: currentUser.email,
        username: currentUser.email.split('@')[0],
        lastSeen: Date.now(),
        online: true,
        ip: userIP
    });
    
    // Atualizar periodicamente (a cada 30 segundos)
    const updateInterval = setInterval(() => {
        if (currentUser) {
            userPresenceRef.update({
                lastSeen: Date.now()
            });
        } else {
            clearInterval(updateInterval);
        }
    }, 30000);
    
    // Remover ao desconectar
    userPresenceRef.onDisconnect().remove();
}

// ==============================================
// SCRIPTS SYSTEM
// ==============================================

async function loadScripts() {
    try {
        const scriptsGrid = document.getElementById('scriptsGrid');
        const scriptsLoader = document.getElementById('scriptsLoader');
        
        if (!scriptsGrid) return;
        
        scriptsGrid.innerHTML = '';
        scriptsLoader.style.display = 'flex';
        
        const snapshot = await database.ref('scripts').orderByChild('date').limitToLast(SYSTEM_CONFIG.SCRIPT_CONFIG.MAX_SCRIPTS).once('value');
        
        scriptsLoader.style.display = 'none';
        
        if (!snapshot.exists()) {
            scriptsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-code"></i>
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
        
        // Ordenar por data (mais recentes primeiro)
        scripts.sort((a, b) => b.date - a.date);
        
        // Aplicar filtros
        const filteredScripts = applyScriptFilters(scripts);
        
        // Mostrar scripts
        if (filteredScripts.length === 0) {
            scriptsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Nenhum script encontrado</h3>
                    <p>Tente alterar os filtros de busca</p>
                </div>
            `;
        } else {
            filteredScripts.forEach((script, index) => {
                const scriptCard = createScriptCard(script);
                scriptCard.style.animationDelay = `${index * 0.05}s`;
                scriptsGrid.appendChild(scriptCard);
            });
        }
        
        // Atualizar contador
        const totalScriptsCount = document.getElementById('totalScripts');
        if (totalScriptsCount) totalScriptsCount.textContent = filteredScripts.length;
        
    } catch (error) {
        console.error("❌ Erro ao carregar scripts:", error);
        document.getElementById('scriptsLoader').style.display = 'none';
        showNotification('Erro ao carregar scripts', 'error');
    }
}

function applyScriptFilters(scripts) {
    const searchTerm = document.getElementById('scriptSearch').value.toLowerCase();
    const gameFilter = document.getElementById('gameFilter').value.toLowerCase();
    const sortFilter = document.getElementById('sortFilter').value;
    
    let filtered = scripts.filter(script => {
        const title = (script.title || '').toLowerCase();
        const description = (script.description || '').toLowerCase();
        const game = (script.game || '').toLowerCase();
        const author = (script.author || '').toLowerCase();
        
        // Aplicar filtro de busca
        const matchesSearch = !searchTerm || 
            title.includes(searchTerm) || 
            description.includes(searchTerm) ||
            author.includes(searchTerm);
        
        // Aplicar filtro de jogo
        const matchesGame = !gameFilter || game.includes(gameFilter);
        
        return matchesSearch && matchesGame;
    });
    
    // Aplicar ordenação
    switch(sortFilter) {
        case 'popular':
            filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
            break;
        case 'downloads':
            filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
            break;
        case 'newest':
        default:
            filtered.sort((a, b) => b.date - a.date);
            break;
    }
    
    return filtered;
}

function filterScripts() {
    const scriptsGrid = document.getElementById('scriptsGrid');
    if (!scriptsGrid) return;
    
    // Recarregar scripts com filtros
    loadScripts();
}

function createScriptCard(script) {
    const div = document.createElement('div');
    div.className = 'script-card reveal';
    
    const date = new Date(script.date || Date.now());
    const dateStr = date.toLocaleDateString('pt-BR');
    
    const downloads = script.downloads || 0;
    const rating = script.rating || 5.0;
    const game = script.game || 'Geral';
    
    // Formatar descrição (limitar tamanho)
    let description = script.description || 'Sem descrição disponível.';
    if (description.length > 150) {
        description = description.substring(0, 150) + '...';
    }
    
    div.innerHTML = `
        <div class="script-header">
            <div class="script-title">${escapeHtml(script.title || 'Script sem título')}</div>
            <div class="script-meta">
                <span class="script-game">${escapeHtml(game)}</span>
                <span class="script-date">${dateStr}</span>
                ${script.author ? `<span class="script-author"><i class="fas fa-user"></i> ${escapeHtml(script.author)}</span>` : ''}
            </div>
        </div>
        
        <div class="script-content">
            ${escapeHtml(description)}
        </div>
        
        <div class="script-stats">
            <span class="stat"><i class="fas fa-download"></i> ${downloads.toLocaleString()}</span>
            <span class="stat"><i class="fas fa-star"></i> ${rating.toFixed(1)}</span>
            <span class="stat"><i class="fas fa-code"></i> ${script.language || 'Lua'}</span>
        </div>
        
        <div class="script-actions">
            <button onclick="downloadScript('${script.id}')" class="btn btn-primary">
                <i class="fas fa-download"></i> Baixar
            </button>
            <button onclick="copyScript('${script.id}')" class="btn btn-secondary">
                <i class="fas fa-copy"></i> Copiar
            </button>
            ${isAdminUser ? `
                <button onclick="editScript('${script.id}')" class="btn btn-warning">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteScript('${script.id}')" class="btn btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            ` : ''}
        </div>
    `;
    
    return div;
}

window.downloadScript = async function(scriptId) {
    if (!currentUser) {
        showNotification('Faça login para baixar scripts', 'warning');
        showLoginModal();
        return;
    }
    
    try {
        const snapshot = await database.ref('scripts/' + scriptId).once('value');
        const script = snapshot.val();
        
        if (!script) {
            showNotification('Script não encontrado', 'error');
            return;
        }
        
        // Verificar se usuário está banido
        const userSnapshot = await database.ref('users/' + currentUser.uid).once('value');
        const userData = userSnapshot.val();
        
        if (userData?.isBanned) {
            showNotification('Você está banido e não pode baixar scripts', 'error');
            return;
        }
        
        // Criar elemento de download
        const code = script.code || '-- Script vazio';
        const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Nome do arquivo
        const fileName = (script.title || 'script')
            .toLowerCase()
            .replace(/[^a-z0-9]/gi, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');
        
        a.href = url;
        a.download = `${fileName}.lua`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Download iniciado!', 'success');
        
        // Atualizar contador de downloads do script
        await database.ref('scripts/' + scriptId + '/downloads').transaction((current) => {
            return (current || 0) + 1;
        });
        
        // Atualizar contador de downloads do usuário
        await database.ref('users/' + currentUser.uid + '/scriptsDownloaded').transaction((current) => {
            return (current || 0) + 1;
        });
        
        // Adicionar XP ao usuário
        await database.ref('users/' + currentUser.uid + '/xp').transaction((current) => {
            return (current || 0) + 10;
        });
        
        // Log de download
        await logSecurityEvent(
            "SCRIPT_DOWNLOAD",
            `Usuário ${currentUser.email} baixou script: ${script.title}`,
            currentUser.uid,
            userIP
        );
        
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
        
        // Log de cópia
        if (currentUser) {
            await logSecurityEvent(
                "SCRIPT_COPY",
                `Usuário ${currentUser.email} copiou script: ${script.title}`,
                currentUser.uid,
                userIP
            );
        }
        
    } catch (error) {
        console.error("❌ Erro ao copiar script:", error);
        showNotification('Erro ao copiar script', 'error');
    }
};

// ==============================================
// RANKING SYSTEM
// ==============================================

async function loadRanking(period = 'alltime') {
    try {
        const rankingList = document.getElementById('rankingList');
        if (!rankingList) return;
        
        const snapshot = await database.ref('users').once('value');
        
        if (!snapshot.exists()) {
            rankingList.innerHTML = '<div class="empty-ranking">Nenhum usuário registrado</div>';
            return;
        }
        
        const users = [];
        const now = Date.now();
        
        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            user.id = childSnapshot.key;
            
            // Ignorar usuários banidos
            if (user.isBanned) return;
            
            // Calcular score baseado no período
            let score = 0;
            
            // Pontos base
            score += (user.messagesSent || 0) * 1;
            score += (user.scriptsDownloaded || 0) * 5;
            score += (user.totalLogins || 0) * 2;
            score += (user.xp || 0) * 0.1;
            
            // Bonus por atividade recente
            if (user.lastLogin) {
                const daysSinceLastLogin = (now - user.lastLogin) / (24 * 60 * 60 * 1000);
                if (daysSinceLastLogin < 7) {
                    score += 50; // Bonus por atividade recente
                }
            }
            
            // Bonus por ser admin
            if (user.email === SYSTEM_CONFIG.ADMIN_EMAIL) {
                score += 1000; // Bonus grande para admin
            }
            
            users.push({
                ...user,
                score: Math.round(score)
            });
        });
        
        // Ordenar por score
        users.sort((a, b) => b.score - a.score);
        
        // Atualizar estatísticas
        const totalUsers = document.getElementById('totalRankingUsers');
        const topUser = document.getElementById('topRankingUser');
        
        if (totalUsers) totalUsers.textContent = users.length;
        if (topUser && users.length > 0) {
            topUser.textContent = users[0].username || users[0].email.split('@')[0];
        }
        
        // Mostrar ranking (top 20)
        rankingList.innerHTML = '';
        const topUsers = users.slice(0, 20);
        
        topUsers.forEach((user, index) => {
            const rankElement = createRankElement(user, index + 1);
            rankingList.appendChild(rankElement);
        });
        
    } catch (error) {
        console.error("❌ Erro ao carregar ranking:", error);
    }
}

function createRankElement(user, position) {
    const div = document.createElement('div');
    div.className = 'rank-item';
    
    // Medalhas para os top 3
    let positionHTML;
    if (position === 1) {
        positionHTML = '<div class="rank-medal gold">🥇</div>';
    } else if (position === 2) {
        positionHTML = '<div class="rank-medal silver">🥈</div>';
    } else if (position === 3) {
        positionHTML = '<div class="rank-medal bronze">🥉</div>';
    } else {
        positionHTML = `<div class="rank-position">${position}</div>`;
    }
    
    // Badge de admin
    const adminBadge = user.email === SYSTEM_CONFIG.ADMIN_EMAIL ? 
        '<span class="rank-admin-badge">👑</span>' : '';
    
    // Data do último login
    const lastLogin = user.lastLogin ? 
        new Date(user.lastLogin).toLocaleDateString('pt-BR') : 
        'Nunca';
    
    div.innerHTML = `
        ${positionHTML}
        
        <div class="rank-user">
            <div class="rank-avatar">${user.username?.charAt(0) || user.email?.charAt(0) || 'U'}</div>
            <div class="rank-info">
                <div class="rank-name">
                    ${user.username || user.email.split('@')[0]}
                    ${adminBadge}
                </div>
                <div class="rank-stats">
                    <span class="stat"><i class="fas fa-comment"></i> ${user.messagesSent || 0}</span>
                    <span class="stat"><i class="fas fa-download"></i> ${user.scriptsDownloaded || 0}</span>
                    <span class="stat"><i class="fas fa-sign-in-alt"></i> ${user.totalLogins || 0}</span>
                </div>
            </div>
        </div>
        
        <div class="rank-score">
            <div class="score-value">${user.score.toLocaleString()} pts</div>
            <div class="score-info">
                <small>Último login: ${lastLogin}</small>
            </div>
        </div>
    `;
    
    // Destacar admin
    if (user.email === SYSTEM_CONFIG.ADMIN_EMAIL) {
        div.classList.add('rank-admin');
    }
    
    return div;
}

// ==============================================
// PERFIL E CONFIGURAÇÕES
// ==============================================

async function showProfileModal() {
    if (!currentUser) return;
    
    await loadProfileData();
    showModal('profileModal');
}

async function loadProfileData() {
    if (!currentUser) return;
    
    try {
        const snapshot = await database.ref('users/' + currentUser.uid).once('value');
        const userData = snapshot.val();
        
        if (!userData) return;
        
        // Informações básicas
        document.getElementById('profileName').textContent = userData.username || currentUser.email.split('@')[0];
        document.getElementById('profileEmailText').textContent = currentUser.email;
        document.getElementById('profileBio').textContent = userData.bio || 'Nenhuma bio definida.';
        
        // Estatísticas
        document.getElementById('profileMessagesCount').textContent = userData.messagesSent || 0;
        document.getElementById('profileDownloadsCount').textContent = userData.scriptsDownloaded || 0;
        document.getElementById('profileLoginsCount').textContent = userData.totalLogins || 1;
        document.getElementById('profileScore').textContent = (userData.xp || 0).toLocaleString();
        
        // Data de criação
        if (userData.createdAt) {
            const createdDate = new Date(userData.createdAt);
            document.getElementById('profileCreatedAt').textContent = createdDate.toLocaleDateString('pt-BR');
        }
        
        // Badge do perfil
        const badge = document.getElementById('profileBadge');
        if (isAdminUser) {
            badge.innerHTML = '<i class="fas fa-crown"></i> ADMIN';
            badge.className = 'badge badge-admin';
        } else {
            badge.innerHTML = '<i class="fas fa-user"></i> MEMBRO';
            badge.className = 'badge badge-member';
        }
        
        // Status online
        const status = document.getElementById('profileStatus');
        if (userData.lastLogin && (Date.now() - userData.lastLogin) < 5 * 60 * 1000) { // 5 minutos
            status.innerHTML = '<i class="fas fa-circle"></i> Online';
            status.className = 'badge badge-online';
        } else {
            status.innerHTML = '<i class="fas fa-circle"></i> Offline';
            status.className = 'badge badge-offline';
        }
        
        // Avatar inicial
        const avatarLarge = document.getElementById('profileAvatar').querySelector('.avatar-initial-large');
        const avatarSmall = document.querySelector('.avatar-initial-small');
        const avatarPreview = document.getElementById('avatarPreview').querySelector('.avatar-initial-preview');
        
        const initial = userData.username ? 
            userData.username.charAt(0).toUpperCase() : 
            currentUser.email.charAt(0).toUpperCase();
        
        if (avatarLarge) avatarLarge.textContent = initial;
        if (avatarSmall) avatarSmall.textContent = initial;
        if (avatarPreview) avatarPreview.textContent = initial;
        
        // Atualizar avatar do header
        const headerAvatar = document.querySelector('.avatar-initial');
        if (headerAvatar) headerAvatar.textContent = initial;
        
        // Atualizar dropdown
        document.getElementById('dropdownUsername').textContent = userData.username || currentUser.email.split('@')[0];
        document.getElementById('dropdownEmail').textContent = currentUser.email;
        
        // Se tiver avatar customizado, carregar
        if (userData.avatarUrl) {
            // Carregar avatar da URL
            loadCustomAvatar(userData.avatarUrl);
        }
        
    } catch (error) {
        console.error("❌ Erro ao carregar perfil:", error);
    }
}

function loadCustomAvatar(url) {
    // Implementar carregamento de avatar customizado
    // Por enquanto, usamos apenas as iniciais
}

function showSettingsModal() {
    if (!currentUser) return;
    
    loadSettingsData();
    showModal('settingsModal');
}

async function loadSettingsData() {
    if (!currentUser) return;
    
    try {
        const snapshot = await database.ref('users/' + currentUser.uid + '/settings').once('value');
        const settings = snapshot.val() || {};
        
        // Carregar configurações
        document.getElementById('themeSelect').value = settings.theme || 'dark';
        document.getElementById('musicToggleSetting').checked = settings.music === 'on';
        document.getElementById('animationsToggle').checked = settings.animations !== false;
        document.getElementById('publicProfile').checked = settings.publicProfile !== false;
        document.getElementById('showOnline').checked = settings.showOnline !== false;
        document.getElementById('showLastLogin').checked = settings.showLastLogin !== false;
        
        // Bio
        const bioSnapshot = await database.ref('users/' + currentUser.uid + '/bio').once('value');
        document.getElementById('settingsBio').value = bioSnapshot.val() || '';
        
    } catch (error) {
        console.error("❌ Erro ao carregar configurações:", error);
    }
}

function showSettingsTab(tabName) {
    // Atualizar tabs ativas
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.settings-tab[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Mostrar painel correspondente
    document.querySelectorAll('.settings-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tabName}Panel`)?.classList.add('active');
}

async function saveProfileSettings() {
    if (!currentUser) return;
    
    try {
        // Coletar configurações
        const settings = {
            theme: document.getElementById('themeSelect').value,
            music: document.getElementById('musicToggleSetting').checked ? 'on' : 'off',
            animations: document.getElementById('animationsToggle').checked,
            publicProfile: document.getElementById('publicProfile').checked,
            showOnline: document.getElementById('showOnline').checked,
            showLastLogin: document.getElementById('showLastLogin').checked
        };
        
        const bio = document.getElementById('settingsBio').value.trim();
        
        // Salvar configurações
        await database.ref('users/' + currentUser.uid + '/settings').set(settings);
        
        // Salvar bio
        await database.ref('users/' + currentUser.uid + '/bio').set(bio);
        
        // Aplicar tema imediatamente
        if (settings.theme === 'dark') {
            document.body.classList.remove('light-theme');
        } else if (settings.theme === 'light') {
            document.body.classList.add('light-theme');
        }
        
        // Aplicar animações
        if (settings.animations) {
            document.body.classList.add('animations-enabled');
        } else {
            document.body.classList.remove('animations-enabled');
        }
        
        showNotification('Configurações salvas com sucesso!', 'success');
        
        // Atualizar perfil
        loadProfileData();
        
    } catch (error) {
        console.error("❌ Erro ao salvar configurações:", error);
        showNotification('Erro ao salvar configurações', 'error');
    }
}

window.editAvatar = function() {
    if (!currentUser) return;
    
    const input = document.getElementById('avatarFile');
    if (input) {
        input.click();
        input.onchange = function() {
            uploadAvatarFile(this.files[0]);
        };
    }
};

window.editBanner = function() {
    if (!currentUser) return;
    
    const input = document.getElementById('bannerFile');
    if (input) {
        input.click();
        input.onchange = function() {
            uploadBannerFile(this.files[0]);
        };
    }
};

window.editBio = function() {
    if (!currentUser) return;
    
    const currentBio = document.getElementById('profileBio').textContent;
    const newBio = prompt("Digite sua nova bio:", currentBio);
    
    if (newBio !== null) {
        const bio = newBio.trim();
        database.ref('users/' + currentUser.uid + '/bio').set(bio)
            .then(() => {
                showNotification('Bio atualizada com sucesso!', 'success');
                loadProfileData();
            })
            .catch(error => {
                console.error("❌ Erro ao atualizar bio:", error);
                showNotification('Erro ao atualizar bio', 'error');
            });
    }
};

async function uploadAvatarFile(file) {
    if (!currentUser || !file) return;
    
    // Validar arquivo
    if (!SYSTEM_CONFIG.UPLOAD.ALLOWED_TYPES.includes(file.type)) {
        showNotification('Tipo de arquivo não permitido. Use JPG, PNG ou GIF.', 'error');
        return;
    }
    
    if (file.size > SYSTEM_CONFIG.UPLOAD.MAX_AVATAR_SIZE) {
        showNotification('Arquivo muito grande. Máximo 5MB.', 'error');
        return;
    }
    
    showNotification('Enviando avatar...', 'info');
    
    try {
        // Em um sistema real, você enviaria para um servidor ou Firebase Storage
        // Por enquanto, vamos apenas simular o upload
        
        // Criar URL temporária para preview
        const reader = new FileReader();
        reader.onload = function(e) {
            // Aqui você normalmente enviaria para Firebase Storage
            // e obteria uma URL permanente
            
            // Simular upload bem-sucedido
            setTimeout(() => {
                showNotification('Avatar atualizado com sucesso!', 'success');
                
                // Atualizar preview (em sistema real, usaria a URL do Storage)
                const avatarElements = document.querySelectorAll('.avatar-initial, .avatar-initial-large, .avatar-initial-small, .avatar-initial-preview');
                avatarElements.forEach(el => {
                    el.style.backgroundImage = `url(${e.target.result})`;
                    el.textContent = '';
                });
                
                // Salvar URL no banco de dados (simulado)
                database.ref('users/' + currentUser.uid + '/avatarUrl').set(e.target.result)
                    .catch(err => console.error("Erro ao salvar avatar:", err));
                    
            }, 1500);
        };
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error("❌ Erro ao fazer upload do avatar:", error);
        showNotification('Erro ao fazer upload do avatar', 'error');
    }
}

// ==============================================
// LOGIN/REGISTRO
// ==============================================

function showLoginModal() {
    showModal('loginModal');
}

function showRegisterModal() {
    showModal('registerModal');
}

function showForgotPassword() {
    const email = prompt("Digite seu email para recuperar a senha:");
    if (email && email.includes('@')) {
        auth.sendPasswordResetEmail(email)
            .then(() => {
                showNotification('Email de recuperação enviado!', 'success');
            })
            .catch(error => {
                showNotification('Erro ao enviar email de recuperação', 'error');
            });
    }
}

function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Preencha todos os campos', 'error');
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            closeModal('loginModal');
            showNotification('Login realizado com sucesso!', 'success');
            document.getElementById('loginForm').reset();
        })
        .catch((error) => {
            let errorMessage = 'Erro ao fazer login';
            switch(error.code) {
                case 'auth/invalid-email': errorMessage = 'Email inválido'; break;
                case 'auth/user-not-found': errorMessage = 'Usuário não encontrado'; break;
                case 'auth/wrong-password': errorMessage = 'Senha incorreta'; break;
                case 'auth/user-disabled': errorMessage = 'Conta desativada'; break;
                case 'auth/too-many-requests': errorMessage = 'Muitas tentativas. Tente mais tarde'; break;
            }
            showNotification(errorMessage, 'error');
            
            // Log de tentativa falha
            logSecurityEvent(
                "LOGIN_FAILED",
                `Tentativa de login falhou para: ${email}`,
                null,
                userIP
            );
        });
}

function handleRegisterSubmit(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    
    if (!username || !email || !password) {
        showNotification('Preencha todos os campos', 'error');
        return;
    }
    
    // Verificar se é tentativa de criar conta admin
    if (email === SYSTEM_CONFIG.ADMIN_EMAIL) {
        showNotification('Este email é reservado para o administrador', 'error');
        
        // Log de tentativa de criar conta admin
        logSecurityEvent(
            "ADMIN_CREATE_ATTEMPT",
            `Tentativa de criar conta com email admin: ${email}`,
            null,
            userIP
        );
        
        return;
    }
    
    // Verificar força da senha
    if (password.length < 6) {
        showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            
            // Salvar dados do usuário
            await database.ref('users/' + user.uid).set({
                email: email,
                username: username,
                displayName: username,
                createdAt: Date.now(),
                isBanned: false,
                isMuted: false,
                isAdmin: false, // SEMPRE FALSE PARA USUÁRIOS NORMAIS
                lastLogin: Date.now(),
                totalLogins: 1,
                messagesSent: 0,
                scriptsDownloaded: 0,
                level: 1,
                xp: 0,
                bio: '',
                avatar: null,
                banner: null,
                lastIP: userIP,
                settings: {
                    theme: 'dark',
                    music: 'off',
                    animations: true,
                    publicProfile: true,
                    showOnline: true,
                    showLastLogin: true
                }
            });
            
            showNotification('Conta criada com sucesso!', 'success');
            closeModal('registerModal');
            document.getElementById('registerForm').reset();
            
            // Log de registro
            logSecurityEvent(
                "USER_REGISTER",
                `Novo usuário registrado: ${email}`,
                user.uid,
                userIP
            );
            
        })
        .catch((error) => {
            let errorMessage = 'Erro ao criar conta';
            switch(error.code) {
                case 'auth/email-already-in-use': errorMessage = 'Email já cadastrado'; break;
                case 'auth/invalid-email': errorMessage = 'Email inválido'; break;
                case 'auth/weak-password': errorMessage = 'Senha muito fraca (mínimo 6 caracteres)'; break;
                case 'auth/operation-not-allowed': errorMessage = 'Operação não permitida'; break;
            }
            showNotification(errorMessage, 'error');
            
            // Log de erro no registro
            logSecurityEvent(
                "REGISTER_FAILED",
                `Falha ao registrar usuário: ${email} - ${error.code}`,
                null,
                userIP
            );
        });
}

// ==============================================
// UI FUNCTIONS
// ==============================================

function updateUIForLoggedInUser(user) {
    // Mostrar avatar, esconder login button
    const loginBtn = document.getElementById('loginBtn');
    const userAvatar = document.getElementById('userAvatarContainer');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (userAvatar) userAvatar.style.display = 'flex';
    
    // Atualizar avatar inicial
    const avatarInitial = document.querySelector('.avatar-initial');
    if (avatarInitial) {
        const initial = user.email ? user.email.charAt(0).toUpperCase() : 'U';
        avatarInitial.textContent = initial;
    }
    
    // Habilitar chat
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const emojiBtn = document.getElementById('emojiBtn');
    const attachBtn = document.getElementById('attachBtn');
    
    if (chatInput) {
        chatInput.disabled = false;
        chatInput.placeholder = "Digite sua mensagem...";
    }
    if (sendMessageBtn) sendMessageBtn.disabled = false;
    if (emojiBtn) emojiBtn.disabled = false;
    if (attachBtn) attachBtn.disabled = false;
}

function updateUIForGuest() {
    const loginBtn = document.getElementById('loginBtn');
    const userAvatar = document.getElementById('userAvatarContainer');
    
    if (loginBtn) loginBtn.style.display = 'block';
    if (userAvatar) userAvatar.style.display = 'none';
    
    // Esconder dashboard admin
    const adminBtn = document.getElementById('adminFloatBtn');
    const adminPanel = document.getElementById('adminPanel');
    if (adminBtn) adminBtn.style.display = 'none';
    if (adminPanel) adminPanel.classList.remove('active');
    
    // Desabilitar chat
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const emojiBtn = document.getElementById('emojiBtn');
    const attachBtn = document.getElementById('attachBtn');
    
    if (chatInput) {
        chatInput.disabled = true;
        chatInput.placeholder = "Faça login para usar o chat";
    }
    if (sendMessageBtn) sendMessageBtn.disabled = true;
    if (emojiBtn) emojiBtn.disabled = true;
    if (attachBtn) attachBtn.disabled = true;
}

// ==============================================
// MODAL FUNCTIONS
// ==============================================

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// ==============================================
// UTILITÁRIOS
// ==============================================

function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        button.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

function updateServerTime() {
    const serverTime = document.getElementById('serverTime');
    if (serverTime) {
        const now = new Date();
        serverTime.textContent = now.toLocaleTimeString('pt-BR');
    }
}

function showNotification(message, type = 'info') {
    // Criar toast
    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas fa-${icons[type] || 'info-circle'}"></i>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // Posicionar toast
    const toasts = document.querySelectorAll('.notification-toast');
    toast.style.bottom = `${(toasts.length - 1) * 70 + 20}px`;
    
    // Remover após 5 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
                // Reorganizar toasts restantes
                reorganizeToasts();
            }
        }, 300);
    }, 5000);
}

function reorganizeToasts() {
    const toasts = document.querySelectorAll('.notification-toast');
    toasts.forEach((toast, index) => {
        toast.style.bottom = `${index * 70 + 20}px`;
    });
}

function showSupportModal() {
    alert(`📞 SUPORTE ECLIPSEXPLOITS\n\nPara suporte, entre em contato:\n\n• Discord: discord.gg/eclipsexploits\n• Email: suporte@eclipsexploits.com\n\nHorário de atendimento: 24/7`);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function scrollChatToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }
}

// ==============================================
// LOGOUT
// ==============================================

async function logoutUser() {
    try {
        // Remover da lista de online users
        if (currentUser) {
            await database.ref('online_users/' + currentUser.uid).remove();
        }
        
        // Fazer logout
        await auth.signOut();
        showNotification('Logout realizado!', 'info');
        
        // Log de logout
        await logSecurityEvent(
            "USER_LOGOUT",
            `Usuário ${currentUser?.email} fez logout`,
            currentUser?.uid,
            userIP
        );
        
    } catch (error) {
        console.error("❌ Erro ao fazer logout:", error);
        showNotification('Erro ao fazer logout', 'error');
    }
}

// ==============================================
// ANTI-DEVTOOLS PROTECTION
// ==============================================

function setupDevToolsDetection() {
    // Detectar F12
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.shiftKey && e.key === 'C') ||
            (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
            triggerDevToolsDetection();
        }
    });
    
    // Detectar clique direito
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        triggerDevToolsDetection();
        return false;
    });
    
    // Detectar abertura de DevTools via tamanho da trena
    let devToolsOpen = false;
    
    function checkDevTools() {
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        
        if (widthThreshold || heightThreshold) {
            if (!devToolsOpen) {
                devToolsOpen = true;
                triggerDevToolsDetection();
            }
        } else {
            devToolsOpen = false;
        }
    }
    
    setInterval(checkDevTools, 1000);
}

function triggerDevToolsDetection() {
    const warning = document.getElementById('devtools-detected');
    if (warning) {
        warning.style.display = 'flex';
        
        // Log de segurança
        if (isAdminUser) {
            logSecurityEvent(
                "DEVTOOLS_ACCESS",
                "Tentativa de acesso às ferramentas de desenvolvimento",
                currentUser?.uid,
                userIP
            );
        }
        
        // Auto-esconder após 5 segundos
        setTimeout(() => {
            warning.style.display = 'none';
        }, 5000);
    }
}

// ==============================================
// ADMIN PANEL TABS
// ==============================================

function showAdminTab(tabName) {
    // Atualizar tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.admin-tab[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Mostrar painel
    document.querySelectorAll('.admin-panel-content').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tabName}Panel`)?.classList.add('active');
    
    // Carregar dados específicos da tab
    switch(tabName) {
        case 'security':
            loadSecurityLogs();
            break;
        case 'bans':
            loadBansList();
            break;
        case 'logs':
            refreshLogs();
            break;
        case 'chat':
            loadAdminChat();
            break;
    }
}

async function loadAdminChat() {
    if (!isAdminUser) return;
    
    try {
        const chatContainer = document.getElementById('adminChatMessages');
        if (!chatContainer) return;
        
        const snapshot = await database.ref('chat').limitToLast(100).orderByChild('timestamp').once('value');
        chatContainer.innerHTML = '';
        
        if (!snapshot.exists()) {
            chatContainer.innerHTML = '<div class="empty-state">Nenhuma mensagem no chat</div>';
            return;
        }
        
        const messages = [];
        snapshot.forEach((childSnapshot) => {
            messages.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        // Ordenar por timestamp (mais recentes primeiro)
        messages.sort((a, b) => b.timestamp - a.timestamp);
        
        // Mostrar mensagens
        messages.forEach((message) => {
            const messageElement = createAdminChatMessageElement(message);
            chatContainer.appendChild(messageElement);
        });
        
    } catch (error) {
        console.error("❌ Erro ao carregar chat admin:", error);
    }
}

function createAdminChatMessageElement(message) {
    const div = document.createElement('div');
    div.className = 'admin-chat-message';
    div.dataset.messageId = message.id;
    
    const time = new Date(message.timestamp);
    const timeStr = time.toLocaleDateString('pt-BR') + ' ' + time.toLocaleTimeString('pt-BR');
    
    const isSystemMessage = message.userId === 'system';
    const isAdminMessage = message.isAdmin || false;
    
    div.innerHTML = `
        <div class="message-header">
            <div class="message-user">
                <strong>${isSystemMessage ? '🤖 Sistema' : escapeHtml(message.userName || 'Usuário')}</strong>
                ${isAdminMessage ? '<span class="admin-badge">ADMIN</span>' : ''}
                <span class="message-ip">${message.userIP || 'IP desconhecido'}</span>
            </div>
            <div class="message-time">${timeStr}</div>
        </div>
        <div class="message-text">${escapeHtml(message.text)}</div>
        <div class="message-actions">
            <button onclick="showDeleteMessageModal('${message.id}')" class="btn btn-sm btn-danger">
                <i class="fas fa-trash"></i> Excluir
            </button>
            <button onclick="banUserByMessage('${message.id}')" class="btn btn-sm btn-warning">
                <i class="fas fa-ban"></i> Banir
            </button>
        </div>
    `;
    
    return div;
}

window.banUserByMessage = async function(messageId) {
    if (!isAdminUser) return;
    
    try {
        const snapshot = await database.ref('chat/' + messageId).once('value');
        const message = snapshot.val();
        
        if (!message) {
            showNotification('Mensagem não encontrada', 'error');
            return;
        }
        
        const reason = prompt(`Banir usuário ${message.userName}?\n\nMotivo:`);
        if (!reason) return;
        
        // Encontrar usuário pelo userId da mensagem
        const userSnapshot = await database.ref('users').orderByChild('email').equalTo(message.userName + '@').once('value');
        
        if (userSnapshot.exists()) {
            userSnapshot.forEach(child => {
                const userId = child.key;
                const userData = child.val();
                
                // Banir usuário
                database.ref('users/' + userId).update({
                    isBanned: true,
                    banReason: reason + ' (via mensagem no chat)',
                    bannedAt: Date.now(),
                    bannedBy: currentUser.email
                });
                
                // Banir por IP também
                if (message.userIP) {
                    banUserByIP(message.userIP, reason + ' (via mensagem no chat)');
                }
                
                showNotification(`Usuário ${message.userName} banido!`, 'success');
                
                // Log de segurança
                logSecurityEvent(
                    "CHAT_BAN",
                    `Usuário ${message.userName} banido por mensagem no chat. Motivo: ${reason}`,
                    userId,
                    message.userIP
                );
            });
        } else {
            // Se não encontrar pelo email, banir pelo IP
            if (message.userIP) {
                await banUserByIP(message.userIP, reason + ' (usuário não registrado, via mensagem no chat)');
                showNotification(`IP ${message.userIP} banido!`, 'success');
            } else {
                showNotification('Não foi possível banir o usuário', 'error');
            }
        }
        
    } catch (error) {
        console.error("❌ Erro ao banir por mensagem:", error);
        showNotification('Erro ao banir usuário', 'error');
    }
};

window.refreshLogs = async function() {
    if (!isAdminUser) return;
    
    await loadSecurityLogs();
    showNotification('Logs atualizados', 'success');
};

window.clearAllLogs = async function() {
    if (!isAdminUser) return;
    
    if (!confirm('Limpar TODOS os logs de segurança?\n\nEsta ação é irreversível!')) return;
    
    try {
        await database.ref('security_logs').remove();
        showNotification('Todos os logs foram limpos!', 'success');
        loadSecurityLogs();
        
    } catch (error) {
        console.error("❌ Erro ao limpar logs:", error);
        showNotification('Erro ao limpar logs', 'error');
    }
};

// ==============================================
// INICIALIZAÇÃO COMPLETA
// ==============================================

console.log("🎉 EclipseXploits Studio - Sistema Completo Carregado!");
console.log("👑 Admin Exclusivo: " + SYSTEM_CONFIG.ADMIN_EMAIL);
console.log("🔒 Webhook de Segurança Configurado");
console.log("🌐 IP do Sistema: " + userIP);
