function groupByFingerprintIDs(input, aggLookup) {
    const result = {};

   const nodes = {};
   const links = {};

   for (const i in input.events) {
       const blocker = input.events[i]["blockingTxnFingerprintId"];
       const waiter = input.events[i]["waitingTxnFingerprintId"];

       if (blocker === "0") {
           continue;
       }

       if (waiter === "0") {
           continue;
       }

       nodes[waiter] = {
           id:    waiter,
           aggTs: aggLookup[waiter],
       };
       nodes[blocker] = {
           id: blocker,
           aggTs: aggLookup[blocker],
       };

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

function main(data, aggLookup) {
    const graph = groupByFingerprintIDs(data, aggLookup);
    console.log(graph);

    const svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", size.width + margin.left + margin.right)
        .attr("height", size.height + margin.top + margin.bottom)
        .style("background-color", "#b8b8b8")
        .call(handleZoom())

    const vis = svg
        .append("g")
        .attr("class", ".root")

   vis
        .append("rect")
        .attr("width", size.width + margin.left + margin.right)
        .attr("height", size.height, + margin.top + margin.bottom)
        .attr("fill", "#b8b8b8")
        .attr("class", ".background")


    // Define end marker.
   vis
        .append("defs")
        .append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 16)
        .attr("markerHeight", 16)
        // .attr("orient", "auto")
        .attr("orient", "auto-start-reverse")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    // Define edges.
    const link = vis
        .append("g")
        .attr("class", ".link")
        .selectAll(".link")
        .data(graph.links)
        .enter()
        .append("path")
        .style("fill","none")
        .attr("stroke", "#276ac2")
        .attr("marker-end", "url(#arrow)");


    // Initialize the nodes
    const node = vis
        .append("g")
        .attr("class", ".node")
        .selectAll(".node")
        .data(graph.nodes)

    const cell = node
        .enter()
        .append("g")
        .attr("class", ".cell")
        .attr("id", (d) => { return d.id })
        .call(handleDrag())

    const rect = cell
        .append("a")
        .attr("xlink:href", (d) => {
            return `http://localhost:8080/#/transaction/${d.aggTs}/${d.id}`
        })
        .append("rect")
        .attr("width", function (d) { return 330 })
        .attr("height", () => { return 50 })
        .style("fill", "#69b3a2")
        .attr('stroke', 'black')
        .on("mouseover", function(d) {
            const s = d3.select(this);
            s.style("fill", "#eedd22");
        })
        .on("mouseout", function(d) {
            const s = d3.select(this);
            s.style("fill", "#69b3a2");
        })

    // Define text
    const text = cell
        .append("text")
        .attr("y", 28)
        .attr("x", 20)
        .style("pointer-events", "none")
        .text((d) => { return `TxnFingerprintID: ${d.id}` })


    const force = d3.forceSimulation(graph.nodes)
        .force("link", d3.forceLink()
            .id(function(d) { return d.id; })
            .distance(250)
            .links(graph.links)
        )
        .force("charge", d3
            .forceManyBody()
            .strength(-450)
        )
        .force("center", d3.forceCenter(size.width / 2, size.height / 2))
        .on("tick", ticked);

    function ticked() {
        // https://stackoverflow.com/questions/49491992/d3-self-linking-edges.
        link.attr("d", function(d) {
            let x1 = d.source.x,
                y1 = d.source.y,
                x2 = d.target.x + 150,
                y2 = d.target.y,
                dx = x2 - x1,
                dy = y2 - y1,
                dr = Math.sqrt(dx * dx + dy * dy),

                // Defaults for normal edge.
                drx = dr,
                dry = dr,
                xRotation = 0, // degrees
                largeArc = 0, // 1 or 0
                sweep = 1; // 1 or 0

            // Self edge.
            if (d.source.x === d.target.x && d.source.y === d.target.y) {
                // Fiddle with this angle to get loop oriented.
                xRotation = -45;

                // Needs to be 1.
                largeArc = 1;

                // Change sweep to change orientation of loop.
                sweep = 0;

                // Make drx and dry different to get an ellipse
                // instead of a circle.
                drx = 25;
                dry = 15;

                // Reposition the start and the end of the ellipse.
                x1 = d.source.x + 50;
                y1 = d.source.y;
                x2 = d.target.x;
                y2 = d.target.y + 5;
            }

            return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;
        });


        node
            .attr("transform", (d) => {
                return "translate(" + d.x + "," + d.y + ")";
            })

        cell
            .attr("transform", (d) => {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .attr("x", (d) => { return d.x })
            .attr("y", (d) => { return d.y })
    }

    function handleDrag() {
        const drag = d3.drag();

        function onStart(e, d) {
            // console.log("start", e, " d: ", d, "parent", d3.select(this.parentNode))
        }

        function onDrag(e, d) {
            d.x = e.x
            d.y = e.y
            const cell = d3
                .select(this)
                .attr("transform", `translate(${e.x}, ${e.y})`)
                .attr("x", (d) => { return e.x })
                .attr("y", (d) => { return e.y })

            ticked()
        }

        function onDrop(e, d) {
            // console.log("drop", e, " d: ", d);
        }

        drag
            .on("start", onStart)
            .on("drag", onDrag)
            .on("end", onDrop);

        return drag;
    }

    function handleZoom() {
        const zoom = d3.zoom();
        zoom
            .on("zoom", function (e) {
                vis.attr("transform", e.transform)
            })

        return zoom
    }

}

getContentionEvents((data, aggTsLookup) => {
    main(data, aggTsLookup)
})
