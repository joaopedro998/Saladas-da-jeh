// --- CONFIGURAÇÕES ---
const PRECO_FIXO_SALADA = 15.00;
const LIMITE_OPCIONAIS = 3;
const PRECO_OPCIONAL_EXTRA = 1.00;
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
    extras: [], 
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
const gridOpcionaisEl = document.getElementById('opcionais');
const mensagemErroEl = document.getElementById('mensagem-erro');
const campoEnderecoEl = document.getElementById('campo-endereco');
const campoTrocoEl = document.getElementById('campo-troco');
const campoOpcoesCartaoEl = document.getElementById('opcoes-cartao');
const quantidadeSaladaEl = document.getElementById('quantidade-salada');

// --- FUNÇÕES DE LÓGICA ---

function resetarSelecaoAtual() {
    saladaAtual = { base: null, proteina: null, opcionais: [], molho: null, extras: [] };
    
    document.querySelectorAll('.opcao.selecionado, .opcao-extra.selecionado').forEach(el => {
        el.classList.remove('selecionado');
    });

    gridOpcionaisEl.querySelectorAll('.opcao-quantia').forEach(opEl => {
        opEl.querySelector('.quantidade-item').textContent = '0';
        opEl.querySelector('.btn-item-menos').disabled = true;
        opEl.classList.remove('item-selecionado'); // Remove a classe que mostra os controles
    });

    quantidadeSaladaEl.value = 1;
    atualizarContadorOpcionais();
    verificarSaladaCompleta();
}

function verificarSaladaCompleta() {
    const totalOpcionaisUnicos = saladaAtual.opcionais.length;
    const completa = saladaAtual.base && saladaAtual.proteina && saladaAtual.molho && totalOpcionaisUnicos >= LIMITE_OPCIONAIS;
    btnAdicionarCarrinho.disabled = !completa;
}

function selecionarOpcaoUnica(tipo, elemento) {
    const grupo = document.getElementById(tipo + 's');
    grupo.querySelectorAll('.opcao').forEach(opt => opt.classList.remove('selecionado'));
    elemento.classList.add('selecionado');
    saladaAtual[tipo] = elemento.dataset.nome;
    verificarSaladaCompleta();
}

function atualizarOpcional(nome, direcao) {
    let opcional = saladaAtual.opcionais.find(op => op.nome === nome);

    if (!opcional && direcao > 0) {
        opcional = { nome: nome, quantidade: 1 };
        saladaAtual.opcionais.push(opcional);
    } else if (opcional) {
        opcional.quantidade += direcao;
        if (opcional.quantidade === 0) {
            saladaAtual.opcionais = saladaAtual.opcionais.filter(op => op.nome !== nome);
        }
    }

    const opcionalEl = gridOpcionaisEl.querySelector(`.opcao-quantia[data-nome="${nome}"]`);
    if (opcionalEl) {
        const quantidadeAtual = opcional ? opcional.quantidade : 0;
        opcionalEl.querySelector('.quantidade-item').textContent = quantidadeAtual;
        opcionalEl.querySelector('.btn-item-menos').disabled = (quantidadeAtual === 0);
        opcionalEl.classList.toggle('item-selecionado', quantidadeAtual > 0);
    }
    
    atualizarContadorOpcionais();
    verificarSaladaCompleta();
}


function selecionarExtra(elemento) {
    const nome = elemento.dataset.nome;
    const preco = parseFloat(elemento.dataset.preco);
    
    const jaSelecionado = saladaAtual.extras.some(extra => extra.nome === nome);
    elemento.classList.toggle('selecionado');

    if (!jaSelecionado) {
        saladaAtual.extras.push({ nome, preco });
    } else {
        saladaAtual.extras = saladaAtual.extras.filter(extra => extra.nome !== nome);
    }
}

function calcularCustoOpcionais(opcionais) {
    const totalItensUnicos = opcionais.length;
    const totalDoses = opcionais.reduce((acc, op) => acc + op.quantidade, 0);

    const dosesPagasUnicas = Math.max(0, totalItensUnicos - LIMITE_OPCIONAIS);
    const dosesPagasRepetidas = totalDoses - totalItensUnicos;

    return (dosesPagasUnicas + dosesPagasRepetidas) * PRECO_OPCIONAL_EXTRA;
}


