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
