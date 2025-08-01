// Global variables
window.insertionLine = null;
window.draggedTask = null;
window.lastParent = null;

// Event listeners
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
    window.processList();
  }
});