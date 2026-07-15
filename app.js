const statuses = [
  ["backlog", "Backlog"],
  ["doing", "Em execução"],
  ["review", "Revisão"],
  ["done", "Concluído"]
];

const demoTasks = [
  {
    id: "task-1",
    title: "Mapear fluxo de checkout",
    project: "E-commerce",
    assignee: "Wesley",
    priority: "alta",
    status: "doing",
    estimate: 8,
    dueDate: "2026-07-10",
    description: "Documentar carrinho, pagamento, cupom, frete e confirmação."
  },
  {
    id: "task-2",
    title: "Criar autenticação do painel",
    project: "SaaS Admin",
    assignee: "Ana",
    priority: "alta",
    status: "review",
    estimate: 12,
    dueDate: "2026-07-08",
    description: "Login, logout, sessão e validações de tela protegida."
  },
  {
    id: "task-3",
    title: "Refatorar painel financeiro",
    project: "Finanças",
    assignee: "Marcos",
    priority: "media",
    status: "backlog",
    estimate: 10,
    dueDate: "2026-07-16",
    description: "Separar cálculo, filtros e renderização dos gráficos."
  },
  {
    id: "task-4",
    title: "Publicar versão responsiva",
    project: "Landing Page",
    assignee: "Wesley",
    priority: "baixa",
    status: "done",
    estimate: 5,
    dueDate: "2026-07-05",
    description: "Ajustes mobile e revisão final de acessibilidade."
  },
  {
    id: "task-5",
    title: "Criar testes de API",
    project: "SaaS Admin",
    assignee: "Bianca",
    priority: "media",
    status: "doing",
    estimate: 7,
    dueDate: "2026-07-12",
    description: "Cobrir rotas principais e cenários de erro."
  }
];

const taskForm = document.querySelector("#taskForm");
const board = document.querySelector("#board");
const metrics = document.querySelector("#metrics");
const timelineList = document.querySelector("#timelineList");
const capacity = document.querySelector("#capacity");
const searchInput = document.querySelector("#searchInput");
const projectFilter = document.querySelector("#projectFilter");
const priorityFilter = document.querySelector("#priorityFilter");
const exportBtn = document.querySelector("#exportBtn");
const resetBtn = document.querySelector("#resetBtn");
const taskTemplate = document.querySelector("#taskTemplate");

let tasks = loadTasks();
let draggedId = null;

function loadTasks() {
  return SafeStorage.read("planner-pro-tasks", demoTasks, Array.isArray);
}

function saveTasks() {
  SafeStorage.write("planner-pro-tasks", tasks);
}

function filteredTasks() {
  const search = searchInput.value.trim().toLowerCase();
  const project = projectFilter.value;
  const priority = priorityFilter.value;

  return tasks.filter((task) => {
    const text = `${task.title} ${task.project} ${task.assignee}`.toLowerCase();
    return (!search || text.includes(search))
      && (project === "all" || task.project === project)
      && (priority === "all" || task.priority === priority);
  });
}

function daysUntil(date) {
  const now = new Date("2026-07-06T12:00:00");
  const due = new Date(`${date}T12:00:00`);
  return Math.ceil((due - now) / 86400000);
}

function renderProjectOptions() {
  const current = projectFilter.value;
  const projects = [...new Set(tasks.map((task) => task.project))].sort();
  projectFilter.innerHTML = "<option value='all'>Todos os projetos</option>"
    + projects.map((project) => `<option value="${project}">${project}</option>`).join("");
  projectFilter.value = projects.includes(current) ? current : "all";
}

function renderMetrics(list) {
  const totalEstimate = list.reduce((sum, task) => sum + Number(task.estimate), 0);
  const completed = list.filter((task) => task.status === "done").length;
  const delayed = list.filter((task) => task.status !== "done" && daysUntil(task.dueDate) < 0).length;
  const high = list.filter((task) => task.priority === "alta").length;

  const cards = [
    ["Tarefas", list.length],
    ["Horas estimadas", `${totalEstimate}h`],
    ["Concluídas", completed],
    ["Risco alto", delayed + high]
  ];

  metrics.innerHTML = cards
    .map(([label, value]) => `
      <article class="metric">
        <span>${label}</span>
        <strong>${value}</strong>
      </article>
    `)
    .join("");
}

