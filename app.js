require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");

const app = express();
const port = process.env.PORT || 3001;
const jwt = require("jsonwebtoken");

app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);
const { hashSync, genSaltSync, compareSync } = require("bcrypt");

const { pool } = require("./services/db");
const { setErrorRequire } = require("./utils");

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

app.get("/company", (req, res) => {
  pool.connect((err, client, done) => {
    const query = "SELECT * FROM empresa";
    client.query(query, (error, result) => {
      done();
      if (error) {
        res.status(400).json({ error });
      }
      if (result.rows < "1") {
        res.status(404).send({
          status: "Failed",
          message: "No student information found",
        });
      } else {
        res.status(200).send({
          status: "Successful",
          message: "Students Information retrieved",
          students: result.rows,
        });
      }
    });
  });
});

app.post("/register", (req, res) => {
  const { cnpj, razao_social, nome_fantasian, nome, email, senha } = req.body;

  if (!cnpj || !nome || !razao_social || !email || !senha) {
    const errors = setErrorRequire([
      [{ cnpj }, "CNPJ é obrigatório"],
      [{ razao_social }, "Razão Social é obrigatório"],
      [{ nome }, "Nome é obrigatório"],
      [{ email }, "Email é obrigatório"],
      [{ senha }, "Senha é obrigatória"],
    ]);

    return res.status(400).json(errors);
  }

  pool.connect((err, client, done) => {
    const query = `SELECT * FROM empresa WHERE cnpj = '${cnpj}'`;
    // const queryA =
    //   "INSERT INTO empresa(cnpj, razao_social, nome_fantasian) VALUES($1,$2,$3) RETURNING *";
    // const values = [
    //   cnpj
    //   razao_social,
    //   nome_fantasian,
    // ];
    client.query(query, (error, result) => {
      done();
      if (result.rows < "1" || error) {
        const querySeller = `SELECT * FROM vendedor WHERE email = '${email}'`;

        client.query(querySeller, (error, result) => {
          done();

          if (result.rows < "1" || error) {
            const queryA =
              "INSERT INTO empresa(cnpj, razao_social, nome_fantasian) VALUES($1,$2,$3) RETURNING *";
            const values = [cnpj, razao_social, nome_fantasian];

            client.query(queryA, values, (error, result) => {
              done();

              if (error) {
                res.status(400).json({ error });
              }

              const salt = genSaltSync(10);
              const senhaformatada = hashSync(senha, salt);

              const queryB =
                "INSERT INTO vendedor(nome, email, senha, ID_Empresa) VALUES($1,$2,$3,$4) RETURNING *";
              const valuesB = [
                nome,
                email,
                senhaformatada,
                result.rows[0].id_empresa,
              ];

              client.query(queryB, valuesB, (error, result) => {
                done();

                if (error) {
                  res.status(400).json({ error });
                }

                const jsontoken = jsonwebtoken.sign(
                  { user: result.rows[0] },
                  process.env.SECRET_KEY,
                  { expiresIn: "30m" }
                );
                res.cookie("token", jsontoken, {
                  httpOnly: true,
                  secure: true,
                  SameSite: "strict",
                  expires: new Date(Number(new Date()) + 30 * 60 * 1000),
                }); //we add secure: true, when using https.

                res.json({ token: jsontoken });

                res.status(201).send({
                  status: "Successful",
                  message: "User created successfully",
                  user: result.rows[0],
                });
              });
            });
          } else {
            return res.status(400).json({ error: "Email já cadastrado" });
          }
        });
        return res.status(404).send({
          status: "Failed",
          message: "No student information found",
        });
      } else {
        return res.status(400).json({ error: "CNPJ já cadastrado" });
      }
    });
  });
});
