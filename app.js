const DATA_URL = 'data.json';
let data = [];
let activeFolder = null;

const foldersEl = document.getElementById('folders');
const filesEl = document.getElementById('files');
const breadcrumbEl = document.getElementById('breadcrumb');
const fileInfoEl = document.getElementById('fileInfo');
const refreshBtn = document.getElementById('refreshBtn');
const filterInput = document.getElementById('filterInput');
const fitsCanvas = document.getElementById('fitsCanvas');
const ctx = fitsCanvas.getContext('2d');

refreshBtn.onclick = () => loadData(true);
filterInput.oninput = () => renderFolders();

async function loadData(force = false) {
  try {
    const res = await fetch(DATA_URL + (force ? `?t=${Date.now()}` : ''));
    if (!res.ok) throw new Error('Could not fetch data.json');
    data = await res.json();
    renderFolders();
    if (data.length && !activeFolder) {
      setActiveFolder(data[0].name);
    } else if (activeFolder) {
      setActiveFolder(activeFolder);
    }
  } catch (err) {
    console.error(err);
    foldersEl.innerHTML = `<li style="color:salmon">Failed to load data.json — check it exists</li>`;
  }
}

function renderFolders() {
  const q = filterInput.value.trim().toLowerCase();
  foldersEl.innerHTML = '';
  data.forEach(folder => {
    if (q && !folder.name.toLowerCase().includes(q)) return;
    const li = document.createElement('li');
    li.textContent = folder.name;
    li.dataset.name = folder.name;
    if (folder.files && folder.files.length) {
      const badge = document.createElement('span');
      badge.textContent = folder.files.length;
      badge.style.opacity = 0.6;
      badge.style.fontSize = '12px';
      li.appendChild(badge);
    }
    li.onclick = () => setActiveFolder(folder.name);
    if (folder.name === activeFolder) li.classList.add('active');
    foldersEl.appendChild(li);
  });
}

function setActiveFolder(name) {
  activeFolder = name;
  breadcrumbEl.textContent = `Home › ${name}`;
  Array.from(foldersEl.children).forEach(li => {
    li.classList.toggle('active', li.dataset.name === name);
  });
  const folder = data.find(d => d.name === name);
  renderFiles(folder ? folder.files : []);
}

function renderFiles(files = []) {
  filesEl.innerHTML = '';
  if (!files.length) {
    filesEl.innerHTML = '<li style="color:var(--muted)">No files in this folder</li>';
    return;
  }
  files.forEach(f => {
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.innerHTML = `<div style="font-weight:700">${f.name}</div><div class="meta">${f.date || 'unknown date'}</div>`;
    const right = document.createElement('div');
    const viewBtn = document.createElement('button');
    viewBtn.textContent = 'Open';
    viewBtn.onclick = (e) => { e.stopPropagation(); openFits(f.path, f.name); };
    right.appendChild(viewBtn);

    li.appendChild(left);
    li.appendChild(right);
    li.onclick = () => openFits(f.path, f.name);
    filesEl.appendChild(li);
  });
}

function openFits(path, filename) {
  fileInfoEl.textContent = filename;

  // Replace .fits extension with .jpg (or .png if you prefer)
  const jpegPath = path.replace(/\.fits$/i, '.jpg');

  const img = new Image();
  img.onload = () => {
    fitsCanvas.width = img.width;
    fitsCanvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  };
  img.onerror = () => {
    alert('JPEG preview not found for this FITS file.');
  };
  img.src = jpegPath;
}


loadData();
