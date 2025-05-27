const taskList = document.getElementById("taskList");

function addTask(text = "Nueva tarea", parent = taskList, level = 0) {
  const li = document.createElement("li");
  const taskType = level === 0 ? "main-task" : "subtask";
  li.classList.add(taskType);
  li.style.setProperty('--level', level); // Aplica padding dinámico
  li.innerHTML = `
    <button class="btn-toggle" onclick="toggleChildren(this)">▼</button>
    <button onclick="this.parentElement.remove()">🗑</button>
    <input type="checkbox">
    <span contenteditable="true">${text}</span>
    <button onclick="addTask('Subtarea', this.parentElement.querySelector('.subtasks'), ${level + 1})">+</button>
    <ul class="subtasks task"></ul>
    <div id="descriptionModal" class="hidden">
      <div class="modal-content">
        <textarea id="descriptionText" rows="5" cols="40" placeholder="Escribe la descripción aquí..."></textarea>
        <button onclick="saveDescription()">Guardar</button>
        <button onclick="closeModal()">Cerrar</button>
      </div>
    </div>
  `;
  parent.appendChild(li);
}

function toggleChildren(button) {
  const sublist = button.parentElement.querySelector(".subtasks");
  sublist.classList.toggle("hidden");
  button.textContent = sublist.classList.contains("hidden") ? "▶" : "▼";
}

function processList() {
  const text = document.getElementById("textInput").value;
  const lines = text.split("\n").filter(line => line.trim() !== "");
  const root = document.getElementById("taskList");
  root.innerHTML = "";

  const stack = [{ element: root, level: -1 }];

  lines.forEach(line => {
    const level = line.match(/^\s*/)[0].length / 2;
    const isChecked = line.includes("[x]");
    const text = line.replace(/^\s*\[.?\]\s*/, "").trim();

    const li = document.createElement("li");
    const taskType = level === 0 ? "main-task" : "subtask";
    li.classList.add(taskType);
    li.style.setProperty('--level', level);
    li.innerHTML = `
      <button class="btn-toggle" onclick="toggleChildren(this)">▼</button>
      <button onclick="this.parentElement.remove()">🗑</button>
      <input type="checkbox" ${isChecked ? "checked" : ""}>
      <span contenteditable="true">${text}</span>
      <button onclick="addTask('Subtarea', this.parentElement.querySelector('.subtasks'), ${level + 1})">+</button>
      <ul class=" subtasks task "></ul>
    `;

    while (stack[stack.length - 1].level >= level) stack.pop();
    stack[stack.length - 1].element.appendChild(li);
    stack.push({ element: li.querySelector(".subtasks"), level });
  });
}

function exportList() {
  const output = [];
  
  function traverseList(element, level = 0) {
    element.querySelectorAll(":scope > li").forEach(li => {
      const checkbox = li.querySelector("input[type='checkbox']");
      const text = li.querySelector("span").innerText.trim();
      const isChecked = checkbox.checked ? "[x]" : "[ ]";
      
      output.push("\t".repeat(level) + isChecked + " " + text); // Indentación por nivel
      
      const sublist = li.querySelector(".subtasks");
      if (sublist) traverseList(sublist, level + 1); // Recursión para subniveles
    });
  }

  traverseList(document.getElementById("taskList"));
  
  // Muestra el texto generado
  const textarea = document.getElementById("textInput");
  textarea.value = output.join("\n");
}