(async () => {
    const graph = populateDAG();
    const data = graph.getJSON();
    console.log(data);
    const dag = d3.dagStratify()(data);
    const nodeRadius = 0.25;
    const layout = d3
        .sugiyama() // base layout
        .decross(d3.decrossOpt()) // minimize number of crossings
        .nodeSize((node) => [(node ? 1 : 0.25) * nodeRadius, 3 * nodeRadius]); // set node size instead of constraining to fit
    const { width, height } = layout(dag);

    // --------------------------------
    // This code only handles rendering
    // --------------------------------
    const svgSelection = d3.select("svg");
    svgSelection.attr("viewBox", [0, 0, width, height].join(" "));

    const steps = dag.size();

    // How to draw edges
    const line = d3
        .line()
        .curve(d3.curveCatmullRom)
        .x((d) => d.x)
        .y((d) => d.y);

    // Plot edges
    svgSelection
        .append("g")
        .selectAll("path")
        .data(dag.links())
        .enter()
        .append("path")
        .attr("d", ({ points }) => line(points))
        .attr("fill", "none")
        .attr("stroke-width", 0.025)
        .attr("stroke", "black");

    // Select nodes
    const nodes = svgSelection
        .append("g")
        .selectAll("g")
        .data(dag.descendants())
        .enter()
        .append("g")
        .attr("transform", ({ x, y }) => `translate(${x}, ${y})`);

    // Plot node circles
    nodes
        .append('rect')
        .attr('x', 10)
        .attr('y', 120)
        .attr('width', 600)
        .attr('height', 40)
        .attr('stroke', 'black');
        // .attr('fill', '#69a3b2');

    // Add text to nodes
    nodes
        .append("text")
        .text((d) => d.data.id)
        .attr("font-weight", "bold")
        .attr("font-size", 0.25)
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("fill", "white");

})();
