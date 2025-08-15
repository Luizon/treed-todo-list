function addTask(text = "", parent = document.getElementById("taskList"), level = 0) {
  const li = document.createElement("li");
  const taskType = level === 0 ? "main-task" : "subtask";
  li.classList.add(taskType);
  li.style.setProperty('--level', level);

  li.innerHTML = `
    <button class="btn-toggle" onclick="toggleChildren(this)" disabled style="color: #0000;">▼</button>
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
  
  addTaskEventListeners(li);
  window.observer.observe(li.querySelector("ul.subtasks"));

  if(level > 0) {
    parent.parentElement.querySelector(".btn-toggle").disabled = false;
    parent.parentElement.querySelector(".btn-toggle").style.color = "";
    if(parent.classList.contains("hidden")) {
      window.maximize(parent, parent.parentElement.querySelector(".task-description"));
    }
  }

  const parentTask = parent.closest("li");
  if (parentTask) {
    window.uncheckParentHierarchy(parentTask);
  }

  li.style.animation = "none";
  void li.offsetWidth; // Force reflow
  li.style.animation = "fadeInTask 0.4s ease-out forwards";

  li.querySelector("span").focus();
  
  const range = document.createRange();
  range.selectNodeContents(li.querySelector("span"));
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
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
      toggleButton.disabled = !hasSubtasks && !hasDescription;
      toggleButton.style.color = toggleButton.disabled ? "#0000" : "";

      window.validateParentOnRemove(parentTask);
    }
  }, 400);
}

function addTaskEventListeners(li) {
  window.setupDragAndDrop(li);
}

window.addTask = addTask;
window.removeTask = removeTask;
window.addTaskEventListeners = addTaskEventListeners; 