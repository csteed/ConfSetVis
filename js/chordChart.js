var chordChart = function () {
  let margin = {top: 20, right: 20, bottom: 20, left: 20};
  let width = 800 - margin.left - margin.right;
  let height = 800 - margin.top - margin.bottom;

  let _chartData;
  let _chartDiv;

  let names;
  let matrix;

  let confStrokeColor = "#778899";
  let interStrokeColor = "lightgray";
  let interStrokeHighlightColor = '#3182bd';
  let fadeOpacity = 0.2;

  function chart(selection, data) {
    _chartData = data.slice();
    _chartDiv = selection;

    names = Array.from(new Set(_chartData.flatMap(d => [d.source, d.target])));

    const index = new Map(names.map((name, i) => [name, i]));
    matrix = Array.from(index, () => new Array(names.length).fill(0));
    for (const {source, target, value} of _chartData) {
      matrix[index.get(source)][index.get(target)] += value;
    }

    drawChart();
  }

  function drawChart() {
    if (_chartDiv) {
      _chartDiv.selectAll('*').remove();

      if (_chartData) {
        const svg = _chartDiv.append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);
        
        const g = svg.append('g')
          .attr('transform', `translate(${margin.left + (width / 2)}, ${margin.top + (height / 2)})`);

        const outerRadius = Math.min(width, height) * 0.5;
        const innerRadius = outerRadius - 124;

        const chord = d3.chord()
          .padAngle(.03)
          .sortSubgroups(d3.descending)
          .sortChords(d3.descending);

        const arc = d3.arc()
          .innerRadius(innerRadius)
          .outerRadius(innerRadius + 20);

        const ribbon = d3.ribbon()
          .radius(innerRadius);

        // const color = d3.scaleSequential(d3.interpolateBlues).domain([0, d3.max(_chartData.map(d => d.value))]);
        const color = d3.scaleSequentialSqrt([0, d3.max(_chartData.map(d => d.value))], t => d3.interpolateBlues((t * .75 + 0.15)));

        const chords = chord(matrix);
        // console.log(chords);
        // const maxDiff = chords.map(d => d.source.value - d.target.value).reduce((t,v) => Math.max(t,v),0);
        // console.log(maxDiff);

        const group = g.append("g")
          .selectAll("g")
          .data(chords.groups)
          .enter().append("g");

        // outer conference paths
        group.append("path")
          .attr("class", d => `conf ${names[d.index]}`)
          .attr('fill', '#C0C0C0')
          // .attr('fill', '#deebf7')
          // .attr('stroke', '#3182bd')
          // .attr('stroke', '#778899')
          .attr('stroke', confStrokeColor)
          .attr('d', arc);

        group.append("text")
          .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
          .attr("dy", ".35em")
          .attr("transform", d => `
            rotate(${(d.angle * 180 / Math.PI - 90)})
            translate(${innerRadius + 26})
            ${d.angle > Math.PI ? "rotate(180)" : ""}`)
          .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
          .text(d => names[d.index]);
          
        // inner intersection paths
        g.append("g")
            .attr("fill-opacity", 0.5)
          .selectAll("path")
          .data(chords)
          .enter().append("path")
            .attr('class', d => {
              return `intersection ${names[d.source.index]} ${names[d.target.index]}`
            })
            // .attr('stroke', '#3182bd')
            .attr('stroke', interStrokeColor)
            .attr('fill', d => color(d.source.value))
            .style("mix-blend-mode", "multiply")
            // .attr('fill', d => (color(Math.abs(d.source.value - d.target.value) / maxDiff)))
            .attr('d', ribbon);
                    
        g.append("text")
          .attr("class", "textbox")
          .style('text-anchor', 'middle')
          .style('text-weight', 'bold')
          .style('font-size', 14)
          .style('text-shadow', '0 2px 0 #eee, 2px 0 0 #fff, 0 -2px 0 #eee, -2px 0 0 #eee')
          .html('Hover over a chord or conference to display information');

        g.selectAll('path.intersection')
          .on('mouseover', function(d) {
            d3.selectAll('path')
              .transition().duration(200).attr('opacity', fadeOpacity);
            d3.select(this)
              .transition().duration(200)
                .attr('opacity', 1);
            //     .attr('stroke', interStrokeHighlightColor);
                // .attr('stroke', '#3182bd');
            d3.select('.textbox')
              .html(`${names[d.source.index]} and ${names[d.target.index]} had ${d.source.value} shared PC members`);
          })
          .on('mouseout', function(d) {
            d3.selectAll('path')
              .transition().duration(200)
                .attr('opacity', 1);
            // d3.selectAll('path.intersection')
            //   .transition().duration(200)
            //   .attr('stroke', "#000");
            // d3.selectAll('path.intersection')
            //   .transition().duration(200)
            //     .attr('stroke', 'lightgray');
            d3.selectAll('text.intersection').transition().duration(200).attr('opacity', 0);
            d3.select('.textbox').html('Hover over a chord or conference to display information');
          });
        
        g.selectAll('path.conf')
          .on('mouseover', function(d) {
            d3.selectAll('path')
              .transition().duration(200)
                .attr('opacity', fadeOpacity);
            d3.selectAll(`.${names[d.index]}`)
              .transition().duration(200)
                .attr('opacity', 1);
            d3.select('.textbox').html(`${names[d.index]} had ${d3.sum(matrix[d.index])} PC members on the PC of other conferences`);
          })
          .on('mouseout', function(d) {
            d3.selectAll('path')
              .transition().duration(200)
                .attr('opacity', 1);
            // d3.selectAll('path.intersection')
            //   .transition().duration(200)
            //     .attr('stroke', 'lightgray');
            d3.select('.textbox').html('Hover over a chord or conference for display information');
          });
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

  chart.width = function(value) {
    if (!arguments.length) {
      return width;
    }
    width = value - margin.left - margin.right;
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

  return chart;
}