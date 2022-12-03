(function() {
  /* 
    Examples of Area Charts
    More on https://codyhouse.co/ds/components/info/area-chart
  */

  var statsCard1 = document.getElementById('stats-card-chart-1');
  if(statsCard1) {
    new Chart({
      element: statsCard1,
      type: 'area',
      xAxis: {
        labels: false,
        guides: false
      },
      yAxis: {
        labels: false,
        range: [0, 16], // 16 is the max value in the chart data
        step: 1
      },
      datasets: [
        {
          data: [1, 2, 3, 12, 8, 7, 10, 4, 9, 5, 16, 3]
        }
      ],
      tooltip: {
        enabled: true,
      },
      padding: 6,
      animate: true
    });
  };

  var statsCard2 = document.getElementById('stats-card-chart-2');
  if(statsCard2) {
    new Chart({
      element: statsCard2,
      type: 'area',
      xAxis: {
        labels: false,
        guides: false
      },
      yAxis: {
        labels: false,
        range: [0, 11], // 11 is the max value in the chart data
        step: 1
      },
      datasets: [
        {
          data: [8, 5, 6, 10, 8, 4, 5, 6, 11, 5, 7, 4]
        }
      ],
      tooltip: {
        enabled: true,
      },
      padding: 6,
      animate: true
    });
  };

  var statsCard3 = document.getElementById('stats-card-chart-3');
  if(statsCard3) {
    new Chart({
      element: statsCard3,
      type: 'area',
      xAxis: {
        labels: false,
        guides: false
      },
      yAxis: {
        labels: false,
        range: [0, 16], // 16 is the max value in the chart data
        step: 1
      },
      datasets: [
        {
          data: [8, 12, 6, 15, 10, 8, 15, 8, 12, 7, 16, 13]
        }
      ],
      tooltip: {
        enabled: true,
      },
      padding: 6,
      animate: true
    });
  };

  var statsCard4 = document.getElementById('stats-card-chart-4');
  if(statsCard4) {
    new Chart({
      element: statsCard4,
      type: 'area',
      xAxis: {
        labels: false,
        guides: false
      },
      yAxis: {
        labels: false,
        range: [0, 16], // 16 is the max value in the chart data
        step: 1
      },
      datasets: [
        {
          data: [5, 16, 3, 2, 9, 7, 16, 3, 10, 4, 9, 5]
        }
      ],
      tooltip: {
        enabled: true,
      },
      padding: 6,
      animate: true
    });
  };

  // Smooth Area Chart
  var areaChart1 = document.getElementById('area-chart-card-1');
  if(areaChart1) {
    new Chart({
      element: areaChart1,
      type: 'area',
      smooth: true,
      xAxis: {
        line: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ticks: true
      },
      yAxis: {
        labels: true
      },
      datasets: [
        {
          data: [1, 2, 3, 12, 8, 7, 10, 4, 9, 5, 16, 3]
        }
      ],
      tooltip: {
        enabled: true,
        customHTML: function(index, chartOptions, datasetIndex) {
          return '<span class="color-contrast-medium">'+chartOptions.xAxis.labels[index] + ':</span> $'+chartOptions.datasets[datasetIndex].data[index]+'';
        }
      },
      animate: true
    });
  }

  // Negative Values
  var areaChart2 = document.getElementById('area-chart-card-2');
  if(areaChart2) {
    new Chart({
      element: areaChart2,
      type: 'area',
      fillOrigin: true,
      xAxis: {
        line: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ticks: true
      },
      yAxis: {
        labels: true
      },
      datasets: [
        {
          data: [10, 7, 4, -1, -5, -7, -6, -4, -1, 3, 5, 2]
        }
      ],
      tooltip: {
        enabled: true,
        customHTML: function(index, chartOptions, datasetIndex) {
          return '<span class="color-contrast-medium">'+chartOptions.xAxis.labels[index] + ':</span> '+chartOptions.datasets[datasetIndex].data[index]+'$';
        }
      },
      animate: true
    });
  }

  // Multi-Set Area Chart
  var areaChart3 = document.getElementById('area-chart-card-3');
  if(areaChart3) {
    new Chart({
      element: areaChart3,
      type: 'area',
      xAxis: {
        line: true,
        ticks: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      },
      yAxis: {
        labels: true
      },
      datasets: [
        {data: [5, 7, 11, 13, 18, 16, 17, 13, 16, 8, 15, 8]},
        {data: [1, 2, 3, 6, 4, 11, 9, 10, 9, 4, 7, 3]}
      ],
      tooltip: {
        enabled: true,
        position: 'top',
        customHTML: function(index, chartOptions, datasetIndex) {
          var html = '<p class="margin-bottom-xxs">Total '+chartOptions.xAxis.labels[index] + '</p>';
          html = html + '<p class="flex items-center"><span class="height-xxxs width-xxxs radius-50% bg-primary margin-right-xxs"></span>$'+chartOptions.datasets[0].data[index]+'</p>';
          html = html + '<p class="flex items-center"><span class="height-xxxs width-xxxs radius-50% bg-accent margin-right-xxs"></span>$'+chartOptions.datasets[1].data[index]+'</p>';
          return html;
        }
      },
      animate: true
    });
  }

  // External Data Value Area Chart
  var areaChart4 = document.getElementById('area-chart-card-4');
  if(areaChart4) {
    new Chart({
      element: areaChart4,
      type: 'area',
      xAxis: {
        line: true,
        ticks: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      },
      yAxis: {
        labels: true
      },
      datasets: [
        {data: [1, 2, 3, 6, 4, 11, 9, 10, 9, 4, 7, 3]},
      ],
      animate: true,
      externalData : {
        customXHTML: function(index, chartOptions, datasetIndex) {
          return ' '+chartOptions.xAxis.labels[index];
        }
      }
    });
  }

  /* 
    Examples of Column Charts
    More on https://codyhouse.co/ds/components/info/column-chart
  */

  // Column Chart
  var columnChart1 = document.getElementById('column-chart-1');
  if(columnChart1) {
    new Chart({
      element: columnChart1,
      type: 'column',
      xAxis: {
        line: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ticks: true
      },
      yAxis: {
        labels: true
      },
      datasets: [
        {data: [1, 2, 3, 12, 8, 7, 10, 4, 9, 5, 16, 3]},
      ],
      column: {
        width: '60%',
        gap: '2px',
        radius: '4px'
      },
      tooltip: {
        enabled: true,
        customHTML: function(index, chartOptions, datasetIndex) {
          return '<span class="color-contrast-medium">'+chartOptions.xAxis.labels[index] + ':</span> $'+chartOptions.datasets[datasetIndex].data[index]+'';
        }
      },
      animate: true
    });
  };

  // Negative Values
  var columnChart2 = document.getElementById('column-chart-2');
  if(columnChart2) {
    new Chart({
      element: columnChart2,
      type: 'column',
      xAxis: {
        line: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ticks: true
      },
      yAxis: {
        labels: true
      },
      datasets: [
        {data: [1, 4, 8, 5, 3, -2, -5, -7, 4, 9, 5, 10, 3]},
      ],
      column: {
        width: '60%',
        gap: '2px',
        radius: '4px'
      },
      tooltip: {
        enabled: true,
        customHTML: function(index, chartOptions, datasetIndex) {
          return '<span class="color-contrast-medium">'+chartOptions.xAxis.labels[index] + ':</span> '+chartOptions.datasets[datasetIndex].data[index]+'$';
        }
      },
      animate: true
    });
  };

  // Multi-Set Column Chart
  var columnChart3 = document.getElementById('column-chart-3');
  if(columnChart3) {
    new Chart({
      element: columnChart3,
      type: 'column',
      xAxis: {
        line: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ticks: true
      },
      yAxis: {
        labels: true
      },
      datasets: [
        {data: [1, 2, 3, 12, 8, 7, 10, 4, 9, 5, 16, 3]},
        {data: [4, 8, 10, 12, 15, 11, 7, 3, 5, 2, 12, 6]}
      ],
      column: {
        width: '60%',
        gap: '2px',
        radius: '4px'
      },
      tooltip: {
        enabled: true,
        customHTML: function(index, chartOptions, datasetIndex) {
          var html = '<p class="margin-bottom-xxs">Total '+chartOptions.xAxis.labels[index] + '</p>';
          html = html + '<p class="flex items-center"><span class="height-xxxs width-xxxs radius-50% bg-primary margin-right-xxs"></span>$'+chartOptions.datasets[0].data[index]+'</p>';
          html = html + '<p class="flex items-center"><span class="height-xxxs width-xxxs radius-50% bg-contrast-higher margin-right-xxs"></span>$'+chartOptions.datasets[1].data[index]+'</p>';
          return html;
        },
        position: 'top'
      },
      animate: true
    });
  };

  // Stacked Column Chart
  var columnChart4 = document.getElementById('column-chart-4');
  if(columnChart4) {
    new Chart({
      element: columnChart4,
      type: 'column',
      stacked: true,
      xAxis: {
        line: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ticks: true
      },
      yAxis: {
        labels: true
      },
      datasets: [
        {data: [1, 2, 3, 12, 8, 7, 10, 4, 9, 5, 16, 3]},
        {data: [4, 8, 10, 12, 15, 11, 7, 3, 5, 2, 12, 6]}
      ],
      column: {
        width: '60%', 
        gap: '2px',
        radius: '4px'
      },
      tooltip: {
        enabled: true,
        customHTML: function(index, chartOptions, datasetIndex) {
          var html = '<p class="margin-bottom-xxs">Total '+chartOptions.xAxis.labels[index] + '</p>';
          html = html + '<p class="flex items-center"><span class="height-xxxs width-xxxs radius-50% bg-primary margin-right-xxs"></span>$'+chartOptions.datasets[0].data[index]+'</p>';
          html = html + '<p class="flex items-center"><span class="height-xxxs width-xxxs radius-50% bg-contrast-higher margin-right-xxs"></span>$'+chartOptions.datasets[1].data[index]+'</p>';
          return html;
        },
        position: 'top'
      },
      animate: true
    });
  };

  /* 
    Examples of Line Charts
    More on https://codyhouse.co/ds/components/info/line-chart
  */

  // Smooth Line Chart
  var lineChart1 = document.getElementById('line-chart-1');
  if(lineChart1) {
    new Chart({
      element: lineChart1,
      type: 'line',
      smooth: true,
      xAxis: {
        line: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ticks: true
      },
      yAxis: {
        labels: true
      },
      datasets: [
        {
          data: [1, 2, 3, 12, 8, 7, 10, 4, 9, 5, 16, 3]
        }
      ],
      tooltip: {
        enabled: true,
        customHTML: function(index, chartOptions, datasetIndex) {
          return '<span class="color-contrast-medium">'+chartOptions.xAxis.labels[index] + ':</span> $'+chartOptions.datasets[datasetIndex].data[index]+'';
        }
      },
      animate: true
    }); 
  };

  // Timeline Chart
  var lineChart2 = document.getElementById('line-chart-2');
  if(lineChart2) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    function getNiceDate(timestamp) {
      // custom function to transform timestamp values to formatted dates
      var date = new Date(timestamp);
      var day = date.getDate(),
        month = date.getMonth();
      return day+' '+months[month]; //e.g., '12 Mar'
    };

    new Chart({
      element: lineChart2,
      type: 'line',
      xAxis: {
        line: true,
        ticks: true,
        labels: true,
        // range: [firstDate, lastDate]
        // use new Date('yyyy-mm-dd').getTime() to get the timestamp value of your date
        range: [new Date('2018-02-25').getTime(), new Date('2018-03-05').getTime()],
        step: (86400000*2), // two days
        labelModifier: function(value) {
          return getNiceDate(value);
        },
      },
      yAxis: {
        legend: 'Temp',
        labels: true
      },
      datasets: [
        {
          data: [
            [new Date('2018-02-25').getTime(), 1], 
            [new Date('2018-02-26').getTime(), 10], 
            [new Date('2018-02-27').getTime(), 7], 
            [new Date('2018-02-28').getTime(), 12], 
            [new Date('2018-03-01').getTime(), 8],
            [new Date('2018-03-02').getTime(), 10], 
            [new Date('2018-03-03').getTime(), 4],
            [new Date('2018-03-04').getTime(), 8], 
            [new Date('2018-03-05').getTime(), 10]
          ]
        }
      ],
      tooltip: {
        enabled: true,
        customHTML: function(index, chartOptions, datasetIndex) {
          return '<span class="color-contrast-medium">'+getNiceDate(chartOptions.datasets[datasetIndex].data[index][0])+' - </span> '+chartOptions.datasets[datasetIndex].data[index][1] + '°C';
        }
      },
      animate: true
    });
  };

  // Multi-Line Chart
  var lineChart3 = document.getElementById('line-chart-3');
  if(lineChart3) {
    new Chart({
      element: lineChart3,
      type: 'line',
      xAxis: {
        line: true,
        ticks: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      },
      yAxis: {
        labels: true
      },
      datasets: [
        {data: [1, 2, 3, 6, 4, 11, 9, 10, 9, 4, 7, 3]},
        {data: [5, 7, 11, 13, 18, 16, 17, 13, 16, 8, 15, 8]}
      ],
      tooltip: {
        enabled: true,
        position: 'top',
        customHTML: function(index, chartOptions, datasetIndex) {
          var html = '<p class="margin-bottom-xxs">Total '+chartOptions.xAxis.labels[index] + '</p>';
          html = html + '<p class="flex items-center"><span class="height-xxxs width-xxxs radius-50% bg-primary margin-right-xxs"></span>$'+chartOptions.datasets[0].data[index]+'</p>';
          html = html + '<p class="flex items-center"><span class="height-xxxs width-xxxs radius-50% bg-accent margin-right-xxs"></span>$'+chartOptions.datasets[1].data[index]+'</p>';
          return html;
        }
      },
      animate: true
    });
  };

  // External Data Value
  var lineChart4 = document.getElementById('line-chart-4');
  if(lineChart4) {
    new Chart({
      element: lineChart4,
      type: 'line',
      xAxis: {
        line: true,
        ticks: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      yAxis: {
        labels: true
      },
      datasets: [
        {data: [1, 2, 3, 6, 4, 11, 9, 10, 9, 4, 7, 3]},
      ],
      animate: true,
      externalData : {
        customXHTML: function(index, chartOptions, datasetIndex) {
          return ' '+chartOptions.xAxis.labels[index];
        }
      }
    });
  };
}());