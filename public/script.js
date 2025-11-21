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
const monthEventList = document.getElementById('monthEventList');
const monthEventsTitle = document.getElementById('monthEventsTitle');
const btnAllEvents = document.getElementById('btnAllEvents');
const allEventList = document.getElementById('allEventList');
const yearSelect = document.getElementById('yearSelect');
const btnYearFilter = document.getElementById('btnYearFilter');

document.getElementById('prevMonth').addEventListener('click',()=>changeMonth(-1));
document.getElementById('nextMonth').addEventListener('click',()=>changeMonth(1));
document.getElementById('fecharModal').addEventListener('click',closeModal);
document.getElementById('cancelAdd').addEventListener('click', e=>{
    e.preventDefault();
    formContainer.style.display="none";
    btnAddNovo.style.display="block";
    newTitulo.value=""; 
    newDescricao.value=""; 
    newPessoas.value=""; 
    newTime.value="";
    idEditando=null;
});
const mesAnoBtn = document.getElementById("mesAno");
const monthYearSelector = document.getElementById("monthYearSelector");
const monthSelect = document.getElementById("monthSelect");
const yearSelectPopup = document.getElementById("yearSelectPopup");
const applyMonthYear = document.getElementById("applyMonthYear");

const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

meses.forEach((m,i)=>{
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = m;
    monthSelect.appendChild(opt);
});

for(let y=current.getFullYear()-10; y<=current.getFullYear()+10; y++){
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelectPopup.appendChild(opt);
}

function updateMesAnoBtn(){
    mesAnoBtn.textContent = `${meses[current.getMonth()]} de ${current.getFullYear()}`;
    monthSelect.value = current.getMonth();
    yearSelectPopup.value = current.getFullYear();
}
updateMesAnoBtn();

mesAnoBtn.addEventListener('click', ()=>{
    monthYearSelector.classList.toggle('hidden');
    const rect = mesAnoBtn.getBoundingClientRect();
    monthYearSelector.style.top = (rect.bottom - mesAnoBtn.parentElement.getBoundingClientRect().top + 4) + "px";
    monthYearSelector.style.left = (rect.left - mesAnoBtn.parentElement.getBoundingClientRect().left) + "px";

});

applyMonthYear.addEventListener('click', ()=>{
    current.setMonth(Number(monthSelect.value));
    current.setFullYear(Number(yearSelectPopup.value));
    updateMesAnoBtn();
    monthYearSelector.classList.add('hidden');
    renderCalendar();
});

btnAddNovo.addEventListener('click',()=>{formContainer.style.display="block"; btnAddNovo.style.display="none";});

btnAllEvents.addEventListener('click',()=>{
    document.querySelector('.year-select-container').style.display='none';
    renderAllEvents();
});
btnYearFilter.addEventListener('click',()=>{
    document.querySelector('.year-select-container').style.display='flex';
    renderYearEvents();
});

async function loadEventos(){
    const res = await fetch(api);
    eventos = await res.json();
    populateYearSelect();
}

function changeMonth(delta){
    current.setMonth(current.getMonth()+delta);
    renderCalendar();
    renderMonthEvents();
}

function renderCalendar(){
    calendarEl.innerHTML="";
    const year=current.getFullYear();
    const month=current.getMonth();
    const weekdays=['seg.','ter.','qua.','qui.','sex.','sáb.','dom.'];
    weekdays.forEach(w=>{
        const el=document.createElement('div');
        el.className='weekday'; el.textContent=w;
        calendarEl.appendChild(el);
    });

    const first=new Date(year,month,1);
    const start=(first.getDay()+6)%7;
    const daysInMonth=new Date(year,month+1,0).getDate();

    for(let i=0;i<start;i++){
        const empty=document.createElement('div'); empty.className='day out';
        calendarEl.appendChild(empty);
    }

    for(let day=1;day<=daysInMonth;day++){
        const dateObj=new Date(year,month,day);
        const dayCell=document.createElement('div'); dayCell.className='day';
        dayCell.dataset.date=dateObj.toISOString();
        const num=document.createElement('div'); num.className='date-num'; num.textContent=day;
        dayCell.appendChild(num);

        const eventosDoDia=eventos.filter(ev=>{
            const d=new Date(ev.data_horario);
            return d.getFullYear()===year && d.getMonth()===month && d.getDate()===day;
        });

        if(eventosDoDia.length){
            const badge=document.createElement('div'); badge.className='event-badge';
            badge.textContent=eventosDoDia.length+" ✦";
            dayCell.appendChild(badge);
        }

        dayCell.addEventListener('click',()=>openModalForDate(dateObj));
        calendarEl.appendChild(dayCell);
    }

    mesAnoEl.textContent=current.toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
    renderMonthEvents();
}

