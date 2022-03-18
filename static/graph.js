class Transaction {
    constructor(txnId) {
        this.txnId = txnId;
        this.sql = "SELECT * FROM;";
        this.blocking = new Set();
    }

    addBlocking(txn) {
        this.blocking.add(txn);
    }
}

class Graph {
    constructor(type) {
        this.txns = new Map();
        this.type = type;
        this.visited = new Map();
    }

    getSQL(txnId) {
        return this.txns[txnId].sql;
    }

    getBlocking(txnId) {
        var txn = this.txns.get(txnId);
        return txn.blocking;
    }

    addVertex(txnId) {
        if (this.type == "undirected") {
            this.visited.set(txnId, false);
        }
        if (this.txns.has(txnId)) {
            return this.txns.get(txnId);
        }
        const txn = new Transaction(txnId);
        this.txns.set(txnId, txn);
        return txn;
    }

    addEdge(src, dst) {
        const blocking = this.addVertex(src);
        const waiting = this.addVertex(dst);

        waiting.addBlocking(blocking);
        if (this.type == "undirected") {
            blocking.addBlocking(waiting);
        }

        return [waiting, blocking];
    }

    getJSON() {
        let data = [];
        for (const [waitingTxnId, txn] of this.txns.entries()) {
            let entry = { "id": waitingTxnId, "parentIds": [] };
            txn.blocking.forEach(blockingTxn => entry["parentIds"].push(
                blockingTxn.txnId
            ));
            data.push(entry);
        }

        return data;
    }

    getJSONString() {
        return JSON.stringify(this.getJSON(), null, '\t');
    }

    size() {
        return this.txns.size;
    }

    DFS(txnId) {
        var component = new Array();
        component.push(txnId);
        this.visited.set(txnId, true);

        var blockingTxns = this.txns.get(txnId).blocking;
        blockingTxns.forEach(txn => {
            if (!this.visited.get(txn.txnId)) {
                component = component.concat(this.DFS(txn.txnId));
            }
        });

        return component;
    }

    getWeaklyConnectedComponents() {
        if (this.type != "undirected") {
            return null;
        }

        var components = new Array();
        for (const [txnId, txn] of this.txns.entries()) {
            if (!this.visited.get(txnId)) {
                var component = this.DFS(txnId);
                components.push(component);
            }
        }

        return components;
    }
}

const populateDAG = (data) => {
    let directedGraph = new Graph("directed");
    let undirectedGraph = new Graph("undirected");

    for (let i in Object(data.events)) {
        let waitingFingerprintID = data.events[i]["waitingTxnFingerprintId"];
        let blockingFingerprintID = data.events[i]["blockingTxnFingerprintId"];
        let waitingID = data.events[i]["waitingTxnId"];
        let blockingID = data.events[i]["blockingEvent"]["txnMeta"]["id"];

        if (waitingFingerprintID !== "0" || blockingFingerprintID !== "0") {
            continue;
        }

        directedGraph.addEdge(waitingID, blockingID);
        undirectedGraph.addEdge(waitingID, blockingID);

    }

    wcc = undirectedGraph.getWeaklyConnectedComponents();

    return [directedGraph, wcc];
}