function exportList() { // this function is usefull rn cause that input is hidden. It's here just because I can export the text as a file later, I just haven't done that implementation yet.
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

function saveToLocalStorage() {
  exportList();
  localStorage.setItem("savedText", document.getElementById("textInput").value);
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
      innerDescription = window.replaceURLsWithContent(description);
      innerDescription = window.processLists(innerDescription);
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

    window.addTaskEventListeners(li);

    while (stack[stack.length - 1].level >= level) stack.pop();
    stack[stack.length - 1].element.appendChild(li);
    stack.push({ element: li.querySelector(".subtasks"), level });
    window.observer.observe(li.querySelector("ul.subtasks"));
    window.addTreeLines(li);

    setTimeout(() => {
      const toggleButton = li.querySelector(".btn-toggle");

      // minimize the toggle button if there are no subtasks
      const subtasks = li.querySelectorAll(".subtasks input[type='checkbox']");
      if (subtasks.length > 0 && Array.from(subtasks).every(cb => cb.checked)) {
        window.toggleChildren(toggleButton);
      }

      // disable the toggle button if there are no subtasks and no description
      const hasSubtasks = li.querySelector(".subtasks").children.length > 0;
      if (!hasSubtasks && description.trim() === "") {
        toggleButton.disabled = true;
        toggleButton.style.color = "#0000";
      }
    }, 10);
  });
  
  window.animateReapearAllTreeLines();
  setTimeout(() => {
    window.updateAllTreeLines();
  }, 500);
}

window.exportList = exportList;
window.saveToLocalStorage = saveToLocalStorage;
window.processList = processList; 