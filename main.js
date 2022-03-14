// const data = {...};

function groupByFingerprintIDs(input) {
   const result = {};

   const nodes = {};
   const links = {};

   for (const i in input.events) {
       const blocker = data.events[i]["blockingTxnFingerprintId"];
       const waiter = data.events[i]["waitingTxnFingerprintId"];

       if (blocker === "0") {
           continue;
       }

       if (waiter === "0") {
           continue;
       }

       // Disallow self reference for now.
       if (blocker === waiter) {
           continue;
       }

       nodes[waiter] = {id: waiter};
       nodes[blocker] = {id: blocker};

       links[waiter + blocker] = {
           source: waiter,
           target: blocker,
       };
   }

   result.nodes = Object.values(nodes);
   result.links = Object.values(links);

   return result;
}

const margin = {
    top: 10,
    right: 30,
    bottom: 30,
    left: 40,
};

const size = {
    width: window.innerWidth - margin.left - margin.right,
    height: window.innerHeight - margin.top - margin.bottom,
};

function main() {
    const graph = groupByFingerprintIDs(data);
    console.log(graph);

    const svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", size.width + margin.left + margin.right)
        .attr("height", size.height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            `translate(${margin.left}, ${margin.top}) scale(0.7)`);

    // Define end marker.
    svg
        .append("defs")
        .append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    const link = svg
        .append("g")
        .attr("class", ".link")
        .selectAll(".link")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("stroke", "#aaa")
        .attr("marker-end", "url(#arrow)");


    // Initialize the nodes
    const node = svg
        .append("g")
        .attr("class", ".node")
        .selectAll(".node")
        .data(graph.nodes)


    const rect = node
        .enter()
        .append("rect")
        .attr("width", function (d) { return 170 })
        .attr("height", () => { return 16 })
        .style("fill", "#69b3a2")
        .attr('stroke', 'black')

    // Define text
    const text = node
        .enter()
        .append("text")
        .attr("y", 12)
        .attr("x", 5)
        .text((d) => { return d.id; })

    // const text = svg
    //     .append("g")
    //     .attr("class", "labels")
    //     .selectAll("g")
    //     .data(graph.nodes)
    //     .enter()
    //     .append("g");

    // text.append("text")
    //     .attr("x", 14)
    //     .attr("y", ".31em")
    //     .style("font-family", "sans-serif")
    //     .style("font-size", "0.7em")
    //     .text(function(d) {
    //         return d.id;
    //     });


    d3.forceSimulation(graph.nodes)
        .force("link", d3.forceLink()
            .id(function(d) { return d.id; })
            .links(graph.links)
        )
        .force("charge", d3
            .forceManyBody()
            .strength(-850)
        )
        .force("center", d3.forceCenter(size.width / 2, size.height / 2))
        .on("end", ticked);

    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x + 12; })
            .attr("y1", function(d) { return d.source.y + 6; })
            .attr("x2", function(d) { return d.target.x + 12; })
            .attr("y2", function(d) { return d.target.y + 6; });

        node
            .attr("x", (d) => { console.log(d); return d.x; })
            .attr("y", (d) => { return d.y; })

        rect
            .attr("x", (d) => { return d.x })
            .attr("y", (d) => { return d.y })
        text
            .attr("transform", (d) => {
                return "translate(" + d.x + "," + d.y + ")";
            });
    }
}

main()