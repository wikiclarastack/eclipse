// CONFIGURAÇÕES DO SISTEMA ECLIPSEXPLOITS
const SYSTEM_CONFIG = {
    // ADMIN EXCLUSIVO - SOMENTE ESTE EMAIL PODE SER ADMIN
    ADMIN_EMAIL: "guizinbzsk@gmail.com",
    
    // WEBHOOK DE SEGURANÇA PARA DISCORD
    SECURITY_WEBHOOK: "https://discord.com/api/webhooks/1461120663317385399/BYvrq6F6QPwNenCbsHdWL7ML-HryAnH209fIvWJg1tGpRNX-SJOULfjfPAJrobWqCzze",
    
    // CONFIGURAÇÕES DO FIREBASE
    FIREBASE_CONFIG: {
        apiKey: "AIzaSyCeAkDlLb3cAnYQvpo2BwHSB8qktUq7Zbg",
        authDomain: "eclipsexploits.firebaseapp.com",
        databaseURL: "https://eclipsexploits-default-rtdb.firebaseio.com",
        projectId: "eclipsexploits",
        storageBucket: "eclipsexploits.firebasestorage.app",
        messagingSenderId: "126850895726",
        appId: "1:126850895726:web:94e544d9f2d373671abb7f",
        measurementId: "G-LH6C7CXH10"
    },
    
    // CONFIGURAÇÕES DO SISTEMA
    CHAT_CONFIG: {
        COOLDOWN_TIME: 3000, // 3 segundos entre mensagens
        MAX_MESSAGES: 100,   // Máximo de mensagens no chat
        MESSAGE_LENGTH: 500  // Tamanho máximo da mensagem
    },
    
    SCRIPT_CONFIG: {
        MAX_SCRIPTS: 50,     // Máximo de scripts exibidos
        ITEMS_PER_PAGE: 12   // Scripts por página
    },
    
    // CONFIGURAÇÕES DE SEGURANÇA
    SECURITY: {
        MAX_LOGIN_ATTEMPTS: 5,      // Tentativas de login
        LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutos
        SESSION_DURATION: 24 * 60 * 60 * 1000 // 24 horas
    }
};

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SYSTEM_CONFIG;
}
