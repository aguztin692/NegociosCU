let negocios = JSON.parse(localStorage.getItem("negocios")) || [];
let editando = null;
let vista = "todos";

const lista = document.getElementById("lista");
const filtroUbicacion = document.getElementById("filtroUbicacion");
const buscador = document.getElementById("buscador");

function render() {
  lista.innerHTML = "";

  if (vista === "pagina") {
    lista.innerHTML = `
      <div class="card">
        <h2>🌐 Crea tu página</h2>
        <p>¿Quieres una página profesional para tu negocio?</p>
        <p>Contáctanos y nosotros la creamos por ti.</p>

        <br>

        <p>📧 contacto@negocioscu.com</p>
        <p>📱 WhatsApp: 667-000-0000</p>
      </div>
    `;
    return;
  }

  if (vista === "estudio") {
    lista.innerHTML = `
      <div class="card">
        <h2>📊 Estudio de mercado</h2>
        <p>Recibe información sobre los productos más vendidos en CU.</p>

        <br>

        <input type="email" placeholder="Tu correo">
        <button>Registrarme</button>
      </div>
    `;
    return;
  }

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
      (n.productos && n.productos.some(p =>
        p.nombre.toLowerCase().includes(texto)
      ))
    );
  }

  datos.forEach((n) => {
    const index = negocios.indexOf(n);

    const div = document.createElement("div");
    div.classList.add("card");

    // ✅ ahora SIEMPRE abre el detalle
    div.onclick = () => abrirDetalle(index);

    const numero = n.contacto ? n.contacto.replace(/\D/g, "") : "";

    const primerProducto = n.productos && n.productos.length > 0
      ? n.productos[0]
      : null;

    div.innerHTML = `
      ${n.imagen ? `
      <div class="img-container">
        <img src="${n.imagen}">
      </div>
      ` : ""}

      <span class="tag ${n.categoria}">${n.categoria}</span>  
      <h3>${n.nombre}</h3>

      <p><strong>${primerProducto?.nombre || "Sin producto"}</strong></p>
      
      <p>💰 $${primerProducto?.precio || "N/A"}</p>

      ${n.productos && n.productos.length > 1 ? `
        <small>+ ${n.productos.length - 1} productos más</small>
      ` : ""}

      <p>📍 ${n.ubicacion || "Sin ubicación"}</p>
      <p>⏱️ ${n.horario || "Sin horario"}</p>

      <small>${n.contacto || "Sin contacto"}</small><br><br>

      ${n.contacto && primerProducto ? `
        <a class="btn-whatsapp" 
        href="https://wa.me/${numero}?text=Hola,%20quiero%20pedir:%20${primerProducto.nombre}%20-%20$${primerProducto.precio}" 
        target="_blank"
        onclick="event.stopPropagation()">
          💬 Pedir
        </a>
      ` : ""}

      <br><br>

      <div class="acciones">
        <button onclick="event.stopPropagation(); editar(${index})">✏️</button>
        <button onclick="event.stopPropagation(); eliminar(${index})">🗑️</button>
        <button onclick="event.stopPropagation(); fav(${index})">
          ${n.favorito ? "⭐" : "☆"}
        </button>
      </div>
    `;

    lista.appendChild(div);
  });
}

function abrirModal() {
  document.getElementById("modal").classList.add("active");

  const contenedor = document.getElementById("listaProductos");

  // si está vacío, agrega uno automáticamente
  if (contenedor.children.length === 0) {
    agregarProducto();
  }
}

function cerrarModal() {
  document.getElementById("modal").classList.remove("active");
  limpiar();
}

