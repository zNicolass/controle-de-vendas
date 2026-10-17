const comeco = "novo mundo";
console.log(comeco); 


// para guardar dados do grafico

// 📦 BANCO DE DADOS ÚNICO: Registra cada venda em ordem cronológica pura
const historicoVendasUnificado = JSON.parse(localStorage.getItem('historicoVendas')) ||[];

// Filtro padrão de exibição inicial
let filtroTemporalAtual = 'dia'; 


//variavel global, não mexer

let faturamentoAcumulado = parseFloat(localStorage.getItem('faturamentoAcumulado')) || 0;

// linha do tempo do grafico

function obterDataAtualFormatada() {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const hora = String(data.getHours()).padStart(2, '0');
    const min = String(data.getMinutes()).padStart(2, '0');
    const seg = String(data.getSeconds()).padStart(2, '0');
    
    // Retorna no formato: "2026-10-17 18:30:15"
    return `${ano}-${mes}-${dia} ${hora}:${min}:${seg}`;
}


// logica do grafico usando biblioteca
const ctx = document.getElementById('meuGrafico').getContext('2d');
// pega a tag do html para ligar a biblioteca

const meuGrafico = new Chart(ctx,{
    type: 'line',
    //tipo do grafico
    data:{ 
        //cofiguração das 3 linhas

        labels:[],

    datasets:[
        {
            label:'valor gasto',
            data: [],
            borderColor:'#e63946',
            backgroundColor:'#e63946',
            tension:0.3
        },
        {
             label: 'Valor Ganho',
                data:[], 
                borderColor: '#4ea8de',  
                backgroundColor: '#4ea8de',
                tension: 0.3
        },
        {
            label: 'Valor em Estoque',
                data: [], 
                borderColor: '#70e000',   
                backgroundColor: '#70e000',
                tension: 0.3
        }
    ]
},
options: {
    responsive:true,
    plugins:{
        legend:{
            position:'top'
        }
    },
    scales:{
        y:{beginAtZero:true

        }
    }
}

});

// dados de atualização do grafico a partir da venda de produtos

// =========================================================================
// 2. LOGICA DE SELEÇÃO E PROCESSO DE VENDA 
// =========================================================================
const modalVenda = document.getElementById('modalVenda');
const fecharVenda = document.querySelector('.fechar-modal-venda');
let linhaSelecionadaParaVenda = null;

if(fecharVenda) fecharVenda.onclick = () => modalVenda.style.display = "none";

// 💰 PROCESSAR A VENDA, SUBTRAIR ESTOQUE E ATUALIZAR GRÁFICO
document.getElementById('formVenda').onsubmit = function(e) {
    e.preventDefault();
    
    const quantAVender = parseInt(document.getElementById('vendaQuant').value) || 0;
    const quantAtual = parseInt(linhaSelecionadaParaVenda.cells[1].innerText) || 0;
    const precoUnitario = parseFloat(linhaSelecionadaParaVenda.cells[2].innerText.replace('R\$ ', '').replace(',', '.')) || 0;

    if (quantAVender > quantAtual) {
        alert("Quantidade insuficiente em estoque!");
        return;
    }

    // 1. Subtrai a quantidade máxima atual
    const novaQuantidade = quantAtual - quantAVender;
    linhaSelecionadaParaVenda.cells[1].innerText = novaQuantidade;

    // 2. Recalcula automaticamente o valor em estoque da linha
    const novoEstoqueValor = (novaQuantidade * precoUnitario).toFixed(2);
    linhaSelecionadaParaVenda.cells[3].innerText = `R$ ${novoEstoqueValor.replace('.', ',')}`;
 
    if (novaQuantidade === 0) {
        linhaSelecionadaParaVenda.cells[4].innerText = "R$ 0,00";
    }

    // 3. Calcula o faturamento da venda
    const valorDaVenda = quantAVender * precoUnitario;
    faturamentoAcumulado += valorDaVenda; 

    // Atualiza os totais de baixo da tabela
    calcularTotaisRodape();

 //  data de registro do banco de dados

   // 4. Captura e limpa os totais da tabela para o banco de dados
    const textoEstoqueTotal = document.getElementById('soma-estoque').innerText;
    const textoGastoTotal = document.getElementById('soma-gasto').innerText;
    
    const estoqueGrafico = parseFloat(textoEstoqueTotal.replace('R\$', '').replace(/\s/g, '').replace('.', '').replace(',', '.')) || 0;
    const gastoGrafico = parseFloat(textoGastoTotal.replace('R\$', '').replace(/\s/g, '').replace('.', '').replace(',', '.')) || 0;

    const dataHoraRegistro = obterDataAtualFormatada();

    // Salva na lista cronológica geral com as variáveis corretas
    historicoVendasUnificado.push({
        dataHora: dataHoraRegistro,
        estoque: estoqueGrafico,
        gasto: gastoGrafico,
        ganho: faturamentoAcumulado
    });
        // GRAVAÇÃO OFFLINE PERMANENTE: Salva a lista e o faturamento no computador
    localStorage.setItem('historicoVendas', JSON.stringify(historicoVendasUnificado));
    localStorage.setItem('faturamentoAcumulado', faturamentoAcumulado);


    // Filtra e redesenha as linhas do gráfico baseado no botão ativo
    renderizarGraficoComFiltro();
    
    modalVenda.style.display = "none"; 
};



