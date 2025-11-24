const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const compromissoRoutes = require("./routes/compromissoRoutes");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

mongoose
  .connect("mongodb://127.0.0.1:27017/agenda_db")
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log("Erro no MongoDB:", err));

app.use("/api/compromissos", compromissoRoutes);

app.listen(3000, () => console.log("Servidor rodando. http://localhost:3000"));