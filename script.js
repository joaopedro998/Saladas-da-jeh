// --- CONFIGURAÇÕES ---
const PRECO_FIXO_SALADA = 15.00;
const LIMITE_OPCIONAIS = 3;
const TAXA_ENTREGA = 7.00; // Mantenha ou altere conforme necessário
const HORA_ABERTURA = 11; // 11:00
const HORA_FECHAMENTO = 22; // 22:00
const NUMERO_WHATSAPP = '5535999280299'; // Insira seu número aqui

// --- ESTADO DO PEDIDO ---
const pedido = {
    base: null,
    proteina: null,
    opcionais: [],
    molho: null,
    metodoEntrega: 'entrega',
    formaPagamento: null,
};

// --- ELEMENTOS DO DOM ---
const mensagemErroEl = document.getElementById('mensagem-erro');
const campoEnderecoEl = document.getElementById('campo-endereco');
const campoTrocoEl = document.getElementById('campo-troco');
const statusLojaEl = document.getElementById('status-loja');
const btnFinalizar = document.getElementById('btn-finalizar');
const contadorOpcionaisEl = document.getElementById('contador-opcionais');
const todosOpcionaisEl = document.querySelectorAll('#opcionais .opcao-multiplo');

// --- FUNÇÕES DE LÓGICA ---

/**
 * Para seções com escolha única (Base, Proteína, Molho).
 * @param {string} tipo - O tipo da seleção (ex: "base", "proteina", "molho").
 * @param {HTMLElement} elemento - O elemento HTML clicado.
 */
function selecionarOpcaoUnica(tipo, elemento) {
    // CORREÇÃO: Adicionado 's' ao final de 'tipo' para encontrar o ID correto no plural (ex: "bases", "proteinas", "molhos")
    const grupo = document.getElementById(tipo + 's'); 
    
    grupo.querySelectorAll('.opcao').forEach(opt => opt.classList.remove('selecionado'));
    elemento.classList.add('selecionado');
    pedido[tipo] = elemento.dataset.nome;
    atualizarResumo();
}

/**
 * Para seção com escolha múltipla (Opcionais).
 * @param {HTMLElement} elemento - O elemento HTML clicado.
 */
function selecionarOpcional(elemento) {
    const nome = elemento.dataset.nome;
    const jaSelecionado = elemento.classList.contains('selecionado');

    if (jaSelecionado) {
        // Desmarcar o item
        elemento.classList.remove('selecionado');
        const index = pedido.opcionais.indexOf(nome);
        if (index > -1) {
            pedido.opcionais.splice(index, 1);
        }
    } else {
        // Marcar um novo item, se houver espaço
        if (pedido.opcionais.length < LIMITE_OPCIONAIS) {
            elemento.classList.add('selecionado');
            pedido.opcionais.push(nome);
        }
    }
    atualizarContadorOpcionais();
    atualizarResumo();
}

/**
 * Atualiza o contador visual de opcionais (ex: "2/3") e habilita/desabilita opções.
 */
function atualizarContadorOpcionais() {
    const contagem = pedido.opcionais.length;
    contadorOpcionaisEl.textContent = `(${contagem}/${LIMITE_OPCIONAIS})`;

    if (contagem >= LIMITE_OPCIONAIS) {
        todosOpcionaisEl.forEach(el => {
            if (!el.classList.contains('selecionado')) {
                el.classList.add('desabilitado');
            }
        });
    } else {
        todosOpcionaisEl.forEach(el => {
            el.classList.remove('desabilitado');
        });
    }
}

function selecionarMetodoEntrega(elemento) {
    pedido.metodoEntrega = elemento.dataset.metodo;
    document.querySelectorAll('#metodo-entrega .opcao').forEach(opt => opt.classList.remove('selecionado'));
    elemento.classList.add('selecionado');
    campoEnderecoEl.style.display = (pedido.metodoEntrega === 'retirada') ? 'none' : 'block';
    atualizarResumo();
}

function selecionarFormaPagamento(elemento) {
    pedido.formaPagamento = elemento.dataset.pagamento;
    document.querySelectorAll('#forma-pagamento .opcao').forEach(opt => opt.classList.remove('selecionado'));
    elemento.classList.add('selecionado');
    campoTrocoEl.style.display = (pedido.formaPagamento === 'Dinheiro') ? 'block' : 'none';
}

function atualizarResumo() {
    const listaResumo = document.getElementById('lista-resumo');
    listaResumo.innerHTML = '';
    let total = 0;
    const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Verifica se todos os itens obrigatórios foram selecionados
    const pedidoCompleto = pedido.base && pedido.proteina && pedido.molho && pedido.opcionais.length === LIMITE_OPCIONAIS;

    if (pedidoCompleto) {
        total = PRECO_FIXO_SALADA;
        listaResumo.innerHTML += `<li><span>Salada Completa (5 itens + molho)</span> <span>${formatarMoeda(PRECO_FIXO_SALADA)}</span></li>`;

        if (pedido.metodoEntrega === 'entrega') {
            listaResumo.innerHTML += `<li><span>Taxa de Entrega</span> <span>${formatarMoeda(TAXA_ENTREGA)}</span></li>`;
            total += TAXA_ENTREGA;
        }
    } else {
         listaResumo.innerHTML = '<li>Selecione todos os itens para ver o total.</li>';
    }

    document.getElementById('total-pedido').innerText = `Total: ${formatarMoeda(total)}`;
}

