// File#: _2_chart
// Usage: codyhouse.co/license
(function() {
  var Chart = function(opts) {
    this.options = Util.extend(Chart.defaults , opts);
    this.element = this.options.element.getElementsByClassName('js-chart__area')[0];
    this.svgPadding = this.options.padding;
    this.topDelta = this.svgPadding;
    this.bottomDelta = 0;
    this.leftDelta = 0;
    this.rightDelta = 0;
    this.legendHeight = 0;
    this.yChartMaxWidth = 0;
    this.yAxisHeight = 0;
    this.xAxisWidth = 0;
    this.yAxisInterval = []; // used to store min and max value on y axis
    this.xAxisInterval = []; // used to store min and max value on x axis
    this.datasetScaled = []; // used to store set data converted to chart coordinates
    this.datasetScaledFlat = []; // used to store set data converted to chart coordinates for animation
    this.datasetAreaScaled = []; // used to store set data (area part) converted to chart coordinates
    this.datasetAreaScaledFlat = []; // used to store set data (area part)  converted to chart coordinates for animation
    // columns chart - store if x axis label where rotated
    this.xAxisLabelRotation = false;
    // tooltip
    this.interLine = false;
    this.markers = false;
    this.tooltipOn = this.options.tooltip && this.options.tooltip.enabled;
    this.tooltipClasses = (this.tooltipOn && this.options.tooltip.classes) ? this.options.tooltip.classes : '';
    this.tooltipPosition = (this.tooltipOn && this.options.tooltip.position) ? this.options.tooltip.position : false;
    this.tooltipDelta = 10;
    this.selectedMarker = false;
    this.selectedMarkerClass = 'chart__marker--selected';
    this.selectedBarClass = 'chart__data-bar--selected';
    this.hoverId = false;
    this.hovering = false;
    // events id
    this.eventIds = []; // will use to store event ids
    // accessibility
    this.categories = this.options.element.getElementsByClassName('js-chart__category');
    this.loaded = false;
    // init chart
    initChartInfo(this);
    initChart(this);
    // if externalDate == true
    initExternalData(this);
  };

  function initChartInfo(chart) {
    // we may need to store store some initial config details before setting up the chart
    if(chart.options.type == 'column') {
      setChartColumnSize(chart);
    }
  };

  function initChart(chart) {
    if(chart.options.datasets.length == 0) return; // no data where provided
    if(!intObservSupported) chart.options.animate = false; // do not animate if intersectionObserver is not supported
    // init event ids variables
    intEventIds(chart);
    setChartSize(chart);
    createChartSvg(chart);
    createSrTables(chart); // chart accessibility
    animateChart(chart); // if animate option is true
    resizeChart(chart);
    chart.loaded = true;
  };

  function intEventIds(chart) {
    chart.eventIds['resize'] = false;
  };

  function setChartSize(chart) {
    chart.height = chart.element.clientHeight;
    chart.width = chart.element.clientWidth;
  };

  function createChartSvg(chart) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="'+chart.width+'" height="'+chart.height+'" class="chart__svg js-chart__svg"></svg>';
    chart.element.innerHTML = svg;
    chart.svg = chart.element.getElementsByClassName('js-chart__svg')[0];

    // create chart content
    switch (chart.options.type) {
      case 'pie':
        getPieSvgCode(chart);
        break;
      case 'doughnut':
        getDoughnutSvgCode(chart);
        break;
      case 'column':
        getColumnSvgCode(chart);
        break;
      default:
        getLinearSvgCode(chart);
    }
  };

  function getLinearSvgCode(chart) { // svg for linear + area charts
    setYAxis(chart);
    setXAxis(chart);
    updateChartWidth(chart);
    placexAxisLabels(chart);
    placeyAxisLabels(chart);
    setChartDatasets(chart);
    initTooltips(chart);
  };

  function getColumnSvgCode(chart) { // svg for column charts
    setYAxis(chart);
    setXAxis(chart);
    updateChartWidth(chart);
    placexAxisLabels(chart);
    placeyAxisLabels(chart);
    resetColumnChart(chart);
    setColumnChartDatasets(chart);
    initTooltips(chart);
  };

  function setXAxis(chart) {
    // set legend of axis if available
    if( chart.options.xAxis && chart.options.xAxis.legend) {
      var textLegend = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textLegend.textContent = chart.options.xAxis.legend;
      Util.setAttributes(textLegend, {class: 'chart__axis-legend chart__axis-legend--x js-chart__axis-legend--x'});
      chart.svg.appendChild(textLegend);

      var xLegend = chart.element.getElementsByClassName('js-chart__axis-legend--x')[0];

      if(isVisible(xLegend)) {
        var size = xLegend.getBBox(),
          xPosition = chart.width/2 - size.width/2,
          yPosition = chart.height - chart.bottomDelta;

        Util.setAttributes(xLegend, {x: xPosition, y: yPosition});
        chart.bottomDelta = chart.bottomDelta + size.height +chart.svgPadding;
      }
    }

    // get interval and create scale
    var xLabels;
    if(chart.options.xAxis && chart.options.xAxis.labels && chart.options.xAxis.labels.length > 1) {
      xLabels = chart.options.xAxis.labels;
      chart.xAxisInterval = [0, chart.options.xAxis.labels.length - 1];
    } else {
      xLabels = getChartXLabels(chart); // this function is used to set chart.xAxisInterval as well
    }
    // modify axis labels
    if(chart.options.xAxis && chart.options.xAxis.labelModifier) {
      xLabels = modifyAxisLabel(xLabels, chart.options.xAxis.labelModifier);
    } 

    var gEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    Util.setAttributes(gEl, {class: 'chart__axis-labels chart__axis-labels--x js-chart__axis-labels--x'});

    for(var i = 0; i < xLabels.length; i++) {
      var textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      var labelClasses = (chart.options.xAxis && chart.options.xAxis.labels) ? 'chart__axis-label chart__axis-label--x js-chart__axis-label' : 'is-hidden js-chart__axis-label';
      Util.setAttributes(textEl, {class: labelClasses, 'alignment-baseline': 'middle'});
      textEl.textContent = xLabels[i];
      gEl.appendChild(textEl);
    }
    
    if(chart.options.xAxis && chart.options.xAxis.line) {
      var lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      Util.setAttributes(lineEl, {class: 'chart__axis chart__axis--x js-chart__axis--x', 'stroke-linecap': 'square'});
      gEl.appendChild(lineEl);
    }

    var ticksLength = xLabels.length;
    if(chart.options.type == 'column') ticksLength = ticksLength + 1;
    
    for(var i = 0; i < ticksLength; i++) {
      var tickEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      var classTicks = (chart.options.xAxis && chart.options.xAxis.ticks) ? 'chart__tick chart__tick-x js-chart__tick-x' : 'js-chart__tick-x';
      Util.setAttributes(tickEl, {class: classTicks, 'stroke-linecap': 'square'});
      gEl.appendChild(tickEl);
    }

    chart.svg.appendChild(gEl);
  };

  function setYAxis(chart) {
    // set legend of axis if available
    if( chart.options.yAxis && chart.options.yAxis.legend) {
      var textLegend = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textLegend.textContent = chart.options.yAxis.legend;
      textLegend.setAttribute('class', 'chart__axis-legend chart__axis-legend--y js-chart__axis-legend--y');
      chart.svg.appendChild(textLegend);

      var yLegend = chart.element.getElementsByClassName('js-chart__axis-legend--y')[0];
      if(isVisible(yLegend)) {
        var height = yLegend.getBBox().height,
          xPosition = chart.leftDelta + height/2,
          yPosition = chart.topDelta;
    
        Util.setAttributes(yLegend, {x: xPosition, y: yPosition});
        chart.leftDelta = chart.leftDelta + height + chart.svgPadding;
      }
    }
    // get interval and create scale
    var yLabels;
    if(chart.options.yAxis && chart.options.yAxis.labels && chart.options.yAxis.labels.length > 1) {
      yLabels = chart.options.yAxis.labels;
      chart.yAxisInterval = [0, chart.options.yAxis.labels.length - 1];
    } else {
      yLabels = getChartYLabels(chart); // this function is used to set chart.yAxisInterval as well
    }

    // modify axis labels
    if(chart.options.yAxis && chart.options.yAxis.labelModifier) {
      yLabels = modifyAxisLabel(yLabels, chart.options.yAxis.labelModifier);
    } 

    var gEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    Util.setAttributes(gEl, {class: 'chart__axis-labels chart__axis-labels--y js-chart__axis-labels--y'});

    for(var i = yLabels.length - 1; i >= 0; i--) {
      var textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      var labelClasses = (chart.options.yAxis && chart.options.yAxis.labels) ? 'chart__axis-label chart__axis-label--y js-chart__axis-label' : 'is-hidden js-chart__axis-label';
      Util.setAttributes(textEl, {class: labelClasses, 'alignment-baseline': 'middle'});
      textEl.textContent = yLabels[i];
      gEl.appendChild(textEl);
    }

    if(chart.options.yAxis && chart.options.yAxis.line) {
      var lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      Util.setAttributes(lineEl, {class: 'chart__axis chart__axis--y js-chart__axis--y', 'stroke-linecap': 'square'});
      gEl.appendChild(lineEl);
    }

    var hideGuides = chart.options.xAxis && chart.options.xAxis.hasOwnProperty('guides') && !chart.options.xAxis.guides;
    for(var i = 1; i < yLabels.length; i++ ) {
      var rectEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      Util.setAttributes(rectEl, {class: 'chart__guides js-chart__guides'});
      if(hideGuides) {
        Util.setAttributes(rectEl, {class: 'chart__guides js-chart__guides opacity-0'});
      }
      gEl.appendChild(rectEl);
    }
    chart.svg.appendChild(gEl);
  };

  function updateChartWidth(chart) {
    var labels = chart.element.getElementsByClassName('js-chart__axis-labels--y')[0].querySelectorAll('.js-chart__axis-label');

    if(isVisible(labels[0])) {
      chart.yChartMaxWidth = getLabelMaxSize(labels, 'width');
      chart.leftDelta = chart.leftDelta + chart.svgPadding + chart.yChartMaxWidth + chart.svgPadding;
    } else {
      chart.leftDelta = chart.leftDelta + chart.svgPadding;
    }

    var xLabels = chart.element.getElementsByClassName('js-chart__axis-labels--x')[0].querySelectorAll('.js-chart__axis-label');
    if(isVisible(xLabels[0]) && !isVisible(labels[0])) {
      chart.leftDelta = chart.leftDelta + xLabels[0].getBBox().width*0.5;
    }
  };

  function placeyAxisLabels(chart) {
    var labels = chart.element.getElementsByClassName('js-chart__axis-labels--y')[0].querySelectorAll('.js-chart__axis-label');

    var labelsVisible = isVisible(labels[0]);
    var height = 0;
    if(labelsVisible) height = labels[0].getBBox().height*0.5;
    
    // update topDelta and set chart height
    chart.topDelta = chart.topDelta + height + chart.svgPadding;
    chart.yAxisHeight = chart.height - chart.topDelta - chart.bottomDelta;

    var yDelta = chart.yAxisHeight/(labels.length - 1);

    var gridRect = chart.element.getElementsByClassName('js-chart__guides'),
      dasharray = ""+chart.xAxisWidth+" "+(2*(chart.xAxisWidth + yDelta))+"";

    for(var i = 0; i < labels.length; i++) {
      var labelWidth = 0;
      if(labelsVisible) labelWidth = labels[i].getBBox().width;
      // chart.leftDelta has already been updated in updateChartWidth() function
      Util.setAttributes(labels[i], {x: chart.leftDelta - labelWidth - 2*chart.svgPadding, y: chart.topDelta + yDelta*i });
      // place grid rectangles
      if(gridRect[i]) Util.setAttributes(gridRect[i], {x: chart.leftDelta, y: chart.topDelta + yDelta*i, height: yDelta, width: chart.xAxisWidth, 'stroke-dasharray': dasharray});
    }

    // place the y axis
    var yAxis = chart.element.getElementsByClassName('js-chart__axis--y');
    if(yAxis.length > 0) {
      Util.setAttributes(yAxis[0], {x1: chart.leftDelta, x2: chart.leftDelta, y1: chart.topDelta, y2: chart.topDelta + chart.yAxisHeight})
    }
    // center y axis label
    var yLegend = chart.element.getElementsByClassName('js-chart__axis-legend--y');
    if(yLegend.length > 0 && isVisible(yLegend[0]) ) {
      var position = yLegend[0].getBBox(),
        height = position.height,
        yPosition = position.y + 0.5*(chart.yAxisHeight + position.width),
        xPosition = position.x + height/4;
      
      Util.setAttributes(yLegend[0], {y: yPosition, x: xPosition, transform: 'rotate(-90 '+(position.x + height)+' '+(yPosition + height/2)+')'});
    }
  };

  function placexAxisLabels(chart) {
    var labels = chart.element.getElementsByClassName('js-chart__axis-labels--x')[0].querySelectorAll('.js-chart__axis-label');
    var ticks = chart.element.getElementsByClassName('js-chart__tick-x');

    // increase rightDelta value
    var labelWidth = 0,
      labelsVisible = isVisible(labels[labels.length - 1]);
    if(labelsVisible) labelWidth = labels[labels.length - 1].getBBox().width;
    if(chart.options.type != 'column') {
      chart.rightDelta = chart.rightDelta + labelWidth*0.5 + chart.svgPadding;
    } else {
      chart.rightDelta = chart.rightDelta + 4;
    }
    chart.xAxisWidth = chart.width - chart.leftDelta - chart.rightDelta;
    

    var maxHeight = getLabelMaxSize(labels, 'height'),
      maxWidth = getLabelMaxSize(labels, 'width'),
      xDelta = chart.xAxisWidth/(labels.length - 1);

    if(chart.options.type == 'column') xDelta = chart.xAxisWidth/labels.length;

    var totWidth = 0,
      height = 0;
    if(labelsVisible)  height = labels[0].getBBox().height;

    for(var i = 0; i < labels.length; i++) {
      var width = 0;
      if(labelsVisible) width = labels[i].getBBox().width;
      // label
      Util.setAttributes(labels[i], {y: chart.height - chart.bottomDelta - height/2, x: chart.leftDelta + xDelta*i - width/2});
      // tick
      Util.setAttributes(ticks[i], {y1: chart.height - chart.bottomDelta - maxHeight - chart.svgPadding, y2: chart.height - chart.bottomDelta - maxHeight - chart.svgPadding + 5, x1: chart.leftDelta + xDelta*i, x2: chart.leftDelta + xDelta*i});
      totWidth = totWidth + width + 4;
    }
    // for columns chart -> there's an additional tick element
    if(chart.options.type == 'column' && ticks[labels.length]) {
      Util.setAttributes(ticks[labels.length], {y1: chart.height - chart.bottomDelta - maxHeight - chart.svgPadding, y2: chart.height - chart.bottomDelta - maxHeight - chart.svgPadding + 5, x1: chart.leftDelta + xDelta*labels.length, x2: chart.leftDelta + xDelta*labels.length});
    }
    //check if we need to rotate chart label -> not enough space
    if(totWidth >= chart.xAxisWidth) {
      chart.xAxisLabelRotation = true;
      rotatexAxisLabels(chart, labels, ticks, maxWidth - maxHeight);
      maxHeight = maxWidth;
    } else {
      chart.xAxisLabelRotation = false;
    }

    chart.bottomDelta = chart.bottomDelta + chart.svgPadding + maxHeight;

    // place the x axis
    var xAxis = chart.element.getElementsByClassName('js-chart__axis--x');
    if(xAxis.length > 0) {
      Util.setAttributes(xAxis[0], {x1: chart.leftDelta, x2: chart.width - chart.rightDelta, y1: chart.height - chart.bottomDelta, y2: chart.height - chart.bottomDelta})
    }

    // center x-axis label
    var xLegend = chart.element.getElementsByClassName('js-chart__axis-legend--x');
    if(xLegend.length > 0 && isVisible(xLegend[0])) {
      xLegend[0].setAttribute('x', chart.leftDelta + 0.5*(chart.xAxisWidth - xLegend[0].getBBox().width));
    }
  };

  function rotatexAxisLabels(chart, labels, ticks, delta) {
    // there's not enough horiziontal space -> we need to rotate the x axis labels
    for(var i = 0; i < labels.length; i++) {
      var dimensions = labels[i].getBBox(),
        xCenter = parseFloat(labels[i].getAttribute('x')) + dimensions.width/2,
        yCenter = parseFloat(labels[i].getAttribute('y'))  - delta;

      Util.setAttributes(labels[i], {y: parseFloat(labels[i].getAttribute('y')) - delta, transform: 'rotate(-45 '+xCenter+' '+yCenter+')'});

      ticks[i].setAttribute('transform', 'translate(0 -'+delta+')');
    }
    if(ticks[labels.length]) ticks[labels.length].setAttribute('transform', 'translate(0 -'+delta+')');
  };

  function setChartDatasets(chart) {
    var gEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gEl.setAttribute('class', 'chart__dataset js-chart__dataset');
    chart.datasetScaled = [];
    for(var i = 0; i < chart.options.datasets.length; i++) {
      var gSet = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      gSet.setAttribute('class', 'chart__set chart__set--'+(i+1)+' js-chart__set');
      chart.datasetScaled[i] = JSON.parse(JSON.stringify(chart.options.datasets[i].data));
      chart.datasetScaled[i] = getChartData(chart, chart.datasetScaled[i]);
      chart.datasetScaledFlat[i] = JSON.parse(JSON.stringify(chart.datasetScaled[i]));
      if(chart.options.type == 'area') {
        chart.datasetAreaScaled[i] = getAreaPointsFromLine(chart, chart.datasetScaled[i]);
        chart.datasetAreaScaledFlat[i] = JSON.parse(JSON.stringify(chart.datasetAreaScaled[i]));
      }
      if(!chart.loaded && chart.options.animate) {
        flatDatasets(chart, i);
      }
      gSet.appendChild(getPath(chart, chart.datasetScaledFlat[i], chart.datasetAreaScaledFlat[i], i));
      gSet.appendChild(getMarkers(chart, chart.datasetScaled[i], i));
      gEl.appendChild(gSet);
    }
    
    chart.svg.appendChild(gEl);
  };

  function getChartData(chart, data) {
    var multiSet = data[0].length > 1;
    var points = multiSet ? data : addXData(data); // addXData is used for one-dimension dataset; e.g. [2, 4, 6] rather than [[2, 4], [4, 7]]
    
    // xOffsetChart used for column chart type onlymodified
    var xOffsetChart = chart.xAxisWidth/(points.length-1) - chart.xAxisWidth/points.length;
    // now modify the points to coordinate relative to the svg 
    for(var i = 0; i < points.length; i++) {
      var xNewCoordinate = chart.leftDelta + chart.xAxisWidth*(points[i][0] - chart.xAxisInterval[0])/(chart.xAxisInterval[1] - chart.xAxisInterval[0]),
        yNewCoordinate = chart.height - chart.bottomDelta - chart.yAxisHeight*(points[i][1] - chart.yAxisInterval[0])/(chart.yAxisInterval[1] - chart.yAxisInterval[0]);
      if(chart.options.type == 'column') {
        xNewCoordinate = xNewCoordinate - i*xOffsetChart;
      }
      points[i] = [xNewCoordinate, yNewCoordinate];
    }
    return points;
  };

  function getPath(chart, points, areaPoints, index) {
    var pathCode = chart.options.smooth ? getSmoothLine(points, false) : getStraightLine(points);
    
    var gEl = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
      pathL = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
    Util.setAttributes(pathL, {d: pathCode, class: 'chart__data-line chart__data-line--'+(index+1)+' js-chart__data-line--'+(index+1)});

    if(chart.options.type == 'area') {
      var areaCode = chart.options.smooth ? getSmoothLine(areaPoints, true) : getStraightLine(areaPoints);
      var pathA = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      Util.setAttributes(pathA, {d: areaCode, class: 'chart__data-fill chart__data-fill--'+(index+1)+' js-chart__data-fill--'+(index+1)});
      gEl.appendChild(pathA);
    }
   
    gEl.appendChild(pathL);
    return gEl;
  };

  function getStraightLine(points) {
    var dCode = '';
    for(var i = 0; i < points.length; i++) {
      dCode = (i == 0) ? 'M '+points[0][0]+','+points[0][1] : dCode+ ' L '+points[i][0]+','+points[i][1];
    }
    return dCode;
  };

  function flatDatasets(chart, index) {
    var bottomY = getBottomFlatDatasets(chart);
    for(var i = 0; i < chart.datasetScaledFlat[index].length; i++) {
      chart.datasetScaledFlat[index][i] = [chart.datasetScaled[index][i][0], bottomY];
    }
    if(chart.options.type == 'area') {
      chart.datasetAreaScaledFlat[index] = getAreaPointsFromLine(chart, chart.datasetScaledFlat[index]);
    }
  };

  // https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
  function getSmoothLine(points, bool) {
    var dCode = '';
    var maxVal = points.length;
    var pointsLoop = JSON.parse(JSON.stringify(points));
    if(bool) {
      maxVal = maxVal - 3;
      pointsLoop.splice(-3, 3);
    }
    for(var i = 0; i < maxVal; i++) {
      if(i == 0) dCode = 'M '+points[0][0]+','+points[0][1];
      else dCode = dCode + ' '+bezierCommand(points[i], i, pointsLoop);
    }
    if(bool) {
      for(var j = maxVal; j < points.length; j++) {
        dCode = dCode + ' L '+points[j][0]+','+points[j][1];
      }
    }
    return dCode;
  };  
  
  function pathLine(pointA, pointB) {
    var lengthX = pointB[0] - pointA[0];
    var lengthY = pointB[1] - pointA[1];

    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
      angle: Math.atan2(lengthY, lengthX)
    };
  };

  function pathControlPoint(current, previous, next, reverse) {
    var p = previous || current;
    var n = next || current;
    var smoothing = 0.2;
    var o = pathLine(p, n);

    var angle = o.angle + (reverse ? Math.PI : 0);
    var length = o.length * smoothing;

    var x = current[0] + Math.cos(angle) * length;
    var y = current[1] + Math.sin(angle) * length;
    return [x, y];
  };

  function bezierCommand(point, i, a) {
    var cps =  pathControlPoint(a[i - 1], a[i - 2], point);
    var cpe = pathControlPoint(point, a[i - 1], a[i + 1], true);
    return "C "+cps[0]+','+cps[1]+' '+cpe[0]+','+cpe[1]+' '+point[0]+','+point[1];
  };

  function getAreaPointsFromLine(chart, array) {
    var points = JSON.parse(JSON.stringify(array)),
      firstPoint = points[0],
      lastPoint = points[points.length -1];

    var boottomY = getBottomFlatDatasets(chart); 
    points.push([lastPoint[0], boottomY]);
    points.push([chart.leftDelta, boottomY]);
    points.push([chart.leftDelta, firstPoint[1]]);
    return points;
  };

  function getBottomFlatDatasets(chart) {
    var bottom = chart.height - chart.bottomDelta;
    if(chart.options.fillOrigin ) {
      bottom = chart.height - chart.bottomDelta - chart.yAxisHeight*(0 - chart.yAxisInterval[0])/(chart.yAxisInterval[1] - chart.yAxisInterval[0]);
    }
    if(chart.options.type && chart.options.type == 'column') {
      bottom = chart.yZero; 
    }
    return bottom;
  };

  function getMarkers(chart, points, index) {
    // see if we need to show tooltips 
    var gEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var xOffset = 0;
    if(chart.options.type == 'column') {
      xOffset = 0.5*chart.xAxisWidth/points.length;
    }
    for(var i = 0; i < points.length; i++) {
      var marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      Util.setAttributes(marker, {class: 'chart__marker js-chart__marker chart__marker--'+(index+1), cx: points[i][0] + xOffset, cy: points[i][1], r: 2, 'data-set': index, 'data-index': i});
      gEl.appendChild(marker);
    }
    return gEl;
  };

  function addXData(data) {
    var multiData = [];
    for(var i = 0; i < data.length; i++) {
      multiData.push([i, data[i]]);
    }
    return multiData;
  };

  function createSrTables(chart) {
    // create a table element for accessibility reasons
    var table = '<div class="chart__sr-table sr-only">';
    for(var i = 0; i < chart.options.datasets.length; i++) {
      table = table + createDataTable(chart, i);
    }
    table = table + '</div>';
    chart.element.insertAdjacentHTML('afterend', table);
  };

  function createDataTable(chart, index) {
    var tableTitle = (chart.categories.length > index ) ? 'aria-label="'+chart.categories.length[index].textContent+'"': '';
    var table = '<table '+tableTitle+'><thead><tr>';
    table = (chart.options.xAxis && chart.options.xAxis.legend) 
      ? table + '<th scope="col">'+chart.options.xAxis.legend+'</th>'
      : table + '<th scope="col"></th>';
      
    table = (chart.options.yAxis && chart.options.yAxis.legend) 
      ? table + '<th scope="col">'+chart.options.yAxis.legend+'</th>'
      : table + '<th scope="col"></th>';

    table = table + '</thead><tbody>';
    var multiset = chart.options.datasets[index].data[0].length > 1,
      xAxisLabels = chart.options.xAxis && chart.options.xAxis.labels && chart.options.xAxis.labels.length > 1;
    for(var i = 0; i < chart.options.datasets[index].data.length; i++) {
      table = table + '<tr>';
      if(multiset) {
        table = table + '<td role="cell">'+chart.options.datasets[index].data[i][0]+'</td><td role="cell">'+chart.options.datasets[index].data[i][1]+'</td>';
      } else {
        var xValue = xAxisLabels ? chart.options.xAxis.labels[i]: (i + 1);
        table = table + '<td role="cell">'+xValue+'</td><td role="cell">'+chart.options.datasets[index].data[i]+'</td>';
      }
      table = table + '</tr>';
    }
    table = table + '</tbody></table>';
    return table;
  }

  function getChartYLabels(chart) {
    var labels = [],
      intervals = 0;
    if(chart.options.yAxis && chart.options.yAxis.range && chart.options.yAxis.step) {
      intervals = Math.ceil((chart.options.yAxis.range[1] - chart.options.yAxis.range[0])/chart.options.yAxis.step);
      for(var i = 0; i <= intervals; i++) {
        labels.push(chart.options.yAxis.range[0] + chart.options.yAxis.step*i);
      }
      chart.yAxisInterval = [chart.options.yAxis.range[0], chart.options.yAxis.range[1]];
    } else {
      var columnChartStacked = (chart.options.type && chart.options.type == 'column' && chart.options.stacked);
      if(columnChartStacked) setDatasetsSum(chart);
      var min = columnChartStacked ? getColStackedMinDataValue(chart) : getMinDataValue(chart, true);
      var max = columnChartStacked ? getColStackedMaxDataValue(chart) : getMaxDataValue(chart, true);
      var niceScale = new NiceScale(min, max, 5);
      var intervals = Math.ceil((niceScale.getNiceUpperBound() - niceScale.getNiceLowerBound()) /niceScale.getTickSpacing());

      for(var i = 0; i <= intervals; i++) {
        labels.push(niceScale.getNiceLowerBound() + niceScale.getTickSpacing()*i);
      }
      chart.yAxisInterval = [niceScale.getNiceLowerBound(), niceScale.getNiceUpperBound()];
    }
    return labels;
  };

  function getChartXLabels(chart) {
    var labels = [],
      intervals = 0;
    if(chart.options.xAxis && chart.options.xAxis.range && chart.options.xAxis.step) {
      intervals = Math.ceil((chart.options.xAxis.range[1] - chart.options.xAxis.range[0])/chart.options.xAxis.step);
      for(var i = 0; i <= intervals; i++) {
        labels.push(chart.options.xAxis.range[0] + chart.options.xAxis.step*i);
      }
      chart.xAxisInterval = [chart.options.xAxis.range[0], chart.options.xAxis.range[1]];
    } else if(!chart.options.datasets[0].data[0].length || chart.options.datasets[0].data[0].length < 2) {
      // data sets are passed with a single value (y axis only)
      chart.xAxisInterval = [0, chart.options.datasets[0].data.length - 1];
      for(var i = 0; i < chart.options.datasets[0].data.length; i++) {
        labels.push(i);
      }
    } else {
      var min = getMinDataValue(chart, false);
      var max = getMaxDataValue(chart, false);
      var niceScale = new NiceScale(min, max, 5);
      var intervals = Math.ceil((niceScale.getNiceUpperBound() - niceScale.getNiceLowerBound()) /niceScale.getTickSpacing());

      for(var i = 0; i <= intervals; i++) {
        labels.push(niceScale.getNiceLowerBound() + niceScale.getTickSpacing()*i);
      }
      chart.xAxisInterval = [niceScale.getNiceLowerBound(), niceScale.getNiceUpperBound()];
    }
    return labels;
  };

  function modifyAxisLabel(labels, fnModifier) {
    for(var i = 0; i < labels.length; i++) {
      labels[i] = fnModifier(labels[i]);
    }

    return labels;
  };

  function getLabelMaxSize(labels, dimesion) {
    if(!isVisible(labels[0])) return 0;
    var size = 0;
    for(var i = 0; i < labels.length; i++) {
      var labelSize = labels[i].getBBox()[dimesion];
      if(labelSize > size) size = labelSize;
    };  
    return size;
  };

  function getMinDataValue(chart, bool) { // bool = true for y axis
    var minArray = [];
    for(var i = 0; i < chart.options.datasets.length; i++) {
      minArray.push(getMin(chart.options.datasets[i].data, bool));
    }
    return Math.min.apply(null, minArray);
  };

  function getMaxDataValue(chart, bool) { // bool = true for y axis
    var maxArray = [];
    for(var i = 0; i < chart.options.datasets.length; i++) {
      maxArray.push(getMax(chart.options.datasets[i].data, bool));
    }
    return Math.max.apply(null, maxArray);
  };

  function setDatasetsSum(chart) {
    // sum all datasets -> this is used for column and bar charts
    chart.datasetsSum = [];
    for(var i = 0; i < chart.options.datasets.length; i++) {
      for(var j = 0; j < chart.options.datasets[i].data.length; j++) {
        chart.datasetsSum[j] = (i == 0) ? chart.options.datasets[i].data[j] : chart.datasetsSum[j] + chart.options.datasets[i].data[j];
      }
    } 
  };

  function getColStackedMinDataValue(chart) {
    var min = Math.min.apply(null, chart.datasetsSum);
    if(min > 0) min = 0;
    return min;
  };

  function getColStackedMaxDataValue(chart) {
    var max = Math.max.apply(null, chart.datasetsSum);
    if(max < 0) max = 0;
    return max;
  };

  function getMin(array, bool) {
    var min;
    var multiSet = array[0].length > 1;
    for(var i = 0; i < array.length; i++) {
      var value;
      if(multiSet) {
        value = bool ? array[i][1] : array[i][0];
      } else {
        value = array[i];
      }
      if(i == 0) {min = value;}
      else if(value < min) {min = value;}
    }
    return min;
  };

  function getMax(array, bool) {
    var max;
    var multiSet = array[0].length > 1;
    for(var i = 0; i < array.length; i++) {
      var value;
      if(multiSet) {
        value = bool ? array[i][1] : array[i][0];
      } else {
        value = array[i];
      }
      if(i == 0) {max = value;}
      else if(value > max) {max = value;}
    }
    return max;
  };

  // https://gist.github.com/igodorogea/4f42a95ea31414c3a755a8b202676dfd
  function NiceScale (lowerBound, upperBound, _maxTicks) {
    var maxTicks = _maxTicks || 10;
    var tickSpacing;
    var range;
    var niceLowerBound;
    var niceUpperBound;
  
    calculate();
  
    this.setMaxTicks = function (_maxTicks) {
      maxTicks = _maxTicks;
      calculate();
    };
  
    this.getNiceUpperBound = function() {
      return niceUpperBound;
    };
  
    this.getNiceLowerBound = function() {
      return niceLowerBound;
    };
  
    this.getTickSpacing = function() {
      return tickSpacing;
    };
  
    function setMinMaxPoints (min, max) {
      lowerBound = min;
      upperBound = max;
      calculate();
    }
  
    function calculate () {
      range = niceNum(upperBound - lowerBound, false);
      tickSpacing = niceNum(range / (maxTicks - 1), true);
      niceLowerBound = Math.floor(lowerBound / tickSpacing) * tickSpacing;
      niceUpperBound = Math.ceil(upperBound / tickSpacing) * tickSpacing;
    }
  
    function niceNum (range, round) {
      // var exponent = Math.floor(Math.log10(range));
      var exponent = Math.floor(Math.log(range) * Math.LOG10E);
      var fraction = range / Math.pow(10, exponent);
      var niceFraction;
  
      if (round) {
        if (fraction < 1.5) niceFraction = 1;
        else if (fraction < 3) niceFraction = 2;
        else if (fraction < 7) niceFraction = 5;
        else niceFraction = 10;
      } else {
        if (fraction <= 1) niceFraction = 1;
        else if (fraction <= 2) niceFraction = 2;
        else if (fraction <= 5) niceFraction = 5;
        else niceFraction = 10;
      }
  
      return niceFraction * Math.pow(10, exponent);
    }
  };

  function initTooltips(chart) {
    if(!intObservSupported) return;

    chart.markers = [];
    chart.bars = []; // this is for column/bar charts only
    var chartSets = chart.element.getElementsByClassName('js-chart__set');
    for(var i = 0; i < chartSets.length; i++) {
      chart.markers[i] = chartSets[i].querySelectorAll('.js-chart__marker');
      if(chart.options.type && chart.options.type == 'column') {
        chart.bars[i] = chartSets[i].querySelectorAll('.js-chart__data-bar');
      }
    }
    
    // create tooltip line
    if(chart.options.yIndicator) {
      var tooltipLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      Util.setAttributes(tooltipLine, {x1: 0, y1: chart.topDelta, x2: 0, y2: chart.topDelta + chart.yAxisHeight, transform: 'translate('+chart.leftDelta+' '+chart.topDelta+')', class: 'chart__y-indicator js-chart__y-indicator is-hidden'});
      chart.svg.insertBefore(tooltipLine, chart.element.getElementsByClassName('js-chart__dataset')[0]);
      chart.interLine = chart.element.getElementsByClassName('js-chart__y-indicator')[0];
    }
    
    // create tooltip
    if(chart.tooltipOn) {
      var tooltip = document.createElement('div');
      tooltip.setAttribute('class', 'chart__tooltip js-chart__tooltip is-hidden '+chart.tooltipClasses);
      chart.element.appendChild(tooltip);
      chart.tooltip = chart.element.getElementsByClassName('js-chart__tooltip')[0];
    }
    initChartHover(chart);
  };

  function initChartHover(chart) {
    if(!chart.options.yIndicator && !chart.tooltipOn) return;
    // init hover effect
    chart.chartArea = chart.element.getElementsByClassName('js-chart__axis-labels--y')[0];
    chart.eventIds['hover'] = handleEvent.bind(chart);
    chart.chartArea.addEventListener('mouseenter', chart.eventIds['hover']);
    chart.chartArea.addEventListener('mousemove', chart.eventIds['hover']);
    chart.chartArea.addEventListener('mouseleave', chart.eventIds['hover']);
    if(!SwipeContent) return;
    new SwipeContent(chart.element);
    chart.element.addEventListener('dragStart', chart.eventIds['hover']);
    chart.element.addEventListener('dragging', chart.eventIds['hover']);
    chart.element.addEventListener('dragEnd', chart.eventIds['hover']);
  };

  function hoverChart(chart, event) {
    if(chart.hovering) return;
    if(!chart.options.yIndicator && !chart.tooltipOn) return;
    chart.hovering = true;
    var selectedMarker = getSelectedMarker(chart, event);
    if(selectedMarker === false) return;
    if(selectedMarker !== chart.selectedMarker) {
      resetMarkers(chart, false);
      resetBars(chart, false);

      chart.selectedMarker = selectedMarker;
      resetMarkers(chart, true);
      resetBars(chart, true);
      var markerSize = chart.markers[0][chart.selectedMarker].getBBox();
      
      if(chart.options.yIndicator) {
        Util.removeClass(chart.interLine, 'is-hidden');
        chart.interLine.setAttribute('transform', 'translate('+(markerSize.x + markerSize.width/2)+' 0)');
      }
      
      if(chart.tooltipOn) {
        Util.removeClass(chart.tooltip, 'is-hidden');
        setTooltipHTML(chart);
        placeTooltip(chart);
      }
    }
    updateExternalData(chart);
    chart.hovering = false;
  };

  function getSelectedMarker(chart, event) {
    if(chart.markers[0].length < 1) return false;
    var clientX = event.detail.x ? event.detail.x : event.clientX;
    var xposition =  clientX - chart.svg.getBoundingClientRect().left;
    var marker = 0,
      deltaX = Math.abs(chart.markers[0][0].getBBox().x - xposition);
    for(var i = 1; i < chart.markers[0].length; i++) {
      var newDeltaX = Math.abs(chart.markers[0][i].getBBox().x - xposition);
      if(newDeltaX < deltaX) {
        deltaX = newDeltaX;
        marker = i;
      }
    }
    return marker;
  };

  function resetTooltip(chart) {
    if(chart.hoverId) {
      (window.requestAnimationFrame) ? window.cancelAnimationFrame(chart.hoverId) : clearTimeout(chart.hoverId);
      chart.hoverId = false;
    }
    if(chart.tooltipOn) Util.addClass(chart.tooltip, 'is-hidden');
    if(chart.options.yIndicator)Util.addClass(chart.interLine, 'is-hidden');
    resetMarkers(chart, false);
    resetBars(chart, false);
    chart.selectedMarker = false;
    resetExternalData(chart);
    chart.hovering = false;
  };

  function resetMarkers(chart, bool) {
    for(var i = 0; i < chart.markers.length; i++) {
      if(chart.markers[i] && chart.markers[i][chart.selectedMarker]) Util.toggleClass(chart.markers[i][chart.selectedMarker], chart.selectedMarkerClass, bool);
    }
  };

  function resetBars(chart, bool) {
    // for column/bar chart -> change opacity on hover
    if(!chart.options.type || chart.options.type != 'column') return;
    for(var i = 0; i < chart.bars.length; i++) {
      if(chart.bars[i] && chart.bars[i][chart.selectedMarker]) Util.toggleClass(chart.bars[i][chart.selectedMarker], chart.selectedBarClass, bool);
    }
  };

  function setTooltipHTML(chart) {
    var selectedMarker = chart.markers[0][chart.selectedMarker];
    chart.tooltip.innerHTML = getTooltipHTML(chart, selectedMarker.getAttribute('data-index'), selectedMarker.getAttribute('data-set'));
  };

  function getTooltipHTML(chart, index, setIndex) {
    var htmlContent = '';
    if(chart.options.tooltip.customHTML) {
      htmlContent = chart.options.tooltip.customHTML(index, chart.options, setIndex);
    } else {
      var multiVal = chart.options.datasets[setIndex].data[index].length > 1;
      if(chart.options.xAxis && chart.options.xAxis.labels && chart.options.xAxis.labels.length > 1) {
        htmlContent = chart.options.xAxis.labels[index] +' - ';
      } else if(multiVal) {
        htmlContent = chart.options.datasets[setIndex].data[index][0] +' - ';
      }
      htmlContent = (multiVal) 
        ? htmlContent + chart.options.datasets[setIndex].data[index][1] 
        : htmlContent + chart.options.datasets[setIndex].data[index];
    }   
    return htmlContent;
  };

  function placeTooltip(chart) {
    var selectedMarker = chart.markers[0][chart.selectedMarker];
    var markerPosition = selectedMarker.getBoundingClientRect();
    var markerPositionSVG = selectedMarker.getBBox();
    var svgPosition = chart.svg.getBoundingClientRect();

    if(chart.options.type == 'column') {
      tooltipPositionColumnChart(chart, selectedMarker, markerPosition, markerPositionSVG);
    } else {
      tooltipPositionChart(chart, markerPosition, markerPositionSVG, svgPosition.left, svgPosition.width);
    }
  };

  function tooltipPositionChart(chart, markerPosition, markerPositionSVG, svgPositionLeft, svgPositionWidth) {
    // set top/left/transform of the tooltip for line/area charts
    // horizontal position
    if(markerPosition.left - svgPositionLeft <= svgPositionWidth/2) {
      chart.tooltip.style.left = (markerPositionSVG.x + markerPositionSVG.width + 2)+'px';
      chart.tooltip.style.right = 'auto';
      chart.tooltip.style.transform = 'translateY(-100%)';
    } else {
      chart.tooltip.style.left = 'auto';
      chart.tooltip.style.right = (svgPositionWidth - markerPositionSVG.x + 2)+'px';
      chart.tooltip.style.transform = 'translateY(-100%)'; 
    }
    // vertical position
    if(!chart.tooltipPosition) {
      chart.tooltip.style.top = markerPositionSVG.y +'px';
    } else if(chart.tooltipPosition == 'top') {
      chart.tooltip.style.top = (chart.topDelta + chart.tooltip.getBoundingClientRect().height + 5) +'px';
      chart.tooltip.style.bottom = 'auto';
    } else {
      chart.tooltip.style.top = 'auto';
      chart.tooltip.style.bottom = (chart.bottomDelta + 5)+'px';
      chart.tooltip.style.transform = ''; 
    }
  };

  function tooltipPositionColumnChart(chart, marker, markerPosition, markerPositionSVG) {
    // set top/left/transform of the tooltip for column charts
    chart.tooltip.style.left = (markerPositionSVG.x + markerPosition.width/2)+'px';
    chart.tooltip.style.right = 'auto';
    chart.tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
    if(!chart.tooltipPosition) {
      if(parseInt(marker.getAttribute('cy')) > chart.yZero) {
        // negative value -> move tooltip below the bar
        chart.tooltip.style.top = (markerPositionSVG.y + markerPositionSVG.height + 6) +'px';
        chart.tooltip.style.transform = 'translateX(-50%)';
      } else {
        chart.tooltip.style.top = (markerPositionSVG.y - 6) +'px';
      }
    } else if(chart.tooltipPosition == 'top') {
      chart.tooltip.style.top = (chart.topDelta + chart.tooltip.getBoundingClientRect().height + 5) +'px';
      chart.tooltip.style.bottom = 'auto';
    } else {
      chart.tooltip.style.bottom = (chart.bottomDelta + 5)+'px';
      chart.tooltip.style.top = 'auto';
      chart.tooltip.style.transform = 'translateX(-50%)';
    }
  };

  function animateChart(chart) {
    if(!chart.options.animate) return;
    var observer = new IntersectionObserver(chartObserve.bind(chart), {rootMargin: "0px 0px -200px 0px"});
    observer.observe(chart.element);
  };

  function chartObserve(entries, observer) { // observe chart position -> start animation when inside viewport
    if(entries[0].isIntersecting) {
      triggerChartAnimation(this);
      observer.unobserve(this.element);
    }
  };

  function triggerChartAnimation(chart) {
    if(chart.options.type == 'line' || chart.options.type == 'area') {
      animatePath(chart, 'line');
      if(chart.options.type == 'area') animatePath(chart, 'fill');
    } else if(chart.options.type == 'column') {
      animateRectPath(chart, 'column');
    }
  };

  function animatePath(chart, type) {
    var currentTime = null,
      duration = 600;

    var startArray = chart.datasetScaledFlat,
      finalArray = chart.datasetScaled;

    if(type == 'fill') {
      startArray = chart.datasetAreaScaledFlat;
      finalArray = chart.datasetAreaScaled;
    }
        
    var animateSinglePath = function(timestamp){
      if (!currentTime) currentTime = timestamp;        
      var progress = timestamp - currentTime;
      if(progress > duration) progress = duration;
      for(var i = 0; i < finalArray.length; i++) {
        var points = [];
        var path = chart.element.getElementsByClassName('js-chart__data-'+type+'--'+(i+1))[0];
        for(var j = 0; j < finalArray[i].length; j++) {
          var val = Math.easeOutQuart(progress, startArray[i][j][1], finalArray[i][j][1]-startArray[i][j][1], duration);
          points[j] = [finalArray[i][j][0], val];
        }
        // get path and animate
        var pathCode = chart.options.smooth ? getSmoothLine(points, type == 'fill') : getStraightLine(points);
        path.setAttribute('d', pathCode);
      }
      if(progress < duration) {
        window.requestAnimationFrame(animateSinglePath);
      }
    };

    window.requestAnimationFrame(animateSinglePath);
  };

  function resizeChart(chart) {
    window.addEventListener('resize', function() {
      clearTimeout(chart.eventIds['resize']);
      chart.eventIds['resize'] = setTimeout(doneResizing, 300);
    });

    function doneResizing() {
      resetChartResize(chart);
      initChart(chart);
    };
  };

  function resetChartResize(chart) {
    chart.topDelta = 0;
    chart.bottomDelta = 0;
    chart.leftDelta = 0;
    chart.rightDelta = 0;
    chart.dragging = false;
    // reset event listeners
    if( chart.eventIds && chart.eventIds['hover']) {
      chart.chartArea.removeEventListener('mouseenter', chart.eventIds['hover']);
      chart.chartArea.removeEventListener('mousemove', chart.eventIds['hover']);
      chart.chartArea.removeEventListener('mouseleave', chart.eventIds['hover']);
      chart.element.removeEventListener('dragStart', chart.eventIds['hover']);
      chart.element.removeEventListener('dragging', chart.eventIds['hover']);
      chart.element.removeEventListener('dragEnd', chart.eventIds['hover']);
    }
  };

  function handleEvent(event) {
		switch(event.type) {
			case 'mouseenter':
				hoverChart(this, event);
        break;
			case 'mousemove':
      case 'dragging':   
        var self = this;
				self.hoverId  = window.requestAnimationFrame 
          ? window.requestAnimationFrame(function(){hoverChart(self, event)})
          : setTimeout(function(){hoverChart(self, event);});
        break;
			case 'mouseleave':
      case 'dragEnd':
				resetTooltip(this);
        break;
		}
  };

  function isVisible(item) {
    return (item && item.getClientRects().length > 0);
  };

  function initExternalData(chart) {
    if(!chart.options.externalData) return;
    var chartId = chart.options.element.getAttribute('id');
    if(!chartId) return;
    chart.extDataX = [];
    chart.extDataXInit = [];
    chart.extDataY = [];
    chart.extDataYInit = [];
    if(chart.options.datasets.length > 1) {
      for(var i = 0; i < chart.options.datasets.length; i++) {
        chart.extDataX[i] = document.querySelectorAll('.js-ext-chart-data-x--'+(i+1)+'[data-chart="'+chartId+'"]');
        chart.extDataY[i] = document.querySelectorAll('.js-ext-chart-data-y--'+(i+1)+'[data-chart="'+chartId+'"]');
      }
    } else {
      chart.extDataX[0] = document.querySelectorAll('.js-ext-chart-data-x[data-chart="'+chartId+'"]');
      chart.extDataY[0] = document.querySelectorAll('.js-ext-chart-data-y[data-chart="'+chartId+'"]');
    }
    // store initial HTML contentent
    storeExternalDataContent(chart, chart.extDataX, chart.extDataXInit);
    storeExternalDataContent(chart, chart.extDataY, chart.extDataYInit);
  };

  function storeExternalDataContent(chart, elements, array) {
    for(var i = 0; i < elements.length; i++) {
      array[i] = [];
      if(elements[i][0]) array[i][0] = elements[i][0].innerHTML;
    }
  };

  function updateExternalData(chart) {
    if(!chart.extDataX || !chart.extDataY) return;
    var marker = chart.markers[0][chart.selectedMarker];
    if(!marker) return;
    var dataIndex = marker.getAttribute('data-index');
    var multiVal = chart.options.datasets[0].data[0].length > 1;
    for(var i = 0; i < chart.options.datasets.length; i++) {
      updateExternalDataX(chart, dataIndex, i, multiVal);
      updateExternalDataY(chart, dataIndex, i, multiVal);
    }
  };

  function updateExternalDataX(chart, dataIndex, setIndex, multiVal) {
    if( !chart.extDataX[setIndex] || !chart.extDataX[setIndex][0]) return;
    var value = '';
    if(chart.options.externalData.customXHTML) {
      value = chart.options.externalData.customXHTML(dataIndex, chart.options, setIndex);
    } else {
      if(chart.options.xAxis && chart.options.xAxis.labels && chart.options.xAxis.labels.length > 1) {
        value = chart.options.xAxis.labels[dataIndex];
      } else if(multiVal) {
        htmlContent = chart.options.datasets[setIndex].data[dataIndex][0];
      }
    }
    chart.extDataX[setIndex][0].innerHTML = value;
  };

  function updateExternalDataY(chart, dataIndex, setIndex, multiVal) {
    if( !chart.extDataY[setIndex] || !chart.extDataY[setIndex][0]) return;
    var value = '';
    if(chart.options.externalData.customYHTML) {
      value = chart.options.externalData.customYHTML(dataIndex, chart.options, setIndex);
    } else {
      if(multiVal) {
        value = chart.options.datasets[setIndex].data[dataIndex][1];
      } else {
        value = chart.options.datasets[setIndex].data[dataIndex];
      }
    }
    chart.extDataY[setIndex][0].innerHTML = value;
  };

  function resetExternalData(chart) {
    if(!chart.options.externalData) return;
    for(var i = 0; i < chart.options.datasets.length; i++) {
      if(chart.extDataX[i][0]) chart.extDataX[i][0].innerHTML = chart.extDataXInit[i][0];
      if(chart.extDataY[i][0]) chart.extDataY[i][0].innerHTML = chart.extDataYInit[i][0];
    }
  };

  function setChartColumnSize(chart) {
    chart.columnWidthPerc = 100;
    chart.columnGap = 0;
    if(chart.options.column && chart.options.column.width) {
      chart.columnWidthPerc = parseInt(chart.options.column.width);
    }
    if(chart.options.column && chart.options.column.gap) {
      chart.columnGap = parseInt(chart.options.column.gap);
    } 
  };

  function resetColumnChart(chart) {
    var labels = chart.element.getElementsByClassName('js-chart__axis-labels--x')[0].querySelectorAll('.js-chart__axis-label'),
      labelsVisible = isVisible(labels[labels.length - 1]),
      xDelta = chart.xAxisWidth/labels.length;
    
    // translate x axis labels
    if(labelsVisible) {
      moveXAxisLabels(chart, labels, 0.5*xDelta);
    }
    // set column width + separation gap between columns
    var columnsSpace = xDelta*chart.columnWidthPerc/100;
    if(chart.options.stacked) {
      chart.columnWidth = columnsSpace;
    } else {
      chart.columnWidth = (columnsSpace - chart.columnGap*(chart.options.datasets.length - 1) )/chart.options.datasets.length;
    }

    chart.columnDelta = (xDelta - columnsSpace)/2;
  };

  function moveXAxisLabels(chart, labels, delta) { 
    // this applies to column charts only
    // translate the xlabels to center them 
    if(chart.xAxisLabelRotation) return; // labels were rotated - no need to translate
    for(var i = 0; i < labels.length; i++) {
      Util.setAttributes(labels[i], {x: labels[i].getBBox().x + delta});
    }
  };

  function setColumnChartDatasets(chart) {
    var gEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gEl.setAttribute('class', 'chart__dataset js-chart__dataset');
    chart.datasetScaled = [];

    setColumnChartYZero(chart);
    
    for(var i = 0; i < chart.options.datasets.length; i++) {
      var gSet = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      gSet.setAttribute('class', 'chart__set chart__set--'+(i+1)+' js-chart__set');
      chart.datasetScaled[i] = JSON.parse(JSON.stringify(chart.options.datasets[i].data));
      chart.datasetScaled[i] = getChartData(chart, chart.datasetScaled[i]);
      chart.datasetScaledFlat[i] = JSON.parse(JSON.stringify(chart.datasetScaled[i]));
      if(!chart.loaded && chart.options.animate) {
        flatDatasets(chart, i);
      }
      gSet.appendChild(getSvgColumns(chart, chart.datasetScaledFlat[i], i));
      gEl.appendChild(gSet);
      gSet.appendChild(getMarkers(chart, chart.datasetScaled[i], i));
    }
    
    chart.svg.appendChild(gEl);
  };

  function setColumnChartYZero(chart) {
    // if there are negative values -> make sre columns start from zero
    chart.yZero = chart.height - chart.bottomDelta;
    if(chart.yAxisInterval[0] < 0) {
      chart.yZero = chart.height - chart.bottomDelta + chart.yAxisHeight*(chart.yAxisInterval[0])/(chart.yAxisInterval[1] - chart.yAxisInterval[0]);
    }
  };

  function getSvgColumns(chart, dataset, index) {
    var gEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    for(var i = 0; i < dataset.length; i++) {
      var pathL = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      var points = getColumnPoints(chart, dataset[i], index, i, chart.datasetScaledFlat);
      var lineType =  chart.options.column && chart.options.column.radius ? 'round' : 'square';
      if(lineType == 'round' && chart.options.stacked && index < chart.options.datasets.length - 1) lineType = 'square';
      var dPath = (lineType == 'round') ? getRoundedColumnRect(chart, points) : getStraightLine(points);
      Util.setAttributes(pathL, {d: dPath, class: 'chart__data-bar chart__data-bar--'+(index+1)+' js-chart__data-bar js-chart__data-bar--'+(index+1)});
      gEl.appendChild(pathL);
    }
    return gEl;
  };

  function getColumnPoints(chart, point, index, pointIndex, dataSetsAll) {
    var xOffset = chart.columnDelta + index*(chart.columnWidth + chart.columnGap),
      yOffset = 0;

    if(chart.options.stacked) {
      xOffset = chart.columnDelta;
      yOffset = getyOffsetColChart(chart, dataSetsAll, index, pointIndex);
    }

    return [ 
      [point[0] + xOffset, chart.yZero - yOffset],
      [point[0] + xOffset, point[1] - yOffset], 
      [point[0] + xOffset + chart.columnWidth, point[1] - yOffset],
      [point[0] + xOffset + chart.columnWidth, chart.yZero - yOffset]
    ];
  };

  function getyOffsetColChart(chart, dataSetsAll, index, pointIndex) {
    var offset = 0;
    for(var i = 0; i < index; i++) {
      if(dataSetsAll[i] && dataSetsAll[i][pointIndex]) offset = offset + (chart.height - chart.bottomDelta - dataSetsAll[i][pointIndex][1]);
    }
    return offset;
  };

  function getRoundedColumnRect(chart, points) {
    var radius = parseInt(chart.options.column.radius);
    var arcType = '0,0,1',
      deltaArc1 = '-',
      deltaArc2 = ',',
      rectHeight = points[1][1] + radius;
    if(chart.yAxisInterval[0] < 0 && points[1][1] > chart.yZero) {
      arcType = '0,0,0';
      deltaArc1 = ',';
      deltaArc2 = '-';
      rectHeight = points[1][1] - radius;
    }
    var dpath = 'M '+points[0][0]+' '+points[0][1];
    dpath = dpath + ' V '+rectHeight;
    dpath = dpath + ' a '+radius+','+radius+','+arcType+','+radius+deltaArc1+radius;
    dpath = dpath + ' H '+(points[2][0] - radius);
    dpath = dpath + ' a '+radius+','+radius+','+arcType+','+radius+deltaArc2+radius;
    dpath = dpath + ' V '+points[3][1];
    return dpath;
  };

  function animateRectPath(chart, type) {
    var currentTime = null,
      duration = 600;

    var startArray = chart.datasetScaledFlat,
      finalArray = chart.datasetScaled;
        
    var animateSingleRectPath = function(timestamp){
      if (!currentTime) currentTime = timestamp;        
      var progress = timestamp - currentTime;
      if(progress > duration) progress = duration;
      var multiSetPoint = [];
      for(var i = 0; i < finalArray.length; i++) {
        // multi sets
        var points = [];
        var paths = chart.element.getElementsByClassName('js-chart__data-bar--'+(i+1));
        var rectLine = chart.options.column && chart.options.column.radius ? 'round' : 'square';
        if(chart.options.stacked && rectLine == 'round' && i < finalArray.length - 1) rectLine = 'square'; 
        for(var j = 0; j < finalArray[i].length; j++) {
          var val = Math.easeOutQuart(progress, startArray[i][j][1], finalArray[i][j][1]-startArray[i][j][1], duration);
          points[j] = [finalArray[i][j][0], val];
          // get path and animate
          var rectPoints = getColumnPoints(chart, points[j], i, j, multiSetPoint);
          var dPath = (rectLine == 'round') ? getRoundedColumnRect(chart, rectPoints) : getStraightLine(rectPoints);
          paths[j].setAttribute('d', dPath);
        }

        multiSetPoint[i] = points;
      }
      if(progress < duration) {
        window.requestAnimationFrame(animateSingleRectPath);
      }
    };

    window.requestAnimationFrame(animateSingleRectPath);
  };

  function getPieSvgCode(chart) {

  };

  function getDoughnutSvgCode(chart) {

  };

  Chart.defaults = {
    element : '',
    type: 'line', // can be line, area, bar
    xAxis: {},
    yAxis: {},
    datasets: [],
    tooltip: {
      enabled: false,
      classes: false,
      customHTM: false
    },
    yIndicator: true,
    padding: 10
  };

  window.Chart = Chart;

  var intObservSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
}());