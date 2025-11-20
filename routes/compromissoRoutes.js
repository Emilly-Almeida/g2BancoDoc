const express = require("express");
const router = express.Router();
const Compromisso = require("../models/Compromisso");

// Listar
router.get("/", async (req, res) => {
  const compromissos = await Compromisso.find();
  res.json(compromissos);
});

// Cadastrar
router.post("/", async (req, res) => {
  const novo = await Compromisso.create(req.body);
  res.json(novo);
});

// Alterar título e descrição
router.put("/:id", async (req, res) => {
  const atualizado = await Compromisso.findByIdAndUpdate(
    req.params.id,
    { $set: { titulo: req.body.titulo, descricao: req.body.descricao } },
    { new: true }
  );
  res.json(atualizado);
});

// Alterar pessoas (substituir toda lista)
router.put("/:id/pessoas", async (req, res) => {
  const atualizado = await Compromisso.findByIdAndUpdate(
    req.params.id,
    { $set: { pessoas: req.body.pessoas } },
    { new: true }
  );
  res.json(atualizado);
});

// Excluir pessoa
router.delete("/:id/pessoa/:pid", async (req, res) => {
  const atualizado = await Compromisso.findByIdAndUpdate(
    req.params.id,
    { $pull: { pessoas: { id: req.params.pid } } },
    { new: true }
  );
  res.json(atualizado);
});

// Excluir compromisso
router.delete("/:id", async (req, res) => {
  await Compromisso.findByIdAndDelete(req.params.id);
  res.json({ msg: "Compromisso removido" });
});

module.exports = router;