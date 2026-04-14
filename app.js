let negocios = JSON.parse(localStorage.getItem("negocios")) || [];
let editando = null;
let vista = "todos";

const lista = document.getElementById("lista");
const filtroUbicacion = document.getElementById("filtroUbicacion");
const buscador = document.getElementById("buscador");

function render() {
  lista.innerHTML = "";

  let datos = negocios;

  if (vista === "favoritos") {
    datos = datos.filter(n => n.favorito);
  }

  if (filtroUbicacion.value !== "") {
    datos = datos.filter(n => n.ubicacion === filtroUbicacion.value);
  }

  if (buscador.value !== "") {
    const texto = buscador.value.toLowerCase();
    datos = datos.filter(n =>
      n.nombre.toLowerCase().includes(texto) ||
      n.producto.toLowerCase().includes(texto)
    );
  }

  datos.forEach((n, i) => {
    const div = document.createElement("div");
    div.classList.add("card");

    const numero = n.contacto ? n.contacto.replace(/\D/g, "") : "";

    div.innerHTML = `
      ${n.imagen ? `
      <div class="img-container">
        <img src="${n.imagen}">
      </div>
      ` : ""}

      <span class="tag">${n.categoria}</span>
      <h3>${n.nombre}</h3>

      <p>${n.producto}</p>

      <p>📍 ${n.ubicacion || "Sin ubicación"}</p>
      <p>⏱️ ${n.horario || "Sin horario"}</p>

      <small>${n.contacto || "Sin contacto"}</small><br><br>

      ${n.contacto ? `
        <a class="btn-whatsapp" href="https://wa.me/${numero}" target="_blank">
          💬 Contactar
        </a>
      ` : ""}

      <br><br>

      <button onclick="editar(${i})">✏️</button>
      <button onclick="eliminar(${i})">🗑️</button>
      <button onclick="fav(${i})">
        ${n.favorito ? "⭐" : "☆"}
      </button>
    `;

    lista.appendChild(div);
  });
}

function abrirModal() {
  document.getElementById("modal").style.display = "block";
}

function cerrarModal() {
  document.getElementById("modal").style.display = "none";
  limpiar();
}

function guardar() {
  const nombre = document.getElementById("nombre").value;
  const categoria = document.getElementById("categoria").value;
  const producto = document.getElementById("producto").value;
  const contacto = document.getElementById("contacto").value;
  const file = document.getElementById("imagen").files[0];
  const ubicacion = document.getElementById("ubicacion").value;
  const horario = document.getElementById("horario").value;

  if (!nombre || !categoria || !producto || !contacto) {
    alert("Completa todo");
    return;
  }

  if (file) {
    const reader = new FileReader();
    reader.onload = e => guardarFinal(e.target.result);
    reader.readAsDataURL(file);
  } else {
    guardarFinal(null);
  }

  function guardarFinal(imagen) {
    const obj = {
      nombre,
      categoria,
      producto,
      contacto,
      ubicacion,
      horario,
      imagen: imagen || (editando !== null ? negocios[editando].imagen : null),
      favorito: editando !== null ? negocios[editando].favorito : false
    };
    if (editando !== null) {
      negocios[editando] = obj;
      editando = null;
    } else {
      negocios.push(obj);
    }

    localStorage.setItem("negocios", JSON.stringify(negocios));
    cerrarModal();
    render();
  }
}

function editar(i) {
  const n = negocios[i];

  document.getElementById("nombre").value = n.nombre;
  document.getElementById("categoria").value = n.categoria;
  document.getElementById("producto").value = n.producto;
  document.getElementById("contacto").value = n.contacto;
  document.getElementById("ubicacion").value = n.ubicacion || "";
  document.getElementById("horario").value = n.horario || "";


  editando = i;
  abrirModal();
}

function eliminar(i) {
  negocios.splice(i, 1);
  localStorage.setItem("negocios", JSON.stringify(negocios));
  render();
}

function fav(i) {
  negocios[i].favorito = !negocios[i].favorito;
  localStorage.setItem("negocios", JSON.stringify(negocios));
  render();
}

function mostrarSeccion(tipo) {
  vista = tipo;
  render();
}

function limpiar() {
  document.getElementById("nombre").value = "";
  document.getElementById("categoria").value = "";
  document.getElementById("producto").value = "";
  document.getElementById("contacto").value = "";
  document.getElementById("ubicacion").value = "";
  document.getElementById("horario").value = "";
  document.getElementById("imagen").value = "";
}

if (filtroUbicacion) {
  filtroUbicacion.addEventListener("change", () => {
    render();
  });
}
buscador.addEventListener("input", render); 
render();