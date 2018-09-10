'use strict'

var User = require('../models/user');

function home(req, res) {
    res.status(200).send({
        message: 'Hola Mundo desde el servidor de NodeJs'
    });
};

function pruebas(req, res) {
    res.status(200).send({
        message: 'Acción de pruebas en el servidor de NodeJs'
    });
};

module.exports = {
    home,
    pruebas
}