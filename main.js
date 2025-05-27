const taskList = document.getElementById("taskList");

function addTask(text = "New task", parent = taskList, level = 0) {
  const li = document.createElement("li");
  const taskType = level === 0 ? "main-task" : "subtask";
  li.classList.add(taskType);
  li.style.setProperty('--level', level);

  li.innerHTML = `
    <button class="btn-toggle" onclick="toggleChildren(this)">▼</button>
    <button onclick="this.parentElement.remove()">🗑</button>
    <input type="checkbox">
    <span contenteditable="true">${text}</span>
    <button onclick="openModal(this)">📝</button>
    <button onclick="addTask('Subtask', this.parentElement.querySelector('.subtasks'), ${level + 1})">+</button>
    <div class="task-description hidden"></div>
    <ul class="subtasks task"></ul>
  `;

  li.setAttribute("data-description", "");
  parent.appendChild(li);
}


let currentTaskElement = null;

function openModal(button) {
  currentTaskElement = button.parentElement;
  const modal = document.getElementById("descriptionModal");
  const descriptionText = document.getElementById("descriptionText");

  descriptionText.value = currentTaskElement.getAttribute("data-description") || "";
  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("descriptionModal").style.display = "none";
}

function saveDescription() {
  if (currentTaskElement) {
    const rawText = document.getElementById("descriptionText").value.trim();
    currentTaskElement.setAttribute("data-description", rawText);

    let descElement = currentTaskElement.querySelector(".task-description");

    descElement.innerHTML = rawText.replace(/\n/g, "<br>");
    if(rawText.trim() !== "")
      descElement.classList.remove("hidden");
    else
      descElement.classList.add("hidden");
  }
  closeModal();
}


function toggleChildren(button) {
  const sublist = button.parentElement.querySelector(".subtasks");
  sublist.classList.toggle("hidden");

  TEST = button.parentElement.querySelector(".task-description");
  if(sublist.classList.contains("hidden")) {
    button.textContent = "▶";
    button.parentElement.querySelector(".task-description").classList.add("hidden");
  }
  else {
    button.textContent = "▼";
    if(button.parentElement.querySelector(".task-description").innerHTML.trim() !== "")
      button.parentElement.querySelector(".task-description").classList.remove("hidden");
  }

}

function processList() {
  const text = document.getElementById("textInput").value
      || document.getElementById("textInput").placeholder;
  const lines = text.split("\n").filter(line => line.trim() !== "");
  const root = document.getElementById("taskList");
  root.innerHTML = "";

  const stack = [{ element: root, level: -1 }];

  lines.forEach(line => {
    const level = line.match(/^\s*/)[0].length / 2;
    const isChecked = line.includes("[x]");
    
    let description = "";
    const descriptionMatch = line.match(/\[Description: (.+)\]$/);
    if (descriptionMatch) {
      description = descriptionMatch[1].replace(/\\n/g, "\n");
      line = line.replace(/\[Description: .+\]$/, "").trim();
    }

    const text = line.replace(/^\s*\[.?\]\s*/, "").trim();

    const li = document.createElement("li");
    const taskType = level === 0 ? "main-task" : "subtask";
    li.classList.add(taskType);
    li.style.setProperty('--level', level);
    li.setAttribute("data-description", description);

    li.innerHTML = `
      <button class="btn-toggle" onclick="toggleChildren(this)">▼</button>
      <button onclick="this.parentElement.remove()">🗑</button>
      <input type="checkbox" ${isChecked ? "checked" : ""}>
      <span contenteditable="true">${text}</span>
      <button onclick="openModal(this)">📝</button>
      <button onclick="addTask('Subtarea', this.parentElement.querySelector('.subtasks'), ${level + 1})">+</button>
      <div class="task-description ${description ? "" : "hidden"}">${description.replace(/\n/g, "<br>")}</div>
      <ul class="subtasks task"></ul>
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
      
      let description = li.getAttribute("data-description") || "";
      
      if (description.trim() !== "") {
        description = description.replace(/\n/g, "\\n");
        output.push("\t".repeat(level) + isChecked + " " + text + " [Description: " + description + "]");
      } else {
        output.push("\t".repeat(level) + isChecked + " " + text);
      }

      const sublist = li.querySelector(".subtasks");
      if (sublist) traverseList(sublist, level + 1);
    });
  }

  traverseList(document.getElementById("taskList"));
  
  const textarea = document.getElementById("textInput");
  textarea.value = output.join("\n");
}
