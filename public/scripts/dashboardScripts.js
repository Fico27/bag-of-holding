window.confirmDelete = function (name) {
  return confirm(`Delete "${name}"? You cannot undo this.`);
};

window.renamePrompt = function (form) {
  const current = "";
  const next = prompt("New name:", current);

  if (next && next.trim()) {
    form.querySelector('input[name="name"]').value = next.trim();
    return true;
  }
  return false;
};

// Modal scripts

const overlay = document.getElementById("modalOverlay");
const content = document.getElementById("modalContent");
const closeBtn = () => (content.innerHTML = "");

function openModal(html) {
  content.innerHTML = html;
  overlay.classList.remove("hidden");
}
function closeModal() {
  overlay.classList.add("hidden");
}

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// Create folder UI

document.getElementById("showFolderModal").addEventListener("click", () => {
  const currentFolderId = window.currentFolderId || "";
  const html = `
    <button class="modal-close" onclick="closeModal()" aria-label="Close">×</button>
    <h3 class="text-lg font-semibold mb-3">Create New Folder</h3>
    <form action="/folders" method="post" class="modal-form">
      <input type="hidden" name="parentId" value="${currentFolderId}">
      <input type="text" name="name" placeholder="Folder name" required autofocus>
      <button type="submit" class="btn-primary">Create</button>
    </form>`;
  openModal(html);
});

// Upload file UI

document.getElementById("showUploadModal").addEventListener("click", () => {
  const currentFolderId = window.currentFolderId || "";
  const html = `
    <button class="modal-close" onclick="closeModal()" aria-label="Close">×</button>
    <h3 class="text-lg font-semibold mb-3">Upload File</h3>
    <form action="/files" method="post" enctype="multipart/form-data" class="modal-form">
      <input type="hidden" name="folderId" value="${currentFolderId}">
      <input type="file" name="file" required>
      <button type="submit" class="btn-primary">Upload</button>
    </form>`;
  openModal(html);
});
