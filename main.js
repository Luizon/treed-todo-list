const taskList = document.getElementById("taskList");
let insertionLine = null;

function addTask(text = "New task", parent = taskList, level = 0) {
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

  if(level > 0) {
    parent.parentElement.querySelector(".btn-toggle").disabled = false;
    parent.parentElement.querySelector(".btn-toggle").style.color = "#000F";
    if(parent.classList.contains("hidden")) {
      maximize(parent, parent.parentElement.querySelector(".task-description"));
    }
  }

  const parentTask = parent.closest("li");
  if (parentTask) {
    uncheckParentHierarchy(parentTask);
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

  saveToLocalStorage();
}

let currentTaskElement = null;

function openModal(button) {
  currentTaskElement = button.parentElement;
  const modal = document.getElementById("descriptionModal");
  const descriptionText = document.getElementById("descriptionText");

  descriptionText.value = currentTaskElement.getAttribute("data-description") || "";
  modal.style.display = "block";

  descriptionText.focus();
}

function closeModal() {
  document.getElementById("descriptionModal").style.display = "none";
}

function saveDescription() {
  if (currentTaskElement) {
    const rawText = document.getElementById("descriptionText").value.trim();
    currentTaskElement.setAttribute("data-description", rawText);

    let descElement = currentTaskElement.querySelector(".task-description");

    descElement.innerHTML = replaceURLsWithContent(rawText);
    descElement.innerHTML = descElement.innerHTML
        .replace(/(^|\n)( +)/g, (match, p1, spaces) => p1 + spaces.replace(/ /g, "&nbsp;")) // blank spaces
        .replace(/\n/g, "<br>") // break lines
    maximize(currentTaskElement.querySelector(".subtasks"), descElement);
    if(rawText.trim() === "")
      descElement.classList.add("hidden");

    const toggleButton = currentTaskElement.querySelector(".btn-toggle");
    const hasSubtasks = currentTaskElement.querySelector(".subtasks").children.length > 0;
    toggleButton.disabled = !hasSubtasks && rawText === "";
    toggleButton.style.color = toggleButton.disabled ? "#0000" : "#000f";

    saveToLocalStorage();
  }
  closeModal();
}

function replaceURLsWithContent(text) {
  const urlRegex = /\b(https?:\/\/[^\s\n\t]+)\b/g;

  return text.replace(urlRegex, (url) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const lowerURL = url.toLowerCase();

    if (imageExtensions.some(ext => lowerURL.includes(ext))) {
      return `<img src="${url}" class="description-image" tabindex="1" onclick="openFullscreen(this)">`;
    }
    return `<a href="${url}">${url}</a>`;
  });
}

