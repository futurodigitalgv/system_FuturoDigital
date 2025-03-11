// Verificar se o usuário está logado
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
if (!usuarioLogado) {
    window.location.href = '../index.html';
}

// Aguardar o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    // Atualizar informações do usuário
    const usernameElement = document.getElementById('username');
    const userRoleElement = document.getElementById('userRole');
    
    if (usernameElement && userRoleElement) {
        usernameElement.textContent = usuarioLogado.username;
        userRoleElement.textContent = usuarioLogado.role === 'administrador' ? 'Administrador' : 'Vendedor';
    }

    // Controle de acesso baseado na função do usuário
    configurarAcessoModulos();

    // Carregar logo
    carregarLogo();

    // Configurar eventos dos menus
    document.querySelectorAll('.menu-item').forEach(item => {
        if (item.id !== 'logout') {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const modulo = item.getAttribute('data-module');
                carregarModulo(modulo);
            });
        }
    });
});

// Controle de acesso baseado na função do usuário
function configurarAcessoModulos() {
    const adminOnly = document.querySelectorAll('.admin-only');
    if (usuarioLogado.role !== 'administrador') {
        adminOnly.forEach(elemento => {
            elemento.style.display = 'none';
        });
    }
}

// Gerenciar navegação entre módulos
document.querySelectorAll('.menu-item').forEach(item => {
    if (item.id !== 'logout') {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const modulo = item.getAttribute('data-module');
            carregarModulo(modulo);
        });
    }
});

// Carregar logo ao iniciar
carregarLogo();

// Função para carregar a logo
function carregarLogo() {
    const logoSalva = localStorage.getItem('logoEmpresa');
    const logoElement = document.getElementById('logoImage');
    
    if (logoSalva) {
        logoElement.src = logoSalva;
    }
}

// Função para carregar conteúdo do módulo
function carregarModulo(modulo) {
    const content = document.getElementById('content');
    
    // Limpar conteúdo atual
    content.innerHTML = '';
    
    // Carregar conteúdo específico do módulo
    switch(modulo) {
        case 'configuracoes':
            carregarModuloConfiguracoes();
            break;
        case 'usuarios':
            carregarModuloUsuarios();
            break;
        case 'produtos':
            carregarModuloProdutos();
            break;
        case 'clientes':
            carregarModuloClientes();
            break;
        case 'vendas':
            carregarModuloVendas();
            break;
        case 'ordens':
            carregarModuloOrdens();
            break;
        case 'relatorios':
            carregarModuloRelatorios();
            break;
        case 'fornecedores':
            carregarModuloFornecedores();
            break;
    }
}

