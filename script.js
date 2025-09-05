// --- CONFIGURAÇÕES ---
const PRECO_FIXO_SALADA = 15.00;
const LIMITE_OPCIONAIS = 3;
const TAXA_ENTREGA = 7.00;
const HORA_ABERTURA = 0;
const HORA_FECHAMENTO = 24;
const NUMERO_WHATSAPP = '5535999280299';

// --- ESTADO DO APLICATIVO ---
let carrinho = [];
let saladaAtual = {
    base: null,
    proteina: null,
    opcionais: [],
    molho: null,
};
let dadosPedido = {
    metodoEntrega: 'entrega',
    formaPagamento: null,
};

// --- ELEMENTOS DO DOM ---
const btnAdicionarCarrinho = document.getElementById('btn-adicionar-carrinho');
const secaoCarrinho = document.getElementById('secao-carrinho');
const listaCarrinhoEl = document.getElementById('lista-carrinho');
const secaoFinalizar = document.getElementById('secao-finalizar');
const totalPedidoEl = document.getElementById('total-pedido');
const btnFinalizar = document.getElementById('btn-finalizar');
const statusLojaEl = document.getElementById('status-loja');
const contadorOpcionaisEl = document.getElementById('contador-opcionais');
const todosOpcionaisEl = document.querySelectorAll('#opcionais .opcao-multiplo');
const mensagemErroEl = document.getElementById('mensagem-erro');
const campoEnderecoEl = document.getElementById('campo-endereco');
const campoTrocoEl = document.getElementById('campo-troco');


// --- FUNÇÕES DE LÓGICA ---

// Reseta a seleção atual para montar uma nova salada
function resetarSelecaoAtual() {
    saladaAtual = { base: null, proteina: null, opcionais: [], molho: null };
    document.querySelectorAll('.opcao.selecionado, .opcao-multiplo.selecionado').forEach(el => {
        el.classList.remove('selecionado');
    });
    atualizarContadorOpcionais();
    verificarSaladaCompleta();
}

// Verifica se a salada atual está completa para habilitar o botão de adicionar
function verificarSaladaCompleta() {
    const completa = saladaAtual.base && saladaAtual.proteina && saladaAtual.molho && saladaAtual.opcionais.length === LIMITE_OPCIONAIS;
    btnAdicionarCarrinho.disabled = !completa;
}

// Para seções com escolha única
function selecionarOpcaoUnica(tipo, elemento) {
    const grupo = document.getElementById(tipo + 's');
    grupo.querySelectorAll('.opcao').forEach(opt => opt.classList.remove('selecionado'));
    elemento.classList.add('selecionado');
    saladaAtual[tipo] = elemento.dataset.nome;
    verificarSaladaCompleta();
}

// Para seção com escolha múltipla
function selecionarOpcional(elemento) {
    const nome = elemento.dataset.nome;
    const jaSelecionado = elemento.classList.contains('selecionado');

    if (jaSelecionado) {
        elemento.classList.remove('selecionado');
        const index = saladaAtual.opcionais.indexOf(nome);
        if (index > -1) saladaAtual.opcionais.splice(index, 1);
    } else {
        if (saladaAtual.opcionais.length < LIMITE_OPCIONAIS) {
            elemento.classList.add('selecionado');
            saladaAtual.opcionais.push(nome);
        }
    }
    atualizarContadorOpcionais();
    verificarSaladaCompleta();
}

function atualizarContadorOpcionais() {
    const contagem = saladaAtual.opcionais.length;
    contadorOpcionaisEl.textContent = `(${contagem}/${LIMITE_OPCIONAIS})`;
    todosOpcionaisEl.forEach(el => {
        el.classList.toggle('desabilitado', contagem >= LIMITE_OPCIONAIS && !el.classList.contains('selecionado'));
    });
}

// Adiciona a salada montada ao carrinho
function adicionarAoCarrinho() {
    carrinho.push({ ...saladaAtual });
    resetarSelecaoAtual();
    renderizarCarrinho();
}

// Remove uma salada do carrinho pelo índice
function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    renderizarCarrinho();
}

// Desenha o carrinho na tela e calcula o total
function renderizarCarrinho() {
    listaCarrinhoEl.innerHTML = '';
    if (carrinho.length > 0) {
        secaoCarrinho.classList.remove('hidden');
        secaoFinalizar.classList.remove('hidden');
    } else {
        secaoCarrinho.classList.add('hidden');
        secaoFinalizar.classList.add('hidden');
    }

    carrinho.forEach((salada, index) => {
        const li = document.createElement('li');
        const opcionaisStr = salada.opcionais.join(', ');
        li.innerHTML = `
            <div>
                <strong>Salada ${index + 1}</strong>
                <div class="detalhes-salada">
                    ${salada.base}, ${salada.proteina}, ${opcionaisStr}, Molho ${salada.molho}
                </div>
            </div>
            <button class="btn-remover" data-index="${index}">X</button>
        `;
        listaCarrinhoEl.appendChild(li);
    });

    // Adiciona evento de clique para os novos botões de remover
    document.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', (e) => {
            removerDoCarrinho(parseInt(e.target.dataset.index));
        });
    });

    atualizarTotalPedido();
}

function atualizarTotalPedido() {
    let total = carrinho.length * PRECO_FIXO_SALADA;
    if (dadosPedido.metodoEntrega === 'entrega' && carrinho.length > 0) {
        total += TAXA_ENTREGA;
    }
    const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    totalPedidoEl.innerText = `Total: ${formatarMoeda(total)}`;
}

// --- LÓGICA FINAL DO PEDIDO ---

