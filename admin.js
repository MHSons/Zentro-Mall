// admin.js - Simple login system with localStorage

const DEFAULT_ADMIN = {
  username: "admin",
  password: "12345"
};

// Save default admin if not exists
if (!localStorage.getItem("admin_users")) {
  localStorage.setItem("admin_users", JSON.stringify([DEFAULT_ADMIN]));
}

function login(username, password) {
  const admins = JSON.parse(localStorage.getItem("admin_users")) || [];
  return admins.find(a => a.username === username && a.password === password);
}

document.getElementById("admin-login").addEventListener("submit", function(e) {
  e.preventDefault();

  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (login(user, pass)) {
    localStorage.setItem("admin_logged", "true");
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("error").classList.remove("hidden");
  }
});
