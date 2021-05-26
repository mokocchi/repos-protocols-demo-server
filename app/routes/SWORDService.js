var express = require('express');
const elastic = require('elasticsearch');
var router = express.Router()
const apiPrefix = process.env.API_PREFIX;

const elasticClient = elastic.Client({
    host: 'elastic-poc.elasticsearch:9200',
});

router.post(apiPrefix + "/public/entries", (req, res) => {
    //en un caso real sanitizaría mejor las respuestas
    const { code, responses } = req.body;
    if (code && responses) {
        elasticClient.index({
            index: 'respuestas',
            body: {
                code,
                responses
            }
        })
            .then(resp => {
                return res.status(200).json({
                    status: "OK"
                });
            })
            .catch(err => {
                return res.status(500).json({
                    error_code: 002,
                    error: "error interno del servidor"
                });
            })
    } else {
        res.json({
            error_code: 001,
            error: "mal formato de respuesta"
        })
    }
})

router.get(apiPrefix + "/collect-point/:coord-o-zona", (req, res) => {
    //en un caso real debería buscar el más cercano o el de la zona indicada
    res.json({
        collectPoint: process.env.COLLECT_POINT
    })
})

module.exports = router