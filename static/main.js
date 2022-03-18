function createGraphs(input, aggLookup, queryLookup) {
    var graphs = new Array();
    var [directedGraph, wcc] = populateDAG(input);

    for (var i = 0; i < wcc.length; i++) {
        txnIds = wcc[i];
        graphs.push(createConnectedComponent(txnIds, directedGraph, queryLookup));
    }

    return graphs;
}

// createConnectedComponent takes in a list of connected txn IDs and the 
// directed graph and returns a new dagreD3 graph made up of the connected 
// components.
const createConnectedComponent = (txnIds, dag, queryLookup) => {
    g = new dagreD3.graphlib.Graph()
        .setGraph({})
        .setDefaultEdgeLabel(function () { return {}; });

    for (var i = 0; i < txnIds.length; i++) {
        var txnId = txnIds[i];
        g.setNode(txnId, { label: "TxnFingerprintId: " + txnId + "\nSQL: " + queryLookup[txnId] });
    }

    for (var i = 0; i < txnIds.length; i++) {
        var txnId = txnIds[i];
        var blocking = dag.getBlocking(txnId);
        blocking.forEach(blockingTxn => {
            g.setEdge(txnId, blockingTxn.txnId);
        });
    }

    return g;
}

const main = (data, aggTsLookup, queryLookup) => {
    var graphs = createGraphs(data, aggTsLookup, queryLookup);

    for (var i = 0; i < graphs.length; i++) {
        var graph = graphs[i];
        var svgId = "DIAGRAM" + i;

        const svgCode = `<svg>
        <g id=${svgId} transform="translate(20,100)" />
        </svg>`;
        document.getElementById('graphs').innerHTML += svgCode + '\n';

        var renderer = new dagreD3.render();
        var svg = d3.select("svg g#" + svgId)
        renderer(svg, graph);

        var nodes = svg.selectAll("g.node")
        nodes.each(function(v) {
            
        })
    }

    var svgs = document.getElementsByTagName("svg");
    for (var i = 0; i < svgs.length; i++) {
        var svg = svgs[i];
        var bbox = svg.getBBox();
        svg.setAttribute("width", (bbox.width + 20) + "px");
        svg.setAttribute("height", (bbox.height + 50) + "px");
        svg.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
    }
}

getContentionEvents((data, aggTsLookup, queryLookup) => {
    main(data, aggTsLookup, queryLookup)
})