function enviarPedido() {
    const nomeCliente = document.getElementById('nome-cliente').value;
    const enderecoCliente = document.getElementById('endereco-cliente').value;
    const observacoes = document.getElementById('observacoes').value;
    const troco = document.getElementById('troco').value;
    mensagemErroEl.style.display = 'none';

    // Validações
    if (!pedido.base) {
        mensagemErroEl.innerText = 'Por favor, escolha 1 base.';
        mensagemErroEl.style.display = 'block';
        return;
    }
     if (!pedido.proteina) {
        mensagemErroEl.innerText = 'Por favor, escolha 1 proteína.';
        mensagemErroEl.style.display = 'block';
        return;
    }
    if (pedido.opcionais.length !== LIMITE_OPCIONAIS) {
        mensagemErroEl.innerText = `Por favor, escolha exatamente ${LIMITE_OPCIONAIS} opcionais.`;
        mensagemErroEl.style.display = 'block';
        return;
    }
    if (!pedido.molho) {
        mensagemErroEl.innerText = 'Por favor, escolha 1 molho.';
        mensagemErroEl.style.display = 'block';
        return;
    }
    if (!pedido.formaPagamento) {
        mensagemErroEl.innerText = 'Por favor, escolha uma forma de pagamento.';
        mensagemErroEl.style.display = 'block';
        return;
    }
    if (nomeCliente.trim() === '') {
        mensagemErroEl.innerText = 'Por favor, preencha seu nome.';
        mensagemErroEl.style.display = 'block';
        return;
    }
    if (pedido.metodoEntrega === 'entrega' && enderecoCliente.trim() === '') {
        mensagemErroEl.innerText = 'Por favor, preencha seu endereço para entrega.';
        mensagemErroEl.style.display = 'block';
        return;
    }

    // Montagem da Mensagem
    let total = PRECO_FIXO_SALADA;
    let mensagem = `Olá, *Salada da Jeh*! 🥗\n\nGostaria de fazer um novo pedido:\n\n`;
    mensagem += `*Cliente:* ${nomeCliente}\n`;
    
    if (pedido.metodoEntrega === 'entrega') {
        mensagem += `*Método:* Entrega 🛵\n*Endereço:* ${enderecoCliente}\n`;
    } else {
        mensagem += `*Método:* Retirada no local 🛍️\n`;
    }

    mensagem += `*Pagamento:* ${pedido.formaPagamento}\n`;
    if (pedido.formaPagamento === 'Dinheiro' && troco.trim() !== '') {
        mensagem += `*Troco para:* R$ ${troco}\n`;
    }
    mensagem += `\n*SALADA MONTADA*\n----------------------\n`;
    mensagem += `*Base:* ${pedido.base}\n`;
    mensagem += `*Proteína:* ${pedido.proteina}\n`;
    mensagem += `*Opcionais:*\n`;
    pedido.opcionais.forEach(item => {
        mensagem += `  - ${item}\n`;
    });
    mensagem += `*Molho:* ${pedido.molho}\n`;
    
    if (pedido.metodoEntrega === 'entrega') {
        total += TAXA_ENTREGA;
    }
    
    if (observacoes.trim() !== '') {
        mensagem += `\n*Observações:* ${observacoes}\n`;
    }
    
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
    }
}

// --- INICIALIZAÇÃO E EVENTOS ---

document.querySelectorAll('#bases .opcao').forEach(el => {
    el.addEventListener('click', () => selecionarOpcaoUnica('base', el));
});
document.querySelectorAll('#proteinas .opcao').forEach(el => {
    el.addEventListener('click', () => selecionarOpcaoUnica('proteina', el));
});
document.querySelectorAll('#molhos .opcao').forEach(el => {
    el.addEventListener('click', () => selecionarOpcaoUnica('molho', el));
});
document.querySelectorAll('#opcionais .opcao-multiplo').forEach(el => {
    el.addEventListener('click', () => selecionarOpcional(el));
});
document.querySelectorAll('#metodo-entrega .opcao').forEach(el => {
    el.addEventListener('click', () => selecionarMetodoEntrega(el));
});
document.querySelectorAll('#forma-pagamento .opcao').forEach(el => {
    el.addEventListener('click', () => selecionarFormaPagamento(el));
});

document.addEventListener('DOMContentLoaded', () => {
    verificarStatusLoja();
    atualizarContadorOpcionais(); // Inicia o contador em (0/3)
});