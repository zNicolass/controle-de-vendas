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
