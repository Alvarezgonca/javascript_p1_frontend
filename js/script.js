const API_URL = 'https://www.googleapis.com/books/v1/volumes?q=javascript&maxResults=10';
const listaLivros = document.getElementById('lista-livros');
const inputFiltro = document.getElementById('filtro');
const botaoFiltrar = document.getElementById('botao-filtrar');
const modal = document.getElementById('detalhes-livro');
const conteudoModal = document.getElementById('conteudo-detalhes');
const botaoFechar = document.getElementsByClassName('fechar')[0];
const filtro = document.getElementById('filtro');

let livros = [];
let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

async function iniciarBiblioteca() {
    try {
        livros = await buscarLivros();
        mostrarLivros(livros);
        atualizarFavoritos();
    } catch (erro) {
        console.error('Erro ao iniciar a biblioteca:', erro);
        mostrarErro('Não foi possível carregar os livros. Tente novamente mais tarde.');
    }
}

async function buscarLivros() {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) {
        throw new Error('Falha na requisição à API');
    }
    const dados = await resposta.json();
    return dados.items || [];
}

function mostrarLivros(livrosParaMostrar) {
    listaLivros.innerHTML = '';
    livrosParaMostrar.forEach(livro => {
        const elementoLivro = criarElementoLivro(livro);
        listaLivros.appendChild(elementoLivro);
    });
}

function criarElementoLivro(livro) {
    const { id, volumeInfo } = livro;
    const { title, authors, imageLinks } = volumeInfo;
    const elemento = document.createElement('div');
    elemento.className = 'livro';
    elemento.innerHTML = `
        <img src="${imageLinks?.thumbnail || 'https://via.placeholder.com/128x192.png?text=Sem+Imagem'}" alt="${title}">
        <div class="titulo">${title}</div>
        <div class="autor">${authors ? authors.join(', ') : 'Autor desconhecido'}</div>
        <button class="favorito" data-id="${id}">${favoritos.includes(id) ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>'}</button>
    `;
    elemento.addEventListener('click', () => mostrarDetalhesLivro(livro));
    const botaoFavorito = elemento.querySelector('.favorito');
    botaoFavorito.addEventListener('click', (e) => {
        e.stopPropagation();
        alternarFavorito(id);
    });
    return elemento;
}

function mostrarErro(mensagem) {
    listaLivros.innerHTML = `<p style="color: red; text-align: center;">${mensagem}</p>`;
}

filtro.addEventListener('keyup', (evento) => {
    if (evento.key === 'Enter') {
        filtrarLivros();
    }
});

botaoFiltrar.addEventListener('click', filtrarLivros);

function filtrarLivros() {
    const termo = inputFiltro.value.toLowerCase();
    const livrosFiltrados = livros.filter(livro => {
        const { title, authors } = livro.volumeInfo;
        return title.toLowerCase().includes(termo) || 
               (authors && authors.join(', ').toLowerCase().includes(termo));
    });
    mostrarLivros(livrosFiltrados);
}

function alternarFavorito(id) {
    const index = favoritos.indexOf(id);
    if (index === -1) {
        favoritos.push(id);
    } else {
        favoritos.splice(index, 1);
    }
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    atualizarFavoritos();
}

function atualizarFavoritos() {
    document.querySelectorAll('.favorito').forEach(botao => {
        const id = botao.dataset.id;
        botao.innerHTML = favoritos.includes(id) ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
    });
}

function mostrarDetalhesLivro(livro) {
    const infoLivro = livro.volumeInfo;
    const titulo = infoLivro.title;
    const autores = infoLivro.authors ? infoLivro.authors.join(', ') : 'Desconhecido';
    const descricao = infoLivro.description || 'Sem descrição disponível.';
    const numeroPaginas = infoLivro.pageCount || 'Desconhecido';
    const categorias = infoLivro.categories ? infoLivro.categories.join(', ') : 'Não especificado';

    conteudoModal.innerHTML = `
        <h2>${titulo}</h2>
        <p><strong>Autor(es):</strong> ${autores}</p>
        <p><strong>Descrição:</strong> ${descricao}</p>
        <p><strong>Número de páginas:</strong> ${numeroPaginas}</p>
        <p><strong>Categorias:</strong> ${categorias}</p>
    `;
    modal.style.display = 'block';
}

botaoFechar.onclick = () => modal.style.display = 'none';
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

document.addEventListener('DOMContentLoaded', iniciarBiblioteca);