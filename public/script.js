const api = "http://localhost:3000/api/compromissos";

async function listar() {
    const res = await fetch(api);
    const dados = await res.json();

    let html = "";
    dados.forEach(c => {
        html += `
        <div class="card compromisso">
            <h3>${c.titulo}</h3>
            <p><b>Data:</b> ${new Date(c.data_horario).toLocaleString()}</p>
            <p><b>Descrição:</b> ${c.descricao}</p>

            <p><b>Pessoas:</b></p>
            <div>
                ${c.pessoas.map(p => `<span class="pessoa">${p.nome}</span>`).join("")}
            </div>

            <button class="btn-delete" onclick="remover('${c._id}')">Excluir compromisso ❌</button>
        </div>
        `;
    });

    document.getElementById("lista").innerHTML = html;
}

async function cadastrar() {
    const data_horario = document.getElementById("data").value;
    const titulo = document.getElementById("titulo").value;
    const descricao = document.getElementById("descricao").value;

    const pessoasTxt = document.getElementById("pessoas").value;
    const pessoas = pessoasTxt.split(",").map((nome, i) => ({
        id: "p" + (i + 1),
        nome: nome.trim()
    }));

    await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data_horario, titulo, descricao, pessoas })
    });

    listar();
}

async function remover(id) {
    await fetch(`${api}/${id}`, { method: "DELETE" });
    listar();
}

listar();