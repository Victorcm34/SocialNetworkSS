'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//cargar rutas

//middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//cors

//routes

app.get('/', (req, res) => {
    res.status(200).send({
        message: 'Hola Mundo desde el servidor de NodeJs'
    });
});

app.get('/pruebas', (req, res) => {
    res.status(200).send({
        message: 'Acción de pruebas en el servidor de NodeJs'
    });
});

//export
module.exports = app;