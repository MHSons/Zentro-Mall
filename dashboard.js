// dashboard.js — Admin management system

// Check login
if (!localStorage.getItem("admin_logged")) {
  window.location.href = "admin.html";
}

function loadAdmins() {
  return JSON.parse(localStorage.getItem("admin_users")) || [];
}

function saveAdmins(list) {
  localStorage.setItem("admin_users", JSON.stringify(list));
}

function renderAdminList() {
  const ul = document.getElementById("admin-list");
  const admins = loadAdmins();
  ul.innerHTML = "";

  admins.forEach((a, index) => {
    const li = document.createElement("li");
    li.className = "p-2 border-b flex justify-between items-center";
    li.innerHTML = `
      <span>${a.username}</span>
      <button data-id="${index}" class="remove-admin text-red-600">Delete</button>
    `;
    ul.appendChild(li);
  });

  document.querySelectorAll(".remove-admin").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const list = loadAdmins();
      list.splice(id, 1);
      saveAdmins(list);
      renderAdminList();
    });
  });
}

// Add New Admin
const modal = document.getElementById("modal");
const addBtn = document.getElementById("add-admin-btn");
const saveBtn = document.getElementById("save-admin");

addBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

saveBtn.addEventListener("click", () => {
  const user = document.getElementById("new-username").value.trim();
  const pass = document.getElementById("new-password").value.trim();

  if (!user || !pass) return;

  const list = loadAdmins();
  list.push({ username: user, password: pass });
  saveAdmins(list);
  modal.classList.add("hidden");
  renderAdminList();
});

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("admin_logged");
  window.location.href = "admin.html";
});

// Initial Load
enderAdminList();
