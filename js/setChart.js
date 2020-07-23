var setChart = function () {
  let margin = {top:20, right:20, bottom: 20, left: 20};
  let width = 900 - margin.left - margin.right;
  let height = 400 - margin.top - margin.bottom;
  let boxSize = 14;
  
  let sortOption = 'Activeness';
  let nameValue = d => d.name;
  let setNames;
  let setCounts;
  let chartData;
  let setPatterns;
  let filteredData;
  let nameFilterStrings = [];
  let chartDiv;
  let cardinalityBarChartWidth = 100;
  let setCountBarChartHeight = 100;

  let orders = ({
    Activeness: (a, b) => {
      aCardinality = 0;
      a.sets.map(d => {
        d.inSet ? aCardinality++ : 0;
      });

      bCardinality = 0;
      b.sets.map(d => {
        d.inSet ? bCardinality++ : 0;
      });

      if (aCardinality === bCardinality) {
        aFirstSetIdx = a.sets.findIndex(d => d.inSet);
        bFirstSetIdx = b.sets.findIndex(d => d.inSet);
        if (aFirstSetIdx === bFirstSetIdx) {
          // aLastSetIdx = a.sets.lastIndexOf(d => d.inSet);
          // bLastSetIdx = b.sets.lastIndexOf(d => d.inSet);
          // if (aLastSetIdx === bLastSetIdx) {
            return d3.ascending(a.name, b.name);
          // } else {
          //   return d3.ascending(aLastSetIdx, bLastSetIdx);
          // }
        } else {
          return d3.ascending(aFirstSetIdx, bFirstSetIdx);
        }
      } else {
        return d3.descending(aCardinality, bCardinality);
      }
    },
    Set: (a, b) => {
      aCardinality = 0;
      a.sets.map(d => {
        d.inSet ? aCardinality++ : 0;
      });

      bCardinality = 0;
      b.sets.map(d => {
        d.inSet ? bCardinality++ : 0;
      });
      aFirstSetIdx = a.sets.findIndex(d => d.inSet);
      bFirstSetIdx = b.sets.findIndex(d => d.inSet);
      if (aFirstSetIdx === bFirstSetIdx) {
        if (aCardinality === bCardinality) {
          return d3.ascending(a.name, b.name);
        } else {
          return d3.descending(aCardinality, bCardinality);
        }
      } else {
        return d3.ascending(aFirstSetIdx, bFirstSetIdx);
      }
    },
    Name: (a, b) => d3.ascending(a.name, b.name)
  });

  const isNameFiltered = (name) => {
    for (let i = 0; i < nameFilterStrings.length; i++) {
      if (name.toLowerCase().includes(nameFilterStrings[i])) {
        return true;
      }
    }
    return false;
  }

  function chart(selection, data) {
    chartData = data.map(d => {
      return {
        name: nameValue(d),
        sets: setNames.map(s => d[s])
      }
    });
    console.log(setNames);
    console.log(chartData);

    const setsAreEqual = (a, b) => {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    };

    setPatterns = [];
    setCounts = setNames.map(d => 0);
    chartData.map(d => {
      let idx = setPatterns.findIndex(p => setsAreEqual(p.sets, d.sets));
      let setPattern;
      if (idx === -1) {
        setPattern = {
          sets: d.sets.slice(),
          intersections: d3.sum(d.sets),
          // count: 0,
          items: []
        }
        setPatterns.push(setPattern);
      } else {
        setPattern = setPatterns[idx];
      }
      setPattern.items.push(d);

      d.sets.map((d,i) => {
        setCounts[i] += d;
      });
    });

    setPatterns.sort((a,b) => d3.descending(a.intersections, b.intersections));
    // let setPatterns = [...new Set(chartData.map(d => d.sets))];
    console.log(setPatterns);
    console.log(setNames);
    console.log(setCounts);
    // console.log(chartData.map(d => d.sets));

    
    // chartData.sort(orders[sortOption]);
    // if (nameFilterStrings.length > 0) {
    //   filteredData = chartData.filter(d => isNameFiltered(d.name));
    // } else {
    //   filteredData = chartData;
    // }

    // console.log(filteredData);

    chartDiv = selection;
    drawChart();
  }

  function drawChart() {
    if (chartDiv) {
      chartDiv.selectAll('*').remove();

      if (setPatterns) {
        width = setNames.length * boxSize;
        height = setPatterns.length * boxSize;

        const svg = chartDiv.append('svg')
          .attr('width', width + cardinalityBarChartWidth + margin.left + margin.right)
          .attr('height', height + setCountBarChartHeight + margin.top + margin.bottom);
        const g = svg.append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
          .domain(setNames)
          .range([0, width]);
        
        const y = d3.scaleBand()
          // .domain([...new Set(filteredData.map(d => d.name))])
          .domain([...new Set(setPatterns.map(d => d.sets))])
          .range([0, height]);
        console.log(y.domain());
        
        const xAxis = g => g
          .call(d3.axisTop(x))
          .call(g => g.select(".domain").remove())
          .call(g => g.selectAll('.tick text')
            .attr('y', 0)
            .attr('x', 10)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'start')
            .attr('transform', 'rotate(-90)'))
        
        g.append("g")
          .attr("class", "axis axis--x")
          .call(xAxis);

        // const yAxis = g => g
        //   .call(d3.axisLeft(y))
        //   .call(g => g.select(".domain").remove());
        
        // g.append("g")
        //   .attr("class", "axis axis-y")
        //   .call(yAxis);

        const row = g.append("g")
            .selectAll("g")
          .data(setPatterns)
          .join("g")
            .attr("transform", d => `translate(0, ${y(d.sets)})`);

        row.selectAll("rect")
          .data(d => d.sets)
          .join("rect")
            .attr("rx", 5)
            .attr("x", (s,i) => x(setNames[i]))
            .attr("width", x.bandwidth() - 2)
            .attr("height", y.bandwidth() - 2)
            .attr("fill", s => s ? "deepskyblue" : "white")
            .attr("stroke", "gray")
            .append("title")
              .text((s,i) => `${setNames[i]}, ${s}`);

        // draw count bar chart
        const barX = d3.scaleLinear()
          .range([width + 10, width + cardinalityBarChartWidth])
          .domain([0, d3.max(setPatterns, d => d.items.length)])
          .nice();
        console.log(barX.domain());

        const cardinailtyXAxis = g => g
          .call(d3.axisTop(barX).ticks(cardinalityBarChartWidth / 30))
          .call(g => g.select(".domain").remove());
          // .call(g => g.selectAll('.tick text')
          //   .attr('y', 0)
          //   .attr('x', 10)
          //   .attr('dy', '0.35em')
          //   .attr('text-anchor', 'start')
          //   .attr('transform', 'rotate(-90)'))
        
        g.append("g")
          .attr("class", "axis axis--x")
          .call(cardinailtyXAxis);

        g.append('g')
          .attr('fill', "deepskyblue")
          .attr('stroke', 'none')
          .selectAll('bin')
          .data(setPatterns)
          .enter().append('rect')
            .attr('x', barX.range()[0])
            .attr('y', d => y(d.sets))
            .attr('width', d => barX(d.items.length) - barX(0))
            .attr('height', y.bandwidth() - 2)
            .append('title')
              .text(d => `${d.sets.map((s,i) => s === 1 ? setNames[i] : null).filter(d => d)}\nn = ${d.items.length}`);
        
        g.append('g')
            .attr('fill', "black")
            .attr('text-anchor', 'end')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 12)
          .selectAll('text')
          .data(setPatterns)
          .join('text')
            .attr('x', d => barX(d.items.length))
            .attr('y', d => y(d.sets) + y.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('dx', -4)
            .text(d => d.items.length)
          .call(text => text.filter(d => barX(d.items.length) - barX(0) < 30)
            .attr('dx', +4)
            // .attr('fill', 'black')
            .attr('text-anchor', 'start'));

        // draw set population size bar chart below matrix chart
        const barY = d3.scaleLinear()
          .range([height + 10, height + setCountBarChartHeight])
          .domain([0, d3.max(setCounts)])
          .nice();
          console.log(barY.domain());
  
        const setSizeYAxis = g => g
          .call(d3.axisLeft(barY).ticks(setCountBarChartHeight/14))
          .call(g => g.select(".domain").remove());
        
        g.append("g")
          .attr("class", "axis axis-y")
          .call(setSizeYAxis);

        g.append('g')
          .attr('fill', "deepskyblue")
          .attr('stroke', 'none')
          .selectAll('bin')
          .data(setCounts)
          .enter().append('rect')
            .attr('x', (d,i) => x(setNames[i]))
            .attr('y', barY.range()[0])
            .attr('width', x.bandwidth() - 2)
            .attr('height', d => barY(d) - barY(0))
            .append('title')
              .text((d,i) => `${setNames[i]}\nn = ${d}`);

        // g.append('g')
        //     .attr('fill', "black")
        //     .attr('text-anchor', 'start')
        //     .attr('font-family', 'sans-serif')
        //     .attr('font-size', 10)
        //   .selectAll('text')
        //   .data(setNames)
        //   .join('text')
        //     .attr('x', 10)
        //     .attr('y', d => x(d) + x.bandwidth() / 2)
        //     .attr('dy', '0.35em')
        //     .attr('transform', 'rotate(-90)')
        //     // .attr('dx', -4)
        //     .text((d,i) => `${setCounts[i]}`);

        // g.append('g')
        //   .attr('fill', "deepskyblue")
        //   .attr('stroke', 'none')
        //   .selectAll('bin')
        //   .data(setCounts)
        //   .enter().append('rect')
        //     .attr('x', (d,i) => x(setNames[i]))
        //     .attr('y', d => barY(d))
        //     .attr('width', x.bandwidth() - 2)
        //     .attr('height', d => Math.abs(barY(d) - barY.range()[0]));
        
        // g.append('g')
        //     .attr('fill', "black")
        //     .attr('text-anchor', 'start')
        //     .attr('font-family', 'sans-serif')
        //     .attr('font-size', 10)
        //   .selectAll('text')
        //   .data(setNames)
        //   .join('text')
        //     .attr('x', 10)
        //     .attr('y', d => x(d) + x.bandwidth() / 2)
        //     .attr('dy', '0.35em')
        //     .attr('transform', 'rotate(-90)')
        //     // .attr('dx', -4)
        //     .text((d,i) => `${d} (${setCounts[i]})`);
      }
    }
  }

  chart.setNameFilterStrings = function(value) {
    if (!arguments.length) {
      return nameFilterStrings;
    }

    let strings = d3.csvParseRows(value)[0];
    nameFilterStrings = [];
    if (strings) {
      strings.map(d => {
        if (d.trim().length > 0) {
          nameFilterStrings.push(d.trim().toLowerCase());
        }
      });
    }
    console.log(nameFilterStrings);

    if (chartData) {
      if (nameFilterStrings.length > 0) {
        filteredData = chartData.filter(d => isNameFiltered(d.name));
      } else {
        filteredData = chartData;
      }
      console.log(filteredData);

      drawChart();
    }
    return chart;
  }

  chart.sortOption = function(value) {
    if (!arguments.length) {
      return sortOption;
    }
    sortOption = value;
    if (chartData) {
      chartData.sort(orders[sortOption]);
      if (nameFilterStrings.length > 0) {
        filteredData = chartData.filter(d => isNameFiltered(d.name));
      } else {
        filteredData = chartData;
      }
      drawChart();
    }
    return chart;
  }

  chart.setNames = function(value) {
    if (!arguments.length) {
      return setNames;
    }
    setNames = value;
    return chart;
  }

  chart.nameValue = function(value) {
    if (!arguments.length) {
      return nameValue;
    }
    nameValue = value;
    return chart;
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

  chart.boxSize = function(value) {
    if (!arguments.length) {
      return boxSize;
    }
    boxSize = value;
    drawChart();
    return chart;
  }

  // chart.width = function(value) {
  //   if (!arguments.length) {
  //     return width;
  //   }
  //   width = value - margin.left - margin.right;
  //   return chart;
  // };

  // chart.height = function(value) {
  //   if (!arguments.length) {
  //     return height;
  //   }
  //   height = value - margin.top - margin.bottom;
  //   drawChart();
  //   return chart;
  // };

  return chart;
}