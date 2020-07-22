var setChart = function () {
  let margin = {top:20, right:20, bottom: 20, left: 20};
  let width = 900 - margin.left - margin.right;
  let height = 400 - margin.top - margin.bottom;
  let boxSize = 14;
  
  let sortOption = 'Activeness';
  let nameValue = d => d.name;
  let setNames;
  let chartData;
  let filteredData;
  let nameFilterStrings = [];
  let chartDiv;

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
          return d3.ascending(a.name, b.name);
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
        sets: setNames.map(s => {
          return {
            setName: s,
            inSet: d[s]
          }
        })
      }
    });
    
    chartData.sort(orders[sortOption]);
    if (nameFilterStrings.length > 0) {
      filteredData = chartData.filter(d => isNameFiltered(d.name));
    } else {
      filteredData = chartData;
    }
    // chartData.sort((a,b) => {
    //   aCardinality = 0;
    //   a.sets.map(d => {
    //     d.inSet ? aCardinality++ : 0;
    //   });

    //   bCardinality = 0;
    //   b.sets.map(d => {
    //     d.inSet ? bCardinality++ : 0;
    //   });

    //   if (aCardinality === bCardinality) {
    //     aFirstSetIdx = a.sets.findIndex(d => d.inSet);
    //     bFirstSetIdx = b.sets.findIndex(d => d.inSet);
    //     if (aFirstSetIdx === bFirstSetIdx) {
    //       return d3.ascending(a.name, b.name);
    //     } else {
    //       return d3.ascending(aFirstSetIdx, bFirstSetIdx);
    //     }
    //   } else {
    //     return d3.descending(aCardinality, bCardinality);
    //   }
    // });

    chartDiv = selection;
    drawChart();
  }

  function drawChart() {
    if (chartDiv) {
      chartDiv.selectAll('*').remove();

      if (filteredData) {
        // console.log(filteredData);

        width = setNames.length * boxSize;
        height = filteredData.length * boxSize;

        const svg = chartDiv.append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);
        const g = svg.append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
          .domain(setNames)
          .range([0, width]);
          // .padding(1);        
        
        const y = d3.scaleBand()
          .domain([...new Set(filteredData.map(d => d.name))])
          .range([0, height]);
          // .padding(1);
        // console.log(y.domain());
        
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
        
        const yAxis = g => g
          .call(d3.axisLeft(y))
          .call(g => g.select(".domain").remove());
        
        g.append("g")
          .attr("class", "axis axis-y")
          .call(yAxis);

        // const dotData = d3.merge(chartData.map(d => {
        //   return setNames.map(setName => {

        //     return {
        //       name: nameValue(d),
        //       `${setName}`: d[setName]
        //     }
        //   });
        // }));
        // console.log(dotData);
        // g.append("g")
        //     .attr("stroke", "black")
        //     .attr("stroke-width", 2)
        //   .selectAll("dots")
        //   .data(chartData)
        //   .join("dots")

        const row = g.append("g")
            .selectAll("g")
          .data(filteredData)
          .join("g")
            .attr("transform", d => `translate(0, ${y(d.name)})`);

        row.selectAll("rect")
          .data(d => d.sets)
          .join("rect")
            .attr("rx", 5)
            .attr("x", s => x(s.setName))
            .attr("width", x.bandwidth() - 2)
            .attr("height", y.bandwidth() - 2)
            .attr("fill", s => s.inSet ? "black" : "white")
            .attr("stroke", "gray")
            .append("title")
              .text(s => `${s.setName}, ${s.inSet}`);

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