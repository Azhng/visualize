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

class DAG {
    constructor() {
        this.txns = new Map();
    }

    addVertex(txnId) {
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
}

const populateDAG = () => {
    let graph = new DAG();

    for (let i in Object(data.events)) {
        waitingID = data.events[i]["waitingTxnFingerprintId"];
        blockingID = data.events[i]["blockingTxnFingerprintId"];

        graph.addEdge(waitingID, blockingID);
        console.log("blocking:", blockingID, "waiting:", waitingID);
    }

    return graph;
}