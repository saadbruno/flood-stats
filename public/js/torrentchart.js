// const labels = Utils.months({count: 7});
// const data = {
//   labels: labels,
//   datasets: [{
//     label: 'My First Dataset',
//     data: [65, 59, 80, 81, 56, 55, 40],
//     fill: false,
//     borderColor: 'rgb(75, 192, 192)',
//     tension: 0.1
//   }]
// };
fetch("/api/torrent")
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data);
        drawChart(data);
    });


function drawChart(importedData) {
    const config = {
        type: 'line',
        data: {
            datasets: importedData
        },
        options: {
            interaction: {
                intersect: false,
                mode: 'nearest',
                axis: 'xy'
            },
            parsing: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        displayFormats: {
                            quarter: 'MMM YYYY'
                        }
                    }
                }
            }
        }
    };

    const myChart = new Chart(
        document.getElementById('myChart'),
        config
    );
}