/// <reference types="cypress" />

import contrato from '../contracts/usuarios.contract';

describe('Testes da Funcionalidade Usuários', () => {
  let token;
  before(() => {
    cy.token('lariqa@ebac.com.br', 'teste').then(tkn => {
      token = tkn;
    });
  });

  it('Deve validar contrato de usuários', () => {
    cy.request('usuarios').then(response => {
      return contrato.validateAsync(response.body);
    });
  });

  it('Deve listar usuários cadastrados', () => {
    cy.request({
      method: 'GET',
      url: 'usuarios',
    }).then(response => {
      expect(response.body.usuarios[0].nome).to.equal('Aluno Editado 3');
      expect(response.body.usuarios[0].email).to.equal(
        'qualityassurance1@teste.com'
      );
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('usuarios');
      expect(response.duration).to.be.lessThan(15);
    });
  });

  it('Deve cadastrar um usuário com sucesso', () => {
    let usuario = `Aluno Quality Assurance ${Math.floor(Math.random() * 1000)}`;
    let email =
      `qualityassurance${Math.floor(Math.random() * 1000)}` + `@teste.com`;
    cy.request({
      method: 'POST',
      url: 'usuarios',
      body: {
        nome: usuario,
        email: email,
        password: 'teste',
        administrador: 'true',
      },
      headers: {
        authorization: token,
      },
    }).then(response => {
      expect(response.status).to.equal(201);
      expect(response.body.message).to.equal('Cadastro realizado com sucesso');
    });
  });

  it('Deve validar um usuário com email inválido', () => {
    let usuario = `Aluno Quality Assurance ${Math.floor(Math.random() * 10)}`;
    cy.cadastrarUsuario(token, usuario, 'teste@teste', 'teste123', 'true').then(
      response => {
        expect(response.status).to.equal(400);
        expect(response.body.email).to.equal('email deve ser um email válido');
      }
    );
  });

  it('Deve editar um usuário previamente cadastrado', () => {
    let usuario = `Aluno Quality Assurance ${Math.floor(
      Math.random() * 100000
    )}`;
    let usuario2 = `Aluno Quality Editado ${Math.floor(
      Math.random() * 1000000
    )}`;
    let email =
      `qualityassurance${Math.floor(Math.random() * 10000)}` + `@teste.com`;
    cy.cadastrarUsuario(token, usuario, email, 'teste123', 'true').then(
      response => {
        let id = response.body._id;
        cy.request({
          method: 'PUT',
          url: `usuarios/${id}`,
          headers: { authorization: token },
          body: {
            nome: usuario2,
            email: email,
            password: 'teste05',
            administrador: 'true',
          },
        }).then(response => {
          expect(response.body.message).to.equal(
            'Registro alterado com sucesso'
          );
        });
      }
    );
  });

  it('Deve deletar um usuário previamente cadastrado', () => {
    let usuario = `Aluno Quality Assurance ${Math.floor(
      Math.random() * 100000
    )}`;
    let email =
      `qualityassurance${Math.floor(Math.random() * 100000)}` + `@teste.com`;
    cy.cadastrarUsuario(token, usuario, email, 'teste123', 'true').then(
      response => {
        let id = response.body._id;
        cy.request({
          method: 'DELETE',
          url: `usuarios/${id}`,
          headers: { authorization: token },
        }).then(response => {
          expect(response.body.message).to.equal(
            'Registro excluído com sucesso'
          );
          expect(response.status).to.equal(200);
        });
      }
    );
  });
});
