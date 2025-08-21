function exportToLocalStorage() {
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
  
  try {
    localStorage.setItem("savedText", output.join("\n"));
    return true;
  } catch (e) {
    console.error('Failed to save to LocalStorage:', e);
    return false;
  }
}

function saveToLocalStorage(isAutoSave = false) {
  const success = exportToLocalStorage();
  if (success) {
    window.showToast(isAutoSave ? '✨ List auto-saved' : '💾 List saved successfully');
  } else {
    window.showToast('❌ Failed to save list', 'error');
  }
}

function processList(newText) {
  const taskList = document.getElementById("taskList");
  
  const text = newText || localStorage.getItem("savedText") || ``;
  const lines = text.split("\n").filter(line => line.trim() !== "");
  // // Basic format validation}
  // const hasValidTask = lines.some(line => line.trim().match(/^\s*\[[ x]\]\s+\S+/));
  
  // if (!hasValidTask) {
  //   throw new Error("Invalid task list format");
  // }
  
  taskList.style.animation = "none";
  void taskList.offsetWidth;
  taskList.style.animation = "fadeIn 0.5s ease-out forwards";
  
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

    li.setAttribute("data-description", description);

    li.innerHTML = `
      <button class="btn-toggle" onclick="toggleChildren(this)">▼</button>
      <button onclick="removeTask(this)">🗑</button>
      <input type="checkbox" ${isChecked ? "checked" : ""}>
      <span contenteditable="true" placeholder="Task name">${text}</span>
      <button onclick="openModal(this)">📝</button>
      <button onclick="addTask('Subtask', this.parentElement.querySelector('.subtasks'), ${level + 1})">+</button>
      <div class="task-description ${description ? "" : "hidden"}">${innerDescription}</div>
      <ul class="subtasks task"></ul>
    `;

    window.addTaskEventListeners(li);

    while (stack[stack.length - 1].level >= level) stack.pop();
    stack[stack.length - 1].element.appendChild(li);
    stack.push({ element: li.querySelector(".subtasks"), level });

    setTimeout(() => {
      const toggleButton = li.querySelector(".btn-toggle");

      // minimize the toggle button if there are no subtasks
      const subtasks = li.querySelectorAll(".subtasks input[type='checkbox']");
      if (subtasks.length > 0 && Array.from(subtasks).every(cb => cb.checked)) {
        window.toggleChildren(toggleButton);
      }

      // disable the toggle button if there are no subtasks and no description
      const hasSubtasks = li.querySelector(".subtasks").children.length > 0;
      const description = li.getAttribute("data-description") || "";
      if (!hasSubtasks && description.trim() === "") {
        toggleButton.disabled = true;
        toggleButton.style.color = "#0000";
      } else {
        toggleButton.disabled = false;
        toggleButton.style.color = "";
      }
    }, 10);
  });
}

function saveToFile() {
  window.storageManager.saveToLocalStorage();
  const text = localStorage.getItem("savedText") || "";
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const filename = `todo-list_${new Date().toISOString().replaceAll(/[T:-]/g, ' ').split('.')[0]}.txt`;
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  window.showToast(`📄 List saved to ${filename}`);
  fabMenuPanel.classList.remove("show");
}

async function loadFile() {
    const file = fileLoader.files && fileLoader.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      
      // Basic format validation: at least one valid task line
      // TODO: test with unvalid files to only accept the valid ones
      const hasValidTask = text.split('\n').some(line => {
        return line.trim().match(/^\s*\[[ x]\]\s+\S+/); // Matches "[ ]" or "[x]" followed by non-whitespace
      });
      
      if (!hasValidTask) {
        throw new Error("Invalid file format. Expected tasks with '[ ]' or '[x]' markers.");
      }

      localStorage.setItem("savedText", text);
      window.processList();
      window.showToast(`📄 Loaded ${file.name} successfully`);
    } catch (error) {
      console.error('Failed to load file:', error);
      window.showToast(`❌ ${error.message || 'Failed to load file'}`, 'error');
    }
    fabMenuPanel.classList.remove("show");
}

window.processList = processList; 
window.storageManager = {
  saveToLocalStorage,
  saveToFile,
  loadFile
};