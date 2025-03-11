// Usuário administrador padrão
const adminPadrao = {
    id: Date.now(),
    username: 'admin',
    password: 'Davy1009',
    role: 'administrador'
};

// Verifica se já existe algum usuário no localStorage
if (!localStorage.getItem('usuarios')) {
    localStorage.setItem('usuarios', JSON.stringify([adminPadrao]));
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const mensagemElement = document.getElementById('mensagem');
    
    const usuarios = JSON.parse(localStorage.getItem('usuarios'));
    const usuario = usuarios.find(u => u.username === username && u.password === password);
    
    if (usuario) {
        // Armazena informações do usuário logado
        localStorage.setItem('usuarioLogado', JSON.stringify({
            id: usuario.id,
            username: usuario.username,
            role: usuario.role
        }));
        
        mensagemElement.textContent = 'Login realizado com sucesso! Redirecionando...';
        mensagemElement.className = 'mensagem sucesso';
        mensagemElement.style.display = 'block';
        
        // Redireciona para a página principal após 1 segundo
        setTimeout(() => {
            window.location.href = 'admin/dashboard.html';
        }, 1000);
    } else {
        mensagemElement.textContent = 'Usuário ou senha incorretos!';
        mensagemElement.className = 'mensagem erro';
        mensagemElement.style.display = 'block';
    }
}); 