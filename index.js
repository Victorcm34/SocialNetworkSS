'use strict'

var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/SocialnetworkDB', {useNewUrlParser: true})
        .then(() => {
            console.log("La conexión a la base de datos SocialnetworkDB se ha realizado correctamente");
        })
        .catch(err => console.log(err))
