let negocios = JSON.parse(localStorage.getItem("negocios")) || [];
let editando = null;
let vista = "todos";

const lista = document.getElementById("lista");
const filtroUbicacion = document.getElementById("filtroUbicacion");
const buscador = document.getElementById("buscador");

function render() {

  const hero = document.getElementById("hero");
  const contenidoHome = document.getElementById("contenidoHome");
  const btnMain = document.querySelector(".btn-main");
  
  lista.innerHTML = "";

  if (vista === "todos") {
  hero.style.display = "flex";
  contenidoHome.style.display = "block";
  } else {
    hero.style.display = "none";
    contenidoHome.style.display = "block";
  }

  if (vista === "productos") {

  hero.style.display = "none";
  contenidoHome.style.display = "block";

  lista.innerHTML = `
    <div class="card">
      <h2>🛍️ Publica tu negocio</h2>

      <p>
        Forma parte del marketplace universitario de CU y comienza a vender dentro del campus.
      </p>

      <br>

      <div class="plan-card">
        <h3>Plan Emprendedor</h3>
        <div class="precio">$300 MXN / mes</div>

        <p>
          Incluye publicación de productos, perfil del negocio y contacto directo por WhatsApp.
        </p>
      </div>

      <br>

      <button onclick="abrirModal()">
        Publicar mi negocio
      </button>
    </div>
  `;

  return;
}

  if (vista === "pagina") {
  lista.innerHTML = `
    <div class="card card-full">
      <h2>🌐 Página personalizada</h2>

      <p>Obtén una página profesional para tu negocio universitario.</p>

      <div class="planes">

        <div class="planes">

  <div class="plan-card">
    <h3>💼 Básica</h3>

    <p class="precio">$1,500 MXN</p>

    <small>
      Página informativa con datos de contacto y presentación del negocio.
    </small>
  </div>

  <div class="plan-card">
    <h3>🛍️ Catálogo</h3>

    <p class="precio">$3,500 MXN</p>

    <small>
      Catálogo de productos, integración con WhatsApp y diseño personalizado.
    </small>
  </div>

  <div class="plan-card">
    <h3>🚀 Premium</h3>

    <p class="precio">$6,000 MXN</p>

    <small>
      Diseño avanzado, branding, optimización móvil y funciones especiales.
    </small>
  </div>

</div>

      </div>

      <br>

      <p>📧 contacto@SpotU.com</p>
      <p>📱 WhatsApp: 667 575 9804</p>

      <button onclick="alert('Solicitud enviada correctamente ✅')">
        Solicitar información
      </button>
    </div>
  `;
  return;
}

  if (vista === "estudio") {
  lista.innerHTML = `
    <div class="card card-full">
      <h2>📊 Estudio de mercado</h2>

      <p>
        Conéctate y colabora con otros alumnos para realizar estudios de mercado colaborativos.
      </p>

      <br>

      <input type="email" id="correoEstudio" placeholder="Tu correo">

      <button onclick="registrarCorreo()">
        Registrarme
      </button>
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
    const productosPreview = n.productos?.slice(0, 2) || [];

    let previewHTML = "";

    productosPreview.forEach(p => {
      if (p.imagen) { 
        previewHTML += `<img src="${p.imagen}" class="preview-img">`;
      }
    });

    if (n.productos && n.productos.length > 2) {
      previewHTML += `<span class="extra">+${n.productos.length - 2}</span>`;
    }
    

    const div = document.createElement("div");
    div.classList.add("card");

    // ✅ ahora SIEMPRE abre el detalle
    div.onclick = () => abrirDetalle(n.id);
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

      <p>📍 ${n.ubicacion || "Sin ubicación"}</p>

      <div class="preview">
        ${previewHTML}  
      </div>

      <div class="acciones">
        <button onclick="event.stopPropagation(); editar(${n.id})">✏️</button>
        <button onclick="event.stopPropagation(); eliminar(${n.id})">🗑️</button>
        <button onclick="event.stopPropagation(); fav(${n.id})">
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
    const fileProd = inputs[2]?.files[0] || null;

    if (!nombreProd) {
      procesados++;
      return;
    }

    // 📸 si tiene imagen
    if (fileProd) {
    const reader = new FileReader();
    reader.onload = e => {
      productos.push({
        nombre: nombreProd,
        precio: precioProd,
        imagen: e.target.result
      });

      procesados++;
      if (procesados === items.length) continuar();
    };
    reader.readAsDataURL(fileProd);

  } else {
    productos.push({
      nombre: nombreProd,
      precio: precioProd,
      imagen: null
    });

    procesados++;
    if (procesados === items.length) continuar();
  }
  });

  // 📸 imagen del negocio
  function guardarFinal(imagenNegocio) {
    const obj = {
      id: Date.now(),
      nombre,
      categoria,
      productos,
      contacto,
      ubicacion,
      horario,
      imagen: imagenNegocio || (editando !== null ? negocios[editando].imagen : null),
      favorito: editando !== null ? negocios[editando].favorito : false
    };

    const confirmar = confirm(
      "Publicar este negocio tiene una tarifa de $300 MXN. ¿Deseas continuar?"
    );

    if (!confirmar) return;

    if (editando !== null) {

      obj.id = negocios[editando].id;

      negocios[editando] = obj;
      editando = null;

    } else {

      negocios.push(obj);

    }

    localStorage.setItem(
      "negocios",
      JSON.stringify(negocios)
    );

    alert("Pago procesado exitosamente ✅");

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
function editar(id) {

  const i = negocios.findIndex(n => n.id === id);

  if (i === -1) return;

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
  document.getElementById("contacto").value = n.contacto;
  document.getElementById("ubicacion").value = n.ubicacion || "";
  document.getElementById("horario").value = n.horario || "";

  editando = i;
  abrirModal();
}
function eliminar(id) {
  if (confirm("¿Eliminar este negocio?")) {
    const index = negocios.findIndex(n => n.id === id);
    if (index === -1) return;
    negocios.splice(index, 1);
    localStorage.setItem("negocios", JSON.stringify(negocios));
    render();
  }

}

function fav(id) {
  const negocio = negocios.find(
  n => n.id === id
  );
  if (!negocio) return;
  negocio.favorito = !negocio.favorito;

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
  document.getElementById("contacto").value = "";
  document.getElementById("ubicacion").value = "";
  document.getElementById("horario").value = "";
  document.getElementById("imagen").value = "";
  document.getElementById("listaProductos").innerHTML = "";
}
function abrirDetalle(id) {

  const n = negocios.find(
    n => n.id === id
  );

  if (!n) return;
 // seguridad

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
function agregarProducto() {
  const contenedor = document.getElementById("listaProductos");

  const div = document.createElement("div");
  div.classList.add("producto-item");

  div.innerHTML = `
    <input type="text" placeholder="Nombre del producto" class="prod-nombre">
    <input type="number" placeholder="Precio" class="prod-precio">
    <input type="file" class="prod-imagen">
    <button onclick="this.parentElement.remove()">❌</button>
  `;

  contenedor.appendChild(div);
} 
function cambiarVista(tipo) {
  vista = tipo;
  render();

  setTimeout(() => {
    document.getElementById("contenidoHome").scrollIntoView({
      behavior: "smooth"
    });
  }, 100);
}


let ultimoScroll = 0;

window.addEventListener("scroll", () => {
  const header = document.querySelector("header");

  if (window.scrollY > 50) {
    header.classList.add("compacto");
  } else {
    header.classList.remove("compacto");
  }
});

function registrarCorreo() {
  const correo = document.getElementById("correoEstudio").value;

  if (!correo) {
    alert("Ingresa un correo");
    return;
  }

  let correos = JSON.parse(localStorage.getItem("correosEstudio")) || [];

  correos.push(correo);

  localStorage.setItem("correosEstudio", JSON.stringify(correos));

  alert("Registro enviado correctamente ✅");
}

buscador.addEventListener("input", render); 
render();
