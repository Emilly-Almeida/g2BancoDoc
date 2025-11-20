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
                ${c.pessoas
                    .map(
                        p =>
                            `<span class="pessoa">${p.nome}
                               <button class="btn-delete-person" onclick="removerPessoa('${c._id}', '${p.id}')">x</button>
                             </span>`
                    )
                    .join("")}
            </div>

            <button class="btn-edit" onclick="editar('${c._id}')">Editar ✏️</button>
            <button class="btn-delete" onclick="remover('${c._id}')">Excluir ❌</button>
        </div>
        `;
    });

    document.getElementById("lista").innerHTML = html;
}

// Cadastrar compromisso
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

// Excluir compromisso
async function remover(id) {
    await fetch(`${api}/${id}`, { method: "DELETE" });
    listar();
}

// Excluir uma pessoa específica
async function removerPessoa(idComp, idPessoa) {
    await fetch(`${api}/${idComp}/pessoa/${idPessoa}`, { method: "DELETE" });
    listar();
}
let idEditando = null;

// Abre modal com dados preenchidos
async function editar(id) {
    idEditando = id;

    const res = await fetch(`${api}/${id}`);
    const c = await res.json();

    document.getElementById("edit-titulo").value = c.titulo;
    document.getElementById("edit-descricao").value = c.descricao;
    document.getElementById("edit-pessoas").value = c.pessoas.map(p => p.nome).join(", ");

    document.getElementById("modal-editar").style.display = "flex";
}

// Fecha o modal
function fecharModal() {
    document.getElementById("modal-editar").style.display = "none";
}

// Salvar alterações
async function salvarEdicao() {
    const titulo = document.getElementById("edit-titulo").value;
    const descricao = document.getElementById("edit-descricao").value;
    const pessoasTxt = document.getElementById("edit-pessoas").value;
    console.log(pessoasTxt);
    console.log(descricao);
    const pessoas = pessoasTxt.split(",").map((nome, i) => ({
        id: "p" + (i + 1),
        nome: nome.trim()
    }));
    console.log(pessoas);

    await fetch(`${api}/${idEditando}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descricao, pessoas })
    });

    fecharModal();
    listar();
}

listar();