function renderMonthEvents(){
    monthEventList.innerHTML="";
    const year=current.getFullYear();
    const month=current.getMonth();
    const eventosDoMes=eventos.filter(ev=>{
        const d=new Date(ev.data_horario);
        return d.getFullYear()===year && d.getMonth()===month;
    });
    if(!eventosDoMes.length){
        monthEventList.innerHTML="<p>Nenhum compromisso neste mês.</p>"; return;
    }
    eventosDoMes.forEach(ev=>{
        const card=document.createElement("div"); card.className="event-card";
        const dt=new Date(ev.data_horario);
        const dataStr=dt.toLocaleDateString("pt-BR");
        const horaStr=dt.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
        card.innerHTML=`<h4>${ev.titulo} <small>${dataStr} ${horaStr}</small></h4><p>${ev.descricao||""}</p>`;
        card.addEventListener('click', ()=>{
            const dateObj = new Date(ev.data_horario);
            openModalForDate(dateObj);
        });
        
        monthEventList.appendChild(card);
    });
}

function populateYearSelect(){
    yearSelect.innerHTML="";
    const anos=[...new Set(eventos.map(ev=>new Date(ev.data_horario).getFullYear()))];
    anos.sort();
    anos.forEach(y=>{
        const opt=document.createElement("option"); opt.value=y; opt.textContent=y;
        yearSelect.appendChild(opt);
    });
}

function renderAllEvents(){
    allEventList.innerHTML="";
    if(!eventos.length){allEventList.innerHTML="<p>Nenhum compromisso cadastrado.</p>"; return;}
    eventos.sort((a,b)=>new Date(a.data_horario)-new Date(b.data_horario)).forEach(ev=>{
        const card=document.createElement("div"); card.className="event-card-full";
        const dt=new Date(ev.data_horario);
        const dataStr=dt.toLocaleDateString("pt-BR");
        const horaStr=dt.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
        const pessoasStr=ev.pessoas && ev.pessoas.length ? ev.pessoas.map(p=>p.nome).join(", ") : "Nenhuma pessoa";
        
        card.innerHTML=`
            <div class="event-card-header">
                <h4>${ev.titulo}</h4>
                <span class="event-date-badge">${dataStr} às ${horaStr}</span>
            </div>
            <p><strong><img src="material/doc.png"> Descrição:</strong> ${ev.descricao||"Sem descrição"}</p>
            <p><strong><img src="material/person.png"> Pessoas:</strong> ${pessoasStr}</p>
        `;
        card.addEventListener('click', ()=>{
            const dateObj = new Date(ev.data_horario);
            openModalForDate(dateObj);
        });
        allEventList.appendChild(card);
    });
}

function renderYearEvents(){
    const ano=Number(yearSelect.value);
    allEventList.innerHTML="";
    const eventosAno=eventos.filter(ev=>new Date(ev.data_horario).getFullYear()===ano)
        .sort((a,b)=>new Date(a.data_horario)-new Date(b.data_horario));
    if(!eventosAno.length){allEventList.innerHTML="<p>Nenhum compromisso neste ano.</p>"; return;}
    eventosAno.forEach(ev=>{
        const card=document.createElement("div"); card.className="event-card-full";
        const dt=new Date(ev.data_horario);
        const dataStr=dt.toLocaleDateString("pt-BR");
        const horaStr=dt.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
        const pessoasStr=ev.pessoas && ev.pessoas.length ? ev.pessoas.map(p=>p.nome).join(", ") : "Nenhuma pessoa";
        
        card.innerHTML=`
            <div class="event-card-header">
                <h4>${ev.titulo}</h4>
                <span class="event-date-badge">${dataStr} às ${horaStr}</span>
            </div>
            <p><strong><img src="material/doc.png"> Descrição:</strong> ${ev.descricao||"Sem descrição"}</p>
            <p><strong><img src="material/person.png"> Pessoas:</strong> ${pessoasStr}</p>
        `;
        card.addEventListener('click', ()=>{
            const dateObj = new Date(ev.data_horario);
            openModalForDate(dateObj);
        });
        allEventList.appendChild(card);
    });
}

