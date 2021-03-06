"use strict";

const Mongoose = require("mongoose");
const Associado = Mongoose.model("Associado");
const TokenUtil = require("../utils/TokenUtil");

module.exports = class ServicoAssociados {
  static async listarTodos(query) {
    try {
      const pageOptions = {
        start: parseInt(query.start, 0) || 0,
        perPage: parseInt(query.perPage, 10) || 10,
      };

      const data = await Associado
        .find({
          ...query.filter,
          ativo: true,
        })
        .skip(pageOptions.start)
        .limit(pageOptions.perPage);

      const total = await Associado
        .find({ ativo: true })
        .countDocuments();

      return { data, total };
    } catch (error) {
      throw new Error("Falha ao processar requisição: " + error);
    }
  } // listarTodos()

  static async buscarPendentes() {
    try {
      const data = await Associado
        .find({ ativo: false })
        .sort({ data_cadastro: 'asc' })
        .skip(0)
        .limit(10);

      return { data };
    } catch (error) {
      throw new Error("Falha ao processar requisição: " + error);
    }
  } // buscarPendentes()

  static async criarAssociado(data) {
    try {
      return await Associado.create(data);
    } catch (error) {
      throw new Error(error.message);
    }
  } // criarAssociado()

  static async login(data) {
    try {
      let associado = await Associado.findOne({ email: data.email });

      if (!associado) throw { message: "E-mail não encontrado!" };

      if (associado.senha !== data.senha) throw { message: "Senha inválida!" };

      let token = await TokenUtil.genereteToken({
        nome: associado.nome,
        email: associado.email,
        _id: associado._id,
        perfil: associado.perfil,
      });
      return await this.formatarAssociado(associado, token);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async atualizarAssociado(data) {
    try {
      const finded = await Associado.find({
        $or: [{ email: data.email }, { cpf: data.cpf }],
      })
        .where("_id")
        .ne(data._id);

      if (finded.length > 0) {
        throw new Error("Este email ou CPF já estão cadastrados");
      }

      await Associado.findByIdAndUpdate(data._id, data);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async excluirAssociado(data) {
    try {
      await Associado.findOneAndDelete({ _id: data._id });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async buscarPorId(data) {
    try {
      const associado = await Associado.findById(data._id);
      return associado;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async formatarAssociado(associado, token) {
    return {
      id: associado.id,
      _id: associado._id,
      imagem: associado.imagem,
      email: associado.email,
      nome: associado.nome,
      perfil: associado.perfil,
      token: token,
    };
  }
}; // class
