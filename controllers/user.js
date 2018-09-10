'use strict'

var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

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

function saveUser(req, res){
    var params = req.body;
    var user = new User();

    if(params.name && params.surname && 
        params.nick && params.email && params.password) {

            user.name = params.name;
            user.surname = params.surname;
            user.nick = params.nick;
            user.email = params.email;
            user.role = 'ROLE_USER';
            user.image = null;

            // Control de usuarios duplicados
            User.find({ $or: [
                        {email: user.email.toLowerCase()},
                        {nick: user.nick.toLowerCase()}
            ]}).exec((err, users) => {
                if(err) return res.status(500).send({message: 'Error en la peticion de usuarios'});

                if(users && users.length >=1){
                    return res.status(200).send({message: 'El usuario que intentas registrar ya existe'});
                }else{
                // Cifrado y guardado de pass                
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;

                        user.save((err, userStored) => {
                            if(err) return res.status(500).send({message: 'Error al guardar el usuario'});

                                if(userStored){
                                    res.status(200).send({user: userStored});
                                }else{
                                    res.status(404).send({message: 'No se ha registrado el usuario'});
                                }
                        });
                    });
                }
                });
        
    }else {
        res.status(200).send({
            message: 'Envía todos los campos necesarios'
        });
    }
}

function loginUser(req,res){
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({email: email}, (err,user) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(user){
            bcrypt.compare(password, user.password, (err,check) => {
                if(check){
                    //Devolver datos de usuario
                    if(params.gettoken){
                        //delvolver token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }else{
                        user.password = undefined;
                        return res.status(200).send({user});
                    }                    
                }else{
                    return res.status(404).send({message: 'El usuario no se ha podido identificar'});
                }
            })
        }else{
            return res.status(404).send({message: 'El usuario no existe'});
        }
    });
}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser
}