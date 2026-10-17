const comeco = "novo mundo";
console.log(comeco);


// logica do grafico usando biblioteca
const ctx = document.getElementById('meuGrafico').getContext('2d');
// pega a tag do html para ligar a biblioteca

const meuGrafico = new Chart(ctx,{
    type: 'line',
    //tipo do grafico
    data:{ 
        //cofiguração das 3 linhas

        labels:['2021','2022','2023'],

    datasets:[
        {
            label:'valor gasto',
            data:[2021,2022,2023],
            borderColor:'#e63946',
            backgroundColor:'#e63946',
            tension:0.3
        },
        {
             label: 'Valor Ganho',
                data:[2021,2022,2023], 
                borderColor: '#4ea8de',  
                backgroundColor: '#4ea8de',
                tension: 0.3
        },
        {
            label: 'Valor em Estoque',
                data:[2021,2022,2023] , 
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

    // Calculo automático
    const estoqueCalculado = (quant * preco).toFixed(2);
    
    // Formatação para o padrão de moeda brasileiro (R\$ XX,XX)
    const precoBr = preco.toFixed(2).replace('.', ',');
    const estoqueBr = parseFloat(estoqueCalculado).toFixed(2).replace('.', ',');
    const gastoBr = gasto.toFixed(2).replace('.', ',');

    if (linhaSendoEditada) {
        // MODO EDIÇÃO (Corrigido o "t" de linhaSendoEditada)
        linhaSendoEditada.cells[0].innerText = nome;
        linhaSendoEditada.cells[1].innerText = quant;
        linhaSendoEditada.cells[2].innerText = `R$ ${precoBr}`;
        linhaSendoEditada.cells[3].innerText = `R$ ${estoqueBr}`; 
        linhaSendoEditada.cells[4].innerText = `R$ ${gastoBr}`;
    } else {
        // MODO ADICIONAR (Agora os valores nascem com R\$ e vírgula!)
        const novaLinha = document.createElement('tr');
        novaLinha.innerHTML = `
            <td>${nome}</td>
            <td>${quant}</td>
            <td>R$ ${precoBr}</td>
            <td class="valor-estoque">R$ ${estoqueBr}</td>
            <td class="valor-gasto">R$ ${gastoBr}</td>
            <td>
                <button class="btn-editar">Editar</button>
                <button class="btn-excluir">X</button>
            </td>
        `;
        
        // Insere no começo do corpo da tabela
        corpoTabela.insertBefore(novaLinha, corpoTabela.firstChild);
        adicionarEventosLinha(novaLinha);
    }

    modal.style.display = "none";
    if (typeof atualizarGraficoDinamico === "function") atualizarGraficoDinamico();
}

// 🌟 DEFINIÇÃO DA FUNÇÃO (Colocada aqui para o onsubmit conseguir encontrá-la)
function adicionarEventosLinha(linha) {
    const btnEditar = linha.querySelector('.btn-editar');
    const btnExcluir = linha.querySelector('.btn-excluir');

    if (btnEditar) {
        btnEditar.onclick = function() {
            linhaSendoEditada = linha;
            document.getElementById('modalTitulo').innerText = "Modificar Produto";
            
            // Puxa os dados da linha de volta para os campos do formulário limpos
            document.getElementById('nomeProd').value = linha.cells[0].innerText;
            document.getElementById('quantProd').value = linha.cells[1].innerText;
            document.getElementById('precoProd').value = linha.cells[2].innerText.replace('R\$ ', '').replace(',', '.');
            document.getElementById('gastoProd').value = linha.cells[4].innerText.replace('R\$ ', '').replace(',', '.');
            
            modal.style.display = "block";
        }
    }

    if (btnExcluir) {
        btnExcluir.onclick = function() {
            if (confirm("Deseja mesmo excluir este produto?")) {
                linha.remove();
                if (typeof atualizarGraficoDinamico === "function") atualizarGraficoDinamico();
            }
        }
    }
}

// Aplica a lógica nas linhas que já começaram criadas de forma estática no HTML
document.querySelectorAll('#corpo-tabela tr').forEach(linha => adicionarEventosLinha(linha));
