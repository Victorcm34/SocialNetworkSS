'use strict'

var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');

//Metodos de prueba
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

//Registro de usuarios
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

//Login de usuarios
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

//Conseguir datos de un usuario
function getUser(req, res) {
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!user) return res.status(404).send({message: 'El usuario no existe'});

        return res.status(200).send({user});
    });
}

//Devolver un listado de usuarios paginado
function getUsers(req, res) {
    var identity_user_id = req.user.sub;
    var page = 1;

    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 5;

    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!users) return res.status(404).send({message: 'No hay usuarios disponibles'});

        return res.status(200).send({
            users,
            total,
            pages: Math.ceil(total/itemsPerPage)
        });
    });
}

//Editar datos usuarios
function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    //borrar propiedad password
    delete update.password;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos de este usuario'});
    }

    User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});

        return res.status(200).send({user: userUpdated});
    });
}

//Subir archivos de imagen/avatar de usuario
function uploadImage(req, res) {
    var userId = req.params.id;

    if(req.files) {
        var file_path = req.files.image.path;
        console.log(file_path);
        var file_split = file_path.split('\\');
        console.log(file_split);
        var file_name = file_split[2];
        console.log(file_name);
        var ext_split = file_name.split('\.');
        console.log(ext_split);
        var file_ext = ext_split[1];
        console.log(file_ext);

        if(userId != req.user.sub){
            removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar los datos de este usuario');            
        }

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            //Actualizar imagen de usuario logueado
        }else{
            removeFilesOfUploads(res, file_path, 'Extensión no válida');
        }

    }else {
        return res.status(200).send({message: 'No se han subido archivos de imagen'});
    }
}

function removeFilesOfUploads(res, file_path, message){
    fs.unlink(file_path, (err) => {
        return res.status(200).send({message: message});
    });
}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadImage
}