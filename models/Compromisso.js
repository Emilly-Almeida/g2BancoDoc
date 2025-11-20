const mongoose = require("mongoose");

const PessoaSchema = new mongoose.Schema({
  id: String,
  nome: String
});

const CompromissoSchema = new mongoose.Schema({
  data_horario: Date,
  titulo: String,
  descricao: String,
  pessoas: [PessoaSchema]
});

module.exports = mongoose.model("Compromisso", CompromissoSchema);