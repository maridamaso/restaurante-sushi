//const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// URL do back-end
const backendURL = 'https://18bdfc01-208c-419a-b83b-1aa45e2161a6-00-xnwb2u0j0zgo.picard.replit.dev';

//Header
// Variável global para controlar o estado de login do usuário
let isLoggedIn = false;

// Função para verificar a role do usuário e exibir o botão de edição se for "Funcionario"
function verificarRoleUsuario() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role === 'Funcionario') {
        document.getElementById('editContentButton').style.display = 'block';
    } else {
        document.getElementById('editContentButton').style.display = 'none';
    }

    if (user && user.role === 'Cliente') {
        fetch(`${backendURL}/reviews?username=${user.username}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    document.getElementById('addReviewButton').style.display = 'none';
                    document.getElementById('editReviewButton').style.display = 'block';
                } else {
                    document.getElementById('addReviewButton').style.display = 'block';
                    document.getElementById('editReviewButton').style.display = 'none';
                }
            })
            .catch(error => console.error('Erro ao verificar reviews do usuário:', error));
    } else {
        document.getElementById('addReviewButton').style.display = 'none';
        document.getElementById('editReviewButton').style.display = 'none';
    }
}

// Inicio navegação responsiva

// Função para alternar a visibilidade do menu em telas menores
function toggleMenu() {
    var nav = document.querySelector('nav');
    nav.classList.toggle('open');
}
// Evento de clique no botão de menu
document.querySelector('.menu-icon').addEventListener('click', function() {
    toggleMenu();
});

// Fim navegação

// Função para criar um item de menu

function createMenuItem(item) {
  const itemDiv = document.createElement('div');
  itemDiv.classList.add('menu-item');

  const img = document.createElement('img');
  img.src = item.imageUrl;
  itemDiv.appendChild(img);

  const name = document.createElement('h3');
  name.textContent = item.name;
  itemDiv.appendChild(name);

  const separator = document.createElement('h3');
  separator.textContent = '-------------------------';
  itemDiv.appendChild(separator);

  const price = document.createElement('h3');
  price.textContent = item.price;
  itemDiv.appendChild(price);

  return itemDiv;
}

// Função para preencher as seções do menu
function fillMenuSection(sectionClass, items) {
  const section = document.querySelector(`.${sectionClass}`);
  const itemsContainer = section.querySelector(`.${sectionClass}-item`);

  items.forEach(item => {
      // Mova a chamada da função createMenuItem() para dentro do loop
      const menuItem = createMenuItem(item);
      itemsContainer.appendChild(menuItem);
  });
}

// Fazer requisição ao backend para obter os dados do cardápio
fetch('${backendURL}/menu')
.then(response => response.json())
.then(data => {
    // Preencher as seções do menu com os dados recebidos
    fillMenuSection('appetizers', data.appetizers);
    fillMenuSection('maincourses', data.maincourses);
    fillMenuSection('desserts', data.desserts);
    fillMenuSection('drinks', data.drinks);
})
.catch(error => console.error('Erro ao carregar os dados do menu:', error));

// Função para adicionar um novo item (em modo de edição)
function addNewItem(section) {
    const sectionClass = {
        appetizers: 'appetizers-edit-item',
        maincourses: 'maincourses-edit-item',
        desserts: 'desserts-edit-item',
        drinks: 'drinks-edit-item'
    }[section];

    const sectionContainer = document.querySelector(`.${sectionClass}`);
    if (!sectionContainer) {
        console.error(`Section container not found for ${sectionClass}`);
        return;
    }

    const itemDiv = document.createElement('div');
    itemDiv.classList.add('edit-item');

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.classList.add('item-name');
    nameInput.placeholder = 'Nome do Item';
    nameInput.autocomplete = 'off'; // Add autocomplete attribute
    itemDiv.appendChild(nameInput);

    const priceInput = document.createElement('input');
    priceInput.type = 'text';
    priceInput.classList.add('item-price');
    priceInput.placeholder = 'Preço do Item';
    priceInput.autocomplete = 'off'; // Add autocomplete attribute
    itemDiv.appendChild(priceInput);

    const imageUrlInput = document.createElement('input');
    imageUrlInput.type = 'text';
    imageUrlInput.classList.add('item-image');
    imageUrlInput.placeholder = 'URL da Imagem';
    imageUrlInput.autocomplete = 'off'; // Add autocomplete attribute
    itemDiv.appendChild(imageUrlInput);

    const imageFileInput = document.createElement('input');
    imageFileInput.type = 'file';
    imageFileInput.classList.add('item-image-file');
    itemDiv.appendChild(imageFileInput);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Salvar';
    saveButton.onclick = () => {
        const name = nameInput.value;
        const price = priceInput.value;
        let imageUrl = imageUrlInput.value;

        if (imageFileInput.files && imageFileInput.files[0]) {
            const file = imageFileInput.files[0];
            const maxSize = 1 * 1024 * 1024; // 1MB em bytes

            if (file.size > maxSize) {
                alert('O arquivo é muito grande. O tamanho máximo permitido é 1MB.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                imageUrl = e.target.result;
                saveNewItem(section, name, price, imageUrl, itemDiv);
            };
            reader.readAsDataURL(file);
        } else {
            saveNewItem(section, name, price, imageUrl, itemDiv);
        }
    };
    itemDiv.appendChild(saveButton);

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remover';
    removeButton.onclick = () => itemDiv.remove();
    itemDiv.appendChild(removeButton);

    sectionContainer.appendChild(itemDiv);
}
// Função para salvar um novo item (em modo de edição)
function saveNewItem(section, name, price, imageUrl, itemDiv) {
    itemDiv.querySelector('.item-image').value = imageUrl;
    itemDiv.querySelector('.item-name').value = name;
    itemDiv.querySelector('.item-price').value = price;

    itemDiv.querySelector('button').remove(); // Remove o botão "Salvar" após salvar

    const editButton = document.createElement('button');
    editButton.textContent = 'Editar';
    editButton.onclick = () => editarItem(itemDiv);
    itemDiv.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Excluir';
    deleteButton.onclick = () => excluirItem(itemDiv);
    itemDiv.appendChild(deleteButton);

    alert('Novo item salvo com sucesso!');
}

// Função para remover um item
function removeItem(button) {
    button.parentElement.remove();
}

// Função para salvar alterações
function salvarAlteracoes() {
    const updatedMenuData = {
        appetizers: [],
        maincourses: [],
        desserts: [],
        drinks: []
    };

    ['appetizers', 'maincourses', 'desserts', 'drinks'].forEach(section => {
        const sectionItems = document.querySelectorAll(`.${section}-edit-item .edit-item`);
        sectionItems.forEach(item => {
            const name = item.querySelector('.item-name').value;
            const price = item.querySelector('.item-price').value;
            const imageUrl = item.querySelector('.item-image').value;
            if (name && price && imageUrl) {
                updatedMenuData[section].push({ name, price, imageUrl });
            }
        });
    });
    
    console.log('Dados atualizados para envio:', updatedMenuData); // Log dos dados a serem enviados

    fetch('${backendURL}/menu', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMenuData),
    })
    .then(response => response.json())
    .then(data => {
        alert('Menu atualizado com sucesso');
        mostrarPagina('cardapio');
        document.querySelector('.editar-cardapio').style.display = 'none';
        atualizarCardapio();
    })
    .catch(error => console.error('Erro ao atualizar o menu:', error));
}

// Função para atualizar a página de cardápio com as novas alterações
function atualizarCardapio() {
    fetch('${backendURL}/menu')
    .then(response => response.json())
    .then(data => {
        document.querySelector('.appetizers-item').innerHTML = '';
        document.querySelector('.maincourses-item').innerHTML = '';
        document.querySelector('.desserts-item').innerHTML = '';
        document.querySelector('.drinks-item').innerHTML = '';

        fillMenuSection('appetizers', data.appetizers);
        fillMenuSection('maincourses', data.maincourses);
        fillMenuSection('desserts', data.desserts);
        fillMenuSection('drinks', data.drinks);
    })
    .catch(error => console.error('Erro ao carregar os dados do menu:', error));
}

// Função para ocultar a página editar-cardapio
function ocultarEditarCardapio() {
    document.querySelector('.editar-cardapio').style.display = 'none';
    mostrarPagina('cardapio');
}

// Função para verificar e atualizar a cor do texto do item de navegação ativo
function atualizarCorTextoAtivo() {
  var links = document.querySelectorAll('nav ul li a');
  links.forEach(function(link) {
      if (link.classList.contains('selecionado')) {
          link.style.color = '#B81818'; // Se estiver ativo, altera a cor do texto para vermelho
      } else {
          link.style.color = ''; // Se não estiver ativo, mantém a cor original do texto
      }
  });
}

// Função para mostrar a página correspondente ao link clicado
function mostrarPagina(pagina) {
  // Esconde todas as páginas de navegação
  const paginasNavegacao = document.querySelectorAll('.pagina-inicial, .cardapio, .reviews, .login, .editar-cardapio, .perfil');
  paginasNavegacao.forEach(function(paginaNavegacao) {
      paginaNavegacao.style.display = 'none';
  });

  // Mostra a página selecionada
  const paginaSelecionada = document.querySelector('.' + pagina);
  paginaSelecionada.style.display = 'block';

  // Remove a classe "selecionado" de todos os links de navegação
  var links = document.querySelectorAll('nav a');
  links.forEach(function(link) {
      link.classList.remove('selecionado');
  });

  // Adiciona a classe "selecionado" ao link clicado
  var linkAtivo = Array.from(links).find(link => link.getAttribute('onclick') === `mostrarPagina('${pagina}')`);
  if (linkAtivo) {
      linkAtivo.classList.add('selecionado');
  }

  // Salva a página atual no localStorage
  localStorage.setItem('paginaAtual', pagina);

   // Verifica se a página ativa é "login"
   if (pagina === 'login') {
    if (isLoggedIn) {
        // Se o usuário está logado, mostra a div de perfil e oculta a área de login
        document.querySelector('.login-area').style.display = 'none';
        document.querySelector('.register-area').style.display = 'none';
        document.querySelector('.perfil').style.display = 'block';
    } else {
        // Se o usuário não está logado, mostra a área de login e oculta a div de perfil
        document.querySelector('.login-area').style.display = 'block';
        document.querySelector('.register-area').style.display = 'block';
        document.querySelector('.perfil').style.display = 'none';
    }
   } else {
    // Se a página ativa não é "login", oculta a div de perfil
    document.querySelector('.perfil').style.display = 'none';
    // Limpa os campos de entrada ao sair da aba de login
    limparCamposEntrada();
   }

   if (pagina === 'reviews') {
    carregarReviews();
    }

  // Atualiza a cor do texto do item de navegação ativo
  atualizarCorTextoAtivo();

  // Carregar os itens existentes ao exibir a página de edição do cardápio
  if (pagina === 'editar-cardapio') {
    carregarItensParaEdicao();
  }
  // Atualizar a visualização do cardápio ao voltar para a página de cardápio
  if (pagina === 'cardapio') {
    atualizarCardapio();
}
}

function carregarItensParaEdicao() {
    fetch('${backendURL}/menu')
    .then(response => response.json())
    .then(data => {
        preencherSecaoEdicao('appetizers', data.appetizers);
        preencherSecaoEdicao('maincourses', data.maincourses);
        preencherSecaoEdicao('desserts', data.desserts);
        preencherSecaoEdicao('drinks', data.drinks);
    })
    .catch(error => console.error('Erro ao carregar os dados do menu:', error));
}

function preencherSecaoEdicao(sectionClass, items) {
    const section = document.querySelector(`.${sectionClass}-edit-item`);
    section.innerHTML = ''; // Limpa a seção antes de adicionar os itens
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('edit-item');

        const img = document.createElement('img');
        img.src = item.imageUrl;
        itemDiv.appendChild(img);

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = item.name;
        nameInput.classList.add('item-name');
        itemDiv.appendChild(nameInput);

        const priceInput = document.createElement('input');
        priceInput.type = 'text';
        priceInput.value = item.price;
        priceInput.classList.add('item-price');
        itemDiv.appendChild(priceInput);

        const imageUrlInput = document.createElement('input');
        imageUrlInput.type = 'text';
        imageUrlInput.value = item.imageUrl;
        imageUrlInput.classList.add('item-image');
        itemDiv.appendChild(imageUrlInput);

        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.onclick = () => editarItem(itemDiv);
        itemDiv.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.onclick = () => excluirItem(itemDiv);
        itemDiv.appendChild(deleteButton);

        section.appendChild(itemDiv);
    });
}

function editarItem(itemDiv) {
    const nameInput = itemDiv.querySelector('.item-name');
    const priceInput = itemDiv.querySelector('.item-price');
    const imageUrlInput = itemDiv.querySelector('.item-image');

    // Cria um novo div para a edição
    const editDiv = document.createElement('div');
    editDiv.classList.add('edit-item-form');

    // Cria os inputs para edição do nome e preço
    const newNameInput = document.createElement('input');
    newNameInput.type = 'text';
    newNameInput.value = nameInput.value;
    newNameInput.classList.add('new-item-name');
    newNameInput.placeholder = 'Editar nome';

    const newPriceInput = document.createElement('input');
    newPriceInput.type = 'text';
    newPriceInput.value = priceInput.value;
    newPriceInput.classList.add('new-item-price');
    newPriceInput.placeholder = 'Editar preço';

    // Cria os inputs para edição da imagem
    const newImageUrlInput = document.createElement('input');
    newImageUrlInput.type = 'text';
    newImageUrlInput.value = imageUrlInput.value;
    newImageUrlInput.classList.add('new-item-image-url');
    newImageUrlInput.placeholder = 'Editar URL da imagem';

    const newImageFileInput = document.createElement('input');
    newImageFileInput.type = 'file';
    newImageFileInput.classList.add('new-item-image-file');

    // Botão para salvar as edições
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Salvar';
    saveButton.onclick = () => {
        nameInput.value = newNameInput.value;
        priceInput.value = newPriceInput.value;
        let newImageUrl = newImageUrlInput.value;
        const newName = newNameInput.value;
        const newPrice = newPriceInput.value;

        if (newImageFileInput.files && newImageFileInput.files[0]) {
            const file = newImageFileInput.files[0];
            const maxSize = 1 * 1024 * 1024; // 1MB em bytes

            if (file.size > maxSize) {
                alert('O arquivo é muito grande. O tamanho máximo permitido é 1MB.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                newImageUrl = e.target.result;
                saveEditedItem(nameInput, priceInput, imageUrlInput, newName, newPrice, newImageUrl, itemDiv, editDiv);
            };
            reader.readAsDataURL(file);
        } else {
            saveEditedItem(nameInput, priceInput, imageUrlInput, newName, newPrice, newImageUrl, itemDiv, editDiv);
        }
        // Remove o formulário de edição
        itemDiv.removeChild(editDiv);
    };

    // Botão para cancelar as edições
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancelar';
    cancelButton.onclick = () => {
        itemDiv.removeChild(editDiv);
    };

    // Adiciona os elementos ao div de edição
    editDiv.appendChild(newNameInput);
    editDiv.appendChild(newPriceInput);
    editDiv.appendChild(newImageUrlInput);
    editDiv.appendChild(newImageFileInput);
    editDiv.appendChild(saveButton);
    editDiv.appendChild(cancelButton);

    // Adiciona o div de edição ao item
    itemDiv.appendChild(editDiv);
}

function saveEditedItem(nameInput, priceInput, imageUrlInput, newName, newPrice, newImageUrl, itemDiv, editDiv) {
    nameInput.value = newName;
    priceInput.value = newPrice;
    imageUrlInput.value = newImageUrl;

    // Remove o formulário de edição
    // Verifica se o editDiv é filho de itemDiv antes de tentar removê-lo
    if (editDiv.parentNode === itemDiv) {
        itemDiv.removeChild(editDiv);
    } else {
        console.error('editDiv não é um filho direto de itemDiv.');
    }

    // Atualiza a interface ou faz outra ação necessária após a edição
    alert('Item editado com sucesso!');
    atualizarCardapio();
}

function excluirItem(itemDiv) {
    if (confirm("Você deseja remover esse item permanentemente?")) {
        itemDiv.remove();
    }
}

// Mantém a classe "pagina-inicial" ativa ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    const paginaInicial = document.querySelector('.pagina-inicial');
    paginaInicial.style.display = 'block';
  
    // Verifica se o usuário está logado no carregamento da página
    if (localStorage.getItem('isLoggedIn')) {
      isLoggedIn = true;
      const user = JSON.parse(localStorage.getItem('user'));
      document.getElementById('profile-username').innerText = user.username;
      document.getElementById('profile-role').innerText = user.role;
      document.getElementById('profile-email').innerText = user.email;
      verificarRoleUsuario(); // Verificar a role do usuário
      carregarReviews();

      // Verifica se a navegação selecionada é "login" e ajusta a exibição
      const linkAtivo = document.querySelector('nav a.selecionado');
      if (linkAtivo && linkAtivo.getAttribute('onclick') === "mostrarPagina('login')") {
        mostrarPagina('login');
      } else {
        document.querySelector('.perfil').style.display = 'none';
      }
    } else {
      document.querySelector('.perfil').style.display = 'none';
    }
    // Restaura a última página visitada
    const paginaAtual = localStorage.getItem('paginaAtual');
    if (paginaAtual) {
        mostrarPagina(paginaAtual);
    } else {
        paginaInicial.style.display = 'block';
    }
  });

// Sistema do login

function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    fetch('${backendURL}/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Login bem-sucedido") {
            // Define isLoggedIn como true quando o login é bem-sucedido
            isLoggedIn = true;
            localStorage.setItem('isLoggedIn', true);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Mostra a div de perfil e oculta a área de login
            document.querySelector('.login-area').style.display = 'none';
            document.querySelector('.register-area').style.display = 'none';
            document.querySelector('.perfil').style.display = 'block';
            document.getElementById('profile-username').innerText = data.user.username;
            document.getElementById('profile-role').innerText = data.user.role;
            document.getElementById('profile-email').innerText = data.user.email;

            // Exibe o botão de editar conteúdo se o usuário for funcionário
            verificarRoleUsuario(); // Verificar a role do usuário

            // Garante que a página de login seja exibida com o perfil
            mostrarPagina('login');

        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Erro:', error));
}

function limparCamposEntrada() {
    // Limpa os campos de login
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';

    // Limpa os campos de registro
    const registerEmail = document.querySelector('.register-area input[name="email"]');
    const registerUsername = document.querySelector('.register-area input[name="username"]');
    const registerPassword = document.querySelector('.register-area input[name="password"]');
    const registerConfirmPassword = document.querySelector('.register-area input[name="confirmPassword"]');

    if (registerEmail) registerEmail.value = '';
    if (registerUsername) registerUsername.value = '';
    if (registerPassword) registerPassword.value = '';
    if (registerConfirmPassword) registerConfirmPassword.value = '';
}

function logout() {
    if (confirm("Você realmente quer deslogar?")) {
        // Define isLoggedIn como false quando o usuário faz logout
        isLoggedIn = false;
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');

        // Oculta a div de perfil e mostra a área de login
        document.querySelector('.perfil').style.display = 'none';
        document.querySelector('.login-area').style.display = 'block';
        document.querySelector('.register-area').style.display = 'block';
        document.getElementById('addReviewButton').style.display = 'none';
        document.getElementById('editReviewButton').style.display = 'none';

        // Remove a role do localStorage se estiver armazenada separadamente
        localStorage.removeItem('role');

        verificarRoleUsuario(); // Verificar a role do usuário

        // Limpa os campos de entrada
        limparCamposEntrada();

        // Volta para a página inicial
        mostrarPagina('pagina-inicial');
    }
}

function isStrongPassword(password) {
    // Verifica se a senha atende aos critérios de complexidade
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

// Função de registro
document.querySelector('.register-area button[type="button"]').addEventListener('click', register);

function register() {
    const emailInput = document.getElementById('register-email');
    const usernameInput = document.getElementById('register-username');
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-confirm-password');

    if (!emailInput || !usernameInput || !passwordInput || !confirmPasswordInput) {
        console.error('Um ou mais campos de entrada não foram encontrados');
        return;
    }

    const email = emailInput.value;
    const username = usernameInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!isStrongPassword(password)) {
        alert("A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma letra minúscula, um número e um caractere especial.");
        return;
    }

    if (password !== confirmPassword) {
        alert("As senhas não coincidem.");
        return;
    }

    fetch('${backendURL}/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, confirmPassword })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Cadastro realizado com sucesso") {
            // Autentica o usuário automaticamente após o cadastro
            isLoggedIn = true;
            localStorage.setItem('isLoggedIn', true);
            localStorage.setItem('user', JSON.stringify({ email, username, role: data.role }));

            // Mostra a div de perfil e oculta a área de login e registro
            document.querySelector('.login-area').style.display = 'none';
            document.querySelector('.register-area').style.display = 'none';
            document.querySelector('.perfil').style.display = 'block';
            document.getElementById('profile-username').innerText = username;
            document.getElementById('profile-role').innerText = data.role;
            document.getElementById('profile-email').innerText = email;

            // Verificar a role do usuário e exibir botões apropriados
            verificarRoleUsuario();

            // Redireciona para a página de perfil
            mostrarPagina('login');
        } else {
            alert(data.message);
        }
        
    })
    .catch(error => console.error('Erro:', error));
}

// Reviews

// Função para converter a nota em estrelas
function criarEstrelas(nota) {
    const maxEstrelas = 5;
    const estrelaCheia = '⭐';
    const estrelaVazia = '☆';
    
    let estrelas = '';
    
    for (let i = 1; i <= maxEstrelas; i++) {
        estrelas += i <= nota ? estrelaCheia : estrelaVazia;
    }
    
    return estrelas;
}

// Função para mostrar o formulário de review
function mostrarFormularioReview(isEdit = false, reviewData = {}) {
    const reviewForm = document.createElement('div');
    reviewForm.classList.add('review-form');

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = 'Título do Review';
    titleInput.value = reviewData.title || '';
    titleInput.autocomplete = 'off';  // Adicionando autocomplete="off"
    reviewForm.appendChild(titleInput);

    const textInput = document.createElement('textarea');
    textInput.placeholder = 'Escreva seu review aqui';
    textInput.value = reviewData.text || '';
    textInput.autocomplete = 'off';  // Adicionando autocomplete="off"
    reviewForm.appendChild(textInput);

    const ratingContainer = document.createElement('div');
    ratingContainer.classList.add('rating-container');

    const ratingInputs = [];
    for (let i = 1; i <= 5; i++) {
        const starInput = document.createElement('span');
        starInput.innerHTML = '☆';
        starInput.classList.add('star');
        starInput.dataset.value = i;
        starInput.onclick = () => {
            ratingInputs.forEach(input => input.innerHTML = '☆');
            for (let j = 0; j < i; j++) {
                ratingInputs[j].innerHTML = '⭐';
            }
        };
        ratingInputs.push(starInput);
        ratingContainer.appendChild(starInput);
    }
    reviewForm.appendChild(ratingContainer);

    const imageFileInput = document.createElement('input');
    imageFileInput.type = 'file';
    imageFileInput.autocomplete = 'off';  
    reviewForm.appendChild(imageFileInput);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Salvar';
    saveButton.onclick = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const review = {
            title: titleInput.value,
            text: textInput.value,
            rating: ratingInputs.filter(input => input.innerHTML === '⭐').length,
            username: user.username,
            image: ''
        };

        if (imageFileInput.files && imageFileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                review.image = e.target.result;
                if (isEdit) {
                    editarReview(review);
                } else {
                    salvarReview(review);
                }
                reviewForm.remove();
            };
            reader.readAsDataURL(imageFileInput.files[0]);
        }
    };

    reviewForm.appendChild(saveButton);

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancelar';
    cancelButton.onclick = () => reviewForm.remove();
    reviewForm.appendChild(cancelButton);

    document.querySelector('.reviews').appendChild(reviewForm);
}

// Função para editar um review
function editarReview(review) {
    fetch('${backendURL}/reviews', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(review),
    })
        .then(response => response.json())
        .then(data => {
            alert('Review editado com sucesso!');
            carregarReviews();
        })
        .catch(error => console.error('Erro ao editar o review:', error));
}

// Função para salvar um review
function salvarReview(review) {
    fetch('${backendURL}/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(review),
    })
        .then(response => response.json())
        .then(data => {
            alert('Review salvo com sucesso!');
            carregarReviews();
            verificarRoleUsuario(); // Atualizar os botões de review
        })
        .catch(error => console.error('Erro ao salvar o review:', error));
}


// Função para carregar os reviews
function carregarReviews() {
    fetch('${backendURL}/reviews')
    .then(response => response.json())
    .then(data => {
        const reviewsContainer = document.querySelector('.reviews-itens');
        reviewsContainer.innerHTML = '';
        data.forEach(review => {
            const reviewDiv = document.createElement('div');
            reviewDiv.classList.add('review-item');

           // Div para a imagem (review-left-section)
           const reviewLeftSection = document.createElement('div');
           reviewLeftSection.classList.add('review-left-section');
           if (review.image) {
               const image = document.createElement('img');
               image.src = review.image;
               image.alt = 'Imagem do Review';
               reviewLeftSection.appendChild(image);
           }
           reviewDiv.appendChild(reviewLeftSection);

            // Div para o conteúdo (review-right-section)
            const reviewRightSection = document.createElement('div');
            reviewRightSection.classList.add('review-right-section');

            const rating = document.createElement('p');
            rating.innerHTML = criarEstrelas(review.rating);
            rating.classList.add('review-rating')
            reviewDiv.appendChild(rating);

            const title = document.createElement('h3');
            title.textContent = review.title;
            title.classList.add('review-title')
            reviewDiv.appendChild(title);

            const text = document.createElement('p');
            text.textContent = review.text;
            text.classList.add('review-body')
            reviewDiv.appendChild(text);

            const postedBy = document.createElement('p');
            postedBy.textContent = review.username;
            postedBy.classList.add('review-postby')
            reviewDiv.appendChild(postedBy);

            reviewsContainer.appendChild(reviewDiv);
        });
    })
    .catch(error => console.error('Erro ao carregar os reviews:', error));
}