// File#: _1_pie-chart
// Usage: codyhouse.co/license
(function() {
  var PieChart = function(opts) {
    this.options = Util.extend(PieChart.defaults , opts);
    this.element = this.options.element;
    this.chartArea = this.element.getElementsByClassName('js-pie-chart__area')[0];
    this.dataValues = this.element.getElementsByClassName('js-pie-chart__value');
    this.chartPaths;
    // used to convert data values to percentages
    this.percentageTot = 0; 
    this.percentageReset = getPercentageMultiplier(this);
    this.percentageStart = []; // store the start angle for each item in the chart
    this.percentageDelta = []; // store the end angle for each item in the chart
    // tooltip element
    this.tooltip = this.element.getElementsByClassName('js-pie-chart__tooltip');
    this.eventIds = [];
    this.hoverId = false;
    this.hovering = false;
    this.selectedIndex = false; // will be used for tooltip 
    this.chartLoaded = false; // used when chart is initially animated
    initPieChart(this);
    initTooltip(this);
  };

  function getPercentageMultiplier(chart) {
    var tot = 0;
    for(var i = 0; i < chart.dataValues.length; i++) {
      tot = tot + parseFloat(chart.dataValues[i].textContent);
    }
    return 100/tot;
  };

  function initPieChart(chart) {
    createChart(chart);
    animateChart(chart);
    // reset chart on resize (if required)
    resizeChart(chart);
  };

  function createChart(chart) {
    setChartSize(chart);
    // create svg element
    createChartSvg(chart);
    // visually hide svg element
    chart.chartArea.setAttribute('aria-hidden', true);
  };

  function setChartSize(chart) {
    chart.height = chart.chartArea.clientHeight;
    chart.width = chart.chartArea.clientWidth;
    // donut charts only
    if(chart.options.type == 'donut') {
      chart.donutSize = parseInt(getComputedStyle(chart.element).getPropertyValue('--pie-chart-donut-width'));
      if(chart.donutSize <= 0 || isNaN(chart.donutSize)) chart.donutSize = chart.width/4; 
    }
  };

  function createChartSvg(chart) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="'+chart.width+'" height="'+chart.height+'" class="pie-chart__svg js-pie-chart__svg"></svg>';
    chart.chartArea.innerHTML = chart.chartArea.innerHTML + svg;
    chart.svg = chart.chartArea.getElementsByClassName('js-pie-chart__svg')[0];
    // create chart content
    getPieSvgCode(chart);
  };

  function getPieSvgCode(chart) {
    var gEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gEl.setAttribute('class', 'pie-chart__dataset js-pie-chart__dataset');
    for(var i = 0; i < chart.dataValues.length; i++) {
      var pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      Util.setAttributes(pathEl, {d: getPiePath(chart, i), class: 'pie-chart__data-path pie-chart__data-path--'+(i+1)+' js-pie-chart__data-path js-pie-chart__data-path--'+(i+1), 'data-index': i, 'stroke-linejoin': 'round'});
      var customStyle = chart.dataValues[i].getAttribute('data-pie-chart-style');
      if(customStyle) pathEl.setAttribute('style', customStyle);
      gEl.appendChild(pathEl);
    }

    chart.svg.appendChild(gEl);
    chart.chartPaths = chart.svg.querySelectorAll('.js-pie-chart__data-path');
  };

  function getPiePath(chart, index) {
    var startAngle = chart.percentageTot*chart.percentageReset*3.6; //convert from percentage to angles
    var dataValue = parseFloat(chart.dataValues[index].textContent);
    // update percentage start
    chart.percentageStart.push(startAngle);
    chart.percentageDelta.push(dataValue*chart.percentageReset*3.6);
    chart.percentageTot = chart.percentageTot + dataValue;
    var endAngle = chart.percentageTot*chart.percentageReset*3.6;
    return getPathCode(chart, startAngle, endAngle);
  };

  function getPathCode(chart, startAngle, endAngle) {
    // if we still need to animate the chart -> reset endAngle
    if(!chart.chartLoaded && chart.options.animate && intersectionObserver && ! reducedMotion) {
      endAngle = startAngle;
    }
    if(chart.options.type == 'pie') {
      return getPieArc(chart.width/2, chart.width/2, chart.width/2, startAngle, endAngle);
    } else { //donut
      return getDonutArc(chart.width/2, chart.width/2, chart.width/2, chart.donutSize, startAngle, endAngle);
    }
  };

  function initTooltip(chart) {
    if(chart.tooltip.length < 1) return;
    // init mouse events
    chart.eventIds['hover'] = handleEvent.bind(chart);
    chart.chartArea.addEventListener('mouseenter', chart.eventIds['hover']);
    chart.chartArea.addEventListener('mousedown', chart.eventIds['hover']);
    chart.chartArea.addEventListener('mousemove', chart.eventIds['hover']);
    chart.chartArea.addEventListener('mouseleave', chart.eventIds['hover']);
  };

  function handleEvent(event) {
    switch(event.type) {
      case 'mouseenter':
      case 'mousedown':
        hoverChart(this, event);
        break;
      case 'mousemove': 
        var self = this;
        self.hoverId  = window.requestAnimationFrame 
          ? window.requestAnimationFrame(function(){hoverChart(self, event)})
          : setTimeout(function(){hoverChart(self, event);});
        break;
      case 'mouseleave':
        resetTooltip(this);
        break;
    }
  };

  function hoverChart(chart, event) {
    if(chart.hovering) return;
    chart.hovering = true;
    var selectedIndex = getSelectedIndex(event);
    if(selectedIndex !== false && selectedIndex !== chart.selectedIndex) {
      chart.selectedIndex = selectedIndex;
      setTooltipContent(chart);
      placeTooltip(chart);
      Util.removeClass(chart.tooltip[0], 'is-hidden');
    }
    chart.hovering = false;
  };

  function resetTooltip(chart) {
    if(chart.hoverId) {
      (window.requestAnimationFrame) ? window.cancelAnimationFrame(chart.hoverId) : clearTimeout(chart.hoverId);
      chart.hoverId = false;
    }
    Util.addClass(chart.tooltip[0], 'is-hidden');
    chart.hovering = false;
    chart.selectedIndex = false;
  };

  function placeTooltip(chart) {
    var tooltipRadialPosition = (chart.options.type == 'donut') ? (chart.width - chart.donutSize)/2 : chart.width/4;
    var pathCenter = polarToCartesian(chart.width/2, chart.width/2, tooltipRadialPosition, chart.percentageStart[chart.selectedIndex] + chart.percentageDelta[chart.selectedIndex]/2);

    chart.tooltip[0].setAttribute('style', 'left: '+pathCenter.x+'px; top: '+pathCenter.y+'px');
  };

  function setTooltipContent(chart) {
    chart.tooltip[0].textContent = chart.dataValues[chart.selectedIndex].textContent;
  };

  function getSelectedIndex(event) {
    if(event.target.tagName.toLowerCase() == 'path') {
      return parseInt(event.target.getAttribute('data-index'));
    }
    return false;
  };

  function resizeChart(chart) {
    window.addEventListener('resize', function() {
      clearTimeout(chart.eventIds['resize']);
      chart.eventIds['resize'] = setTimeout(doneResizing, 300);
    });

    function doneResizing() {
      resetChartResize(chart);
      removeChart(chart);
      createChart(chart);
      initTooltip(chart);
    };
  };

  function resetChartResize(chart) {
    chart.hovering = false;
    // reset event listeners
    if( chart.eventIds && chart.eventIds['hover']) {
      chart.chartArea.removeEventListener('mouseenter', chart.eventIds['hover']);
      chart.chartArea.removeEventListener('mousedown', chart.eventIds['hover']);
      chart.chartArea.removeEventListener('mousemove', chart.eventIds['hover']);
      chart.chartArea.removeEventListener('mouseleave', chart.eventIds['hover']);
    }
  };

  function removeChart(chart) {
    // on resize -> remove svg and create a new one
    chart.svg.remove();
  };

  function animateChart(chart) {
    if(!chart.options.animate || chart.chartLoaded || reducedMotion || !intersectionObserver) return;
    var observer = new IntersectionObserver(chartObserve.bind(chart), {rootMargin: "0px 0px -200px 0px"});
    observer.observe(chart.element);
  };

  function chartObserve(entries, observer) { // observe chart position -> start animation when inside viewport
    if(entries[0].isIntersecting) {
      this.chartLoaded = true;
      animatePath(this);
      observer.unobserve(this.element);
    }
  };

  function animatePath(chart, type) {
    var currentTime = null,
      duration = 400/chart.dataValues.length;
        
    var animateSinglePath = function(index, timestamp) {
      if (!currentTime) currentTime = timestamp;        
      var progress = timestamp - currentTime;
      if(progress > duration) progress = duration;

      var startAngle = chart.percentageStart[index];
      var endAngle =  startAngle + chart.percentageDelta[index]*(progress/duration);

      var path = chart.element.getElementsByClassName('js-pie-chart__data-path--'+(index+1))[0];
      var pathCode = getPathCode(chart, startAngle, endAngle);;
      path.setAttribute('d', pathCode);
      
      if(progress < duration) {
        window.requestAnimationFrame(function(timestamp) {animateSinglePath(index, timestamp);});
      } else if(index < chart.dataValues.length - 1) {
        currentTime = null;
        window.requestAnimationFrame(function(timestamp) {animateSinglePath(index + 1, timestamp);});
      }
    };

    window.requestAnimationFrame(function(timestamp) {animateSinglePath(0, timestamp);});
  };

  // util functions - get paths d values
  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
  
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };
  
  function getPieArc(x, y, radius, startAngle, endAngle){
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
        "L", x,y,
        "L", start.x, start.y
    ].join(" ");

    return d;       
  };

  function getDonutArc(x, y, radius, radiusDelta, startAngle, endAngle){
    var s1 = polarToCartesian(x, y, (radius - radiusDelta), endAngle),
      s2 = polarToCartesian(x, y, radius, endAngle),
      s3 = polarToCartesian(x, y, radius, startAngle),
      s4 = polarToCartesian(x, y, (radius - radiusDelta), startAngle);


    var arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

    var d = [
        "M", s1.x, s1.y,
        "L", s2.x, s2.y, 
        "A", radius, radius, 0, arcSweep, 0, s3.x, s3.y, 
        "L", s4.x, s4.y, 
        "A", (radius - radiusDelta), (radius - radiusDelta), 0, arcSweep, 1, s1.x, s1.y
    ].join(" ");

    return d;       
  };

  PieChart.defaults = {
    element : '',
    type: 'pie', // can be pie or donut
    animate: false
  };

  window.PieChart = PieChart;

  //initialize the PieChart objects
  var pieCharts = document.getElementsByClassName('js-pie-chart');
  var intersectionObserver = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype),
    reducedMotion = Util.osHasReducedMotion();
  
  if( pieCharts.length > 0 ) {
    for( var i = 0; i < pieCharts.length; i++) {
      (function(i){
        var chartType = pieCharts[i].getAttribute('data-pie-chart-type') ? pieCharts[i].getAttribute('data-pie-chart-type') : 'pie';
        var animate = pieCharts[i].getAttribute('data-pie-chart-animation') && pieCharts[i].getAttribute('data-pie-chart-animation') == 'on' ? true : false;
        new PieChart({
          element: pieCharts[i],
          type: chartType,
          animate: animate
        });
      })(i);
    }
  }
}());