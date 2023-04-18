/// <reference types="cypress"/>

import contrato from '../contracts/produtos.contract';

describe('Testes da Funcionalidade Produtos', () => {
  let token;
  before(() => {
    cy.token('lariqa@ebac.com.br', 'teste').then(tkn => {
      token = tkn;
    });
  });

  it('Deve validar contratos de produtos', () => {
    cy.request('produtos').then(response => {
      return contrato.validateAsync(response.body);
    });
  });

  it('Listar Produtos', () => {
    cy.request({
      method: 'GET',
      url: 'produtos',
    }).then(response => {
      expect(response.body.produtos[5].nome).to.equal('Produto Ebac 10000000');
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('produtos');
      expect(response.duration).to.be.lessThan(15);
    });
  });

  it('Cadastrar produtos', () => {
    let produto = `Produto Ebac ${Math.floor(Math.random() * 100000)}`;
    cy.request({
      method: 'POST',
      url: 'produtos',
      body: {
        nome: produto,
        preco: 200,
        descricao: 'Objeto novo',
        quantidade: 400,
      },
      headers: {
        authorization: token,
      },
    }).then(response => {
      expect(response.status).to.equal(201);
      expect(response.body.message).to.equal('Cadastro realizado com sucesso');
    });
  });
  it('Deve validar mensagem de erro ao cadastrar produto repetido', () => {
    cy.cadastrarProduto(
      token,
      'Produto Ebac Novo',
      250,
      'Descrição do Produto Novo',
      1
    ).then(response => {
      expect(response.status).to.equal(400);
      expect(response.body.message).to.equal('Já existe produto com esse nome');
    });
  });
  it('Deve editar um produto já cadastrado', () => {
    cy.request('produtos').then(response => {
      let id = response.body.produtos[0]._id;
      let produto = `Produto Ebac ${Math.floor(Math.random() * 100000)}`;
      cy.request({
        method: 'PUT',
        url: `produtos/${id}`,
        headers: { authorization: token },
        body: {
          nome: produto,
          preco: 100,
          descricao: 'Novo Produto Editado',
          quantidade: 100,
        },
      }).then(response => {
        expect(response.body.message).to.equal('Registro alterado com sucesso');
      });
    });
  });
  it('Deve editar um produto cadastrado previamente', () => {
    let produto = `Produto Ebac ${Math.floor(Math.random() * 100000)}`;
    cy.cadastrarProduto(
      token,
      produto,
      250,
      'Descrição do Produto Novo',
      180
    ).then(response => {
      let id = response.body._id;
      cy.request({
        method: 'PUT',
        url: `produtos/${id}`,
        headers: { authorization: token },
        body: {
          nome: produto,
          preco: 200,
          descricao: 'Novo Produto Editado',
          quantidade: 300,
        },
      }).then(response => {
        expect(response.body.message).to.equal('Registro alterado com sucesso');
      });
    });
  });
  it('Deve deletar um produto previamente cadastrado', () => {
    let produto = `Produto Ebac ${Math.floor(Math.random() * 100000)}`;
    cy.cadastrarProduto(
      token,
      produto,
      250,
      'Descrição do Produto Novo',
      180
    ).then(response => {
      let id = response.body._id;
      cy.request({
        method: 'DELETE',
        url: `produtos/${id}`,
        headers: { authorization: token },
      }).then(response => {
        expect(response.body.message).to.equal('Registro excluído com sucesso');
        expect(response.status).to.equal(200);
      });
    });
  });
});
