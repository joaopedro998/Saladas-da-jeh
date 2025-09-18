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
    extras: [], // NOVO: Array para os extras pagos
};
let dadosPedido = {
    metodoEntrega: 'entrega',
    formaPagamento: null,
    tipoCartao: null,
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
const campoOpcoesCartaoEl = document.getElementById('opcoes-cartao');
const quantidadeSaladaEl = document.getElementById('quantidade-salada');


// --- FUNÇÕES DE LÓGICA ---

// ALTERADO: Limpa também a seleção de extras
function resetarSelecaoAtual() {
    saladaAtual = { base: null, proteina: null, opcionais: [], molho: null, extras: [] };
    
    document.querySelectorAll('.selecionado').forEach(el => {
        el.classList.remove('selecionado');
    });

    quantidadeSaladaEl.value = 1;
    atualizarContadorOpcionais();
    verificarSaladaCompleta();
}

// Verifica se a salada base está completa (extras são opcionais)
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

// Para seção com escolha múltipla de opcionais (com limite)
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

// NOVO: Para seção de extras (sem limite)
function selecionarExtra(elemento) {
    const nome = elemento.dataset.nome;
    const preco = parseFloat(elemento.dataset.preco);
    const jaSelecionado = elemento.classList.contains('selecionado');

    if (jaSelecionado) {
        elemento.classList.remove('selecionado');
        // Remove o extra do array pelo nome
        saladaAtual.extras = saladaAtual.extras.filter(extra => extra.nome !== nome);
    } else {
        elemento.classList.add('selecionado');
        saladaAtual.extras.push({ nome, preco });
    }
    // Não precisa chamar verificarSaladaCompleta() pois extras são opcionais
}


function atualizarContadorOpcionais() {
    const contagem = saladaAtual.opcionais.length;
    contadorOpcionaisEl.textContent = `(${contagem}/${LIMITE_OPCIONAIS})`;
    todosOpcionaisEl.forEach(el => {
        el.classList.toggle('desabilitado', contagem >= LIMITE_OPCIONAIS && !el.classList.contains('selecionado'));
    });
}

// ALTERADO: Adiciona a salada com seus extras ao carrinho
function adicionarAoCarrinho() {
    const quantidade = parseInt(quantidadeSaladaEl.value);
    if (quantidade < 1) return;

    // O ID agora inclui os extras para diferenciar saladas
    const idExtras = saladaAtual.extras.map(e => e.nome).sort().join(',');
    const idSalada = [
        saladaAtual.base,
        saladaAtual.proteina,
        saladaAtual.molho,
        ...saladaAtual.opcionais.sort()
    ].join('-') + `-[EXTRAS:${idExtras}]`;

    const itemExistente = carrinho.find(item => item.id === idSalada);

    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        carrinho.push({
            id: idSalada,
            salada: { ...saladaAtual, extras: [...saladaAtual.extras] }, // Garante cópia dos extras
            quantidade: quantidade
        });
    }

    resetarSelecaoAtual();
    renderizarCarrinho();
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    renderizarCarrinho();
}

// ALTERADO: Renderiza o carrinho mostrando os extras
function renderizarCarrinho() {
    listaCarrinhoEl.innerHTML = '';
    if (carrinho.length > 0) {
        secaoCarrinho.classList.remove('hidden');
        secaoFinalizar.classList.remove('hidden');
    } else {
        secaoCarrinho.classList.add('hidden');
        secaoFinalizar.classList.add('hidden');
    }

    carrinho.forEach((item, index) => {
        const li = document.createElement('li');
        const opcionaisStr = item.salada.opcionais.join(', ');
        
        // Formata a lista de extras
        let extrasStr = '';
        if (item.salada.extras.length > 0) {
            extrasStr = `<br>Extras: ${item.salada.extras.map(e => e.nome).join(', ')}`;
        }

        li.innerHTML = `
            <div>
                <strong>${item.quantidade}x Salada</strong>
                <div class="detalhes-salada">
                    ${item.salada.base}, ${item.salada.proteina}, ${opcionaisStr}, Molho ${item.salada.molho}${extrasStr}
                </div>
            </div>
            <button class="btn-remover" data-index="${index}">X</button>
        `;
        listaCarrinhoEl.appendChild(li);
    });

    document.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', (e) => removerDoCarrinho(parseInt(e.target.dataset.index)));
    });

    atualizarTotalPedido();
}

// ALTERADO: O cálculo do total agora soma os preços dos extras
function atualizarTotalPedido() {
    const totalItens = carrinho.reduce((acc, item) => {
        const precoExtras = item.salada.extras.reduce((subAcc, extra) => subAcc + extra.preco, 0);
        const precoUnitario = PRECO_FIXO_SALADA + precoExtras;
        return acc + (item.quantidade * precoUnitario);
    }, 0);
    
    let totalFinal = totalItens;

    if (dadosPedido.metodoEntrega === 'entrega' && carrinho.length > 0) {
        totalFinal += TAXA_ENTREGA;
    }
    
    const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    totalPedidoEl.innerText = `Total: ${formatarMoeda(totalFinal)}`;
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

    campoTrocoEl.classList.toggle('hidden', dadosPedido.formaPagamento !== 'Dinheiro');
    campoOpcoesCartaoEl.classList.toggle('hidden', dadosPedido.formaPagamento !== 'Cartão');

    if (dadosPedido.formaPagamento !== 'Cartão') {
        dadosPedido.tipoCartao = null;
        document.querySelectorAll('#tipo-cartao .opcao').forEach(opt => opt.classList.remove('selecionado'));
    }
}

