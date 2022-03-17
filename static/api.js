const contentionEventAPI = "/api/_status/transactioncontentionevents"
const translationAPI = "/getAggTs"
const statementAPI = "api/_status/statements"

async function getStatements() {
    const resp = await fetch(statementAPI, {mode: 'cors'});
    const data = await resp.json();

    var stmtLookup = {};
    var txns = data["transactions"];

    txns.forEach(txn => {
        var stmts = [];
        var txnFingerprintId = txn["statsData"]["transactionFingerprintId"];
        var stmtFingerprintIds = txn["statsData"]["statementFingerprintIds"];

        stmtFingerprintIds.forEach(stmtFingerprintId => {
            var query = getStatementSQLFromStmtFingerprintId(data, stmtFingerprintId)
            stmts.push(query);
        })
        
        stmtLookup[txnFingerprintId] = stmts;
    })

    return stmtLookup;
}

function getStatementSQLFromStmtFingerprintId(data, stmtFingerprintId) {
    var stmts = data["statements"];
    for (var i = 0; i < stmts.length; i++) {
        var stmt = stmts[i];
        
        if (stmt["id"] === stmtFingerprintId) {
            return stmt["key"]["keyData"]["query"];
        }
    }
}

async function getContentionEvents(main) {
    try {
        const resp = await fetch(contentionEventAPI, {mode: 'cors'})
        const data = await resp.json()
        const lookupTable = await getAggTsForTxnFingerprintIDs(data)
        const stmtLookup = await getStatements();
        main(data, lookupTable, stmtLookup)
    } catch(e) {
        alert(e);  
    }
}

async function getAggTsForTxnFingerprintIDs(contentionEventPayload) {
    const txnFingerprintIDs = [... new Set(contentionEventPayload
        .events
        .flatMap((e) => {
            return [e.blockingTxnFingerprintId, e.waitingTxnFingerprintId]
        })
        .filter((v) => { return v !== "0" }))];

    try {
        const resp = await fetch(translationAPI, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            body: JSON.stringify(txnFingerprintIDs),
        })
        const mapping = await resp.json()
        const lookupTable = {}
        mapping.data.forEach((m) => {
            lookupTable[m[0]] = m[1]
        })
        return lookupTable
    } catch(e) {
        alert(e)
    }
}