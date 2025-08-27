const TAXA_ENTREGA = 7.00; // Define a taxa de entrega aqui

const pedido = {
    saladaPronta: null,
    folha: null,
    proteina: null,
    molho: null,
    extras: [],
    metodoEntrega: 'entrega' // Valor padrão
};

const precos = {
    saladaPronta: 0,
    folha: 0,
    proteina: 0,
    molho: 0,
};

const mensagemErroEl = document.getElementById('mensagem-erro');
const secaoMonteSuaSalada = document.getElementById('monte-sua-salada');
const campoEnderecoEl = document.getElementById('campo-endereco');

function limparSelecaoMonteSua() {
    secaoMonteSuaSalada.querySelectorAll('.opcao.selecionado').forEach(el => el.classList.remove('selecionado'));
    pedido.folha = null;
    pedido.proteina = null;
    pedido.molho = null;
    pedido.extras = [];
    precos.folha = 0;
    precos.proteina = 0;
    precos.molho = 0;
}

function limparSelecaoPronta() {
    document.querySelectorAll('#saladas-prontas .opcao.selecionado').forEach(el => el.classList.remove('selecionado'));
    pedido.saladaPronta = null;
    precos.saladaPronta = 0;
}

function selecionarSaladaPronta(elemento) {
    limparSelecaoMonteSua();
    secaoMonteSuaSalada.classList.add('desativado');

    const grupo = document.getElementById('saladas-prontas');
    grupo.querySelectorAll('.opcao').forEach(opt => opt.classList.remove('selecionado'));
    elemento.classList.add('selecionado');
    
    pedido.saladaPronta = {
        nome: elemento.dataset.nome,
        descricao: elemento.dataset.descricao
    };
    precos.saladaPronta = parseFloat(elemento.dataset.preco);
    atualizarResumo();
}

function selecionarOpcaoUnica(tipo, elemento) {
    limparSelecaoPronta();
    secaoMonteSuaSalada.classList.remove('desativado');

    const grupo = document.getElementById(tipo);
    grupo.querySelectorAll('.opcao').forEach(opt => opt.classList.remove('selecionado'));
    elemento.classList.add('selecionado');
    
    const tipoSingular = tipo.slice(0, -1);
    pedido[tipoSingular] = elemento.dataset.nome;
    precos[tipoSingular] = parseFloat(elemento.dataset.preco);
    atualizarResumo();
}

function selecionarExtra(elemento) {
    limparSelecaoPronta();
    secaoMonteSuaSalada.classList.remove('desativado');

    const nome = elemento.dataset.nome;
    const preco = parseFloat(elemento.dataset.preco);

    elemento.classList.toggle('selecionado');
    const index = pedido.extras.findIndex(extra => extra.nome === nome);

    if (index > -1) {
        pedido.extras.splice(index, 1);
    } else {
        pedido.extras.push({ nome, preco });
    }
    atualizarResumo();
}

function selecionarMetodoEntrega(elemento) {
    const metodo = elemento.dataset.metodo;
    pedido.metodoEntrega = metodo;

    document.querySelectorAll('#metodo-entrega .opcao').forEach(opt => opt.classList.remove('selecionado'));
    elemento.classList.add('selecionado');

    if (metodo === 'retirada') {
        campoEnderecoEl.style.display = 'none';
    } else {
        campoEnderecoEl.style.display = 'block';
    }
    atualizarResumo(); // Atualiza o resumo para adicionar/remover a taxa
}

function atualizarResumo() {
    const listaResumo = document.getElementById('lista-resumo');
    listaResumo.innerHTML = '';
    let total = 0;
    const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (pedido.saladaPronta) {
        listaResumo.innerHTML += `<li><span>${pedido.saladaPronta.nome}</span> <span>${formatarMoeda(precos.saladaPronta)}</span></li>`;
        total = precos.saladaPronta;
    } else {
        if (pedido.folha) {
            listaResumo.innerHTML += `<li><span>Base: ${pedido.folha}</span> <span>${formatarMoeda(precos.folha)}</span></li>`;
            total += precos.folha;
        }
        if (pedido.proteina) {
            listaResumo.innerHTML += `<li><span>Proteína: ${pedido.proteina}</span> <span>${formatarMoeda(precos.proteina)}</span></li>`;
            total += precos.proteina;
        }
        if (pedido.molho) {
            listaResumo.innerHTML += `<li><span>Molho: ${pedido.molho}</span> <span>${formatarMoeda(precos.molho)}</span></li>`;
            total += precos.molho;
        }
        if (pedido.extras.length > 0) {
            pedido.extras.forEach(extra => {
                listaResumo.innerHTML += `<li><span>Extra: ${extra.nome}</span> <span>${formatarMoeda(extra.preco)}</span></li>`;
                total += extra.preco;
            });
        }
    }
    
    // Adiciona a taxa de entrega se o método for 'entrega'
    if (pedido.metodoEntrega === 'entrega') {
        listaResumo.innerHTML += `<li><span>Taxa de Entrega</span> <span>${formatarMoeda(TAXA_ENTREGA)}</span></li>`;
        total += TAXA_ENTREGA;
    }

    document.getElementById('total-pedido').innerText = `Total: ${formatarMoeda(total)}`;
}