function selecionarTipoCartao(elemento) {
    dadosPedido.tipoCartao = elemento.dataset.tipo;
    document.querySelectorAll('#tipo-cartao .opcao').forEach(opt => opt.classList.remove('selecionado'));
    elemento.classList.add('selecionado');
}

// ALTERADO: Monta a mensagem final com os extras
function enviarPedido() {
    const nomeCliente = document.getElementById('nome-cliente').value.trim();
    const enderecoCliente = document.getElementById('endereco-cliente').value.trim();
    mensagemErroEl.style.display = 'none';

    // Validações... (permanecem as mesmas)
    if (carrinho.length === 0) return;
    if (!dadosPedido.formaPagamento) {
        mensagemErroEl.innerText = 'Por favor, escolha uma forma de pagamento.';
        mensagemErroEl.style.display = 'block';
        return;
    }
    if (dadosPedido.formaPagamento === 'Cartão' && !dadosPedido.tipoCartao) {
        mensagemErroEl.innerText = 'Por favor, escolha Crédito ou Débito.';
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

    // --- Montagem da Mensagem ---
    let mensagem = `Olá, *Salada da Jeh*! 🥗\n\nGostaria de fazer um novo pedido:\n\n`;
    
    carrinho.forEach((item) => {
        const precoExtras = item.salada.extras.reduce((subAcc, extra) => subAcc + extra.preco, 0);
        const precoUnitario = PRECO_FIXO_SALADA + precoExtras;
        
        mensagem += `*🥗 ${item.quantidade}x SALADA (R$ ${precoUnitario.toFixed(2).replace('.',',')} cada)*\n`;
        mensagem += `*- Base:* ${item.salada.base}\n`;
        mensagem += `*- Proteína:* ${item.salada.proteina}\n`;
        mensagem += `*- Opcionais:* ${item.salada.opcionais.join(', ')}\n`;
        
        if (item.salada.extras.length > 0) {
            const extrasStr = item.salada.extras.map(e => `${e.nome} (R$ ${e.preco.toFixed(2).replace('.',',')})`).join(', ');
            mensagem += `*- Extras:* ${extrasStr}\n`;
        }
        
        mensagem += `*- Molho:* ${item.salada.molho}\n\n`;
    });

    mensagem += `----------------------\n`;
    mensagem += `*Cliente:* ${nomeCliente}\n`;
    mensagem += `*Método:* ${dadosPedido.metodoEntrega === 'entrega' ? `Entrega 🛵\n*Endereço:* ${enderecoCliente}` : 'Retirada no local 🛍️'}\n`;
    
    let pagamentoStr = dadosPedido.formaPagamento;
    if (pagamentoStr === 'Cartão') {
        pagamentoStr += ` (${dadosPedido.tipoCartao})`;
    }
    mensagem += `*Pagamento:* ${pagamentoStr}\n`;

    const troco = document.getElementById('troco').value.trim();
    if (dadosPedido.formaPagamento === 'Dinheiro' && troco) {
        mensagem += `*Troco para:* R$ ${troco}\n`;
    }
    const observacoes = document.getElementById('observacoes').value.trim();
    if (observacoes) {
        mensagem += `\n*Observações:* ${observacoes}\n`;
    }
    
    const totalItens = carrinho.reduce((acc, item) => {
        const precoExtras = item.salada.extras.reduce((subAcc, extra) => subAcc + extra.preco, 0);
        return acc + (item.quantidade * (PRECO_FIXO_SALADA + precoExtras));
    }, 0);
    let totalFinal = totalItens;
    if (dadosPedido.metodoEntrega === 'entrega') totalFinal += TAXA_ENTREGA;
    
    mensagem += `----------------------\n*TOTAL:* R$ ${totalFinal.toFixed(2).replace('.', ',')}\n\n`;
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
    document.querySelectorAll('#extras .opcao-extra').forEach(el => el.addEventListener('click', () => selecionarExtra(el))); // NOVO
    
    // Eventos para o pedido final
    document.querySelectorAll('#metodo-entrega .opcao').forEach(el => el.addEventListener('click', () => selecionarMetodoEntrega(el)));
    document.querySelectorAll('#forma-pagamento .opcao').forEach(el => el.addEventListener('click', () => selecionarFormaPagamento(el)));
    document.querySelectorAll('#tipo-cartao .opcao').forEach(el => el.addEventListener('click', () => selecionarTipoCartao(el)));
    
    // Eventos dos botões principais
    btnAdicionarCarrinho.addEventListener('click', adicionarAoCarrinho);
    btnFinalizar.addEventListener('click', enviarPedido);
});