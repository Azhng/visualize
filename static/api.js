const contentionEventAPI = "/api/_status/transactioncontentionevents"
const translationAPI = "/getAggTs"
const statementAPI = "api/_status/statements"

async function getStatements() {
    const resp = await fetch(statementAPI, { mode: 'cors' });
    const data = await resp.json();
    var queryLookup = {};
    var txns = data["transactions"];
    var stmts = data["statements"];

    txns.forEach(txn => {
        var queries = [];
        var txnFingerprintId = txn["statsData"]["transactionFingerprintId"];
        var stmtFingerprintIds = txn["statsData"]["statementFingerprintIds"];

        stmtFingerprintIds.forEach(stmtFingerprintId => {
            var query = getStatementSQLFromStmtFingerprintId(stmts, stmtFingerprintId)
            queries.push(query);
        })

        queryLookup[txnFingerprintId] = queries;
    })

    return queryLookup;
}

function getStatementSQLFromStmtFingerprintId(stmts, stmtFingerprintId) {
    for (var i = 0; i < stmts.length; i++) {
        var stmt = stmts[i];

        if (stmt["id"] === stmtFingerprintId) {
            return stmt["key"]["keyData"]["query"];
        }
    }
}

async function getContentionEvents(main) {
    try {
        const resp = await fetch(contentionEventAPI, { mode: 'cors' })
        const data = await resp.json()
        const lookupTable = await getAggTsForTxnFingerprintIDs(data)
        const queryLookup = await getStatements();
        main(data, lookupTable, queryLookup)
    } catch (e) {
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
    } catch (e) {
        alert(e)
    }
}