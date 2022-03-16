const endpoint = "/api/_status/transactioncontentionevents"

function getContentionEvents(main) {
    fetch(endpoint, {mode: 'cors'})
        .then((resp) => {
            resp.json()
                .then((data) => {
                    main(data)
                })
        })
        .catch((e) => {
            alert(e)
        })
}