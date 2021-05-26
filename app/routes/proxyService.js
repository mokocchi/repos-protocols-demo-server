var express = require('express');
const http = require('http');
const axios = require('axios');
const bodyParser = require('body-parser');
var router = express.Router();

const errorResponse = (error, res) => {
    console.log(error.message)
    res.status(503).send({
        status: 503,
        user_message: "Servicio no disponible",
        error_code: 1,
    })
}

const OAIclient = axios.create({
    baseURL: process.env.OAI_HOST,
    httpAgent: new http.Agent({ keepAlive: true })
})

const restoreOAIQuery = q => {
    let query = "";
    Object.keys(q)
        .filter(x => ["verb", "metadataPrefix", "from", "until", "identifier", "set", "resumptionToken"].includes(x))
        .forEach(x => {
            query = query + (q[x] ? `${x}=${q[x]}&` : "");
        })
    if (query[query.length - 1] === "&") {
        return query.slice(0, query.length - 1);
    } else {
        return query;
    }
}

router.get("/oai/:context", (req, res) => {
    OAIclient.get(`oai/${req.params.context}?${restoreOAIQuery(req.query)}`).then(resp => {
        res.status(resp.status).send(resp.data)
    }).catch(error => {
        if (error.response) {
            res.status(error.response.status).send(error.response.data)
        } else {
            errorResponse(error, res)
        }
    })
})

const OSclient = axios.create({
    baseURL: process.env.OS_HOST,
    httpAgent: new http.Agent({ keepAlive: true })
})

const restoreOSQuery = q => {
    let query = "";
    Object.keys(q)
        .filter(x => ["format", "scope", "query", "rpp"].includes(x))
        .forEach(x => {
            query = query + (q[x] ? `${x}=${q[x]}&` : "");
        })
    if (query[query.length - 1] === "&") {
        return query.slice(0, query.length - 1);
    } else {
        return query;
    }
}

router.get("/open-search/discover", (req, res) => {
    OSclient.get(`/open-search/discover?${restoreOSQuery(req.query)}`).then(resp => {
        res.status(resp.status).send(resp.data)
    }).catch(error => {
        if (error.response) {
            res.status(error.response.status).send(error.response.data)
        } else {
            errorResponse(error, res)
        }
    })
})

const SRUclient = axios.create({
    baseURL: process.env.SRU_HOST,
    httpAgent: new http.Agent({ keepAlive: true })
})

const restoreSRUQuery = q => {
    let query = "";
    Object.keys(q)
        .filter(x => ["operation", "query", "scanClause", "maximumRecords", "recordSchema"].includes(x))
        .forEach(x => {
            query = query + (q[x] ? `${x}=${q[x]}&` : "");
        })
    if (query[query.length - 1] === "&") {
        return query.slice(0, query.length - 1);
    } else {
        return query;
    }
}

router.get("/sru", (req, res) => {
    SRUclient.get(`bib?${restoreSRUQuery(req.query)}`).then(resp => {
        res.status(resp.status).send(resp.data)
    }).catch(error => {
        if (error.response) {
            res.status(error.response.status).send(error.response.data)
        } else {
            errorResponse(error, res)
        }
    })
})

const SWORDClient = axios.create({
    baseURL: process.env.SWORD_HOST
})

router.get("/swordv2/servicedocument", (req, res) => {
    SWORDClient.get(`/swordv2/servicedocument`, {
        headers: {
            'Authorization': req.headers.authorization
        }
    }).then(resp => {
        res.status(resp.status).send(resp.data)
    }).catch(error => {
        if (error.response) {
            res.status(error.response.status).send(error.response.data)
        } else {
            errorResponse(error, res)
        }
    })
})

const restoreRestQuery = q => {
    let query = "";
    Object.keys(q)
        .filter(x => ["expand"].includes(x))
        .forEach(x => {
            query = query + (q[x] ? `${x}=${q[x]}&` : "");
        })
    if (query[query.length - 1] === "&") {
        return query.slice(0, query.length - 1);
    } else {
        return query;
    }
}

router.get("/rest/handle/:han/:dle", (req, res) => {
    SWORDClient.get(`/rest/handle/${req.params.han}/${req.params.dle}?${restoreRestQuery(req.query)}`, {
        headers: {
            "Accept": "application/xml"
        }
    }).then(resp => {
        res.status(resp.status).send(resp.data)
    }).catch(error => {
        if (error.response) {
            res.status(error.response.status).send(error.response.data)
        } else {
            errorResponse(error, res)
        }
    })
})

router.post("/swordv2/collection/:han/:dle", bodyParser.text({ type: 'application/atom+xml' }), async (req, res) => {
    SWORDClient.post(`/swordv2/collection/${req.params.han}/${req.params.dle}`,
        req.body,
        {
            headers: req.headers //TODO: pasar solo 2 headers obligatorios
        }).then(resp => {
            res.status(resp.status).send(resp.data)
        }).catch(error => {
            if (error.response) {
                res.status(error.response.status).send(error.response.data)
            } else {
                errorResponse(error, res)
            }
        })
})

router.post("/swordv2/edit/:iri", async (req, res) => {
    const iri = req.params.iri;
    SWORDClient({
        method: 'post',
        url: `/swordv2/edit/${iri}`,
        headers: req.headers
    }).then(resp => {
        res.status(resp.status).send(resp.data)
    }).catch(error => {
        if (error.response) {
            res.status(error.response.status).send(error.response.data)
        } else {
            errorResponse(error, res)
        }
    })
})

module.exports = router