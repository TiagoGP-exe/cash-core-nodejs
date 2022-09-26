const pg = require("pg");

const config = {
  user: "postgres", //this is the db user credential
  database: "cashcore",
  password: "postgres",
  port: 5432,
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000,
};

const pool = new pg.Pool(config);

pool.on("connect", () => {
  console.log("connected to the Database");
});

const createTables = () => {
  const schoolTable = `

      CREATE TABLE IF NOT EXISTS empresa (
        cnpj char(14) NOT NULL,
        razao_social VARCHAR(60),
        nome_fantasia VARCHAR(60),
        ID_Empresa SERIAL PRIMARY KEY
      );

      CREATE TABLE IF NOT EXISTS metodo_pagto (
        descricao VARCHAR(20) NOT NULL,
        ID_Metodo_Pagto SERIAL PRIMARY KEY
      );
      
      CREATE TABLE IF NOT EXISTS cliente (
        ID_Cliente SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        cpf char(11) NOT NULL,
        endereco VARCHAR(60),
        telefone VARCHAR(20),
        ID_Empresa INTEGER,
        FOREIGN KEY(ID_Empresa) REFERENCES empresa (ID_Empresa)
      );  
  
      CREATE TABLE IF NOT EXISTS produto (
        ID_Produto SERIAL PRIMARY KEY,
        descricao VARCHAR(80) NOT NULL,
        VL_Produto numeric(9,2) NOT NULL,
        QTD_Total_Produto INTEGER NOT NULL,
        inativo BOOLEAN,
        DT_Inativo TIMESTAMP,
        DT_Atualizacao TIMESTAMP,
        DT_Criacao TIMESTAMP,
        ID_Empresa INTEGER,
        FOREIGN KEY(ID_Empresa) REFERENCES empresa (ID_Empresa)
      );
  
  
      CREATE TABLE IF NOT EXISTS vendedor (
        ID_Vendedor SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        senha VARCHAR(60) NOT NULL,
        email VARCHAR(60) NOT NULL,
        tipo_Vendedor CHAR(1),
        telefone VARCHAR(20),
        ID_Empresa INTEGER,
        FOREIGN KEY(ID_Empresa) REFERENCES empresa (ID_Empresa)
      );

      CREATE TABLE venda (
        ID_Venda serial PRIMARY KEY,
        VL_Total NUMERIC(9,2),
        observacao VARCHAR(100),
        st_venda CHAR(1),
        DT_Criacao TIMESTAMP,
        DT_Atualizacao TIMESTAMP,
        ID_Vendedor INTEGER,
        ID_Cliente INTEGER,
        ID_Metodo_Pagto INTEGER,
        FOREIGN KEY(ID_Vendedor) REFERENCES vendedor (ID_Vendedor),
        FOREIGN KEY(ID_Cliente) REFERENCES cliente (ID_Cliente),
        FOREIGN KEY(ID_Metodo_Pagto) REFERENCES metodo_pagto (ID_Metodo_Pagto)
      );

      CREATE TABLE venda_produto (
        QTD_Produto INTEGER,
        vl_produto_atual NUMERIC(9,2),
        ID_Produto INTEGER,
        ID_Venda INTEGER,
        PRIMARY KEY(ID_Produto,ID_Venda),
        FOREIGN KEY(ID_Produto) REFERENCES produto (ID_Produto),
        FOREIGN KEY(ID_Venda) REFERENCES venda (ID_Venda)
      ); 
      
      `;
  pool
    .query(schoolTable)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err, "erro");
      pool.end();
    });
};

pool.on("remove", () => {
  console.log("client removed");
  process.exit(0);
});

//export pool and createTables to be accessible  from an where within the application
module.exports = {
  createTables,
  pool,
};

require("make-runnable");