// =========================================================================
// 3. FAZER OS BOTÕES 'DIA, MÊS, ANO' GERENCIAREM O GRÁFICO (Atualizado)
// =========================================================================
document.querySelectorAll('.filtros-grafico button').forEach(botao => {
    botao.onclick = function() {
        document.querySelectorAll('.filtros-grafico button').forEach(b => b.classList.remove('ativo'));
        this.classList.add('ativo');

        filtroTemporalAtual = this.innerText.toLowerCase().trim();

        // Limpa o gráfico para receber a nova linha do tempo limpa
        bancoDeDadosDoApp.labels = [];
        bancoDeDadosDoApp.gasto = [];
        bancoDeDadosDoApp.ganho = [];
        bancoDeDadosDoApp.estoque = [];
        
        meuGrafico.update();
    };
});


/* parte de janela flutuante cadastrar/modificar produto */


const modal = document.getElementById('modalProduto');
const btnNovo = document.getElementById('adicionarCelula'); 
const spanFechar = document.querySelector('.fechar-modal');
const form = document.getElementById('formProduto');
const corpoTabela = document.getElementById('corpo-tabela');

let linhaSendoEditada = null;

// Abrir modal para NOVO produto
btnNovo.onclick = function() {
    form.reset();
    document.getElementById('modalTitulo').innerText = "Adicionar Novo Produto";
    linhaSendoEditada = null;
    modal.style.display = "block";
}

// Fechar modal
spanFechar.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; }


// Adicionar ou Modificar Produto ao Submeter o formulário

form.onsubmit = function(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nomeProd').value;
    const quant = parseInt(document.getElementById('quantProd').value) || 0;
    const preco = parseFloat(document.getElementById('precoProd').value) || 0;
    const gasto = parseFloat(document.getElementById('gastoProd').value) || 0;

    // Calculo automatico
    const estoqueCalculado = (quant * preco).toFixed(2);
    const precoFormatado = preco.toFixed(2).replace('.', ',');
    const estoqueBr = parseFloat(estoqueCalculado).toFixed(2).replace('.', ',');
    const gastoFormatado = gasto.toFixed(2).replace('.', ',');

    if (linhaSendoEditada) {
        // MODO EDIÇÃO: Atualiza os dados e restaura o gasto inserido
        linhaSendoEditada.cells[0].innerText = nome;
        linhaSendoEditada.cells[1].innerText = quant;
        linhaSendoEditada.cells[2].innerText = `R$ ${precoFormatado}`;
        linhaSendoEditada.cells[3].innerText = `R$ ${estoqueBr}`; 
        linhaSendoEditada.cells[4].innerText = `R$ ${gastoFormatado}`;
        // Salva na memória oculta da linha o gasto original atualizado
        linhaSendoEditada.setAttribute('data-gasto-inicial', gasto.toFixed(2));
    } else {
        // MODO ADICIONAR: Cria a linha guardando o 'data-gasto-inicial'
        const novaLinha = document.createElement('tr');
        novaLinha.setAttribute('data-gasto-inicial', gasto.toFixed(2));
        novaLinha.innerHTML = `
            <td>${nome}</td>
            <td>${quant}</td>
            <td>R$ ${precoFormatado}</td>
            <td class="valor-estoque">R$ ${estoqueBr}</td>
            <td class="valor-gasto">R$ ${gastoFormatado}</td>
            <td>
                <button class="btn-vender-linha">🛒</button>
                <button class="btn-editar">Editar</button>
                <button class="btn-excluir">X</button>
            </td>
        `;
        corpoTabela.insertBefore(novaLinha, corpoTabela.firstChild);
        adicionarEventosLinha(novaLinha);
    }

    modal.style.display = "none";
    calcularTotaisRodape();
}