function atualizarContadorOpcionais() {
    const custo = calcularCustoOpcionais(saladaAtual.opcionais);
    const totalItensUnicos = saladaAtual.opcionais.length;
    
    let textoContador = `(${totalItensUnicos} itens)`;
    if (custo > 0) {
        textoContador += ` - Extras: +${custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
    }
    
    contadorOpcionaisEl.textContent = textoContador;
}

function adicionarAoCarrinho() {
    const quantidade = parseInt(quantidadeSaladaEl.value);
    if (quantidade < 1) return;

    const idOpcionais = saladaAtual.opcionais.map(o => `${o.nome}:${o.quantidade}`).sort().join(',');
    const idExtras = saladaAtual.extras.map(e => e.nome).sort().join(',');
    const idSalada = [
        saladaAtual.base,
        saladaAtual.proteina,
        saladaAtual.molho,
    ].join('-') + `-[OPC:${idOpcionais}]-[EXTRAS:${idExtras}]`;

    const itemExistente = carrinho.find(item => item.id === idSalada);

    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        carrinho.push({
            id: idSalada,
            salada: JSON.parse(JSON.stringify(saladaAtual)),
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

function renderizarCarrinho() {
    listaCarrinhoEl.innerHTML = '';
    secaoCarrinho.classList.toggle('hidden', carrinho.length === 0);
    secaoFinalizar.classList.toggle('hidden', carrinho.length === 0);

    carrinho.forEach((item, index) => {
        const li = document.createElement('li');
        
        const opcionaisStr = item.salada.opcionais.map(op => 
            op.quantidade > 1 ? `${op.nome} (${op.quantidade}x)` : op.nome
        ).join(', ');

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

function atualizarTotalPedido() {
    const totalItens = carrinho.reduce((acc, item) => {
        const custoOpcionais = calcularCustoOpcionais(item.salada.opcionais);
        const precoExtras = item.salada.extras.reduce((subAcc, extra) => subAcc + extra.preco, 0);
        const precoUnitario = PRECO_FIXO_SALADA + custoOpcionais + precoExtras;
        return acc + (item.quantidade * precoUnitario);
    }, 0);
    
    let totalFinal = totalItens;

    if (dadosPedido.metodoEntrega === 'entrega' && carrinho.length > 0) {
        totalFinal += TAXA_ENTREGA;
    }
    
    totalPedidoEl.innerText = totalFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

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

    let mensagem = `Olá, *Salada da Jeh*! 🥗\n\nGostaria de fazer um novo pedido:\n\n`;
    let totalItens = 0;
    
    carrinho.forEach((item) => {
        const custoOpcionais = calcularCustoOpcionais(item.salada.opcionais);
        const precoExtras = item.salada.extras.reduce((subAcc, extra) => subAcc + extra.preco, 0);
        const precoUnitario = PRECO_FIXO_SALADA + custoOpcionais + precoExtras;
        totalItens += item.quantidade * precoUnitario;

        const opcionaisStr = item.salada.opcionais.map(op => 
            op.quantidade > 1 ? `${op.nome} (${op.quantidade}x)` : op.nome
        ).join(', ');
        
        mensagem += `*🥗 ${item.quantidade}x SALADA (${precoUnitario.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} cada)*\n`;
        mensagem += `*- Base:* ${item.salada.base}\n`;
        mensagem += `*- Proteína:* ${item.salada.proteina}\n`;
        mensagem += `*- Opcionais:* ${opcionaisStr}\n`;
        
        if (item.salada.extras.length > 0) {
            const extrasStr = item.salada.extras.map(e => `${e.nome} (+${e.preco.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})})`).join(', ');
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
    let totalFinal = totalItens;
    if (dadosPedido.metodoEntrega === 'entrega') totalFinal += TAXA_ENTREGA;
    mensagem += `----------------------\n*TOTAL:* ${totalFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\n`;
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

    document.querySelectorAll('#bases .opcao').forEach(el => el.addEventListener('click', () => selecionarOpcaoUnica('base', el)));
    document.querySelectorAll('#proteinas .opcao').forEach(el => el.addEventListener('click', () => selecionarOpcaoUnica('proteina', el)));
    document.querySelectorAll('#molhos .opcao').forEach(el => el.addEventListener('click', () => selecionarOpcaoUnica('molho', el)));
    document.querySelectorAll('#extras .opcao-extra').forEach(el => el.addEventListener('click', () => selecionarExtra(el)));
    
    // NOVO: Event listener inteligente para os opcionais
    gridOpcionaisEl.addEventListener('click', (e) => {
        const opcionalEl = e.target.closest('.opcao-quantia');
        if (!opcionalEl) return;

        const nome = opcionalEl.dataset.nome;
        
        if (e.target.classList.contains('btn-item-mais')) {
            atualizarOpcional(nome, 1);
            return;
        }
        
        if (e.target.classList.contains('btn-item-menos')) {
            atualizarOpcional(nome, -1);
            return;
        }

        // Se clicou no card e ele ainda não foi selecionado, seleciona com quantidade 1
        const opcionalState = saladaAtual.opcionais.find(op => op.nome === nome);
        if (!opcionalState || opcionalState.quantidade === 0) {
            atualizarOpcional(nome, 1);
        }
    });
    
    document.querySelectorAll('#metodo-entrega .opcao').forEach(el => el.addEventListener('click', () => selecionarMetodoEntrega(el)));
    document.querySelectorAll('#forma-pagamento .opcao').forEach(el => el.addEventListener('click', () => selecionarFormaPagamento(el)));
    document.querySelectorAll('#tipo-cartao .opcao').forEach(el => el.addEventListener('click', () => selecionarTipoCartao(el)));
    
    btnAdicionarCarrinho.addEventListener('click', adicionarAoCarrinho);
    btnFinalizar.addEventListener('click', enviarPedido);
});