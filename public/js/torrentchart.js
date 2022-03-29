// fetch("/sample.json")
fetch("/api/torrent/relative")
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        // console.log(data);
        drawChart(data);
    });


function drawChart(importedData) {
    const config = {
        type: 'line',
        data: {
            datasets: importedData
        },
        options: {
            spanGaps: true,
            animation: false,
            parsing: false,
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'nearest',
                axis: 'xy'
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function (context) {
                            if (context.parsed.y == 0) {
                                return;
                            }
                            return [`${context.parsed.y} MB - ${context.dataset.label.substring(0, 50)}`]
                        }
                    }
                },
                legend: {
                    display: false
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'xy',
                    },
                    zoom: {
                        animation: {
                            duration: 0
                        },
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        drag: {
                            enabled: true,
                            borderColor: 'rgb(54, 162, 235)',
                            borderWidth: 1,
                            backgroundColor: 'rgba(54, 162, 235, 0.3)',
                            modifierKey: 'ctrl'
                        },
                        mode: 'xy',
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        displayFormats: {
                            quarter: 'MMM YYYY'
                        },
                        minUnit: 'day'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'MB'
                    }
                }
            },
            elements: {
                point: {
                    radius: 0
                },
                line: {
                    width: 1
                }
            }
        }
    };

    const myChart = new Chart(
        document.getElementById('myChart'),
        config
    );
}