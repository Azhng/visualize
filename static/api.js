const contentionEventAPI = "/api/_status/transactioncontentionevents"
const translationAPI = "/getAggTs"

async function getContentionEvents(main) {
    try {
        const resp = await fetch(contentionEventAPI, {mode: 'cors'})
        const data = await resp.json()
        const lookupTable = await getAggTsForTxnFingerprintIDs(data)
        main(data, lookupTable)
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