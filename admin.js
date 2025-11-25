// admin.js
const DEFAULT_ADMIN = { username: "superadmin", password: "admin123", role: "superadmin" };

// store admin users
if (!localStorage.getItem("admin_users")) {
  localStorage.setItem("admin_users", JSON.stringify([DEFAULT_ADMIN]));
}

function login(username,password){
  const admins = JSON.parse(localStorage.getItem("admin_users")||'[]');
  return admins.find(a=>a.username===username && a.password===password);
}

document.getElementById("admin-login").addEventListener("submit", function(e){
  e.preventDefault();
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const found = login(user,pass);
  if(found){
    // save current admin session (simple)
    localStorage.setItem("admin_logged", JSON.stringify({username:found.username, role:found.role}));
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("error").classList.remove("hidden");
  }
});
