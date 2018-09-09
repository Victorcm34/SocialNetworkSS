'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

//Connect DB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/SocialnetworkDB', {useNewUrlParser: true})
        .then(() => {
            console.log("La conexión a la base de datos SocialnetworkDB se ha realizado correctamente");

            //Create server
            app.listen(port, () => {
                console.log("Servidor creado corriendo en http://localhost:3800");
            });
        })
        .catch(err => console.log(err));
