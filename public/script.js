const api = "http://localhost:3000/api/compromissos";

let eventos = [];
let current = new Date();
let selectedDate = null;
let idEditando = null;

const calendarEl = document.getElementById('calendar');
const mesAnoEl = document.getElementById('mesAno');
const modal = document.getElementById('modal');
const modalDateEl = document.getElementById('modal-date');
const eventListEl = document.getElementById('event-list');

const formAdd = document.getElementById('form-add');
const newTitulo = document.getElementById('new-titulo');
const newDescricao = document.getElementById('new-descricao');
const newPessoas = document.getElementById('new-pessoas');
const newTime = document.getElementById('new-time');

const btnAddNovo = document.getElementById('btnAddNovo');
const formContainer = document.getElementById('form-container');

document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
document.getElementById('fecharModal').addEventListener('click', closeModal);
document.getElementById('cancelAdd').addEventListener('click', e => { e.preventDefault(); closeModal(); });

async function loadEventos() {
    const res = await fetch(api);
    const dados = await res.json();
    eventos = dados.map(ev => ({
        ...ev,
        data_horario: ev.data_horario
    }));
}

function changeMonth(delta) {
    current.setMonth(current.getMonth() + delta);
    renderCalendar();
}

function renderCalendar() {
    calendarEl.innerHTML = "";

    const year = current.getFullYear();
    const month = current.getMonth();

    const weekdays = ['seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.', 'dom.'];
    weekdays.forEach(w => {
        const el = document.createElement('div');
        el.className = 'weekday';
        el.textContent = w;
        calendarEl.appendChild(el);
    });

    const first = new Date(year, month, 1);
    const start = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < start; i++) {
        const empty = document.createElement('div');
        empty.className = 'day out';
        calendarEl.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const dayCell = document.createElement('div');
        dayCell.className = 'day';
        dayCell.dataset.date = dateObj.toISOString();

        const num = document.createElement('div');
        num.className = 'date-num';
        num.textContent = day;

        dayCell.appendChild(num);

        const eventosDoDia = eventos.filter(ev => {
            const d = new Date(ev.data_horario);
            return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
        });

        if (eventosDoDia.length) {
            const badge = document.createElement('div');
            badge.className = 'event-badge';
            badge.textContent = eventosDoDia.length + " ✦";
            dayCell.appendChild(badge);
        }

        dayCell.addEventListener('click', () => {
            selectedDate = dateObj;
            openModalForDate(dateObj);
        });

        calendarEl.appendChild(dayCell);
    }

    mesAnoEl.textContent = current.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
    });
}

function openModalForDate(dateObj) {
    modal.style.display = "flex";

    modalDateEl.textContent = dateObj.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    idEditando = null;
    formAdd.querySelector(".btn-save").textContent = "Salvar";

    const eventosDoDia = eventos.filter(ev => {
        const d = new Date(ev.data_horario);
        return d.toDateString() === dateObj.toDateString();
    });

    if (eventosDoDia.length === 0) {
        eventListEl.innerHTML = "<p>Nenhum compromisso neste dia.</p>";

        btnAddNovo.style.display = "none";
        formContainer.style.display = "block";
    }

    else {
        renderEventList(dateObj);

        btnAddNovo.style.display = "block";
        formContainer.style.display = "none";
    }

    newTitulo.value = "";
    newDescricao.value = "";
    newPessoas.value = "";
    newTime.value = "";
}

btnAddNovo.addEventListener("click", () => {
    formContainer.style.display = "block";
    btnAddNovo.style.display = "none";
});

function renderEventList(dateObj) {
    eventListEl.innerHTML = "";

    const eventosDoDia = eventos
        .filter(ev => {
            const d = new Date(ev.data_horario);
            return d.toDateString() === dateObj.toDateString();
        })
        .sort((a, b) => new Date(a.data_horario) - new Date(b.data_horario));

    if (!eventosDoDia.length) {
        eventListEl.innerHTML = "<p>Nenhum compromisso neste dia.</p>";
        return;
    }

    eventosDoDia.forEach(ev => {
        const item = document.createElement("div");
        item.className = "event-item";

        const hora = new Date(ev.data_horario).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });

        item.innerHTML = `
            <h4>${ev.titulo} <small style="color:#a4005b">${hora}</small></h4>
            <p>${ev.descricao || ""}</p>
            <p><b>Pessoas:</b> ${ev.pessoas?.map(p => `
                <span class="pessoa">
                    ${p.nome}
                    <button class="btn-del-pessoa" data-id="${ev._id}" data-pid="${p.id}">✖</button>
                </span>
            `).join(" ") || "-"}</p>

            <div class="event-buttons">
                <button class="btn-edit" data-id="${ev._id}">Editar</button>
                <button class="btn-del" data-id="${ev._id}">Excluir</button>
            </div>
        `;

        eventListEl.appendChild(item);
    });
}
eventListEl.addEventListener("click", async (e) => {

    if (e.target.classList.contains("btn-del-pessoa")) {
        const id = e.target.dataset.id;
        const pid = e.target.dataset.pid;

        await fetch(`${api}/${id}/pessoa/${pid}`, {
            method: "DELETE"
        });

        await loadEventos();
        renderEventList(selectedDate);
        renderCalendar();
    }

    if (e.target.classList.contains("btn-del")) {
        const id = e.target.dataset.id;

        await fetch(`${api}/${id}`, { method: "DELETE" });

        await loadEventos();
        renderEventList(selectedDate);
        renderCalendar();
    }

    if (e.target.classList.contains("btn-edit")) {
        const id = e.target.dataset.id;
        startEdit(id);
    }
});
function startEdit(id) {
    idEditando = id;

    const ev = eventos.find(e => e._id === id);

    newTitulo.value = ev.titulo;
    newDescricao.value = ev.descricao;
    newPessoas.value = ev.pessoas.map(p => p.nome).join(", ");
    newTime.value = new Date(ev.data_horario).toLocaleTimeString("pt-BR", {
        hour:"2-digit", minute:"2-digit", hour12:false
    });

    formAdd.querySelector(".btn-save").textContent = "Salvar edição";
}

function closeModal() {
    modal.style.display = "none";
    selectedDate = null;
}

formAdd.addEventListener("submit", async e => {
    e.preventDefault();
    if (!selectedDate) return;

    const titulo = newTitulo.value.trim();
    const descricao = newDescricao.value.trim();
    const pessoas = newPessoas.value.split(",").map((nome, i) => ({
        id: "p" + (i + 1),
        nome: nome.trim()
    }));

    const [h, m] = newTime.value.split(":");
    const dt = new Date(selectedDate);
    dt.setHours(h, m, 0, 0);

    const payload = {
        titulo,
        descricao,
        pessoas,
        data_horario: dt.toISOString()
    };

    const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const saved = await res.json();
    eventos.push(saved);

    renderEventList(selectedDate);
    renderCalendar();
});
formContainer.style.display = "none";
btnAddNovo.style.display = "block";

loadEventos().then(renderCalendar);