// Modal
function openModalForDate(dateObj){
    modal.style.display="flex";
    modalDateEl.textContent=dateObj.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
    selectedDate=dateObj;
    idEditando=null;
    btnAddNovo.style.display="block";
    formContainer.style.display="none";
    newTitulo.value=""; newDescricao.value=""; newPessoas.value=""; newTime.value="";
    renderEventList(dateObj);
}

function renderEventList(dateObj){
    eventListEl.innerHTML="";
    const eventosDoDia=eventos.filter(ev=>new Date(ev.data_horario).toDateString()===dateObj.toDateString())
        .sort((a,b)=>new Date(a.data_horario)-new Date(b.data_horario));
    if(!eventosDoDia.length){eventListEl.innerHTML="<p>Nenhum compromisso neste dia.</p>"; return;}
    eventosDoDia.forEach(ev=>{
        const item=document.createElement("div"); item.className="event-item";
        const hora=new Date(ev.data_horario).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
        const data=new Date(ev.data_horario).toLocaleDateString("pt-BR");
        const pessoasStr=ev.pessoas && ev.pessoas.length ? ev.pessoas.map(p=>p.nome).join(", ") : "Nenhuma pessoa";
        
        item.innerHTML=`
            <div class="event-item-content">
                <div class="event-item-info">
                    <h4>${ev.titulo}</h4>
                    <p><strong><img src="material/calendar.png"> Data:</strong> ${data} às ${hora}</p>
                    <p><strong><img src="material/doc.png"> Descrição:</strong> ${ev.descricao||"Sem descrição"}</p>
                    <p><strong><img src="material/person.png"> Pessoas:</strong> ${pessoasStr}</p>
                </div>
                <div class="event-actions">
                    <button class="btn-edit" title="Editar compromisso"><img src="material/edit.png"></button>
                    <button class="btn-delete" title="Excluir compromisso"><img src="material/delete.png"></button>
                </div>
            </div>
        `;
        
        const btnEdit = item.querySelector('.btn-edit');
        btnEdit.addEventListener('click',(e)=>{ 
            e.stopPropagation();
            idEditando=ev._id||ev.id;
            newTitulo.value=ev.titulo;
            newDescricao.value=ev.descricao;
            newPessoas.value=ev.pessoas?ev.pessoas.map(p=>p.nome).join(","):"";
            newTime.value=new Date(ev.data_horario).toTimeString().slice(0,5);
            formContainer.style.display="block";
            btnAddNovo.style.display="none";
        });
        
        const btnDelete = item.querySelector('.btn-delete');
        btnDelete.addEventListener('click', async (e)=>{
            e.stopPropagation();
            if(!confirm(`Deseja realmente excluir "${ev.titulo}"?`)) return;
            
            const evId = ev._id || ev.id;
            await fetch(`${api}/${evId}`, {method:"DELETE"});
            eventos = eventos.filter(e => (e._id || e.id) !== evId);
            renderEventList(selectedDate);
            renderCalendar();
        });
        
        eventListEl.appendChild(item);
    });
}

formAdd.addEventListener("submit", async e=>{
    e.preventDefault();
    if(!selectedDate) return;

    const titulo = newTitulo.value.trim();
    const descricao = newDescricao.value.trim();
    const pessoas = newPessoas.value.split(",").map((nome,i)=>({id:"p"+(i+1),nome:nome.trim()}));
    const [h,m] = newTime.value.split(":");
    const dt = new Date(selectedDate);
    dt.setHours(h,m,0,0);
    const payload = {titulo, descricao, pessoas, data_horario: dt.toISOString()};

    if(idEditando){
        const res = await fetch(`${api}/${idEditando}`, {
            method:"PUT",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify(payload)
        });
        const updated = await res.json();
        const idx = eventos.findIndex(ev => ev._id === idEditando || ev.id === idEditando);
        eventos[idx] = updated;
    } else {
        const res = await fetch(api, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify(payload)
        });
        const saved = await res.json();
        eventos.push(saved);
    }

    formContainer.style.display="none";
    btnAddNovo.style.display="block";
    renderEventList(selectedDate);
    renderCalendar();
});

function closeModal(){
    modal.style.display="none";
}

// Inicial
loadEventos().then(()=>renderCalendar());