// Função para carregar módulo de configurações
function carregarModuloConfiguracoes() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Configurações do Sistema</h2>
        <div class="form-group">
            <h3>Logomarca da Empresa</h3>
            <div class="logo-preview" id="logoPreview">
                <img src="${document.getElementById('logoImage').src}" alt="Preview da Logo">
            </div>
            <div class="file-input-container">
                <div class="file-input-button">
                    <i class="fas fa-upload"></i> Selecionar Nova Logo
                </div>
                <input type="file" id="logoInput" accept="image/*">
            </div>
            <p style="margin-top: 10px; color: #666;">
                Formatos aceitos: PNG, JPG, JPEG. Tamanho máximo recomendado: 1MB
            </p>
        </div>

        <div class="form-group backup-section">
            <h3>Backup e Restauração</h3>
            <div class="backup-options">
                <button onclick="realizarBackup()" class="btn-backup">
                    <i class="fas fa-download"></i> Realizar Backup
                </button>
                <div class="file-input-container">
                    <div class="file-input-button btn-restore">
                        <i class="fas fa-upload"></i> Restaurar Backup
                    </div>
                    <input type="file" id="restoreInput" accept=".json">
                </div>
            </div>
            <p style="margin-top: 10px; color: #666;">
                O backup inclui todos os dados do sistema: clientes, produtos, vendas, ordens de serviço e configurações.
            </p>
        </div>
    `;

    // Adicionar evento para upload de imagem
    document.getElementById('logoInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB
                alert('A imagem é muito grande. Por favor, selecione uma imagem menor que 1MB.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const logoPreview = document.querySelector('#logoPreview img');
                const logoSidebar = document.getElementById('logoImage');
                
                logoPreview.src = event.target.result;
                logoSidebar.src = event.target.result;
                
                // Salvar no localStorage
                localStorage.setItem('logoEmpresa', event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // Adicionar evento para restauração de backup
    document.getElementById('restoreInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const backupData = JSON.parse(event.target.result);
                    
                    // Verificar se o arquivo é um backup válido
                    if (!backupData.timestamp || !backupData.data) {
                        alert('Arquivo de backup inválido!');
                        return;
                    }

                    if (confirm('Tem certeza que deseja restaurar este backup? Todos os dados atuais serão substituídos.')) {
                        // Restaurar todos os dados do backup
                        Object.keys(backupData.data).forEach(key => {
                            localStorage.setItem(key, JSON.stringify(backupData.data[key]));
                        });

                        alert('Backup restaurado com sucesso! A página será recarregada.');
                        window.location.reload();
                    }
                } catch (error) {
                    console.error('Erro ao restaurar backup:', error);
                    alert('Erro ao restaurar o backup. O arquivo pode estar corrompido.');
                }
            };
            reader.readAsText(file);
        }
    });
}

// Função para realizar backup
function realizarBackup() {
    try {
        // Coletar todos os dados do localStorage
        const backupData = {
            timestamp: new Date().toISOString(),
            data: {
                clientes: JSON.parse(localStorage.getItem('clientes')) || [],
                produtos: JSON.parse(localStorage.getItem('produtos')) || [],
                vendas: JSON.parse(localStorage.getItem('vendas')) || [],
                ordens: JSON.parse(localStorage.getItem('ordens')) || [],
                usuarios: JSON.parse(localStorage.getItem('usuarios')) || [],
                logoEmpresa: localStorage.getItem('logoEmpresa'),
                usuarioLogado: JSON.parse(localStorage.getItem('usuarioLogado'))
            }
        };

        // Criar blob e link para download
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_sistema_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        alert('Backup realizado com sucesso!');
    } catch (error) {
        console.error('Erro ao realizar backup:', error);
        alert('Erro ao realizar o backup. Por favor, tente novamente.');
    }
}

// Função para carregar módulo de usuários
function carregarModuloUsuarios() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Gerenciamento de Usuários</h2>
        <form id="usuarioForm">
            <input type="hidden" name="id" id="usuarioId">
            <div class="form-group">
                <label>Nome de Usuário:</label>
                <input type="text" name="username" required>
            </div>
            <div class="form-group" id="senhaGroup">
                <label>Senha:</label>
                <input type="password" name="password">
                <small class="form-text">Deixe em branco para manter a senha atual ao editar</small>
            </div>
            <div class="form-group">
                <label>Função:</label>
                <select name="role" required>
                    <option value="vendedor">Vendedor</option>
                    <option value="administrador">Administrador</option>
                </select>
            </div>
            <button type="submit" id="btnSubmitUsuario">Cadastrar Usuário</button>
            <button type="button" id="btnCancelarUsuario" style="display: none; background-color: #6c757d;">Cancelar</button>
        </form>

        <div style="margin-top: 30px;">
            <h3>Usuários Cadastrados</h3>
            <div id="listaUsuarios"></div>
        </div>
    `;

    function atualizarListaUsuarios() {
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const listaElement = document.getElementById('listaUsuarios');
        
        if (usuarios.length === 0) {
            listaElement.innerHTML = '<p>Nenhum usuário cadastrado.</p>';
            return;
        }

        let html = `
            <table>
                <tr>
                    <th>Nome de Usuário</th>
                    <th>Função</th>
                    <th>Ações</th>
                </tr>
        `;

        usuarios.forEach(usuario => {
            html += `
                <tr>
                    <td>${usuario.username}</td>
                    <td>${usuario.role === 'administrador' ? 'Administrador' : 'Vendedor'}</td>
                    <td>
                        <button onclick="editarUsuario(${usuario.id})" class="btn-editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="excluirUsuario(${usuario.id})" class="btn-excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</table>';
        listaElement.innerHTML = html;
    }

    window.editarUsuario = function(id) {
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const usuario = usuarios.find(u => u.id === id);
        if (usuario) {
            const form = document.getElementById('usuarioForm');
            form.querySelector('[name="id"]').value = usuario.id;
            form.querySelector('[name="username"]').value = usuario.username;
            form.querySelector('[name="role"]').value = usuario.role;
            
            document.getElementById('btnSubmitUsuario').textContent = 'Atualizar Usuário';
            document.getElementById('btnCancelarUsuario').style.display = 'inline-block';
        }
    };

    window.excluirUsuario = function(id) {
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        
        if (usuarioLogado.id === id) {
            alert('Não é possível excluir o usuário atualmente logado.');
            return;
        }

        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            const usuariosAtualizados = usuarios.filter(usuario => usuario.id !== id);
            localStorage.setItem('usuarios', JSON.stringify(usuariosAtualizados));
            atualizarListaUsuarios();
        }
    };

    document.getElementById('btnCancelarUsuario').addEventListener('click', () => {
        document.getElementById('usuarioForm').reset();
        document.getElementById('usuarioId').value = '';
        document.getElementById('btnSubmitUsuario').textContent = 'Cadastrar Usuário';
        document.getElementById('btnCancelarUsuario').style.display = 'none';
    });

    document.getElementById('usuarioForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const usuarioId = formData.get('id');
        
        const usuarioData = {
            username: formData.get('username'),
            role: formData.get('role')
        };

        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

        if (usuarioId) {
            // Atualização
            const index = usuarios.findIndex(u => u.id === parseInt(usuarioId));
            if (index !== -1) {
                if (formData.get('password')) {
                    usuarioData.password = formData.get('password');
                } else {
                    usuarioData.password = usuarios[index].password;
                }
                usuarios[index] = { ...usuarios[index], ...usuarioData };
                alert('Usuário atualizado com sucesso!');
            }
        } else {
            // Novo cadastro
            if (!formData.get('password')) {
                alert('A senha é obrigatória para novos usuários!');
                return;
            }
            usuarioData.password = formData.get('password');
            usuarioData.id = Date.now();
            usuarios.push(usuarioData);
            alert('Usuário cadastrado com sucesso!');
        }

        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        e.target.reset();
        document.getElementById('btnSubmitUsuario').textContent = 'Cadastrar Usuário';
        document.getElementById('btnCancelarUsuario').style.display = 'none';
        atualizarListaUsuarios();
    });

    atualizarListaUsuarios();
}

// Função para carregar módulo de produtos
function carregarModuloProdutos() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Gerenciamento de Produtos</h2>
        <form id="produtoForm">
            <input type="hidden" name="id" id="produtoId">
            <div class="form-group">
                <label>Categoria:</label>
                <select name="categoria" required>
                    <option value="">Selecione uma categoria</option>
                    <option value="celular_novo">Celular Novo</option>
                    <option value="celular_usado">Celular Usado</option>
                    <option value="acessorios">Acessórios</option>
                    <option value="pecas">Peças</option>
                </select>
            </div>
            <div class="form-group">
                <label>Fornecedor:</label>
                <select name="fornecedorId" required>
                    <option value="">Selecione um fornecedor</option>
                </select>
            </div>
            <div class="form-group">
                <label>Nome do Produto:</label>
                <input type="text" name="nome" required>
            </div>
            <div class="form-group">
                <label>Preço de Custo:</label>
                <input type="number" name="precoCusto" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Preço de Venda:</label>
                <input type="number" name="preco" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Quantidade em Estoque:</label>
                <input type="number" name="estoque" required>
            </div>
            <button type="submit" id="btnSubmitProduto">Cadastrar Produto</button>
            <button type="button" id="btnCancelarProduto" style="display: none; background-color: #6c757d;">Cancelar</button>
        </form>

        <div style="margin-top: 30px;">
            <h3>Produtos Cadastrados</h3>
            <div class="filtro-produtos">
                <label>
                    <select id="filtroCategoria" onchange="filtrarProdutos()">
                        <option value="">Todas as categorias</option>
                        <option value="celular_novo">Celular Novo</option>
                        <option value="celular_usado">Celular Usado</option>
                        <option value="acessorios">Acessórios</option>
                        <option value="pecas">Peças</option>
                    </select>
                </label>
            </div>
            <div id="listaProdutos"></div>
        </div>
    `;

    // Carregar fornecedores no select
    function carregarFornecedores() {
        const fornecedores = JSON.parse(localStorage.getItem('fornecedores')) || [];
        const select = document.querySelector('select[name="fornecedorId"]');
        select.innerHTML = '<option value="">Selecione um fornecedor</option>';
        
        fornecedores.forEach(fornecedor => {
            const option = document.createElement('option');
            option.value = fornecedor.id;
            option.textContent = fornecedor.nome;
            select.appendChild(option);
        });
    }

    function atualizarListaProdutos() {
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        const fornecedores = JSON.parse(localStorage.getItem('fornecedores')) || [];
        const listaElement = document.getElementById('listaProdutos');
        const categoriaFiltro = document.getElementById('filtroCategoria').value;
        
        let produtosFiltrados = produtos;
        if (categoriaFiltro) {
            produtosFiltrados = produtos.filter(p => p.categoria === categoriaFiltro);
        }
        
        if (produtosFiltrados.length === 0) {
            listaElement.innerHTML = '<p>Nenhum produto cadastrado.</p>';
            return;
        }

        let html = `
            <table>
                <tr>
                    <th>Categoria</th>
                    <th>Fornecedor</th>
                    <th>Nome</th>
                    <th>Preço de Custo</th>
                    <th>Preço de Venda</th>
                    <th>Estoque</th>
                    <th>Margem</th>
                    <th>Ações</th>
                </tr>
        `;

        produtosFiltrados.forEach(produto => {
            const margem = ((produto.preco - produto.precoCusto) / produto.precoCusto * 100).toFixed(1);
            const classeMargem = margem >= 0 ? 'margem-positiva' : 'margem-negativa';
            const categoriaNome = {
                'celular_novo': 'Celular Novo',
                'celular_usado': 'Celular Usado',
                'acessorios': 'Acessórios',
                'pecas': 'Peças'
            }[produto.categoria] || produto.categoria;

            const fornecedor = fornecedores.find(f => f.id === produto.fornecedorId) || { nome: 'Fornecedor não encontrado' };

            html += `
                <tr>
                    <td>${categoriaNome}</td>
                    <td>${fornecedor.nome}</td>
                    <td>${produto.nome}</td>
                    <td>R$ ${produto.precoCusto}</td>
                    <td>R$ ${produto.preco}</td>
                    <td>${produto.estoque}</td>
                    <td class="${classeMargem}">${margem}%</td>
                    <td>
                        <button onclick="editarProduto(${produto.id})" class="btn-editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="excluirProduto(${produto.id})" class="btn-excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</table>';
        listaElement.innerHTML = html;
    }

    window.filtrarProdutos = function() {
        atualizarListaProdutos();
    };

    window.editarProduto = function(id) {
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        const produto = produtos.find(p => p.id === id);
        if (produto) {
            const form = document.getElementById('produtoForm');
            form.querySelector('[name="id"]').value = produto.id;
            form.querySelector('[name="categoria"]').value = produto.categoria;
            form.querySelector('[name="fornecedorId"]').value = produto.fornecedorId;
            form.querySelector('[name="nome"]').value = produto.nome;
            form.querySelector('[name="precoCusto"]').value = produto.precoCusto;
            form.querySelector('[name="preco"]').value = produto.preco;
            form.querySelector('[name="estoque"]').value = produto.estoque;
            
            document.getElementById('btnSubmitProduto').textContent = 'Atualizar Produto';
            document.getElementById('btnCancelarProduto').style.display = 'inline-block';
        }
    };

    window.excluirProduto = function(id) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
            const produtosAtualizados = produtos.filter(produto => produto.id !== id);
            localStorage.setItem('produtos', JSON.stringify(produtosAtualizados));
            atualizarListaProdutos();
        }
    };

    document.getElementById('btnCancelarProduto').addEventListener('click', () => {
        document.getElementById('produtoForm').reset();
        document.getElementById('produtoId').value = '';
        document.getElementById('btnSubmitProduto').textContent = 'Cadastrar Produto';
        document.getElementById('btnCancelarProduto').style.display = 'none';
    });

    document.getElementById('produtoForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const produtoId = formData.get('id');
        
        const produtoData = {
            categoria: formData.get('categoria'),
            fornecedorId: parseInt(formData.get('fornecedorId')),
            nome: formData.get('nome'),
            precoCusto: parseFloat(formData.get('precoCusto')),
            preco: parseFloat(formData.get('preco')),
            estoque: parseInt(formData.get('estoque'))
        };

        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];

        if (produtoId) {
            // Atualização
            const index = produtos.findIndex(p => p.id === parseInt(produtoId));
            if (index !== -1) {
                produtos[index] = { ...produtos[index], ...produtoData };
                alert('Produto atualizado com sucesso!');
            }
        } else {
            // Novo cadastro
            produtoData.id = Date.now();
            produtos.push(produtoData);
            alert('Produto cadastrado com sucesso!');
        }

        localStorage.setItem('produtos', JSON.stringify(produtos));
        e.target.reset();
        document.getElementById('btnSubmitProduto').textContent = 'Cadastrar Produto';
        document.getElementById('btnCancelarProduto').style.display = 'none';
        atualizarListaProdutos();
    });

    carregarFornecedores();
    atualizarListaProdutos();
}

// Função para carregar módulo de clientes
function carregarModuloClientes() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Gerenciamento de Clientes</h2>
        <form id="clienteForm">
            <input type="hidden" name="id" id="clienteId">
            <div class="form-group">
                <label>Nome Completo:</label>
                <input type="text" name="nome" required>
            </div>
            <div class="form-group">
                <label>Endereço:</label>
                <textarea name="endereco" required></textarea>
            </div>
            <div class="form-group">
                <label>Contato Principal:</label>
                <input type="tel" name="contatoPrincipal" required placeholder="(00) 00000-0000">
            </div>
            <div class="form-group">
                <label>Contato de Urgência:</label>
                <input type="tel" name="contatoUrgencia" required placeholder="(00) 00000-0000">
            </div>
            <button type="submit" id="btnSubmitCliente">Cadastrar Cliente</button>
            <button type="button" id="btnCancelarCliente" style="display: none; background-color: #6c757d;">Cancelar</button>
        </form>
        
        <div style="margin-top: 30px;">
            <h3>Clientes Cadastrados</h3>
            <div id="listaClientes"></div>
        </div>
    `;

    function atualizarListaClientes() {
        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        const listaElement = document.getElementById('listaClientes');
        
        if (clientes.length === 0) {
            listaElement.innerHTML = '<p>Nenhum cliente cadastrado.</p>';
            return;
        }

        let html = `
            <table>
                <tr>
                    <th>Nome</th>
                    <th>Endereço</th>
                    <th>Contato Principal</th>
                    <th>Contato de Urgência</th>
                    <th>Data de Cadastro</th>
                    <th>Ações</th>
                </tr>
        `;

        clientes.forEach(cliente => {
            html += `
                <tr>
                    <td>${cliente.nome}</td>
                    <td>${cliente.endereco}</td>
                    <td>${cliente.contatoPrincipal}</td>
                    <td>${cliente.contatoUrgencia}</td>
                    <td>${new Date(cliente.dataCadastro).toLocaleDateString()}</td>
                    <td>
                        <button onclick="editarCliente(${cliente.id})" class="btn-editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="excluirCliente(${cliente.id})" class="btn-excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</table>';
        listaElement.innerHTML = html;
    }

    window.editarCliente = function(id) {
        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        const cliente = clientes.find(c => c.id === id);
        if (cliente) {
            const form = document.getElementById('clienteForm');
            form.querySelector('[name="id"]').value = cliente.id;
            form.querySelector('[name="nome"]').value = cliente.nome;
            form.querySelector('[name="endereco"]').value = cliente.endereco;
            form.querySelector('[name="contatoPrincipal"]').value = cliente.contatoPrincipal;
            form.querySelector('[name="contatoUrgencia"]').value = cliente.contatoUrgencia;
            
            document.getElementById('btnSubmitCliente').textContent = 'Atualizar Cliente';
            document.getElementById('btnCancelarCliente').style.display = 'inline-block';
        }
    };

    window.excluirCliente = function(id) {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
            const clientesAtualizados = clientes.filter(cliente => cliente.id !== id);
            localStorage.setItem('clientes', JSON.stringify(clientesAtualizados));
            atualizarListaClientes();
        }
    };

    document.getElementById('btnCancelarCliente').addEventListener('click', () => {
        document.getElementById('clienteForm').reset();
        document.getElementById('clienteId').value = '';
        document.getElementById('btnSubmitCliente').textContent = 'Cadastrar Cliente';
        document.getElementById('btnCancelarCliente').style.display = 'none';
    });

    document.getElementById('clienteForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const clienteId = formData.get('id');
        
        const clienteData = {
            nome: formData.get('nome'),
            endereco: formData.get('endereco'),
            contatoPrincipal: formData.get('contatoPrincipal'),
            contatoUrgencia: formData.get('contatoUrgencia')
        };

        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];

        if (clienteId) {
            // Atualização
            const index = clientes.findIndex(c => c.id === parseInt(clienteId));
            if (index !== -1) {
                clientes[index] = { 
                    ...clientes[index], 
                    ...clienteData,
                    dataCadastro: clientes[index].dataCadastro // Manter a data de cadastro original
                };
                alert('Cliente atualizado com sucesso!');
            }
        } else {
            // Novo cadastro
            clienteData.id = Date.now();
            clienteData.dataCadastro = new Date().toISOString();
            clientes.push(clienteData);
            alert('Cliente cadastrado com sucesso!');
        }

        localStorage.setItem('clientes', JSON.stringify(clientes));
        e.target.reset();
        document.getElementById('btnSubmitCliente').textContent = 'Cadastrar Cliente';
        document.getElementById('btnCancelarCliente').style.display = 'none';
        atualizarListaClientes();
    });

    atualizarListaClientes();
}

// Função para carregar módulo de vendas
function carregarModuloVendas() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Registro de Vendas</h2>
        <form id="vendaForm">
            <div class="form-group">
                <label>Buscar Cliente:</label>
                <input type="text" id="buscarCliente" placeholder="Digite o nome do cliente">
                <div id="resultadoBusca" style="display: none;" class="resultado-busca"></div>
            </div>
            <div class="form-group">
                <label>Dados do Cliente:</label>
                <div id="dadosCliente" class="dados-cliente">
                    <p>Nenhum cliente selecionado</p>
                </div>
            </div>
            <div class="form-group">
                <label>Produto:</label>
                <select name="produto" id="selectProduto">
                    <option value="">Selecione um produto</option>
                </select>
                <div id="infoProduto" class="info-produto"></div>
            </div>
            <div class="form-group">
                <label>Quantidade:</label>
                <input type="number" name="quantidade" id="inputQuantidade" min="1">
            </div>
            <button type="button" id="btnAdicionarProduto" class="btn-adicionar">Adicionar Produto</button>
            <input type="hidden" name="clienteId" id="clienteId">
            
            <div class="lista-produtos-venda">
                <h3>Produtos da Venda</h3>
                <div id="tabelaProdutosVenda"></div>
                <div class="total-venda">
                    <p><strong>Subtotal:</strong> <span id="subtotalVenda">R$ 0,00</span></p>
                    <div class="desconto-container">
                        <div class="form-group">
                            <label>Tipo de Desconto:</label>
                            <select id="tipoDesconto" onchange="toggleDesconto()">
                                <option value="">Sem desconto</option>
                                <option value="porcentagem">Porcentagem (%)</option>
                                <option value="valor">Valor (R$)</option>
                            </select>
                        </div>
                        <div id="campoDesconto" style="display: none;">
                            <div class="form-group">
                                <label>Valor do Desconto:</label>
                                <input type="number" id="valorDesconto" step="0.01" min="0">
                            </div>
                            <button type="button" onclick="aplicarDesconto()" class="btn-desconto">Aplicar Desconto</button>
                        </div>
                    </div>
                    <p><strong>Desconto:</strong> <span id="valorDescontoExibido">R$ 0,00</span></p>
                    <p><strong>Total da Venda:</strong> <span id="totalVenda">R$ 0,00</span></p>
                </div>
            </div>

            <div class="form-group">
                <label>Forma de Pagamento:</label>
                <select name="formaPagamento" id="formaPagamento" required>
                    <option value="">Selecione a forma de pagamento</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="pix">PIX</option>
                    <option value="cartao">Cartão de Crédito</option>
                    <option value="boleto">Boleto</option>
                </select>
            </div>

            <div id="opcoesBoleto" style="display: none;">
                <div class="form-group">
                    <label>Parcelamento:</label>
                    <select name="parcelamento" id="parcelamento">
                        <option value="1">1x sem juros</option>
                        <option value="2">2x com juros (18% ao mês)</option>
                        <option value="3">3x com juros (18% ao mês)</option>
                        <option value="4">4x com juros (18% ao mês)</option>
                    </select>
                </div>
                <div id="detalhesParcelamento"></div>
            </div>
            
            <button type="submit">Finalizar Venda</button>
        </form>
    `;

    // Array para armazenar os produtos da venda
    let produtosVenda = [];

    // Carregar produtos no select
    function carregarProdutos() {
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        const select = document.querySelector('select[name="produto"]');
        select.innerHTML = '<option value="">Selecione um produto</option>';
        
        produtos.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto.id;
            option.textContent = `${produto.nome} - R$ ${produto.preco}`;
            select.appendChild(option);
        });
    }

    // Mostrar informações do produto selecionado
    document.getElementById('selectProduto').addEventListener('change', (e) => {
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        const produtoId = parseInt(e.target.value);
        const infoProduto = document.getElementById('infoProduto');
        
        if (produtoId) {
            const produto = produtos.find(p => p.id === produtoId);
            if (produto) {
                const estoqueClass = produto.estoque === 0 ? 'estoque-zero' : '';
                infoProduto.innerHTML = `
                    <div class="produto-info ${estoqueClass}">
                        <p><strong>Preço:</strong> R$ ${produto.preco}</p>
                        <p><strong>Estoque disponível:</strong> ${produto.estoque} unidades</p>
                        ${produto.estoque === 0 ? '<p class="aviso-estoque">Aviso: Produto sem estoque!</p>' : ''}
                    </div>
                `;
            }
        } else {
            infoProduto.innerHTML = '';
        }
    });

    // Função para atualizar a tabela de produtos da venda
    function atualizarTabelaProdutosVenda() {
        const tabelaProdutos = document.getElementById('tabelaProdutosVenda');
        let html = `
            <table>
                <tr>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Preço Unit.</th>
                    <th>Total</th>
                    <th>Ações</th>
                </tr>
        `;

        let subtotalVenda = 0;

        produtosVenda.forEach((item, index) => {
            const totalItem = item.quantidade * item.precoUnitario;
            subtotalVenda += totalItem;

            html += `
                <tr>
                    <td>${item.produto}</td>
                    <td>${item.quantidade}</td>
                    <td>R$ ${item.precoUnitario.toFixed(2)}</td>
                    <td>R$ ${totalItem.toFixed(2)}</td>
                    <td>
                        <button type="button" onclick="removerProdutoVenda(${index})" class="btn-excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</table>';
        tabelaProdutos.innerHTML = html;
        document.getElementById('subtotalVenda').textContent = `R$ ${subtotalVenda.toFixed(2)}`;
        atualizarTotalVenda();
    }

    // Adicionar evento para forma de pagamento
    document.getElementById('formaPagamento').addEventListener('change', function(e) {
        const opcoesBoleto = document.getElementById('opcoesBoleto');
        const detalhesParcelamento = document.getElementById('detalhesParcelamento');
        
        if (e.target.value === 'boleto') {
            opcoesBoleto.style.display = 'block';
            atualizarDetalhesParcelamento();
        } else {
            opcoesBoleto.style.display = 'none';
            detalhesParcelamento.innerHTML = '';
        }
    });

    // Adicionar evento para parcelamento
    document.getElementById('parcelamento').addEventListener('change', atualizarDetalhesParcelamento);

    function atualizarDetalhesParcelamento() {
        const parcelamento = document.getElementById('parcelamento');
        const detalhesParcelamento = document.getElementById('detalhesParcelamento');
        const totalVenda = parseFloat(document.getElementById('totalVenda').textContent.replace('R$ ', '').replace(',', '.'));
        
        if (parcelamento.value === '1') {
            detalhesParcelamento.innerHTML = `
                <p><strong>Valor Total:</strong> R$ ${totalVenda.toFixed(2)}</p>
                <p><strong>1x de:</strong> R$ ${totalVenda.toFixed(2)}</p>
            `;
        } else {
            const numParcelas = parseInt(parcelamento.value);
            const taxaJuros = 0.18; // 18% ao mês
            const valorParcela = (totalVenda * Math.pow(1 + taxaJuros, numParcelas - 1)) / numParcelas;
            const valorTotal = valorParcela * numParcelas;
            
            let html = `
                <p><strong>Valor Total com Juros:</strong> R$ ${valorTotal.toFixed(2)}</p>
                <p><strong>${numParcelas}x de:</strong> R$ ${valorParcela.toFixed(2)}</p>
                <p><strong>Juros Totais:</strong> R$ ${(valorTotal - totalVenda).toFixed(2)}</p>
            `;
            
            detalhesParcelamento.innerHTML = html;
        }
    }

    // Função para adicionar produto à venda
    window.adicionarProdutoVenda = function() {
        const formData = new FormData(document.getElementById('vendaForm'));
        const produtoId = parseInt(formData.get('produto'));
        const quantidade = parseInt(formData.get('quantidade'));

        if (!produtoId || !quantidade) {
            alert('Por favor, selecione um produto e informe a quantidade.');
            return;
        }

        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        const produto = produtos.find(p => p.id === produtoId);

        if (!produto) {
            alert('Produto não encontrado!');
            return;
        }

        if (quantidade <= 0) {
            alert('A quantidade deve ser maior que zero.');
            return;
        }

        if (produto.estoque === 0) {
            if (!confirm('Este produto está sem estoque. Deseja continuar com a venda?')) {
                return;
            }
        } else if (quantidade > produto.estoque) {
            if (!confirm(`Estoque insuficiente (${produto.estoque} unidades disponíveis). Deseja continuar com a venda?`)) {
                return;
            }
        }

        produtosVenda.push({
            produtoId: produtoId,
            produto: produto.nome,
            quantidade: quantidade,
            precoUnitario: parseFloat(produto.preco),
            total: quantidade * parseFloat(produto.preco)
        });

        atualizarTabelaProdutosVenda();
        
        // Limpar campos
        document.getElementById('selectProduto').value = '';
        document.getElementById('inputQuantidade').value = '';
        document.getElementById('infoProduto').innerHTML = '';
    };

    // Função para remover produto da venda
    window.removerProdutoVenda = function(index) {
        produtosVenda.splice(index, 1);
        atualizarTabelaProdutosVenda();
    };

    // Adicionar evento ao botão de adicionar produto
    document.getElementById('btnAdicionarProduto').addEventListener('click', adicionarProdutoVenda);

    // Implementar busca de clientes
    const inputBusca = document.getElementById('buscarCliente');
    const resultadoBusca = document.getElementById('resultadoBusca');

    inputBusca.addEventListener('input', () => {
        const termo = inputBusca.value.toLowerCase();
        if (termo.length < 2) {
            resultadoBusca.style.display = 'none';
            return;
        }

        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        const clientesFiltrados = clientes.filter(cliente => 
            cliente.nome.toLowerCase().includes(termo)
        );

        if (clientesFiltrados.length > 0) {
            resultadoBusca.innerHTML = clientesFiltrados.map(cliente => `
                <div class="cliente-item" data-id="${cliente.id}">
                    <strong>${cliente.nome}</strong><br>
                    <small>${cliente.contatoPrincipal}</small>
                </div>
            `).join('');
            resultadoBusca.style.display = 'block';
        } else {
            resultadoBusca.innerHTML = '<div class="sem-resultados">Nenhum cliente encontrado</div>';
            resultadoBusca.style.display = 'block';
        }
    });

    // Selecionar cliente
    resultadoBusca.addEventListener('click', (e) => {
        const clienteItem = e.target.closest('.cliente-item');
        if (!clienteItem) return;

        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        const clienteId = parseInt(clienteItem.dataset.id);
        const clienteSelecionado = clientes.find(c => c.id === clienteId);

        if (clienteSelecionado) {
            document.getElementById('clienteId').value = clienteSelecionado.id;
            document.getElementById('dadosCliente').innerHTML = `
                <p><strong>Nome:</strong> ${clienteSelecionado.nome}</p>
                <p><strong>Contato:</strong> ${clienteSelecionado.contatoPrincipal}</p>
                <p><strong>Endereço:</strong> ${clienteSelecionado.endereco}</p>
            `;
            inputBusca.value = clienteSelecionado.nome;
            resultadoBusca.style.display = 'none';
        }
    });

    document.getElementById('vendaForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const clienteId = document.getElementById('clienteId').value;
        const formaPagamento = document.getElementById('formaPagamento').value;

        if (!clienteId) {
            alert('Por favor, selecione um cliente para a venda.');
            return;
        }

        if (produtosVenda.length === 0) {
            alert('Por favor, adicione pelo menos um produto à venda.');
            return;
        }

        if (!formaPagamento) {
            alert('Por favor, selecione uma forma de pagamento.');
            return;
        }

        try {
            // Registrar as vendas
            const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
            const produtos = JSON.parse(localStorage.getItem('produtos')) || [];

            // Gerar número da nota
            let numeroNota = parseInt(localStorage.getItem('ultimoNumeroNota') || '0') + 1;
            const numeroNotaFormatado = numeroNota.toString().padStart(7, '0');

            // Calcular totais
            const subtotal = produtosVenda.reduce((total, item) => total + item.total, 0);
            const desconto = parseFloat(document.getElementById('valorDescontoExibido').textContent.replace('R$ ', '').replace(',', '.')) || 0;
            const total = parseFloat(document.getElementById('totalVenda').textContent.replace('R$ ', '').replace(',', '.'));

            // Criar objeto da venda
            const novaVenda = {
                id: Date.now(),
                numeroNota: numeroNotaFormatado,
                clienteId: parseInt(clienteId),
                data: new Date().toISOString(),
                formaPagamento: formaPagamento,
                produtos: produtosVenda.map(item => ({
                    produtoId: item.produtoId,
                    produto: item.produto,
                    quantidade: item.quantidade,
                    precoUnitario: item.precoUnitario,
                    total: item.total
                })),
                subtotal: subtotal,
                desconto: desconto,
                total: total
            };

            // Adicionar informações de parcelamento se for boleto
            if (formaPagamento === 'boleto') {
                const parcelamento = document.getElementById('parcelamento').value;
                const numParcelas = parseInt(parcelamento);
                if (numParcelas > 1) {
                    const taxaJuros = 0.18;
                    const valorParcela = (total * Math.pow(1 + taxaJuros, numParcelas - 1)) / numParcelas;
                    novaVenda.parcelamento = {
                        numParcelas: numParcelas,
                        valorParcela: valorParcela,
                        valorTotal: valorParcela * numParcelas,
                        juros: (valorParcela * numParcelas) - total
                    };
                }
                
                // Inicializar parcelas
                novaVenda.parcelas = [];
                const data = new Date();
                if (novaVenda.parcelamento) {
                    for (let i = 0; i < novaVenda.parcelamento.numParcelas; i++) {
                        novaVenda.parcelas.push({
                            numero: i + 1,
                            valor: novaVenda.parcelamento.valorParcela,
                            status: 'pendente',
                            dataVencimento: new Date(data.getTime() + (i * 30 * 24 * 60 * 60 * 1000)).toISOString()
                        });
                    }
                } else {
                    novaVenda.parcelas.push({
                        numero: 1,
                        valor: total,
                        status: 'pendente',
                        dataVencimento: data.toISOString()
                    });
                }
            }

            // Atualizar estoque
            produtosVenda.forEach(item => {
                const produtoIndex = produtos.findIndex(p => p.id === item.produtoId);
                if (produtoIndex !== -1) {
                    produtos[produtoIndex].estoque = Math.max(0, produtos[produtoIndex].estoque - item.quantidade);
                }
            });

            // Salvar alterações
            vendas.push(novaVenda);
            localStorage.setItem('vendas', JSON.stringify(vendas));
            localStorage.setItem('produtos', JSON.stringify(produtos));
            localStorage.setItem('ultimoNumeroNota', numeroNota);

            // Perguntar se deseja imprimir a nota
            if (confirm('Venda registrada com sucesso! Deseja imprimir a nota fiscal?')) {
                gerarNotaFiscalPDF(novaVenda);
            }

            // Limpar formulário
            e.target.reset();
            document.getElementById('dadosCliente').innerHTML = '<p>Nenhum cliente selecionado</p>';
            document.getElementById('infoProduto').innerHTML = '';
            document.getElementById('opcoesBoleto').style.display = 'none';
            document.getElementById('detalhesParcelamento').innerHTML = '';
            document.getElementById('valorDescontoExibido').textContent = 'R$ 0,00';
            produtosVenda = [];
            atualizarTabelaProdutosVenda();
            carregarProdutos();

        } catch (error) {
            console.error('Erro ao registrar venda:', error);
            alert('Erro ao registrar a venda. Por favor, tente novamente.');
        }
    });

    carregarProdutos();
}

// Adicionar após a função atualizarTabelaProdutosVenda
function toggleDesconto() {
    const tipoDesconto = document.getElementById('tipoDesconto').value;
    const campoDesconto = document.getElementById('campoDesconto');
    campoDesconto.style.display = tipoDesconto ? 'block' : 'none';
    if (!tipoDesconto) {
        document.getElementById('valorDesconto').value = '';
        document.getElementById('valorDescontoExibido').textContent = 'R$ 0,00';
        atualizarTotalVenda();
    }
}

function aplicarDesconto() {
    const tipoDesconto = document.getElementById('tipoDesconto').value;
    const valorDesconto = parseFloat(document.getElementById('valorDesconto').value);
    const subtotal = parseFloat(document.getElementById('subtotalVenda').textContent.replace('R$ ', '').replace(',', '.'));
    
    if (!valorDesconto || valorDesconto <= 0) {
        alert('Por favor, informe um valor de desconto válido.');
        return;
    }

    let descontoCalculado = 0;
    if (tipoDesconto === 'porcentagem') {
        if (valorDesconto > 100) {
            alert('O desconto não pode ser maior que 100%.');
            return;
        }
        descontoCalculado = (subtotal * valorDesconto) / 100;
    } else {
        if (valorDesconto > subtotal) {
            alert('O desconto não pode ser maior que o valor total da venda.');
            return;
        }
        descontoCalculado = valorDesconto;
    }

    // Verificar se o usuário é vendedor
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (usuarioLogado.role === 'vendedor') {
        // Solicitar aprovação do administrador
        const modalAprovacao = document.createElement('div');
        modalAprovacao.className = 'modal-aprovacao';
        modalAprovacao.innerHTML = `
            <div class="modal-content">
                <h3>Aprovação de Desconto</h3>
                <p>Por favor, solicite a aprovação do administrador para aplicar o desconto de R$ ${descontoCalculado.toFixed(2)}.</p>
                <div class="form-group">
                    <label>Usuário Administrador:</label>
                    <input type="text" id="adminUsername" placeholder="Digite o usuário do administrador">
                </div>
                <div class="form-group">
                    <label>Senha:</label>
                    <input type="password" id="adminPassword" placeholder="Digite a senha do administrador">
                </div>
                <div class="modal-buttons">
                    <button onclick="confirmarDesconto(${descontoCalculado})">Confirmar</button>
                    <button onclick="this.closest('.modal-aprovacao').remove()">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalAprovacao);
        return;
    }

    // Se for administrador, aplicar desconto diretamente
    aplicarDescontoCalculado(descontoCalculado);
}

window.confirmarDesconto = function(valorDesconto) {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    // Verificar credenciais do administrador
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const admin = usuarios.find(u => u.username === username && u.password === password && u.role === 'administrador');

    if (!admin) {
        alert('Credenciais inválidas ou usuário não é administrador.');
        return;
    }

    // Aplicar desconto após aprovação
    aplicarDescontoCalculado(valorDesconto);
    document.querySelector('.modal-aprovacao').remove();
};

function aplicarDescontoCalculado(descontoCalculado) {
    document.getElementById('valorDescontoExibido').textContent = `R$ ${descontoCalculado.toFixed(2)}`;
    atualizarTotalVenda();
}

// Modificar a função atualizarTabelaProdutosVenda
function atualizarTabelaProdutosVenda() {
    const tabelaProdutos = document.getElementById('tabelaProdutosVenda');
    let html = `
        <table>
            <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Preço Unit.</th>
                <th>Total</th>
                <th>Ações</th>
            </tr>
    `;

    let subtotalVenda = 0;

    produtosVenda.forEach((item, index) => {
        const totalItem = item.quantidade * item.precoUnitario;
        subtotalVenda += totalItem;

        html += `
            <tr>
                <td>${item.produto}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${item.precoUnitario.toFixed(2)}</td>
                <td>R$ ${totalItem.toFixed(2)}</td>
                <td>
                    <button type="button" onclick="removerProdutoVenda(${index})" class="btn-excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    html += '</table>';
    tabelaProdutos.innerHTML = html;
    document.getElementById('subtotalVenda').textContent = `R$ ${subtotalVenda.toFixed(2)}`;
    atualizarTotalVenda();
}

function atualizarTotalVenda() {
    const subtotal = parseFloat(document.getElementById('subtotalVenda').textContent.replace('R$ ', '').replace(',', '.'));
    const desconto = parseFloat(document.getElementById('valorDescontoExibido').textContent.replace('R$ ', '').replace(',', '.'));
    const total = subtotal - desconto;
    document.getElementById('totalVenda').textContent = `R$ ${total.toFixed(2)}`;
}

// Função para carregar módulo de ordens de serviço
function carregarModuloOrdens() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Ordem de Serviço</h2>
        <form id="osForm">
            <div class="form-group">
                <label>Buscar Cliente:</label>
                <input type="text" id="buscarCliente" placeholder="Digite o nome do cliente">
                <div id="resultadoBusca" style="display: none;" class="resultado-busca"></div>
            </div>
            <div class="form-group">
                <label>Dados do Cliente:</label>
                <div id="dadosCliente" class="dados-cliente">
                    <p>Nenhum cliente selecionado</p>
                </div>
            </div>
            <div class="form-group">
                <label>Tipo de Serviço:</label>
                <select name="tipoServico" id="tipoServico" required>
                    <option value="geral">Serviço Geral</option>
                    <option value="desbloqueio">Desbloqueio de Aparelho</option>
                </select>
            </div>
            <div class="form-group">
                <label>Descrição do Serviço:</label>
                <textarea name="descricao" required></textarea>
            </div>
            <div id="camposDesbloqueio" style="display: none;">
                <div class="form-group">
                    <label>Marca do Aparelho:</label>
                    <input type="text" name="marcaAparelho">
                </div>
                <div class="form-group">
                    <label>Modelo do Aparelho:</label>
                    <input type="text" name="modeloAparelho">
                </div>
                <div class="form-group">
                    <label>IMEI:</label>
                    <input type="text" name="imei" pattern="[0-9]{15}" title="Digite os 15 dígitos do IMEI">
                </div>
                <div class="form-group">
                    <label>Operadora:</label>
                    <select name="operadora">
                        <option value="">Selecione a operadora</option>
                        <option value="Vivo">Vivo</option>
                        <option value="Claro">Claro</option>
                        <option value="Tim">Tim</option>
                        <option value="Oi">Oi</option>
                        <option value="Nextel">Nextel</option>
                        <option value="Outra">Outra</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Observações Técnicas:</label>
                    <textarea name="obsTecnicas" placeholder="Informações técnicas relevantes para o desbloqueio"></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>Valor:</label>
                <input type="number" name="valor" step="0.01" required>
            </div>
            <input type="hidden" name="clienteId" id="clienteId">
            <button type="submit">Criar Ordem de Serviço</button>
        </form>

        <div style="margin-top: 30px;">
            <h3>Ordens de Serviço Ativas</h3>
            <div class="filtro-os">
                <label>
                    <input type="checkbox" id="mostrarTodas"> Mostrar todas as ordens
                </label>
            </div>
            <div id="listaOrdens"></div>
        </div>
    `;

    // Mostrar/ocultar campos específicos de desbloqueio
    document.getElementById('tipoServico').addEventListener('change', function(e) {
        const camposDesbloqueio = document.getElementById('camposDesbloqueio');
        camposDesbloqueio.style.display = e.target.value === 'desbloqueio' ? 'block' : 'none';
    });

    // Implementar busca de clientes
    const inputBusca = document.getElementById('buscarCliente');
    const resultadoBusca = document.getElementById('resultadoBusca');

    // Adicionar evento para o filtro
    document.getElementById('mostrarTodas').addEventListener('change', (e) => {
        atualizarListaOrdens(e.target.checked);
    });

    // Implementar busca de clientes
    inputBusca.addEventListener('input', () => {
        const termo = inputBusca.value.toLowerCase();
        if (termo.length < 2) {
            resultadoBusca.style.display = 'none';
            return;
        }

        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        const clientesFiltrados = clientes.filter(cliente => 
            cliente.nome.toLowerCase().includes(termo)
        );

        if (clientesFiltrados.length > 0) {
            resultadoBusca.innerHTML = clientesFiltrados.map(cliente => `
                <div class="cliente-item" data-id="${cliente.id}">
                    <strong>${cliente.nome}</strong><br>
                    <small>${cliente.contatoPrincipal}</small>
                </div>
            `).join('');
            resultadoBusca.style.display = 'block';
        } else {
            resultadoBusca.innerHTML = '<div class="sem-resultados">Nenhum cliente encontrado</div>';
            resultadoBusca.style.display = 'block';
        }
    });

    // Selecionar cliente
    resultadoBusca.addEventListener('click', (e) => {
        const clienteItem = e.target.closest('.cliente-item');
        if (!clienteItem) return;

        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        const clienteId = parseInt(clienteItem.dataset.id);
        const clienteSelecionado = clientes.find(c => c.id === clienteId);

        if (clienteSelecionado) {
            document.getElementById('clienteId').value = clienteSelecionado.id;
            document.getElementById('dadosCliente').innerHTML = `
                <p><strong>Nome:</strong> ${clienteSelecionado.nome}</p>
                <p><strong>Contato:</strong> ${clienteSelecionado.contatoPrincipal}</p>
                <p><strong>Endereço:</strong> ${clienteSelecionado.endereco}</p>
            `;
            inputBusca.value = clienteSelecionado.nome;
            resultadoBusca.style.display = 'none';
        }
    });

    function atualizarListaOrdens(mostrarTodas = false) {
        const ordens = JSON.parse(localStorage.getItem('ordens')) || [];
        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        const listaElement = document.getElementById('listaOrdens');
        
        // Filtrar apenas ordens abertas se mostrarTodas for falso
        const ordensExibidas = mostrarTodas ? ordens : ordens.filter(os => os.status === 'Aberta');
        
        if (ordensExibidas.length === 0) {
            listaElement.innerHTML = '<p>Nenhuma ordem de serviço encontrada.</p>';
            return;
        }

        let html = `
            <table>
                <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
        `;

        ordensExibidas.forEach(os => {
            const cliente = clientes.find(c => c.id === os.clienteId) || { nome: 'Cliente não encontrado' };
            const tipoServico = os.tipoServico === 'desbloqueio' ? 'Desbloqueio' : 'Geral';
            const descricao = os.tipoServico === 'desbloqueio' ? 
                `${os.marcaAparelho} ${os.modeloAparelho} - ${os.operadora}` : 
                os.descricao;

            html += `
                <tr>
                    <td>${new Date(os.data).toLocaleDateString()}</td>
                    <td>${cliente.nome}</td>
                    <td>${tipoServico}</td>
                    <td>${descricao}</td>
                    <td>R$ ${parseFloat(os.valor).toFixed(2)}</td>
                    <td>${os.status}</td>
                    <td>
                        <button onclick="gerarReciboPDF(${JSON.stringify(os)})" class="btn-recibo" title="Gerar Recibo">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                        <button onclick="alterarStatusOS(${os.id})" class="btn-editar" title="Alterar Status">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button onclick="excluirOS(${os.id})" class="btn-excluir" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</table>';
        listaElement.innerHTML = html;
    }

    window.alterarStatusOS = function(id) {
        const ordens = JSON.parse(localStorage.getItem('ordens')) || [];
        const index = ordens.findIndex(os => os.id === id);
        
        if (index !== -1) {
            const statusAtual = ordens[index].status;
            const novoStatus = statusAtual === 'Aberta' ? 'Concluída' : 'Aberta';
            ordens[index].status = novoStatus;
            localStorage.setItem('ordens', JSON.stringify(ordens));
            atualizarListaOrdens();
        }
    };

    window.excluirOS = function(id) {
        if (confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
            const ordens = JSON.parse(localStorage.getItem('ordens')) || [];
            const ordensAtualizadas = ordens.filter(os => os.id !== id);
            localStorage.setItem('ordens', JSON.stringify(ordensAtualizadas));
            atualizarListaOrdens();
        }
    };

    document.getElementById('osForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const clienteId = document.getElementById('clienteId').value;

        if (!clienteId) {
            alert('Por favor, selecione um cliente.');
            return;
        }

        const novaOS = {
            id: Date.now(),
            clienteId: parseInt(clienteId),
            tipoServico: formData.get('tipoServico'),
            descricao: formData.get('descricao'),
            valor: formData.get('valor'),
            data: new Date().toISOString(),
            status: 'Aberta'
        };

        // Adicionar campos específicos de desbloqueio se necessário
        if (novaOS.tipoServico === 'desbloqueio') {
            novaOS.marcaAparelho = formData.get('marcaAparelho');
            novaOS.modeloAparelho = formData.get('modeloAparelho');
            novaOS.imei = formData.get('imei');
            novaOS.operadora = formData.get('operadora');
            novaOS.obsTecnicas = formData.get('obsTecnicas');
        }

        const ordens = JSON.parse(localStorage.getItem('ordens')) || [];
        ordens.push(novaOS);
        localStorage.setItem('ordens', JSON.stringify(ordens));

        // Gerar recibo em PDF
        gerarReciboPDF(novaOS);

        alert('Ordem de serviço criada com sucesso!');
        e.target.reset();
        document.getElementById('dadosCliente').innerHTML = '<p>Nenhum cliente selecionado</p>';
        document.getElementById('camposDesbloqueio').style.display = 'none';
        atualizarListaOrdens();
    });

    atualizarListaOrdens();
}

// Função para gerar recibo em PDF
function gerarReciboPDF(ordem) {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const cliente = clientes.find(c => c.id === ordem.clienteId);
    
    if (!cliente) {
        alert('Erro ao gerar recibo: cliente não encontrado');
        return;
    }

    // Criar novo documento PDF com tamanho 1/4 de A4
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'cm',
        format: [10.5, 14.85]
    });

    // Adicionar logomarca como marca d'água
    const logoEmpresa = localStorage.getItem('logoEmpresa');
    if (logoEmpresa) {
        // Criar uma imagem temporária para obter as dimensões
        const img = new Image();
        img.src = logoEmpresa;
        
        // Calcular dimensões para centralizar a logo
        const maxWidth = 9; // Aumentado de 8 para 9 cm
        const maxHeight = 8; // Aumentado de 6 para 8 cm
        let logoWidth = maxWidth;
        let logoHeight = (img.height * maxWidth) / img.width;
        
        if (logoHeight > maxHeight) {
            logoHeight = maxHeight;
            logoWidth = (img.width * maxHeight) / img.height;
        }

        // Calcular posição central
        const x = (10.5 - logoWidth) / 2;
        const y = (14.85 - logoHeight) / 2;

        // Adicionar a imagem com transparência
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.3 })); // Aumentado de 0.1 para 0.3
        doc.addImage(logoEmpresa, 'PNG', x, y, logoWidth, logoHeight);
        doc.restoreGraphicsState();
    }

    // Configurar fonte e tamanho
    doc.setFont('helvetica');
    doc.setFontSize(12);

    // Adicionar conteúdo
    doc.text('RECIBO DE ORDEM DE SERVIÇO', 5.25, 1, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Nº OS: ${ordem.id}`, 1, 2);
    doc.text(`Data: ${new Date(ordem.data).toLocaleDateString()}`, 1, 3);
    
    doc.text('Cliente:', 1, 4);
    doc.text(cliente.nome, 1, 4.5);
    
    doc.text('Descrição do Serviço:', 1, 6);
    
    // Se for desbloqueio, mostrar informações específicas
    if (ordem.tipoServico === 'desbloqueio') {
        doc.text(`Tipo: Desbloqueio de Aparelho`, 1, 6.5);
        doc.text(`Aparelho: ${ordem.marcaAparelho} ${ordem.modeloAparelho}`, 1, 7);
        doc.text(`IMEI: ${ordem.imei}`, 1, 7.5);
        doc.text(`Operadora: ${ordem.operadora}`, 1, 8);
        
        if (ordem.obsTecnicas) {
            doc.text('Observações Técnicas:', 1, 9);
            const linhasObs = doc.splitTextToSize(ordem.obsTecnicas, 8);
            doc.text(linhasObs, 1, 9.5);
        }
        
        doc.text(`Valor: R$ ${parseFloat(ordem.valor).toFixed(2)}`, 1, 10.5);

        // Adicionar declaração do cliente
        doc.setFontSize(8);
        doc.text('DECLARAÇÃO:', 1, 11);
        const declaracao = "Declaro que o aparelho é de minha propriedade e não é proveniente de furto/roubo/extravio. Estou ciente das penalidades.";
        const linhasDeclaracao = doc.splitTextToSize(declaracao, 8);
        doc.text(linhasDeclaracao, 1, 11.5);
        
        // Linha para assinatura
        doc.setLineWidth(0.1); // Define a espessura da linha como 0.1
        doc.line(1, 13, 9.5, 13);
        doc.text('Assinatura do Cliente', 3.5, 13.5);

        // Adicionar rodapé
        doc.setFontSize(8);
        doc.text('Futuro Digital - Solução em Celular', 5.25, 14, { align: 'center' });
        doc.text('R. Santo Onofre, 12, Vila Mariana - GV - (33) 98832-2820', 5.25, 14.4, { align: 'center' });
    } else {
        // Para serviços gerais
        const linhasDescricao = doc.splitTextToSize(ordem.descricao, 8);
        doc.text(linhasDescricao, 1, 6.5);
        doc.text(`Valor: R$ ${parseFloat(ordem.valor).toFixed(2)}`, 1, 9);
        
        // Linha para assinatura
        doc.setLineWidth(0.1); // Define a espessura da linha como 0.1
        doc.line(1, 11, 9.5, 11);
        doc.text('Assinatura do Cliente', 3.5, 11.5);

        // Adicionar rodapé
        doc.setFontSize(8);
        doc.text('Futuro Digital - Solução em Celular', 5.25, 13.5, { align: 'center' });
        doc.text('R. Santo Onofre, 12, Vila Mariana - GV - (33) 98832-2820', 5.25, 13.9, { align: 'center' });
    }

    // Salvar PDF
    doc.save(`recibo_os_${ordem.id}.pdf`);
}

// Função para carregar módulo de relatórios
function carregarModuloRelatorios() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Relatórios</h2>
        <div class="filtro-periodo">
            <div class="form-group">
                <label>Período:</label>
                <div class="periodo-inputs">
                    <input type="date" id="dataInicial" placeholder="Data Inicial">
                    <span>até</span>
                    <input type="date" id="dataFinal" placeholder="Data Final">
                </div>
            </div>
        </div>
        <div class="form-group">
            <button onclick="gerarRelatorioVendas()">Relatório de Vendas</button>
            <button onclick="gerarRelatorioProdutos()">Relatório de Produtos</button>
            <button onclick="gerarRelatorioOS()">Relatório de Ordens de Serviço</button>
            <button onclick="gerarRelatorioClientes()">Relatório por Cliente</button>
            <button onclick="gerarRelatorioContasReceber()">Contas a Receber</button>
            <button onclick="gerarBalancoFinanceiro()">Balanço Financeiro</button>
            <button onclick="gerarBalancoEstoque()">Balanço de Estoque</button>
        </div>
        <div id="relatorio-resultado"></div>
    `;
}

// Função auxiliar para filtrar por período
function filtrarPorPeriodo(dados, dataInicial, dataFinal) {
    if (!dataInicial && !dataFinal) return dados;
    
    return dados.filter(item => {
        // Garantir que a data do item seja válida
        if (!item.data) return false;
        
        // Se tiver apenas data final, usar ela como data inicial também
        if (!dataInicial && dataFinal) {
            dataInicial = dataFinal;
        }
        
        // Se tiver apenas data inicial, usar ela como data final também
        if (dataInicial && !dataFinal) {
            dataFinal = dataInicial;
        }
        
        // Criar novas instâncias de Date para não modificar as originais
        const dataItem = new Date(item.data);
        
        // Ajustar as datas de início e fim para o fuso horário local
        const inicio = new Date(dataInicial + 'T00:00:00');
        const fim = new Date(dataFinal + 'T23:59:59.999');
        
        // Comparar as datas
        return dataItem >= inicio && dataItem <= fim;
    });
}

// Função para gerar o rodapé padrão dos relatórios
function gerarRodapeRelatorio() {
    return `
        <div class="relatorio-footer">
            <p>Futuro Digital - Solução em Celular</p>
            <p>R. Santo Onofre, 12, Vila Mariana - GV</p>
            <p>(33) 98832-2820</p>
        </div>
    `;
}

// Funções para gerar relatórios
function gerarRelatorioVendas() {
    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const resultado = document.getElementById('relatorio-resultado');
    
    // Obter datas do filtro
    const dataInicial = document.getElementById('dataInicial').value;
    const dataFinal = document.getElementById('dataFinal').value;
    
    // Filtrar vendas por período
    const vendasFiltradas = filtrarPorPeriodo(vendas, dataInicial, dataFinal);
    
    let html = '<h3>Relatório de Vendas</h3>';
    
    // Adicionar período do relatório
    if (dataInicial || dataFinal) {
        html += `<p class="periodo-relatorio">`;
        if (dataInicial) html += `De: ${new Date(dataInicial).toLocaleDateString('pt-BR')}`;
        if (dataInicial && dataFinal) html += ' até ';
        if (dataFinal) html += `Até: ${new Date(dataFinal).toLocaleDateString('pt-BR')}`;
        html += '</p>';
    }
    
    if (vendasFiltradas.length === 0) {
        resultado.innerHTML = '<p>Nenhuma venda registrada no período selecionado.</p>';
        return;
    }

    let totalGeral = 0;
    let quantidadeTotal = 0;

    html += `
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Preço Unit.</th>
                    <th>Total</th>
                    <th>Forma de Pagamento</th>
                </tr>
            </thead>
            <tbody>
    `;

    vendasFiltradas.forEach(venda => {
        try {
            const cliente = clientes.find(c => c.id === venda.clienteId) || { nome: 'Cliente não encontrado' };
            const quantidade = parseInt(venda.quantidade) || 0;
            const precoUnitario = parseFloat(venda.precoUnitario) || 0;
            const totalItem = venda.total || (quantidade * precoUnitario);

            totalGeral += totalItem;
            quantidadeTotal += quantidade;

            const data = new Date(venda.data);
            const dataFormatada = data.toLocaleDateString('pt-BR');

            // Formatar forma de pagamento
            let formaPagamento = venda.formaPagamento.charAt(0).toUpperCase() + venda.formaPagamento.slice(1);
            if (venda.formaPagamento === 'boleto' && venda.parcelamento) {
                formaPagamento += ` (${venda.parcelamento.numParcelas}x)`;
            }

            html += `
                <tr>
                    <td>${dataFormatada}</td>
                    <td>${cliente.nome}</td>
                    <td>${venda.produto}</td>
                    <td style="text-align: center">${quantidade}</td>
                    <td style="text-align: right">R$ ${precoUnitario.toFixed(2)}</td>
                    <td style="text-align: right">R$ ${totalItem.toFixed(2)}</td>
                    <td>${formaPagamento}</td>
                </tr>
            `;
        } catch (error) {
            console.error('Erro ao processar venda:', error);
        }
    });

    html += `
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="5"><strong>Totais:</strong></td>
                    <td style="text-align: right"><strong>R$ ${totalGeral.toFixed(2)}</strong></td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
        <div class="resumo-os">
            <p><strong>Quantidade de Vendas:</strong> ${vendasFiltradas.length}</p>
            <p><strong>Quantidade Total de Itens:</strong> ${quantidadeTotal}</p>
            <p><strong>Valor Total:</strong> R$ ${totalGeral.toFixed(2)}</p>
        </div>
        ${gerarRodapeRelatorio()}
    `;

    resultado.innerHTML = html;
}

function gerarRelatorioProdutos() {
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const resultado = document.getElementById('relatorio-resultado');
    
    let html = '<h3>Relatório de Produtos</h3>';
    if (produtos.length === 0) {
        html += '<p>Nenhum produto cadastrado.</p>';
    } else {
        html += `
            <table border="1">
                <tr>
                    <th>Nome</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                </tr>
        `;
        produtos.forEach(produto => {
            html += `
                <tr>
                    <td>${produto.nome}</td>
                    <td>R$ ${produto.preco}</td>
                    <td>${produto.estoque}</td>
                </tr>
            `;
        });
        html += '</table>';
    }
    html += `</table>${gerarRodapeRelatorio()}`;
    resultado.innerHTML = html;
}

function gerarRelatorioOS() {
    const ordens = JSON.parse(localStorage.getItem('ordens')) || [];
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const resultado = document.getElementById('relatorio-resultado');
    
    // Obter datas do filtro
    const dataInicial = document.getElementById('dataInicial').value;
    const dataFinal = document.getElementById('dataFinal').value;
    
    // Filtrar ordens por período
    const ordensFiltradas = filtrarPorPeriodo(ordens, dataInicial, dataFinal);
    
    let html = '<h3>Relatório de Ordens de Serviço</h3>';
    
    // Adicionar período do relatório
    if (dataInicial || dataFinal) {
        html += `<p class="periodo-relatorio">`;
        if (dataInicial) html += `De: ${new Date(dataInicial).toLocaleDateString('pt-BR')}`;
        if (dataInicial && dataFinal) html += ' até ';
        if (dataFinal) html += `Até: ${new Date(dataFinal).toLocaleDateString('pt-BR')}`;
        html += '</p>';
    }
    
    if (ordensFiltradas.length === 0) {
        html += '<p>Nenhuma ordem de serviço registrada no período selecionado.</p>';
    } else {
        let totalGeral = 0;
        let ordensAbertas = 0;
        let ordensConcluidas = 0;

        html += `
            <table>
                <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Status</th>
                </tr>
        `;
        ordensFiltradas.forEach(os => {
            const cliente = clientes.find(c => c.id === os.clienteId) || { nome: 'Cliente não encontrado' };
            const valor = parseFloat(os.valor);
            totalGeral += valor;
            
            if (os.status === 'Aberta') ordensAbertas++;
            if (os.status === 'Concluída') ordensConcluidas++;

            html += `
                <tr>
                    <td>${new Date(os.data).toLocaleDateString()}</td>
                    <td>${cliente.nome}</td>
                    <td>${os.descricao}</td>
                    <td>R$ ${valor.toFixed(2)}</td>
                    <td>${os.status}</td>
                </tr>
            `;
        });
        html += `
            <tr class="total-row">
                <td colspan="3"><strong>Total Geral:</strong></td>
                <td colspan="2"><strong>R$ ${totalGeral.toFixed(2)}</strong></td>
            </tr>
        </table>
        <div class="resumo-os">
            <p><strong>Total de Ordens:</strong> ${ordensFiltradas.length}</p>
            <p><strong>Ordens Abertas:</strong> ${ordensAbertas}</p>
            <p><strong>Ordens Concluídas:</strong> ${ordensConcluidas}</p>
        </div>
        ${gerarRodapeRelatorio()}
    `;
    }
    resultado.innerHTML = html;
}

// Função para gerar relatório por cliente
function gerarRelatorioClientes() {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    const ordens = JSON.parse(localStorage.getItem('ordens')) || [];
    const resultado = document.getElementById('relatorio-resultado');
    
    // Obter datas do filtro
    const dataInicial = document.getElementById('dataInicial').value;
    const dataFinal = document.getElementById('dataFinal').value;
    
    // Filtrar vendas e ordens por período
    const vendasFiltradas = filtrarPorPeriodo(vendas, dataInicial, dataFinal);
    const ordensFiltradas = filtrarPorPeriodo(ordens, dataInicial, dataFinal);
    
    resultado.innerHTML = `
        <h3>Relatório por Cliente</h3>
        ${(dataInicial || dataFinal) ? `
            <p class="periodo-relatorio">
                ${dataInicial ? `De: ${new Date(dataInicial).toLocaleDateString('pt-BR')}` : ''}
                ${dataInicial && dataFinal ? ' até ' : ''}
                ${dataFinal ? `Até: ${new Date(dataFinal).toLocaleDateString('pt-BR')}` : ''}
            </p>
        ` : ''}
        <div class="filtro-cliente">
            <div class="form-group">
                <label>Buscar Cliente:</label>
                <input type="text" id="buscarClienteRelatorio" placeholder="Digite o nome do cliente">
                <div id="resultadoBuscaRelatorio" style="display: none;" class="resultado-busca"></div>
            </div>
            <div id="clienteSelecionadoInfo"></div>
        </div>
    `;

    if (clientes.length === 0) {
        resultado.innerHTML += '<p>Nenhum cliente cadastrado.</p>';
        return;
    }

    // Implementar busca de clientes
    const inputBusca = document.getElementById('buscarClienteRelatorio');
    const resultadoBusca = document.getElementById('resultadoBuscaRelatorio');

    function gerarRelatorioClienteEspecifico(clienteId) {
        const cliente = clientes.find(c => c.id === clienteId);
        if (!cliente) return;

        const vendasCliente = vendasFiltradas.filter(v => v.clienteId === cliente.id);
        const ordensCliente = ordensFiltradas.filter(o => o.clienteId === cliente.id);
        
        const totalVendas = vendasCliente.reduce((total, venda) => total + (parseFloat(venda.total) || 0), 0);
        const totalOrdens = ordensCliente.reduce((total, ordem) => total + (parseFloat(ordem.valor) || 0), 0);
        
        let html = `
            <div class="cliente-relatorio">
                <h4>${cliente.nome}</h4>
                <p><strong>Contato:</strong> ${cliente.contatoPrincipal}</p>
                <p><strong>Endereço:</strong> ${cliente.endereco}</p>
                
                <div class="resumo-cliente">
                    <p><strong>Total em Vendas:</strong> R$ ${totalVendas.toFixed(2)}</p>
                    <p><strong>Total em Ordens de Serviço:</strong> R$ ${totalOrdens.toFixed(2)}</p>
                    <p><strong>Total Geral:</strong> R$ ${(totalVendas + totalOrdens).toFixed(2)}</p>
                </div>`;

        if (vendasCliente.length > 0) {
            html += `
                <h5>Vendas</h5>
                <table>
                    <tr>
                        <th>Data</th>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Preço Unit.</th>
                        <th>Total</th>
                    </tr>`;
            
            vendasCliente.forEach(venda => {
                const data = new Date(venda.data).toLocaleDateString('pt-BR');
                html += `
                    <tr>
                        <td>${data}</td>
                        <td>${venda.produto}</td>
                        <td style="text-align: center">${venda.quantidade}</td>
                        <td style="text-align: right">R$ ${parseFloat(venda.precoUnitario).toFixed(2)}</td>
                        <td style="text-align: right">R$ ${parseFloat(venda.total).toFixed(2)}</td>
                    </tr>`;
            });
            
            html += '</table>';
        } else {
            html += '<p>Nenhuma venda registrada para este cliente no período selecionado.</p>';
        }

        if (ordensCliente.length > 0) {
            html += `
                <h5>Ordens de Serviço</h5>
                <table>
                    <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Valor</th>
                        <th>Status</th>
                    </tr>`;
            
            ordensCliente.forEach(ordem => {
                const data = new Date(ordem.data).toLocaleDateString('pt-BR');
                html += `
                    <tr>
                        <td>${data}</td>
                        <td>${ordem.descricao}</td>
                        <td style="text-align: right">R$ ${parseFloat(ordem.valor).toFixed(2)}</td>
                        <td>${ordem.status}</td>
                    </tr>`;
            });
            
            html += '</table>';
        } else {
            html += '<p>Nenhuma ordem de serviço registrada para este cliente no período selecionado.</p>';
        }

        html += '</div>';
        
        document.getElementById('clienteSelecionadoInfo').innerHTML = html;
    }

    inputBusca.addEventListener('input', () => {
        const termo = inputBusca.value.toLowerCase();
        if (termo.length < 2) {
            resultadoBusca.style.display = 'none';
            return;
        }

        const clientesFiltrados = clientes.filter(cliente => 
            cliente.nome.toLowerCase().includes(termo)
        );

        if (clientesFiltrados.length > 0) {
            resultadoBusca.innerHTML = clientesFiltrados.map(cliente => `
                <div class="cliente-item" data-id="${cliente.id}">
                    <strong>${cliente.nome}</strong><br>
                    <small>${cliente.contatoPrincipal}</small>
                </div>
            `).join('');
            resultadoBusca.style.display = 'block';
        } else {
            resultadoBusca.innerHTML = '<div class="sem-resultados">Nenhum cliente encontrado</div>';
            resultadoBusca.style.display = 'block';
        }
    });

    resultadoBusca.addEventListener('click', (e) => {
        const clienteItem = e.target.closest('.cliente-item');
        if (!clienteItem) return;

        const clienteId = parseInt(clienteItem.dataset.id);
        inputBusca.value = clientes.find(c => c.id === clienteId)?.nome || '';
        resultadoBusca.style.display = 'none';
        
        gerarRelatorioClienteEspecifico(clienteId);
    });
}

// Função para gerar relatório de contas a receber
function gerarRelatorioContasReceber() {
    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const resultado = document.getElementById('relatorio-resultado');
    
    // Obter datas do filtro
    const dataInicial = document.getElementById('dataInicial').value;
    const dataFinal = document.getElementById('dataFinal').value;
    
    // Filtrar vendas por período e apenas boletos
    const vendasFiltradas = filtrarPorPeriodo(vendas, dataInicial, dataFinal)
        .filter(venda => venda.formaPagamento === 'boleto');
    
    let html = '<h3>Contas a Receber</h3>';
    
    // Adicionar período do relatório
    if (dataInicial || dataFinal) {
        html += `<p class="periodo-relatorio">`;
        if (dataInicial) html += `De: ${new Date(dataInicial).toLocaleDateString('pt-BR')}`;
        if (dataInicial && dataFinal) html += ' até ';
        if (dataFinal) html += `Até: ${new Date(dataFinal).toLocaleDateString('pt-BR')}`;
        html += '</p>';
    }
    
    if (vendasFiltradas.length === 0) {
        resultado.innerHTML = '<p>Nenhuma venda com boleto registrada no período selecionado.</p>';
        return;
    }

    let totalPendente = 0;
    let totalRecebido = 0;

    html += `
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Produto</th>
                    <th>Valor Total</th>
                    <th>Parcelas</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    vendasFiltradas.forEach(venda => {
        const cliente = clientes.find(c => c.id === venda.clienteId) || { nome: 'Cliente não encontrado' };
        const data = new Date(venda.data);
        const dataFormatada = data.toLocaleDateString('pt-BR');
        
        // Inicializar parcelas se não existirem
        if (!venda.parcelas) {
            venda.parcelas = [];
            if (venda.parcelamento) {
                for (let i = 0; i < venda.parcelamento.numParcelas; i++) {
                    venda.parcelas.push({
                        numero: i + 1,
                        valor: venda.parcelamento.valorParcela,
                        status: 'pendente',
                        dataVencimento: new Date(data.getTime() + (i * 30 * 24 * 60 * 60 * 1000)).toISOString()
                    });
                }
            } else {
                venda.parcelas.push({
                    numero: 1,
                    valor: venda.total,
                    status: 'pendente',
                    dataVencimento: data.toISOString()
                });
            }
        }

        const parcelasPendentes = venda.parcelas.filter(p => p.status === 'pendente');
        const valorPendente = parcelasPendentes.reduce((total, p) => total + p.valor, 0);
        const valorRecebido = venda.parcelas.reduce((total, p) => total + (p.status === 'pago' ? p.valor : 0), 0);
        
        totalPendente += valorPendente;
        totalRecebido += valorRecebido;

        html += `
            <tr>
                <td>${dataFormatada}</td>
                <td>${cliente.nome}</td>
                <td>${venda.produto}</td>
                <td style="text-align: right">R$ ${parseFloat(venda.total).toFixed(2)}</td>
                <td>
                    <div class="parcelas-container">
                        ${venda.parcelas.map(parcela => `
                            <div class="parcela-item status-${parcela.status}">
                                <span>${parcela.numero}x de R$ ${parcela.valor.toFixed(2)}</span>
                                ${parcela.status === 'pendente' ? `
                                    <button onclick="marcarParcelaPaga(${venda.id}, ${parcela.numero})" class="btn-marcar-pago">
                                        <i class="fas fa-check"></i> Marcar como Pago
                                    </button>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </td>
                <td>${parcelasPendentes.length === 0 ? 'Pago' : 'Pendente'}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="3"><strong>Totais:</strong></td>
                    <td style="text-align: right"><strong>R$ ${(totalPendente + totalRecebido).toFixed(2)}</strong></td>
                    <td colspan="2">
                        <strong>Pendente: R$ ${totalPendente.toFixed(2)}</strong><br>
                        <strong>Recebido: R$ ${totalRecebido.toFixed(2)}</strong>
                    </td>
                </tr>
            </tfoot>
        </table>
        ${gerarRodapeRelatorio()}
    `;

    resultado.innerHTML = html;
}

// Nova função para marcar parcela como paga
window.marcarParcelaPaga = function(vendaId, numeroParcela) {
    try {
        // Obter todas as vendas do localStorage
        const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
        
        // Encontrar a venda específica
        const vendaIndex = vendas.findIndex(v => v.id === vendaId);
        
        if (vendaIndex === -1) {
            throw new Error('Venda não encontrada');
        }

        // Obter a venda
        const venda = vendas[vendaIndex];
        
        // Verificar se a venda tem parcelas
        if (!venda.parcelas || !Array.isArray(venda.parcelas)) {
            throw new Error('Venda não possui parcelas');
        }

        // Encontrar a parcela específica
        const parcelaIndex = venda.parcelas.findIndex(p => p.numero === numeroParcela);
        
        if (parcelaIndex === -1) {
            throw new Error('Parcela não encontrada');
        }

        // Verificar se a parcela já está paga
        if (venda.parcelas[parcelaIndex].status === 'pago') {
            throw new Error('Parcela já está marcada como paga');
        }

        // Atualizar o status da parcela
        venda.parcelas[parcelaIndex].status = 'pago';
        
        // Atualizar a venda no array de vendas
        vendas[vendaIndex] = venda;
        
        // Salvar as alterações no localStorage
        localStorage.setItem('vendas', JSON.stringify(vendas));
        
        // Atualizar o relatório
        gerarRelatorioContasReceber();
        
        alert('Parcela marcada como paga com sucesso!');
    } catch (error) {
        console.error('Erro ao marcar parcela como paga:', error);
        alert(error.message || 'Erro ao marcar parcela como paga. Por favor, tente novamente.');
    }
};

// Configurar logout
document.getElementById('logout').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('usuarioLogado');
    window.location.href = '../index.html';
});

// Inicializar a página
configurarAcessoModulos();

// Função para carregar módulo de fornecedores
function carregarModuloFornecedores() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Gerenciamento de Fornecedores</h2>
        <form id="fornecedorForm">
            <input type="hidden" name="id" id="fornecedorId">
            <div class="form-group">
                <label>Nome do Fornecedor:</label>
                <input type="text" name="nome" required>
            </div>
            <div class="form-group">
                <label>Endereço:</label>
                <textarea name="endereco" required></textarea>
            </div>
            <div class="form-group">
                <label>Telefone:</label>
                <input type="tel" name="telefone" required placeholder="(00) 00000-0000">
            </div>
            <button type="submit" id="btnSubmitFornecedor">Cadastrar Fornecedor</button>
            <button type="button" id="btnCancelarFornecedor" style="display: none; background-color: #6c757d;">Cancelar</button>
        </form>

        <div style="margin-top: 30px;">
            <h3>Fornecedores Cadastrados</h3>
            <div id="listaFornecedores"></div>
        </div>
    `;

    function atualizarListaFornecedores() {
        const fornecedores = JSON.parse(localStorage.getItem('fornecedores')) || [];
        const listaElement = document.getElementById('listaFornecedores');
        
        if (fornecedores.length === 0) {
            listaElement.innerHTML = '<p>Nenhum fornecedor cadastrado.</p>';
            return;
        }

        let html = `
            <table>
                <tr>
                    <th>Nome</th>
                    <th>Endereço</th>
                    <th>Telefone</th>
                    <th>Ações</th>
                </tr>
        `;

        fornecedores.forEach(fornecedor => {
            html += `
                <tr>
                    <td>${fornecedor.nome}</td>
                    <td>${fornecedor.endereco}</td>
                    <td>${fornecedor.telefone}</td>
                    <td>
                        <button onclick="editarFornecedor(${fornecedor.id})" class="btn-editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="excluirFornecedor(${fornecedor.id})" class="btn-excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</table>';
        listaElement.innerHTML = html;
    }

    window.editarFornecedor = function(id) {
        const fornecedores = JSON.parse(localStorage.getItem('fornecedores')) || [];
        const fornecedor = fornecedores.find(f => f.id === id);
        if (fornecedor) {
            const form = document.getElementById('fornecedorForm');
            form.querySelector('[name="id"]').value = fornecedor.id;
            form.querySelector('[name="nome"]').value = fornecedor.nome;
            form.querySelector('[name="endereco"]').value = fornecedor.endereco;
            form.querySelector('[name="telefone"]').value = fornecedor.telefone;
            
            document.getElementById('btnSubmitFornecedor').textContent = 'Atualizar Fornecedor';
            document.getElementById('btnCancelarFornecedor').style.display = 'inline-block';
        }
    };

    window.excluirFornecedor = function(id) {
        if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
            const fornecedores = JSON.parse(localStorage.getItem('fornecedores')) || [];
            const fornecedoresAtualizados = fornecedores.filter(fornecedor => fornecedor.id !== id);
            localStorage.setItem('fornecedores', JSON.stringify(fornecedoresAtualizados));
            atualizarListaFornecedores();
        }
    };

    document.getElementById('btnCancelarFornecedor').addEventListener('click', () => {
        document.getElementById('fornecedorForm').reset();
        document.getElementById('fornecedorId').value = '';
        document.getElementById('btnSubmitFornecedor').textContent = 'Cadastrar Fornecedor';
        document.getElementById('btnCancelarFornecedor').style.display = 'none';
    });

    document.getElementById('fornecedorForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const fornecedorId = formData.get('id');
        
        const fornecedorData = {
            nome: formData.get('nome'),
            endereco: formData.get('endereco'),
            telefone: formData.get('telefone')
        };

        const fornecedores = JSON.parse(localStorage.getItem('fornecedores')) || [];

        if (fornecedorId) {
            // Atualização
            const index = fornecedores.findIndex(f => f.id === parseInt(fornecedorId));
            if (index !== -1) {
                fornecedores[index] = { ...fornecedores[index], ...fornecedorData };
                alert('Fornecedor atualizado com sucesso!');
            }
        } else {
            // Novo cadastro
            fornecedorData.id = Date.now();
            fornecedores.push(fornecedorData);
            alert('Fornecedor cadastrado com sucesso!');
        }

        localStorage.setItem('fornecedores', JSON.stringify(fornecedores));
        e.target.reset();
        document.getElementById('btnSubmitFornecedor').textContent = 'Cadastrar Fornecedor';
        document.getElementById('btnCancelarFornecedor').style.display = 'none';
        atualizarListaFornecedores();
    });

    atualizarListaFornecedores();
}

// Função para gerar balanço financeiro
function gerarBalancoFinanceiro() {
    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const ordens = JSON.parse(localStorage.getItem('ordens')) || [];
    const resultado = document.getElementById('relatorio-resultado');
    
    // Obter datas do filtro
    const dataInicial = document.getElementById('dataInicial').value;
    const dataFinal = document.getElementById('dataFinal').value;
    
    // Filtrar vendas e ordens por período
    const vendasFiltradas = filtrarPorPeriodo(vendas, dataInicial, dataFinal);
    const ordensFiltradas = filtrarPorPeriodo(ordens, dataInicial, dataFinal);
    
    let html = '<h3>Balanço Financeiro</h3>';
    
    // Adicionar período do relatório
    if (dataInicial || dataFinal) {
        html += `<p class="periodo-relatorio">`;
        if (dataInicial) html += `De: ${new Date(dataInicial).toLocaleDateString('pt-BR')}`;
        if (dataInicial && dataFinal) html += ' até ';
        if (dataFinal) html += `Até: ${new Date(dataFinal).toLocaleDateString('pt-BR')}`;
        html += '</p>';
    }

    // Calcular totais
    let totalVendas = 0;
    let totalCusto = 0;
    let quantidadeVendas = vendasFiltradas.length;
    let quantidadeOS = ordensFiltradas.length;
    let totalOS = 0;

    // Calcular valores das vendas
    vendasFiltradas.forEach(venda => {
        const produto = produtos.find(p => p.id === venda.produtoId);
        if (produto) {
            totalVendas += venda.total || (venda.quantidade * venda.precoUnitario);
            totalCusto += produto.precoCusto * venda.quantidade;
        }
    });

    // Calcular valores das ordens de serviço
    ordensFiltradas.forEach(ordem => {
        totalOS += parseFloat(ordem.valor);
    });

    // Calcular lucro total
    const lucroVendas = totalVendas - totalCusto;
    const lucroTotal = lucroVendas + totalOS;

    // Gerar HTML do relatório
    html += `
        <div class="balanco-financeiro">
            <div class="resumo-balanco">
                <h4>Resumo de Vendas</h4>
                <table>
                    <tr>
                        <th>Descrição</th>
                        <th>Quantidade</th>
                        <th>Valor</th>
                    </tr>
                    <tr>
                        <td>Total de Vendas</td>
                        <td style="text-align: center">${quantidadeVendas}</td>
                        <td style="text-align: right">R$ ${totalVendas.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Custo Total</td>
                        <td style="text-align: center">-</td>
                        <td style="text-align: right">R$ ${totalCusto.toFixed(2)}</td>
                    </tr>
                    <tr class="destaque">
                        <td>Lucro em Vendas</td>
                        <td style="text-align: center">-</td>
                        <td style="text-align: right">R$ ${lucroVendas.toFixed(2)}</td>
                    </tr>
                </table>

                <h4>Resumo de Serviços</h4>
                <table>
                    <tr>
                        <th>Descrição</th>
                        <th>Quantidade</th>
                        <th>Valor</th>
                    </tr>
                    <tr>
                        <td>Ordens de Serviço</td>
                        <td style="text-align: center">${quantidadeOS}</td>
                        <td style="text-align: right">R$ ${totalOS.toFixed(2)}</td>
                    </tr>
                </table>

                <h4>Resultado Final</h4>
                <table>
                    <tr>
                        <th>Descrição</th>
                        <th>Valor</th>
                    </tr>
                    <tr class="total-row">
                        <td><strong>Lucro Total</strong></td>
                        <td style="text-align: right"><strong>R$ ${lucroTotal.toFixed(2)}</strong></td>
                    </tr>
                </table>
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <button onclick="gerarBalancoPDF()" class="btn-recibo">
                    <i class="fas fa-file-pdf"></i> Imprimir Balanço
                </button>
            </div>
        </div>
        ${gerarRodapeRelatorio()}
    `;

    resultado.innerHTML = html;
}

// Função para gerar PDF do balanço
function gerarBalancoPDF() {
    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const ordens = JSON.parse(localStorage.getItem('ordens')) || [];
    
    // Obter datas do filtro
    const dataInicial = document.getElementById('dataInicial').value;
    const dataFinal = document.getElementById('dataFinal').value;
    
    // Filtrar dados por período
    const vendasFiltradas = filtrarPorPeriodo(vendas, dataInicial, dataFinal);
    const ordensFiltradas = filtrarPorPeriodo(ordens, dataInicial, dataFinal);

    // Calcular totais
    let totalVendas = 0;
    let totalCusto = 0;
    let quantidadeVendas = vendasFiltradas.length;
    let quantidadeOS = ordensFiltradas.length;
    let totalOS = 0;

    vendasFiltradas.forEach(venda => {
        const produto = produtos.find(p => p.id === venda.produtoId);
        if (produto) {
            totalVendas += venda.total || (venda.quantidade * venda.precoUnitario);
            totalCusto += produto.precoCusto * venda.quantidade;
        }
    });

    ordensFiltradas.forEach(ordem => {
        totalOS += parseFloat(ordem.valor);
    });

    const lucroVendas = totalVendas - totalCusto;
    const lucroTotal = lucroVendas + totalOS;

    // Criar PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configurar fonte e tamanho
    doc.setFont('helvetica');
    doc.setFontSize(16);

    // Título
    doc.text('Balanço Financeiro', 105, 20, { align: 'center' });
    
    // Período
    doc.setFontSize(12);
    if (dataInicial || dataFinal) {
        let textoPeriodo = 'Período: ';
        if (dataInicial) textoPeriodo += `De ${new Date(dataInicial).toLocaleDateString('pt-BR')}`;
        if (dataInicial && dataFinal) textoPeriodo += ' até ';
        if (dataFinal) textoPeriodo += `${new Date(dataFinal).toLocaleDateString('pt-BR')}`;
        doc.text(textoPeriodo, 105, 30, { align: 'center' });
    }

    // Resumo de Vendas
    doc.setFontSize(14);
    doc.text('Resumo de Vendas', 20, 45);
    doc.setFontSize(12);
    doc.text(`Quantidade de Vendas: ${quantidadeVendas}`, 20, 55);
    doc.text(`Total em Vendas: R$ ${totalVendas.toFixed(2)}`, 20, 65);
    doc.text(`Custo Total: R$ ${totalCusto.toFixed(2)}`, 20, 75);
    doc.text(`Lucro em Vendas: R$ ${lucroVendas.toFixed(2)}`, 20, 85);

    // Resumo de Serviços
    doc.setFontSize(14);
    doc.text('Resumo de Serviços', 20, 100);
    doc.setFontSize(12);
    doc.text(`Quantidade de OS: ${quantidadeOS}`, 20, 110);
    doc.text(`Total em Serviços: R$ ${totalOS.toFixed(2)}`, 20, 120);

    // Resultado Final
    doc.setFontSize(14);
    doc.text('Resultado Final', 20, 135);
    doc.setFontSize(12);
    doc.text(`Lucro Total: R$ ${lucroTotal.toFixed(2)}`, 20, 145);

    // Adicionar rodapé
    doc.setFontSize(10);
    doc.text('Futuro Digital - Solução em Celular', 105, 270, { align: 'center' });
    doc.text('R. Santo Onofre, 12, Vila Mariana - GV - (33) 98832-2820', 105, 275, { align: 'center' });

    // Salvar PDF
    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    doc.save(`balanco_financeiro_${dataAtual}.pdf`);
}

// Função para gerar balanço de estoque
function gerarBalancoEstoque() {
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const resultado = document.getElementById('relatorio-resultado');
    
    let html = '<h3>Balanço de Estoque</h3>';
    
    if (produtos.length === 0) {
        html += '<p>Nenhum produto cadastrado.</p>';
    } else {
        // Calcular totais
        let totalItens = 0;
        let totalValor = 0;
        let produtosBaixoEstoque = 0;
        
        // Filtrar produtos com estoque > 0 e ordenar por quantidade
        const produtosOrdenados = [...produtos]
            .filter(p => p.estoque > 0)
            .sort((a, b) => a.estoque - b.estoque);
        
        if (produtosOrdenados.length === 0) {
            html += '<p>Nenhum produto com estoque disponível.</p>';
            resultado.innerHTML = html;
            return;
        }
        
        html += `
            <table>
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Quantidade</th>
                        <th>Preço de Custo</th>
                        <th>Valor Total</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        produtosOrdenados.forEach(produto => {
            const valorTotal = produto.estoque * produto.precoCusto;
            totalItens += produto.estoque;
            totalValor += valorTotal;
            
            // Determinar status do estoque
            let status = '';
            let statusClass = '';
            if (produto.estoque <= 3) {
                status = 'Estoque Baixo';
                statusClass = 'status-baixo';
                produtosBaixoEstoque++;
            } else {
                status = 'Normal';
                statusClass = 'status-normal';
            }
            
            html += `
                <tr>
                    <td>${produto.nome}</td>
                    <td>${produto.categoria}</td>
                    <td style="text-align: center">${produto.estoque}</td>
                    <td style="text-align: right">R$ ${produto.precoCusto.toFixed(2)}</td>
                    <td style="text-align: right">R$ ${valorTotal.toFixed(2)}</td>
                    <td class="${statusClass}">${status}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="2"><strong>Totais:</strong></td>
                        <td style="text-align: center"><strong>${totalItens}</strong></td>
                        <td></td>
                        <td style="text-align: right"><strong>R$ ${totalValor.toFixed(2)}</strong></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
            <div class="resumo-estoque">
                <p><strong>Total de Produtos em Estoque:</strong> ${produtosOrdenados.length}</p>
                <p><strong>Total de Itens em Estoque:</strong> ${totalItens}</p>
                <p><strong>Valor Total em Estoque:</strong> R$ ${totalValor.toFixed(2)}</p>
                <p><strong>Produtos com Estoque Baixo:</strong> ${produtosBaixoEstoque}</p>
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <button onclick="gerarBalancoEstoquePDF()" class="btn-recibo">
                    <i class="fas fa-file-pdf"></i> Imprimir Balanço
                </button>
            </div>
            ${gerarRodapeRelatorio()}
        `;
    }
    
    resultado.innerHTML = html;
}

// Função para gerar PDF do balanço de estoque
function gerarBalancoEstoquePDF() {
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    
    // Filtrar produtos com estoque > 0
    const produtosComEstoque = produtos.filter(p => p.estoque > 0);
    
    if (produtosComEstoque.length === 0) {
        alert('Não há produtos com estoque disponível para gerar o relatório.');
        return;
    }
    
    // Criar PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurar fonte e tamanho
    doc.setFont('helvetica');
    doc.setFontSize(16);
    
    // Título
    doc.text('Balanço de Estoque', 105, 20, { align: 'center' });
    
    // Data do relatório
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 105, 30, { align: 'center' });
    
    // Calcular totais
    let totalItens = 0;
    let totalValor = 0;
    let produtosBaixoEstoque = 0;
    
    produtosComEstoque.forEach(produto => {
        totalItens += produto.estoque;
        totalValor += produto.estoque * produto.precoCusto;
        if (produto.estoque <= 3) produtosBaixoEstoque++;
    });
    
    // Resumo
    doc.setFontSize(14);
    doc.text('Resumo', 20, 45);
    doc.setFontSize(12);
    doc.text(`Total de Produtos em Estoque: ${produtosComEstoque.length}`, 20, 55);
    doc.text(`Total de Itens em Estoque: ${totalItens}`, 20, 65);
    doc.text(`Valor Total em Estoque: R$ ${totalValor.toFixed(2)}`, 20, 75);
    doc.text(`Produtos com Estoque Baixo: ${produtosBaixoEstoque}`, 20, 85);
    
    // Tabela de produtos
    doc.setFontSize(14);
    doc.text('Produtos', 20, 100);
    
    // Cabeçalho da tabela
    doc.setFontSize(10);
    doc.text('Produto', 20, 110);
    doc.text('Categoria', 60, 110);
    doc.text('Qtd', 100, 110);
    doc.text('Preço Custo', 120, 110);
    doc.text('Valor Total', 150, 110);
    
    // Dados da tabela
    let y = 120;
    produtosComEstoque.forEach(produto => {
        const valorTotal = produto.estoque * produto.precoCusto;
        
        // Verificar se precisa de nova página
        if (y > 250) {
            doc.addPage();
            y = 20;
        }
        
        doc.text(produto.nome, 20, y);
        doc.text(produto.categoria, 60, y);
        doc.text(produto.estoque.toString(), 100, y);
        doc.text(`R$ ${produto.precoCusto.toFixed(2)}`, 120, y);
        doc.text(`R$ ${valorTotal.toFixed(2)}`, 150, y);
        
        y += 10;
    });
    
    // Totais
    y += 5;
    doc.setFontSize(12);
    doc.text('Totais:', 20, y);
    doc.text(totalItens.toString(), 100, y);
    doc.text(`R$ ${totalValor.toFixed(2)}`, 150, y);
    
    // Adicionar rodapé
    doc.setFontSize(10);
    doc.text('Futuro Digital - Solução em Celular', 105, 270, { align: 'center' });
    doc.text('R. Santo Onofre, 12, Vila Mariana - GV - (33) 98832-2820', 105, 275, { align: 'center' });
    
    // Salvar PDF
    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    doc.save(`balanco_estoque_${dataAtual}.pdf`);
}

// Função para gerar nota fiscal em PDF
function gerarNotaFiscalPDF(venda) {
    try {
        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        const cliente = clientes.find(c => c.id === venda.clienteId);
        
        if (!cliente) {
            throw new Error('Cliente não encontrado');
        }

        // Criar novo documento PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Configurar fonte e tamanho
        doc.setFont('helvetica');
        
        // Adicionar logomarca como marca d'água
        const logoEmpresa = localStorage.getItem('logoEmpresa');
        if (logoEmpresa) {
            try {
                const img = new Image();
                img.src = logoEmpresa;
                
                // Calcular dimensões para centralizar a logo
                const maxWidth = 150; // Aumentado de 100 para 150 mm
                const maxHeight = 150; // Aumentado de 100 para 150 mm
                let logoWidth = maxWidth;
                let logoHeight = (img.height * maxWidth) / img.width;
                
                if (logoHeight > maxHeight) {
                    logoHeight = maxHeight;
                    logoWidth = (img.width * maxHeight) / img.height;
                }

                // Calcular posição central
                const x = (210 - logoWidth) / 2;
                const y = (297 - logoHeight) / 2;

                // Adicionar a imagem com transparência
                doc.saveGraphicsState();
                doc.setGState(new doc.GState({ opacity: 0.3 })); // Aumentado de 0.1 para 0.3
                doc.addImage(logoEmpresa, 'PNG', x, y, logoWidth, logoHeight);
                doc.restoreGraphicsState();
            } catch (logoError) {
                console.error('Erro ao adicionar logo:', logoError);
            }
        }

        // Cabeçalho
        doc.setFontSize(18);
        doc.text('NOTA FISCAL', 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text('Futuro Digital LTDA', 105, 30, { align: 'center' });
        doc.text('CNPJ: 56.251.644/0001-07', 105, 35, { align: 'center' });
        doc.text('R. Santo Onofre, 12 - Vila Mariana', 105, 40, { align: 'center' });
        doc.text('Gov. Valadares - MG', 105, 45, { align: 'center' });
        doc.text('Telefone: (33) 98832-2820', 105, 50, { align: 'center' });

        // Número da nota e data
        doc.setFontSize(12);
        doc.text(`Nota Fiscal Nº: ${venda.numeroNota}`, 20, 65);
        doc.text(`Data: ${new Date(venda.data).toLocaleDateString('pt-BR')}`, 20, 70);

        // Dados do cliente
        doc.text('Dados do Cliente:', 20, 85);
        doc.setFontSize(10);
        doc.text(`Nome: ${cliente.nome}`, 20, 92);
        doc.text(`Endereço: ${cliente.endereco}`, 20, 97);
        doc.text(`Contato: ${cliente.contatoPrincipal}`, 20, 102);

        // Tabela de produtos
        doc.setFontSize(12);
        doc.text('Produtos:', 20, 115);
        
        // Cabeçalho da tabela
        doc.setFontSize(10);
        doc.text('Descrição', 20, 122);
        doc.text('Qtd', 120, 122);
        doc.text('Valor Unit.', 140, 122);
        doc.text('Total', 170, 122);
        
        // Linha separadora
        doc.line(20, 124, 190, 124);
        
        let y = 130;
        
        // Produtos
        doc.setFontSize(9);
        venda.produtos.forEach(item => {
            doc.text(item.produto.toString(), 20, y);
            doc.text(item.quantidade.toString(), 120, y);
            doc.text(`R$ ${item.precoUnitario.toFixed(2)}`, 140, y);
            doc.text(`R$ ${item.total.toFixed(2)}`, 170, y);
            y += 6;
        });
        
        // Linha separadora
        doc.line(20, y, 190, y);
        y += 10;

        // Totais
        doc.setFontSize(10);
        doc.text('Subtotal:', 140, y);
        doc.text(`R$ ${venda.subtotal.toFixed(2)}`, 170, y);
        y += 6;
        
        if (venda.desconto > 0) {
            doc.text('Desconto:', 140, y);
            doc.text(`R$ ${venda.desconto.toFixed(2)}`, 170, y);
            y += 6;
        }
        
        doc.setFontSize(12);
        doc.text('Total:', 140, y);
        doc.text(`R$ ${venda.total.toFixed(2)}`, 170, y);
        y += 15;

        // Forma de pagamento
        doc.setFontSize(10);
        doc.text(`Forma de Pagamento: ${venda.formaPagamento.toUpperCase()}`, 20, y);
        
        if (venda.formaPagamento === 'boleto' && venda.parcelamento) {
            y += 6;
            doc.text(`Parcelamento: ${venda.parcelamento.numParcelas}x de R$ ${venda.parcelamento.valorParcela.toFixed(2)}`, 20, y);
        }

        // Salvar PDF
        doc.save(`nota_fiscal_${venda.numeroNota}.pdf`);
    } catch (error) {
        console.error('Erro ao gerar nota fiscal:', error);
        alert('Erro ao gerar a nota fiscal. Por favor, tente novamente.');
    }
}