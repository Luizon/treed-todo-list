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

function processLists(text) {
  const lines = text.split('\n');
  const html = [];
  const listStack = []; // stack of indents for open <ul>

  const openUl = (indent) => {
    html.push('<ul>');
    listStack.push(indent);
  };
  const closeUl = () => {
    html.push('</ul>');
    listStack.pop();
  };
  const topIndent = () => (listStack.length ? listStack[listStack.length - 1] : -1);

  for (let raw of lines) {
    const line = raw.replace(/\r$/, '');
    const liMatch = line.match(/^(\s*)[-*]\s+(.+)$/);

    if (liMatch) {
      const indent = liMatch[1].length;
      const content = liMatch[2];

      // Close lists only if we're going shallower
      while (listStack.length && indent < topIndent()) {
        closeUl();
      }
      // Open a new list if we're going deeper or there is no list yet
      if (!listStack.length || indent > topIndent()) {
        openUl(indent);
      }
      // Same indent: continue current <ul>
      html.push(`<li>${content}</li>`);
    } else {
      // Non-list line: close all open lists and keep the line with a newline
      while (listStack.length) closeUl();
      html.push(line + '\n');
    }
  }

  // Close any remaining lists
  while (listStack.length) closeUl();

  // Join without extra newlines so later \n -> <br> doesn't split list markup
  return html.join('');
}

function showInsertionLine(li, position) {
  if (!window.insertionLine) {
    window.insertionLine = document.createElement('div');
    window.insertionLine.className = 'insertion-line';
    document.body.appendChild(window.insertionLine);
  }
  const rect = li.getBoundingClientRect();
  window.insertionLine.style.width = rect.width + "px";
  window.insertionLine.style.left = rect.left + "px";
  if (position === "top") {
    window.insertionLine.style.top = rect.top + "px";
  } else if (position === "bottom") {
    window.insertionLine.style.top = rect.bottom + "px";
  } else if (position === "middle") {
    window.insertionLine.style.top = (rect.top + rect.height / 2) + "px";
  }
  window.insertionLine.style.display = "block";
}

function hideInsertionLine() {
  if (window.insertionLine) window.insertionLine.style.display = "none";
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

function openFullscreen(img) {
  const modal = document.createElement('div');
  modal.className = 'modal-img';
  modal.style.display = 'none';

  const clone = img.cloneNode(true);
  clone.style.maxWidth = '90%';
  clone.style.maxHeight = '90%';

  modal.appendChild(clone);
  document.body.appendChild(modal);

  requestAnimationFrame(() => {
    modal.style.display = 'flex';
  });

  modal.addEventListener('click', () => {
    modal.style.display = 'none';
    setTimeout(() => modal.remove(), 200);
  });
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Remove after 3s
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

window.openFullscreen = openFullscreen;
window.showInsertionLine = showInsertionLine;
window.hideInsertionLine = hideInsertionLine;
window.maximize = maximize;
window.minimize = minimize;
window.replaceURLsWithContent = replaceURLsWithContent;
window.processLists = processLists; 
window.showToast = showToast;