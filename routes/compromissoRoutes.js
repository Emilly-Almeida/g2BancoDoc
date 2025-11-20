const express = require("express");
const router = express.Router();
const Compromisso = require("../models/Compromisso");

router.get("/", async (req, res) => {
  const compromissos = await Compromisso.find();
  res.json(compromissos);
});

router.get("/:id", async (req, res) => {
  try {
    const compromisso = await Compromisso.findById(req.params.id);

    if (!compromisso) {
      return res.status(404).json({ erro: "Compromisso não encontrado" });
    }

    res.json(compromisso);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar compromisso" });
  }
});

router.post("/", async (req, res) => {
  try {
    let { pessoas } = req.body;

    if (typeof pessoas === "string") {
      pessoas = pessoas.split(",").map((nome, i) => ({
        id: "p" + (i + 1),
        nome: nome.trim()
      }));
    }

    const novo = await Compromisso.create({
      ...req.body,
      pessoas
    });

    res.json(novo);
  } catch (erro) {
    console.error("ERRO AO CADASTRAR:", erro);
    res.status(400).json({ erro: erro.message });
  }
});

router.put("/:id", async (req, res) => {
  const atualizado = await Compromisso.findByIdAndUpdate(
    req.params.id,
    { $set: { titulo: req.body.titulo, descricao: req.body.descricao, pessoas: req.body.pessoas } },
    { new: true }
  );
  res.json(atualizado);
});

router.delete("/:id/pessoa/:pid", async (req, res) => {
  const atualizado = await Compromisso.findByIdAndUpdate(
    req.params.id,
    { $pull: { pessoas: { id: req.params.pid } } },
    { new: true }
  );
  res.json(atualizado);
});

router.delete("/:id", async (req, res) => {
  await Compromisso.findByIdAndDelete(req.params.id);
  res.json({ msg: "Compromisso removido" });
});

module.exports = router;