function selecionarMetodoEntrega(elemento) {
    dadosPedido.metodoEntrega = elemento.dataset.metodo;
    document.querySelectorAll('#metodo-entrega .opcao').forEach(opt => opt.classList.remove('selecionado'));
    elemento.classList.add('selecionado');
    campoEnderecoEl.style.display = (dadosPedido.metodoEntrega === 'retirada') ? 'none' : 'block';
    atualizarTotalPedido();
}

function selecionarFormaPagamento(elemento) {
    dadosPedido.formaPagamento = elemento.dataset.pagamento;
    document.querySelectorAll('#forma-pagamento .opcao').forEach(opt => opt.classList.remove('selecionado'));
    elemento.classList.add('selecionado');
    campoTrocoEl.style.display = (dadosPedido.formaPagamento === 'Dinheiro') ? 'block' : 'none';
}

function enviarPedido() {
    const nomeCliente = document.getElementById('nome-cliente').value.trim();
    const enderecoCliente = document.getElementById('endereco-cliente').value.trim();
    mensagemErroEl.style.display = 'none';

    if (carrinho.length === 0) return;
    if (!dadosPedido.formaPagamento) {
        mensagemErroEl.innerText = 'Por favor, escolha uma forma de pagamento.';
        mensagemErroEl.style.display = 'block';
        return;
    }
    if (nomeCliente === '') {
        mensagemErroEl.innerText = 'Por favor, preencha seu nome.';
        mensagemErroEl.style.display = 'block';
        return;
    }
    if (dadosPedido.metodoEntrega === 'entrega' && enderecoCliente === '') {
        mensagemErroEl.innerText = 'Por favor, preencha seu endereço.';
        mensagemErroEl.style.display = 'block';
        return;
    }

    // Montagem da Mensagem
    let total = carrinho.length * PRECO_FIXO_SALADA;
    let mensagem = `Olá, *Salada da Jeh*! 🥗\n\nGostaria de fazer um novo pedido:\n\n`;
    
    carrinho.forEach((salada, index) => {
        mensagem += `*🥗 SALADA ${index + 1}*\n`;
        mensagem += `*- Base:* ${salada.base}\n`;
        mensagem += `*- Proteína:* ${salada.proteina}\n`;
        mensagem += `*- Opcionais:* ${salada.opcionais.join(', ')}\n`;
        mensagem += `*- Molho:* ${salada.molho}\n\n`;
    });

    mensagem += `----------------------\n`;
    mensagem += `*Cliente:* ${nomeCliente}\n`;
    mensagem += `*Método:* ${dadosPedido.metodoEntrega === 'entrega' ? `Entrega 🛵\n*Endereço:* ${enderecoCliente}` : 'Retirada no local 🛍️'}\n`;
    mensagem += `*Pagamento:* ${dadosPedido.formaPagamento}\n`;
    const troco = document.getElementById('troco').value.trim();
    if (dadosPedido.formaPagamento === 'Dinheiro' && troco !== '') {
        mensagem += `*Troco para:* R$ ${troco}\n`;
    }
    const observacoes = document.getElementById('observacoes').value.trim();
    if (observacoes !== '') {
        mensagem += `\n*Observações:* ${observacoes}\n`;
    }

    if (dadosPedido.metodoEntrega === 'entrega') total += TAXA_ENTREGA;
    mensagem += `----------------------\n*TOTAL:* R$ ${total.toFixed(2).replace('.', ',')}\n\n`;
    mensagem += `Aguardo a confirmação do meu pedido. Obrigado!`;

    const linkWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
    window.open(linkWhatsApp, '_blank');
}

function verificarStatusLoja() {
    const agora = new Date();
    const horaAtual = agora.getHours();
    const lojaAberta = horaAtual >= HORA_ABERTURA && horaAtual < HORA_FECHAMENTO;

    if (lojaAberta) {
        statusLojaEl.textContent = 'Aberto para pedidos!';
        statusLojaEl.className = 'aberto';
        btnFinalizar.disabled = false;
    } else {
        statusLojaEl.textContent = `Fechado (Aberto das ${HORA_ABERTURA}:00 às ${HORA_FECHAMENTO}:00)`;
        statusLojaEl.className = 'fechado';
        btnFinalizar.disabled = true;
        btnAdicionarCarrinho.disabled = true;
    }
}

// --- INICIALIZAÇÃO E EVENTOS ---

document.addEventListener('DOMContentLoaded', () => {
    verificarStatusLoja();
    resetarSelecaoAtual();

    // Eventos para montar a salada
    document.querySelectorAll('#bases .opcao').forEach(el => el.addEventListener('click', () => selecionarOpcaoUnica('base', el)));
    document.querySelectorAll('#proteinas .opcao').forEach(el => el.addEventListener('click', () => selecionarOpcaoUnica('proteina', el)));
    document.querySelectorAll('#molhos .opcao').forEach(el => el.addEventListener('click', () => selecionarOpcaoUnica('molho', el)));
    document.querySelectorAll('#opcionais .opcao-multiplo').forEach(el => el.addEventListener('click', () => selecionarOpcional(el)));
    
    // Eventos para o pedido final
    document.querySelectorAll('#metodo-entrega .opcao').forEach(el => el.addEventListener('click', () => selecionarMetodoEntrega(el)));
    document.querySelectorAll('#forma-pagamento .opcao').forEach(el => el.addEventListener('click', () => selecionarFormaPagamento(el)));
    
    // Eventos dos botões principais
    btnAdicionarCarrinho.addEventListener('click', adicionarAoCarrinho);
    btnFinalizar.addEventListener('click', enviarPedido);
});