function enviarPedido() {
    const nomeCliente = document.getElementById('nome-cliente').value;
    const enderecoCliente = document.getElementById('endereco-cliente').value;
    const observacoes = document.getElementById('observacoes').value;
    mensagemErroEl.style.display = 'none';

    const isMonteSuaInvalido = !pedido.folha || !pedido.proteina || !pedido.molho;
    if (!pedido.saladaPronta && isMonteSuaInvalido) {
        mensagemErroEl.innerText = 'Por favor, escolha uma salada pronta ou monte a sua por completo!';
        mensagemErroEl.style.display = 'block';
        return;
    }
    if (nomeCliente.trim() === '') {
        mensagemErroEl.innerText = 'Por favor, preencha seu nome!';
        mensagemErroEl.style.display = 'block';
        return;
    }
    if (pedido.metodoEntrega === 'entrega' && enderecoCliente.trim() === '') {
         mensagemErroEl.innerText = 'Por favor, preencha seu endereço para entrega!';
        mensagemErroEl.style.display = 'block';
        return;
    }

    let total = 0;
    let mensagem = `Olá, *Salada da Jeh*! 🥗\nGostaria de fazer um novo pedido:\n\n`;
    mensagem += `*Cliente:* ${nomeCliente}\n`;
    
    if (pedido.metodoEntrega === 'entrega') {
        mensagem += `*Método:* Entrega 🛵\n`;
        mensagem += `*Endereço:* ${enderecoCliente}\n\n`;
    } else {
        mensagem += `*Método:* Retirada no local 🛍️\n\n`;
    }

    if (pedido.saladaPronta) {
        total = precos.saladaPronta;
        mensagem += `*SALADA PRONTA*\n`;
        mensagem += `----------------------\n`;
        mensagem += `*Item:* ${pedido.saladaPronta.nome}\n`;
        mensagem += `(${pedido.saladaPronta.descricao})\n`;
    } else {
        total = precos.folha + precos.proteina + precos.molho;
        pedido.extras.forEach(extra => total += extra.preco);
        mensagem += `*SALADA MONTADA*\n`;
        mensagem += `----------------------\n`;
        mensagem += `*Base:* ${pedido.folha}\n`;
        mensagem += `*Proteína:* ${pedido.proteina}\n`;
        mensagem += `*Molho:* ${pedido.molho}\n`;
        if (pedido.extras.length > 0) {
            mensagem += `*Extras:*\n`;
            pedido.extras.forEach(extra => {
                mensagem += `  - ${extra.nome}\n`;
            });
        }
    }

    if (pedido.metodoEntrega === 'entrega') {
        total += TAXA_ENTREGA;
    }
    
    if (observacoes.trim() !== '') {
        mensagem += `\n*Observações:* ${observacoes}\n`;
    }
    
    mensagem += `----------------------\n`;
    mensagem += `*TOTAL:* R$ ${total.toFixed(2).replace('.', ',')}\n\n`;
    mensagem += `Aguardo a confirmação do meu pedido. Obrigado!`;

    const numeroWhatsApp = '5535000000000';
    const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(linkWhatsApp, '_blank');
}

// Adiciona os "escutadores" de clique aos elementos da página
document.querySelectorAll('#saladas-prontas .opcao').forEach(el => {
    el.addEventListener('click', () => selecionarSaladaPronta(el));
});
document.querySelectorAll('#folhas .opcao, #proteinas .opcao, #molhos .opcao').forEach(el => {
    const tipo = el.parentElement.id;
    el.addEventListener('click', () => selecionarOpcaoUnica(tipo, el));
});
document.querySelectorAll('#extras .opcao').forEach(el => {
    el.addEventListener('click', () => selecionarExtra(el));
});
document.querySelectorAll('#metodo-entrega .opcao').forEach(el => {
    el.addEventListener('click', () => selecionarMetodoEntrega(el));
});