//função para atualizar com o carrinho tambem
// 🌟 DEFINIÇÃO DA FUNÇÃO (Colocada aqui para o onsubmit conseguir encontrá-la)
function adicionarEventosLinha(linha) {
    const btnEditar = linha.querySelector('.btn-editar');
    const btnExcluir = linha.querySelector('.btn-excluir');
    const btnVenderLinha = linha.querySelector('.btn-vender-linha'); // Captura o carrinho 🛒

    // 🛒 CLIQUE NO CARRINHO DA LINHA
    if (btnVenderLinha) {
        btnVenderLinha.onclick = function() {
            linhaSelecionadaParaVenda = linha;
            const nomeProd = linha.cells[0].innerText;
            const quantAtual = parseInt(linha.cells[1].innerText) || 0;

            // Preenche as informações na janela de venda
            document.getElementById('vendaNomeProduto').innerText = `Produto: ${nomeProd}`;
            document.getElementById('vendaMaxAviso').innerText = `Disponível em estoque: ${quantAtual} unidades`;
            document.getElementById('vendaQuant').max = quantAtual; 
            document.getElementById('vendaQuant').value = "";
            
            // Abre a janela de vendas
            document.getElementById('modalVenda').style.display = "block";
        }
    }

    // ✏️ CLIQUE NO BOTÃO EDITAR (Corrigido para linhaSendoEditada)
    if (btnEditar) {
        btnEditar.onclick = function() {
            linhaSendoEditada = linha;
            document.getElementById('modalTitulo').innerText = "Modificar Produto";
            
            document.getElementById('nomeProd').value = linha.cells[0].innerText;
            document.getElementById('quantProd').value = linha.cells[1].innerText;
            document.getElementById('precoProd').value = linha.cells[2].innerText.replace('R\$ ', '').replace(',', '.');
            document.getElementById('gastoProd').value = linha.cells[4].innerText.replace('R\$ ', '').replace(',', '.');
            
            document.getElementById('modalProduto').style.display = "block";
        }
    }

    // ❌ CLIQUE NO BOTÃO EXCLUIR
    if (btnExcluir) {
        btnExcluir.onclick = function() {
            if (confirm("Deseja mesmo excluir este produto?")) {
                linha.remove();
                calcularTotaisRodape();
                if (typeof atualizarGraficoDinamico === "function") atualizarGraficoDinamico();
            }
        }
    }
}


// Aplica a lógica nas linhas que já começaram criadas de forma estática no HTML
document.querySelectorAll('#corpo-tabela tr').forEach(linha => adicionarEventosLinha(linha));



// Função para calcular valores finais na tabela

function calcularTotaisRodape() {
    let totalEstoque = 0;
    let totalGasto = 0;

    // 1. Varre todas as células com a classe 'valor-estoque' e soma os valores
    document.querySelectorAll('.valor-estoque').forEach(celula => {
        // Limpa o 'R\$', remove espaços e troca a vírgula por ponto para o JS conseguir somar
        let valorTexto = celula.innerText.replace('R\$', '').replace(/\s/g, '').replace(',', '.');
        totalEstoque += parseFloat(valorTexto) || 0;
    });

    // 2. Varre todas as células com a classe 'valor-gasto' e soma os valores
    document.querySelectorAll('.valor-gasto').forEach(celula => {
        let valorTexto = celula.innerText.replace('R\$', '').replace(/\s/g, '').replace(',', '.');
        totalGasto += parseFloat(valorTexto) || 0;
    });

    // 3. Formata os valores de volta para o padrão de moeda brasileiro (R\$ XX,XX)
    const totalEstoqueBr = totalEstoque.toFixed(2).replace('.', ',');
    const totalGastoBr = totalGasto.toFixed(2).replace('.', ',');

    // 4. Injeta os valores calculados na tela dentro dos spans do tfooter
    document.getElementById('soma-estoque').innerText = `R$ ${totalEstoqueBr}`;
    document.getElementById('soma-gasto').innerText = `R$ ${totalGastoBr}`;
}

//função para processar o banco de dados e colocar nas linhas do grafico

function renderizarGraficoComFiltro() {
    const labelsFiltradas = [];
    const dadosGasto = [];
    const dadosGanho = [];
    const dadosEstoque = [];

    historicoVendasUnificado.forEach(venda => {
        // Quebra o texto para ler ano, mês, dia e hora
        const [dataParte, horaParte] = venda.dataHora.split(' ');
        const [ano, mes, dia] = dataParte.split('-');
        const [hora, min, seg] = horaParte.split(':');

        let labelFormatada = '';

        if (filtroTemporalAtual === 'dia') {
            labelFormatada = `${hora}:${min}:${seg}`; // Mostra o segundo exato no teste do dia
        } else if (filtroTemporalAtual === 'mês') {
            const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            labelFormatada = mesesNomes[parseInt(mes) - 1];
        } else {
            labelFormatada = ano;
        }

        labelsFiltradas.push(labelFormatada);
        dadosGasto.push(venda.gasto);
        dadosGanho.push(venda.ganho);
        dadosEstoque.push(venda.estoque);
    });

    // Envia as listas processadas para o Chart.js desenhar
    meuGrafico.data.labels = labelsFiltradas;
    meuGrafico.data.datasets[0].data = dadosGasto;
    meuGrafico.data.datasets[1].data = dadosGanho;
    meuGrafico.data.datasets[2].data = dadosEstoque;

    meuGrafico.update();
}

//alterar visualização apartir dos botões do grafico

document.querySelectorAll('.filtros-grafico button').forEach(botao => {
    botao.onclick = function() {
        document.querySelectorAll('.filtros-grafico button').forEach(b => b.classList.remove('ativo'));
        this.classList.add('ativo');

        filtroTemporalAtual = this.innerText.toLowerCase().trim();

        // Recalcula a exibição dos mesmos dados salvos sob o novo filtro
        renderizarGraficoComFiltro();
    };
});

// força o grafico a usar os dados da memoria assim que abrir o app
if (typeof renderizarGraficoComFiltro === "function") {
    renderizarGraficoComFiltro();
}