function openFullscreen(img) {
  // Crear un contenedor modal si no existe
  let modal = document.getElementById("fullscreen-modal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "fullscreen-modal";
    modal.classList.add("modal-img");
    const modalImg = document.createElement("img");
    modal.appendChild(modalImg);
    document.body.appendChild(modal);

    document.addEventListener( "keydown", event => {
      if( event.key === "Escape" ) {
        modal.style.display = "none";
      }
    })
  }

  // Mostrar imagen en el modal
  modal.style.display = "flex";
  modal.querySelector("img").src = img.src;

  // Cerrar al hacer clic
  modal.onclick = () => {
    modal.style.display = "none";
  };
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
    let innerDescription = "";
    const descriptionMatch = line.match(/\[Description: (.+)\]$/);
    if (descriptionMatch) {
      description = descriptionMatch[1].replace(/\\n/g, "\n");
      innerDescription = replaceURLsWithContent(description);
      innerDescription = innerDescription
          .replace(/(^|\n)( +)/g, (match, p1, spaces) => p1 + spaces.replace(/ /g, "&nbsp;")) // blank spaces
          .replace(/\n/g, "<br>") // break lines
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
      <div class="task-description ${description ? "" : "hidden"}">${innerDescription}</div>
      <ul class="subtasks task"></ul>
    `;

    addTaskEventListeners(li);

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
        toggleButton.style.color = "#0000";
      }
    }, 10);
  });
}

function showInsertionLine(li, position) {
  if (!insertionLine) {
    insertionLine = document.createElement('div');
    insertionLine.className = 'insertion-line';
    document.body.appendChild(insertionLine);
  }
  const rect = li.getBoundingClientRect();
  insertionLine.style.width = rect.width + "px";
  insertionLine.style.left = rect.left + "px";
  if (position === "top") {
    insertionLine.style.top = rect.top + "px";
  } else if (position === "bottom") {
    insertionLine.style.top = rect.bottom + "px";
  } else if (position === "middle") {
    insertionLine.style.top = (rect.top + rect.height / 2) + "px";
  }
  insertionLine.style.display = "block";
}

function hideInsertionLine() {
  if (insertionLine) insertionLine.style.display = "none";
}

function addTaskEventListeners(li) {

  li.querySelector("input[type='checkbox']").addEventListener("change", (e) => handleCheckboxChange(li.querySelector("input[type='checkbox']")) );
  li.querySelector("span").addEventListener("input", (e) => saveToLocalStorage() );

  li.setAttribute("draggable", "true");

  li.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", null); // Necesario para Firefox
    if(window.draggedTask)
      return;
    window.draggedTask = li;
    window.lastParent = li.parentElement.closest("li");
    li.classList.add("dragging");
  });

  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
    window.draggedTask = null;
  });

  li.addEventListener("dragover", (e) => {
    e.preventDefault();
    if( e.target !== li && e.target.parentElement !== li )
      return;
    li.classList.add("drag-over");
    const rect = li.getBoundingClientRect();
    const mouseY = e.clientY;
    const topZone = rect.top + rect.height / 3;
    const bottomZone = rect.bottom - rect.height / 3;

    if (mouseY < topZone) {
      showInsertionLine(li, "top");
    } else if (mouseY > bottomZone) {
      showInsertionLine(li, "bottom");
    } else {
      showInsertionLine(li, "middle");
    }
  });

  li.addEventListener("dragleave", () => {
    li.classList.remove("drag-over");
    hideInsertionLine();
  });

  li.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    li.classList.remove("drag-over");
    hideInsertionLine();
    const dragged = window.draggedTask;
    if (
      dragged &&
      dragged !== li &&
      !dragged.contains(li)
    ) {
      const rect = li.getBoundingClientRect();
      const mouseY = e.clientY;
      const topZone = rect.top + rect.height / 3;
      const bottomZone = rect.bottom - rect.height / 3;

      if (mouseY < topZone) {
        li.parentElement.insertBefore(dragged, li);
        if (!li.parentElement.closest("li")) {
          dragged.classList.add("main-task");
          dragged.classList.remove("subtask");
        } else {
          dragged.classList.remove("main-task");
          dragged.classList.add("subtask");
        }
      } else if (mouseY > bottomZone) {
        li.parentElement.insertBefore(dragged, li.nextSibling);
        if (!li.parentElement.closest("li")) {
          dragged.classList.add("main-task");
          dragged.classList.remove("subtask");
        } else {
          dragged.classList.remove("main-task");
          dragged.classList.add("subtask");
        }
      } else {
        const sublist = li.querySelector(".subtasks");
        sublist.appendChild(dragged);
        dragged.classList.remove("main-task");
        dragged.classList.add("subtask");

        const toggleButton = li.querySelector(".btn-toggle");
        toggleButton.disabled = false;
        toggleButton.style.color = "#000f";
        maximize(sublist, li.querySelector(".task-description"));
      }

      const parentTask = li.closest("li");
      if (parentTask) {
        validateParentOnRemove(parentTask);
      }
      if (window.lastParent) {
        validateParentOnRemove(window.lastParent);
        const hasSubtasks = window.lastParent.querySelector(".subtasks").children.length > 0;
        const hasDescription = window.lastParent.getAttribute("data-description").trim() !== "";
        const toggleButton = window.lastParent.querySelector(".btn-toggle");
        toggleButton.disabled = !hasSubtasks && !hasDescription;
        toggleButton.style.color = toggleButton.disabled ? "#0000" : "#000f";
      }

      saveToLocalStorage();
    }
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
      toggleButton.disabled = !hasSubtasks && !hasDescription;
      toggleButton.style.color = toggleButton.disabled ? "#0000" : "#000f";

      validateParentOnRemove(parentTask);
    }

    saveToLocalStorage();
  }, 400);
}

function saveToLocalStorage() {
  exportList();
  localStorage.setItem("savedText", document.getElementById("textInput").value);
}

function validateParentOnRemove(task) {
  const list = task.querySelector(".subtasks");
  const siblingCheckboxes = list ? list.querySelectorAll("input[type='checkbox']") : [];
  const parentCheckbox = task.querySelector("input[type='checkbox']");

  if (siblingCheckboxes.length > 0) {
    const allChecked = Array.from(siblingCheckboxes).every(cb => cb.checked);
    parentCheckbox.checked = allChecked;
  }

  const grandParentTask = task.parentElement.closest("li");
  if (grandParentTask) {
    validateParentOnRemove(grandParentTask);
  }
}

function handleCheckboxChange(checkbox) {
  const parentTask = checkbox.closest("li").parentElement.closest("li");
  const sublist = checkbox.parentElement.querySelector(".subtasks");

  // check/uncheck children
  if (sublist && sublist.hasChildNodes()) {
    sublist.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = checkbox.checked);
  }

  if (parentTask) {
    checkParentHierarchy(parentTask);
  }

  if (!checkbox.checked && parentTask) {
    uncheckParentHierarchy(parentTask);
  }

  saveToLocalStorage();
}

function checkParentHierarchy(task) {
  const list = task.querySelector(".subtasks");
  const siblingCheckboxes = list ? list.querySelectorAll("input[type='checkbox']") : [];
  const parentCheckbox = task.querySelector("input[type='checkbox']");

  if (siblingCheckboxes.length > 0) {
    const allChecked = Array.from(siblingCheckboxes).every(cb => cb.checked);
    parentCheckbox.checked = allChecked;
  }

  const grandParentTask = task.parentElement.closest("li");
  if (grandParentTask && parentCheckbox.checked) {
    checkParentHierarchy(grandParentTask);
  }
}

function uncheckParentHierarchy(task) {
  const list = task.querySelector(".subtasks");
  const parentCheckbox = task.querySelector("input[type='checkbox']");

  if (parentCheckbox.checked) {
    parentCheckbox.checked = false;
  }

  const grandParentTask = task.parentElement.closest("li");
  if (grandParentTask) {
    uncheckParentHierarchy(grandParentTask);
  }
}

document.addEventListener("keydown", event => {
  if(event.key === "Escape") {
    document.getElementById("descriptionModal").style = "display: none;";
  }
});

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