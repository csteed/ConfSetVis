var barChart = function() {
  let margin = {top: 40, right: 20, bottom: 20, left: 40};
  let width = 900 - margin.left - margin.right;
  let height = 200 - margin.bottom - margin.top;
  let categoryValue;
  let categories;
  let barValue;
  let binFill = 'deepskyblue';
  // let binFill = "#8BB1D0";
  let titleText;

  let chartData;
  let chartDiv;

  function chart(selection, data) {
    chartData = data;
    chartDiv = selection;
    drawChart();
  }

  function drawChart() {
    if (chartData && chartDiv) {
      chartDiv.selectAll('*').remove();
          
      let svg = chartDiv.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

      let g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      if (!categories) {
        categories = [...new Set(chartData.map(categoryValue))].sort(d3.ascending);
      }

      let y = d3.scaleBand()
        .domain(categories)
        .range([0, height])
        .padding(0.1);
      
      let x = d3.scaleLinear()
        .domain([0, d3.max(chartData, barValue)])
        .range([0, width])
        .nice();

      const format = d3.format('.4s');

      g.append('g')
        .attr('fill', binFill)
        .attr('stroke', 'none')
        .selectAll('bin')
        .data(chartData)
        .enter().append('rect')
          .attr('x', x(0))
          .attr('y', d => y(categoryValue(d)))
          .attr('width', d => x(barValue(d)) - x(0))
          .attr('height', y.bandwidth());

      // g.append('g')
      //   .attr('fill', 'white')
      //   .attr('text-anchor', 'end')
      //   .style('font', '10px sans-serif')
      //   .selectAll('text')
      //   .data(chartData);
        // .enter().append('text')
        //   .attr('x', d => x(barValue(d)) - (barValue(d) > 100 ? 4: -4))
        //   .attr('y', d => y(d.key) + y.bandwidth() / 2)
        //   .attr('dy', '0.35em')
        //   .attr('text-anchor', d => d.values.length > 100 ? 'end' : 'start')
        //   .attr('fill', d => d.values.length > 100 ? 'white' : 'black')
        //   .text(d => d3.format(',')(d.values.length));

      let yAxis = d3.axisLeft(y);

      g.append('g')
        .attr('class', 'axis axis--y')
        .call(yAxis);
        // .select('.domain').remove();
      
      let xAxis = d3.axisTop(x).tickSize(-height);

      g.append('g')
        .attr('class', 'axis axis--x')
        // .attr('transform', `translate()`)
        .call(xAxis)
        .select('.domain').remove();
      g.select('.axis--x').selectAll('.tick line').attr('opacity', 0.15);
      
      if (titleText) {
        g.append("text")
          .attr("x", 0)
          .attr("y", -24)
          .style("text-anchor", "start")
          .style("font-weight", "bold")
          .style("font-size", 12)
          .text(titleText);
      }
    }
  }

  chart.margin = function(value) {
    if (!arguments.length) {
      return margin;
    }
    oldChartWidth = width + margin.left + margin.right;
    oldChartHeight = height + margin.top + margin.bottom;
    margin = value;
    width = oldChartWidth - margin.left - margin.right;
    height = oldChartHeight - margin.top - margin.bottom;
    return chart;
  };

  chart.barValue = function(value) {
    if (!arguments.length) {
      return barValue;
    }
    barValue = value;
    return chart;
  };

  chart.categories = function(value) {
    if (!arguments.length) {
      return categories;
    }
    categories = value;
    return chart;
  };

  chart.categoryValue = function(value) {
    if (!arguments.length) {
      return categoryValue;
    }
    categoryValue = value;
    return chart;
  };

  chart.width = function(value) {
    if (!arguments.length) {
      return width;
    }
    width = value - margin.left - margin.right;
    drawChart();
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) {
      return height;
    }
    height = value - margin.top - margin.bottom;
    drawChart();
    return chart;
  };

  chart.titleText = function(value) {
    if (!arguments.length) {
      return titleText;
    }
    titleText = value;
    return chart;
  };

  return chart;
}