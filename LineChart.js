class LineChart {
  x;
  xAxis;
  y;
  yAxis;
  svg;
  transitionDuration = 0;

  create = data => {
    // set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 30, left: 50 },
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    this.svg = d3.select("#line-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Initialise a X axis:
    this.x = d3.scaleUtc().range([0, width]);
    this.xAxis = d3.axisBottom().scale(this.x);
    this.svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .attr("class", "myXaxis")

    // Initialize an Y axis
    this.y = d3.scaleLinear().range([height, 0]);
    this.yAxis = d3.axisLeft().scale(this.y);
    this.svg.append("g")
      .attr("class", "myYaxis")

    // At the beginning, I run the update function on the first dataset:
    this.update(data)
  }

  // Create a function that takes a dataset as input and update the plot:
  update = data => {
    // Create the X axis:
    this.x.domain([d3.min(data, d => d.x), d3.max(data, d => d.x)]);
    this.svg.selectAll(".myXaxis").transition()
      .duration(this.transitionDuration)
      .call(this.xAxis);

    // create the Y axis
    this.y.domain([d3.min(data, d => d.y), d3.max(data, d => d.y)]);
    this.svg.selectAll(".myYaxis")
      .transition()
      .duration(this.transitionDuration)
      .call(this.yAxis);

    // Create a update selection: bind to the new data
    const u = this.svg.selectAll(".lineTest")
      .data([data], d => d.x);

    // Update the line
    u
      .join("path")
      .attr("class", "lineTest")
      .transition()
      .duration(this.transitionDuration)
      .attr("d", d3.line()
        .x(d => this.x(d.x))
        .y(d => this.y(d.y)))
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1)
  }
}