function renderBoard(list) {
  board.innerHTML = statuses
    .map(([status, label]) => `
      <section class="column" data-status="${status}">
        <div class="column-head">
          <h2>${label}</h2>
          <span>${list.filter((task) => task.status === status).length}</span>
        </div>
        <div class="tasks"></div>
      </section>
    `)
    .join("");

  board.querySelectorAll(".column").forEach((column) => {
    const taskContainer = column.querySelector(".tasks");

    column.addEventListener("dragover", (event) => event.preventDefault());
    column.addEventListener("drop", () => {
      tasks = tasks.map((task) => task.id === draggedId ? { ...task, status: column.dataset.status } : task);
      draggedId = null;
      saveTasks();
      render();
    });

    list
      .filter((task) => task.status === column.dataset.status)
      .forEach((task) => taskContainer.appendChild(createTaskCard(task)));
  });
}

function createTaskCard(task) {
  const node = taskTemplate.content.cloneNode(true);
  const article = node.querySelector(".task");
  const badge = node.querySelector(".badge");
  const title = node.querySelector("h3");
  const description = node.querySelector("p");
  const assignee = node.querySelector(".assignee");
  const due = node.querySelector(".due");
  const deleteButton = node.querySelector(".delete");

  article.dataset.id = task.id;
  badge.textContent = task.priority;
  badge.classList.add(task.priority);
  title.textContent = task.title;
  description.textContent = `${task.project} • ${task.description}`;
  assignee.textContent = task.assignee;

  const remaining = daysUntil(task.dueDate);
  due.textContent = remaining < 0 ? `${Math.abs(remaining)}d atrasado` : `${remaining}d restantes`;

  article.addEventListener("dragstart", () => {
    draggedId = task.id;
    article.classList.add("dragging");
  });
  article.addEventListener("dragend", () => article.classList.remove("dragging"));

  deleteButton.addEventListener("click", () => {
    tasks = tasks.filter((item) => item.id !== task.id);
    saveTasks();
    render();
  });

  return node;
}

function renderTimeline(list) {
  timelineList.innerHTML = [...list]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 8)
    .map((task) => {
      const remaining = daysUntil(task.dueDate);
      const risk = remaining < 0 ? "Atrasado" : remaining <= 3 ? "Atenção" : "No prazo";
      return `
        <article class="timeline-item">
          <strong>${task.dueDate.split("-").reverse().join("/")} • ${task.title}</strong>
          <span>${task.project} • ${task.assignee} • ${risk}</span>
        </article>
      `;
    })
    .join("");
}

function renderCapacity(list) {
  const byPerson = list.reduce((map, task) => {
    if (task.status === "done") return map;
    map[task.assignee] = (map[task.assignee] || 0) + Number(task.estimate);
    return map;
  }, {});

  const max = Math.max(...Object.values(byPerson), 1);

  capacity.innerHTML = Object.entries(byPerson)
    .sort((a, b) => b[1] - a[1])
    .map(([person, hours]) => `
      <article class="capacity-item">
        <strong>${person}</strong>
        <span>${hours}h planejadas</span>
        <div class="progress"><i style="width:${Math.min((hours / max) * 100, 100)}%"></i></div>
      </article>
    `)
    .join("");
}

function render() {
  renderProjectOptions();
  const list = filteredTasks();
  renderMetrics(list);
  renderBoard(list);
  renderTimeline(list);
  renderCapacity(list);
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(taskForm).entries());
  tasks.unshift({
    id: crypto.randomUUID(),
    ...payload,
    estimate: Number(payload.estimate)
  });
  saveTasks();
  taskForm.reset();
  render();
});

[searchInput, projectFilter, priorityFilter].forEach((field) => {
  field.addEventListener("input", render);
});

exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "planner-pro-tarefas.json";
  link.click();
  URL.revokeObjectURL(url);
});

resetBtn.addEventListener("click", () => {
  tasks = demoTasks;
  saveTasks();
  render();
});

render();
