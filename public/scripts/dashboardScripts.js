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

window.fileSize = function (size) {
  if (bytes == null) return "-";
  //File size is max 5MB but adding just in case I update later.
  const unitSize = ["B", "KB", "MB", "GB", "TB"];

  let i = 0;
  let currentSize = size;

  while (currentSize >= 1024 && unitSize.length - 1) {
    currentSize /= 1024;
    i++;
  }
  return (
    currentSize.toFixed(currentSize >= 10 || i === 0 ? 0 : 1) +
    " " +
    unitSize[i]
  );
};
