// Global variables
window.insertionLine = null;
window.draggedTask = null;
window.lastParent = null;

// Event listeners
document.addEventListener("keydown", event => {
  if(event.key === "Escape") {
    const modal = document.getElementById("descriptionModal");
    if (modal.classList.contains("show")) {
      window.closeModal();
    }
  }
});

document.addEventListener('keydown', (e) => {
  if(e.ctrlKey || e.metaKey) {
    if(e.key.toLowerCase() === 's') {
      e.preventDefault();
      e.shiftKey ? window.storageManager.saveToFile() : window.storageManager.saveToLocalStorage();
    }
    else if(e.key.toLowerCase() === 'o') {
      e.preventDefault();
      fileLoader.value = "";
      fileLoader.click();
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const savedText = localStorage.getItem("savedText");
  if (savedText) {
    window.processList();
  }

  const taskList = document.getElementById("taskList");
  // Delegate checkbox changes
  taskList.addEventListener("change", (e) => {
    const target = e.target;
    if (target && target.matches("input[type='checkbox']")) {
      window.handleCheckboxChange(target);
    }
  });

  // Delegate contenteditable changes
  taskList.addEventListener("input", (e) => {
    const target = e.target;
    if (target && target.matches("span[contenteditable]")) {
      // intentional: rely on manual/periodic saves
    }
  });

  // Single FAB to toggle menu
  const fabButton = document.getElementById("fabButton");
  const fabMenuPanel = document.getElementById("fabMenuPanel");
  const fileLoader = document.getElementById("fileLoader");

  if (fabButton && fabMenuPanel) {
    fabButton.addEventListener("click", () => {
      fabMenuPanel.classList.toggle("show");
    });
  }

  // Add main task
  const menuAddMain = document.getElementById("menuAddMain");
  if (menuAddMain) {
    menuAddMain.addEventListener("click", () => {
      window.addTask();
      fabMenuPanel.classList.remove("show");
    });
  }

  const menuQuickSave = document.getElementById("menuQuickSave");
  if (menuQuickSave) {
    menuQuickSave.addEventListener("click", () => {
      window.storageManager.saveToLocalStorage();
      fabMenuPanel.classList.remove("show");
    });
  }

  const menuSaveFile = document.getElementById("menuSaveFile");
  if (menuSaveFile) {
    menuSaveFile.addEventListener("click", window.storageManager.saveToFile);
  }

  const menuLoadFile = document.getElementById("menuLoadFile");
  if (menuLoadFile && fileLoader) {
    menuLoadFile.addEventListener("click", () => {
      fileLoader.value = "";
      fileLoader.click();
    });

    fileLoader.addEventListener("change", window.storageManager.loadFile);
  }

  const menuClearAll = document.getElementById("menuClearAll");
  const confirmModal = document.getElementById("confirmClearModal");
  
  if (menuClearAll && confirmModal) {
    menuClearAll.addEventListener("click", () => {
      confirmModal.classList.remove("hidden");
      confirmModal.classList.add("show");
      fabMenuPanel.classList.remove("show");
    });
  }

  window.confirmClear = () => {
    localStorage.removeItem("savedText");
    
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";
    
    window.showToast("🗑️ List cleared");
    closeConfirmModal();
  };

  window.closeConfirmModal = () => {
    const modal = document.getElementById("confirmClearModal");
    modal.classList.remove("show");
    modal.classList.add("hidden");
  };

  document.addEventListener("keydown", event => {
    if(event.key === "Escape") {
      const confirmModal = document.getElementById("confirmClearModal");
      if (confirmModal.classList.contains("show")) {
        closeConfirmModal();
      }
    }
  });

  setInterval(() => {
    window.storageManager.saveToLocalStorage(true);
  }, 60000);
});