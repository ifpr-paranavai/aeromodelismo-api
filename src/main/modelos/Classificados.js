"use strict";

const Mongoose = require("mongoose");


module.exports = class Classificados extends Mongoose.Schema {

    constructor() {

        super({

            imagem:{
                src: String,
                alt: String,
            },
            nome: String,
            descricao: String,
            preco: Number,
            contato: String,  
        });
        Mongoose.model("Classificado", this);
    } // constructor()
} // class