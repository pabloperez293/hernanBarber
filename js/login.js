// Usuario y clave definidos
const USER = "barber";
const PASS = "1234";

document.getElementById("loginForm").addEventListener("submit", function(e){
  e.preventDefault();

  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  if(user === USER && pass === PASS){
    // Guardamos sesión simple
    localStorage.setItem("auth", "true");
    window.location.href = "/index.html";
  } else {
    document.getElementById("error").textContent = "Usuario o contraseña incorrectos, contactarse con el admin.";
  }
});