function guardar() {
  const nombre = document.getElementById("nombre").value;
  const categoria = document.getElementById("categoria").value;
  const contacto = document.getElementById("contacto").value;
  const fileNegocio = document.getElementById("imagen").files[0];
  const ubicacion = document.getElementById("ubicacion").value;
  const horario = document.getElementById("horario").value;

  const items = document.querySelectorAll("#listaProductos .producto-item");

  if (!nombre || !categoria || !contacto) {
    alert("Completa los datos principales");
    return;
  }

  if (items.length === 0) {
    alert("Agrega al menos un producto");
    return;
  }

  let productos = [];
  let procesados = 0;

  items.forEach((div, i) => {
    const inputs = div.querySelectorAll("input");

    const nombreProd = inputs[0].value.trim();
    const precioProd = inputs[1].value.trim();
    const fileProd = inputs[2].files[0];

    if (!nombreProd) {
      procesados++;
      return;
    }

    // 📸 si tiene imagen
    if (fileProd) {
      const reader = new FileReader();
      reader.onload = e => {
        productos[i] = {
          nombre: nombreProd,
          precio: precioProd,
          imagen: e.target.result
        };
        procesados++;
        if (procesados === items.length) continuar();
      };
      reader.readAsDataURL(fileProd);
    } else {
      productos[i] = {
        nombre: nombreProd,
        precio: precioProd,
        imagen: null
      };
      procesados++;
      if (procesados === items.length) continuar();
    }
  });

  // 📸 imagen del negocio
  function guardarFinal(imagenNegocio) {
    const obj = {
      nombre,
      categoria,
      productos,
      contacto,
      ubicacion,
      horario,
      imagen: imagenNegocio || (editando !== null ? negocios[editando].imagen : null),
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

  function continuar() {
    if (fileNegocio) {
      const reader = new FileReader();
      reader.onload = e => guardarFinal(e.target.result);
      reader.readAsDataURL(fileNegocio);
    } else {
      guardarFinal(null);
    }
  }
}
function editar(i) {
  const n = negocios[i];

  // soporte para datos viejos (muy importante)
  if (!n.productos) {
    n.productos = [
      {
        nombre: n.producto,
        precio: n.precio
      }
    ];
  }

  // tomar el primer producto
  const primerProducto = n.productos[0] || { nombre: "", precio: "" };

  document.getElementById("nombre").value = n.nombre;
  document.getElementById("categoria").value = n.categoria;
  document.getElementById("producto").value = primerProducto.nombre;
  document.getElementById("precio").value = primerProducto.precio;
  document.getElementById("contacto").value = n.contacto;
  document.getElementById("ubicacion").value = n.ubicacion || "";
  document.getElementById("horario").value = n.horario || "";

  editando = i;
  abrirModal();
}
function eliminar(i) {
  if (confirm("¿Eliminar este negocio?")) {
    negocios.splice(i, 1);
    localStorage.setItem("negocios", JSON.stringify(negocios));
    render();
  }

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
function abrirDetalle(i) {
  const n = negocios[i];

  if (!n) return; // seguridad

  const numero = n.contacto ? n.contacto.replace(/\D/g, "") : "";

  // 🔥 soporte datos viejos
  if (!n.productos) {
    n.productos = [
      {
        nombre: n.producto || "Producto",
        precio: n.precio || "N/A",
        imagen: null
      }
    ];
  }

  let productosHTML = "";

  n.productos.forEach(p => {
    productosHTML += `
      <div class="producto">
        ${p.imagen ? `<img src="${p.imagen}" class="producto-img">` : ""}

        <div>
          <p><strong>${p.nombre}</strong></p>
          <p>💰 $${p.precio}</p>
        </div>

        ${numero ? `
        <a class="btn-whatsapp"
          href="https://wa.me/${numero}?text=Hola,%20quiero:%20${p.nombre}%20-%20$${p.precio}"
          target="_blank">
          Pedir
        </a>
        ` : ""}
      </div>
    `;
  });

  const detalleInfo = document.getElementById("detalleInfo");

  if (!detalleInfo) return; // seguridad

  detalleInfo.innerHTML = `
    ${n.imagen ? `<img src="${n.imagen}" class="detalle-img">` : ""}

    <h2>${n.nombre}</h2>
    <p>📍 ${n.ubicacion || "Sin ubicación"}</p>
    <p>⏱️ ${n.horario || "Sin horario"}</p>

    <hr>    

    <h3>Productos</h3>

    ${productosHTML}
  `;

  document.getElementById("detalle").style.display = "flex";
}
function cerrarDetalle() {
  const detalle = document.getElementById("detalle");
  const info = document.getElementById("detalleInfo");

  if (detalle) detalle.style.display = "none";
  if (info) info.innerHTML = "";
}
function agregarProducto(nombre = "", precio = "") {
  const div = document.createElement("div");
  div.classList.add("producto-item");

  div.innerHTML = `
    <input type="text" placeholder="Producto" value="${nombre}">
    <input type="number" placeholder="Precio" value="${precio}">
    <input type="file" accept="image/*" onclick="event.stopPropagation()">
    <button type="button" onclick="event.stopPropagation(); this.parentElement.remove()">❌</button>
  `;

  document.getElementById("listaProductos").appendChild(div);
}
function cambiarVista(tipo) {
  vista = tipo;
  render();
}
buscador.addEventListener("input", render); 
render();
