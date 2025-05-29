const taskList = document.getElementById("taskList");

function addTask(text = "New task", parent = taskList, level = 0) {
  const li = document.createElement("li");
  const taskType = level === 0 ? "main-task" : "subtask";
  li.classList.add(taskType);
  li.style.setProperty('--level', level);
  TEST = parent;

  li.innerHTML = `
    <button class="btn-toggle" onclick="toggleChildren(this)" disabled style="opacity: 0.5;">▼</button>
    <button onclick="removeTask(this)">🗑</button>
    <input type="checkbox">
    <span contenteditable="true">${text}</span>
    <button onclick="openModal(this)">📝</button>
    <button onclick="addTask('Subtask', this.parentElement.querySelector('.subtasks'), ${level + 1})">+</button>
    <div class="task-description hidden"></div>
    <ul class="subtasks task"></ul>
  `;

  li.setAttribute("data-description", "");
  parent.appendChild(li);
  li.querySelector("input").addEventListener("change", () => {
    exportList();
    localStorage.setItem("savedText", document.getElementById("textInput").value);
  });

  if(level > 0) {
    parent.parentElement.querySelector(".btn-toggle").disabled = false;
    parent.parentElement.querySelector(".btn-toggle").style.opacity = "1";

    TEST = parent;
    if(parent.classList.contains("hidden")) {
      maximize(parent, parent.parentElement.querySelector(".task-description"));
    }
  }

  li.style.animation = "none";
  void li.offsetWidth; // Force reflow
  li.style.animation = "fadeInTask 0.4s ease-out forwards";
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
    maximize(currentTaskElement.querySelector(".subtasks"), descElement);
    if(rawText.trim() === "")
      descElement.classList.add("hidden");

    const toggleButton = currentTaskElement.querySelector(".btn-toggle");
    const hasSubtasks = currentTaskElement.querySelector(".subtasks").children.length > 0;
    toggleButton.disabled = !hasSubtasks && rawText === "";
    toggleButton.style.opacity = toggleButton.disabled ? "0.5" : "1";
  }
  closeModal();
}

function maximize(sublist, description) {
  sublist.style.animation = "none";
  void sublist.offsetWidth;
  sublist.style.animation = "fadeInTask 0.3s ease-out forwards";
  sublist.classList.remove("hidden");

  const toggleButton = sublist.parentElement.querySelector(".btn-toggle");
  toggleButton.textContent = "▼";

  if (description.innerHTML.trim() !== "") {
    description.style.animation = "none";
    void description.offsetWidth;
    description.style.animation = "fadeInDescription 0.3s ease-out forwards";
    description.classList.remove("hidden");
  }
}

function minimize(sublist, description) {
  sublist.style.animation = "none";
  void sublist.offsetWidth;
  sublist.style.animation = "fadeOutSubtasks 0.3s ease-out forwards";
  setTimeout(() => sublist.classList.add("hidden"), 300);

  const toggleButton = sublist.parentElement.querySelector(".btn-toggle");
  toggleButton.textContent = "▶";

  if (description.innerHTML.trim() !== "") {
    description.style.animation = "none";
    void description.offsetWidth;
    description.style.animation = "fadeOutDescription 0.3s ease-out forwards";
    setTimeout(() => description.classList.add("hidden"), 300);
  }
}

function toggleChildren(button) {
  const taskElement = button.parentElement;
  const sublist = taskElement.querySelector(".subtasks");
  const description = taskElement.querySelector(".task-description");

  if(sublist.classList.contains("hidden")) {
    maximize(sublist, description);
  }
  else {
    minimize(sublist, description);
  }
}

function processList() {
  const taskList = document.getElementById("taskList");
  taskList.style.animation = "none";
  void taskList.offsetWidth;
  taskList.style.animation = "fadeIn 0.5s ease-out forwards";

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
      <button onclick="removeTask(this)">🗑</button>
      <input type="checkbox" ${isChecked ? "checked" : ""}>
      <span contenteditable="true">${text}</span>
      <button onclick="openModal(this)">📝</button>
      <button onclick="addTask('Subtask', this.parentElement.querySelector('.subtasks'), ${level + 1})">+</button>
      <div class="task-description ${description ? "" : "hidden"}">${description.replace(/\n/g, "<br>")}</div>
      <ul class="subtasks task"></ul>
    `;

    li.querySelector("input").addEventListener("change", () => {
      exportList();
      localStorage.setItem("savedText", document.getElementById("textInput").value);
    });

    while (stack[stack.length - 1].level >= level) stack.pop();
    stack[stack.length - 1].element.appendChild(li);
    stack.push({ element: li.querySelector(".subtasks"), level });

    setTimeout(() => {
      const toggleButton = li.querySelector(".btn-toggle");

      // minimize the toggle button if there are no subtasks
      const subtasks = li.querySelectorAll(".subtasks input[type='checkbox']");
      if (subtasks.length > 0 && Array.from(subtasks).every(cb => cb.checked)) {
        toggleChildren(toggleButton);
      }

      // disable the toggle button if there are no subtasks and no description
      const hasSubtasks = li.querySelector(".subtasks").children.length > 0;
      if (!hasSubtasks && description.trim() === "") {
        toggleButton.disabled = true;
        toggleButton.style.opacity = "0.5";
      }
    }, 10);
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

function removeTask(button) {
  const taskElement = button.parentElement;

  if(taskElement.classList.contains("removing")) return; // It's already being removed

  taskElement.style.animation = "none";
  void taskElement.offsetWidth; // Force reflow
  taskElement.style.animation = "fadeOutTask 0.4s ease-out forwards";

  taskElement.classList.add("removing");
  setTimeout(() => {
    const parentTask = taskElement.parentElement.closest("li");

    taskElement.remove();
    if (parentTask) {
      const hasSubtasks = parentTask.querySelector(".subtasks").children.length > 0;
      const hasDescription = parentTask.getAttribute("data-description").trim() !== "";
      const toggleButton = parentTask.querySelector(".btn-toggle");
      console.log(hasSubtasks, hasDescription, toggleButton);
      toggleButton.disabled = !hasSubtasks && !hasDescription;
      toggleButton.style.opacity = toggleButton.disabled ? "0.5" : "1";
    }

  }, 400);
}

document.getElementById("textInput").addEventListener("input", () => {
  localStorage.setItem("savedText", document.getElementById("textInput").value);
});

document.addEventListener("DOMContentLoaded", () => {
  const savedText = localStorage.getItem("savedText");
  if (savedText) {
    document.getElementById("textInput").value = savedText;
    processList();
  }
});