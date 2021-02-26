"use strict";
const AccessControl = require("../middlewares/AccessControl");

const AssociateController = require("../controllers/AssociateController");
const access = new AccessControl('Associado')
const accessDiretoria = new AccessControl('Diretoria')

module.exports = class AssociateRoute {
    constructor(app) {
        app.route("/associados")
            .get(AssociateController.getList)
            .post(AssociateController.create)
        
        app.route("/associados/:id")
            .get(AssociateController.getOne)
            .put(AssociateController.update)
            .delete(AssociateController.delete);

        app.get("/associados/actives", AssociateController.findAllActives);
    } // constructor()

} // class