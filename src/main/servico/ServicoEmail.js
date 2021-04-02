"use strict";

const nodemailer = require('nodemailer');
const TokenUtil = require("../utils/TokenUtil");
const ServicoConfiguracoes = require("../servico/ServicoConfiguracoes");


module.exports = class ServicoEmail {
    
    static async enviar(assunto, mensagem) {
        let email =  (await ServicoConfiguracoes.obterDados()).email
        let mailOptions = {
            from: email.usuario,
            to: email.destinatario,
            subject: assunto,
            html: mensagem
        };

        let transporter = nodemailer.createTransport({
            nome: email.usuario,
            host: email.host,
            port: email.porta,
            secure: email.seguranca,
            auth: {
                user: email.usuario,
                pass: email.senha
            },
            tls: { rejectUnauthorized: email.tls }
        });
        return await transporter.sendMail(mailOptions)
    } // enviar

    static async notificarContato(dados) {
        try {
            await this.notificarAdministrador(dados, "CONTATO")
            await this.notificarAssociado(dados, "CONTATO")
            return "E-mail enviado com sucesso!"
        } catch (error) {
            throw new Error("ServicoEmail.notificarContato: " + error);
        }
    } // enviar()

    static notificacaoRegistro(dados) {
        try {
            this.notificarAdministrador(dados, "REGISTRO")
            this.notificarAssociado(dados, "REGISTRO")
            return
        } catch (error) {
            throw new Error("ServicoEmail.notificacaoRegistro: " + error);
        }
    } // notificacaoRegistro()

    static notificacaoRecuperacao(dados) {
        try {
            this.notificarAssociado(dados, "RECUPERACAO")
            return
        } catch (error) {
            throw new Error("ServicoEmail.notificacaoRecuperacao: " + error);
        }
    } // notificacaoRecuperacao()

    static async notificarAdministrador(dados, tipo){
        let assunto = "";
        let mensagem = "";
        switch(tipo){
            case 'REGISTRO':
                assunto = '[SITE] Novo Cadastro - ' + dados.nome;
                mensagem = this.adminRegistroMensagem(dados);
            break;
            case 'CONTATO':
                assunto = "[SITE] E-mail de contato - " + dados.nome;
                mensagem = this.adminContatoMensagem(dados);
            break;
        }
        try {
            return this.enviar(assunto, mensagem)
        } catch (error) {
            throw new Error("ServicoEmail.notificarAdministrador: " + error);
        }
    } //notificarAdministrador

    static async notificarAssociado(dados, tipo) {
        const associacao =  ( await ServicoConfiguracoes.obterDados()).associacao
        let assunto = "";
        let mensagem = "";
        switch(tipo){
            case 'REGISTRO':
                assunto = `[${associacao.toUpperCase()}] Confirmação de registro`;
                mensagem = this.associadoRegistroMensagem(dados, associacao);
            break;
            case 'CONTATO':
                assunto = `[${associacao.toUpperCase()}] Confirmação de Recebimento`
                mensagem = this.associadoContatoMensagem(dados, associacao);
            break;
            case 'RECUPERACAO':
                assunto = `[${associacao.toUpperCase()}] Recuperação de senha`
                mensagem = this.associadoRecuperacaoMensagem(dados, associacao);
            break;
        }
        try {
            return this.enviar(assunto, mensagem)
        } catch (error) {
            throw new Error("ServicoEmail.notificarAssociado: " + error);
        }
    } // notificarAssociado

    static associadoContatoMensagem(dados, associacao){
        return `<p>Olá <strong> ${dados.nome}</strong>. </p>
        <p>Agradeçemos sua visita e a oportunidade de recebermos o seu contato. </p>
        <p>Em até 48 horas você receberá no e-mail fornecido a resposta para sua questão. </p>
        <p>Atenciosamente,</p>
        <p>${associacao}</p>
        <p>Observação - Não é necessário responder esta mensagem.</p>`
    } //associadoContatoMensagem

    static associadoRecuperacaoMensagem(dados, associacao){
        return `h2>Solicitação de recuperação de senha</h2>
        <p>Senha: ${dados.temp_password}</p>
        <p>Se vcê não fez essa solicitação, basta ignorar este e-mail.</p>
        <p>Observação - Não é necessário responder esta mensagem.</p>
        <p>${associacao}</p>`;
    } //associadoRecuperacaooMensagem

    static associadoRegistroMensagem(dados, associado, api) {
        let token = TokenUtil.genereteToken({ nome: dados.nome, email: dados.email, id_user: dados._id, role: dados.role });

        return `<p>Olá <strong> ${dados.nome}</strong>.</p>
        <p>Você acabou de realizar seu registro na ${associado} usando esta conta de e-mail.</p>
        <a href='${api}/emailconfirm/${token}' target='_blank'>Clique aqui para confirmar seu e-mail</a> <br />
        <p>Atenciosamente,</p>
        <p>${associado}</p>
        <p>Observação - Não é necessário responder esta mensagem.</p>`
    } //associadoRegistroMensagem

    static adminContatoMensagem(dados){
        return `<h3>De:</h3> 
        <p>${dados.nome} - ${dados.email}</p>
        <h3>Mensagem</h3>
        <p>${dados.mensagem}</p>`;
    } //adminContactMessage

    static adminRegistroMensagem(dados){
        return `<p>Um novo cadastro foi realizado no site. </p>
        <p><strong>Nome:</strong> ${dados.nome}</p>
        <p><strong>Sobrenome:</strong> ${dados.sobrenome}</p>
        <p><strong>E-mail:</strong> ${dados.email}</p>
        <p><strong>Telefone:</strong> ${dados.telefone}</p>`;
    } //adminContactMessage
} // class
