/* =========================================
   1. FUNCIONES AUXILIARES
========================================= */

const $ = (selector, contexto = document) =>
  contexto.querySelector(selector);

const $$ = (selector, contexto = document) =>
  [...contexto.querySelectorAll(selector)];

const formatoPrecio = (precio) =>
  "$ " + Number(precio || 0).toLocaleString("es-AR");

function normalizarTexto(texto = "") {
  return String(texto)
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}


/* =========================================
   2. BUSCADOR GENERAL
========================================= */

const botonBuscador = $("#abrirBuscador");
const panelBuscador = $("#panelBuscador");
const campoBuscador = $("#buscadorGeneral");
const botonEjecutarBusqueda = $("#ejecutarBusqueda");

if (botonBuscador && panelBuscador) {
  botonBuscador.addEventListener("click", () => {
    panelBuscador.classList.toggle("d-none");

    $("#panelPerfil")?.classList.add("d-none");

    if (!panelBuscador.classList.contains("d-none")) {
      campoBuscador?.focus();
    }
  });
}

function buscarProductos() {
  if (!campoBuscador) return;

  const textoOriginal = campoBuscador.value.trim();
  const texto = normalizarTexto(textoOriginal);

  if (!texto) {
    campoBuscador.focus();
    return;
  }

  // Buscar primero dentro del contenido de la página actual.
  const elementos = $$(
    "main h1, main h2, main h3, main p, main .product-card, main .producto-item, main .oferta, main .card"
  );

  let encontrados = 0;
  let primerResultado = null;

  elementos.forEach((elemento) => {
    const contenido = normalizarTexto(
      (elemento.dataset.search || "") + " " +
      elemento.textContent
    );

    if (contenido.includes(texto)) {
      encontrados++;

      if (!primerResultado) {
        primerResultado = elemento;
      }
    }
  });

  // Si hay coincidencias en esta página, quedarse aquí.
  if (primerResultado) {
    panelBuscador?.classList.add("d-none");

    primerResultado.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    primerResultado.classList.add("resultado-busqueda");

    setTimeout(() => {
      primerResultado.classList.remove("resultado-busqueda");
    }, 2000);

    let estado = $("#estadoBusqueda");

    if (!estado) {
      estado = document.createElement("p");
      estado.id = "estadoBusqueda";
      estado.setAttribute("role", "status");

      const main = $("main");

      if (main) {
        main.prepend(estado);
      }
    }

    if (estado) {
      estado.textContent =
        encontrados + (encontrados === 1
          ? " coincidencia encontrada en esta página."
          : " coincidencias encontradas en esta página.");
    }

    return;
  }

  // Si no está en esta página, buscar secciones conocidas.
  const rutas = [
    {
      palabras: ["sucursal", "sucursales", "local", "locales", "ubicacion"],
      pagina: "sucursale.html"
    },
    {
      palabras: ["color tendencia", "colores tendencias", "tendencias",
        "tendencia", "paleta", "colores", "color"],
      pagina: "colores.html"
    },
    {
      palabras: ["clientes", "cliente", "atencion",
        "asesoramiento", "asesoria"],
      pagina: "clientes.html"
    },
    {
      palabras: ["contactanos", "contacto", "consulta", "consultas"],
      pagina: "contactanos.html"
    }
  ];

  const rutaEncontrada = rutas.find((ruta) =>
    ruta.palabras.some((palabra) => texto.includes(palabra))
  );

  if (rutaEncontrada) {
    window.location.href = rutaEncontrada.pagina;
    return;
  }

  // No redirigir al catálogo si no se encontró una coincidencia.
  let estado = $("#estadoBusqueda");

  if (!estado) {
    estado = document.createElement("p");
    estado.id = "estadoBusqueda";
    estado.setAttribute("role", "status");

    const main = $("main");

    if (main) {
      main.prepend(estado);
    }
  }

  if (estado) {
    estado.textContent =
      `No encontramos "${textoOriginal}" en esta página ni en las secciones reconocidas.`;
  }

  panelBuscador?.classList.add("d-none");
}

botonEjecutarBusqueda?.addEventListener(
  "click",
  buscarProductos
);

campoBuscador?.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") {
    evento.preventDefault();
    buscarProductos();
  }
});

// Permite abrir el catálogo con una búsqueda desde otra página.
const parametrosURL = new URLSearchParams(window.location.search);
const busquedaInicial = parametrosURL.get("buscar");

if (busquedaInicial && $$(".product-card").length) {
  if (campoBuscador) {
    campoBuscador.value = busquedaInicial;
  }

  $$(".product-card").forEach((producto) => {
    const contenido = normalizarTexto(
      (producto.dataset.search || "") + " " +
      producto.textContent
    );

    producto.classList.toggle(
      "d-none",
      !contenido.includes(normalizarTexto(busquedaInicial))
    );
  });

  const estado = $("#estadoBusqueda");

  if (estado) {
    const cantidad = $$(".product-card:not(.d-none)").length;

    estado.textContent = cantidad
      ? `${cantidad} producto(s) encontrado(s) para "${busquedaInicial}".`
      : `No encontramos productos para "${busquedaInicial}".`;

    estado.classList.remove("d-none");
  }
}


/* =========================================
   3. PANEL DE PERFIL
========================================= */

const botonPerfil = $("#abrirPerfil");
const panelPerfil = $("#panelPerfil");
const formularioPerfil = $("#formPerfil");

botonPerfil?.addEventListener("click", () => {
  panelPerfil?.classList.toggle("d-none");
  panelBuscador?.classList.add("d-none");
});

$$("[data-close]").forEach((boton) => {
  boton.addEventListener("click", () => {
    const panel = $("#" + boton.dataset.close);
    panel?.classList.add("d-none");
  });
});

formularioPerfil?.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const mensaje = $("#mensajePerfil");

  if (mensaje) {
    mensaje.textContent =
      "El inicio de sesión todavía no está conectado a un sistema de usuarios.";
  }
});


/* =========================================
   4. CARRUSEL DE PRODUCTOS
========================================= */

const listaProductos = $("#productTrack");
const flechaAnterior = $("#productosPrev");
const flechaSiguiente = $("#productosNext");

flechaAnterior?.addEventListener("click", () => {
  if (!listaProductos) return;

  listaProductos.scrollBy({
    left: -listaProductos.clientWidth * 0.8,
    behavior: "smooth"
  });
});

flechaSiguiente?.addEventListener("click", () => {
  if (!listaProductos) return;

  listaProductos.scrollBy({
    left: listaProductos.clientWidth * 0.8,
    behavior: "smooth"
  });
});


/* =========================================
   5. CARRITO: CARGA Y GUARDADO
========================================= */

const CLAVE_CARRITO = "mundoPinturaCarrito";

function cargarCarrito() {
  try {
    const datos = JSON.parse(
      localStorage.getItem("mundoPinturaCarrito")
    );

    if (!Array.isArray(datos)) return [];

    return datos
      .filter((p) =>
        p &&
        typeof p.nombre === "string" &&
        (
          p.precio === null ||
          (
            Number.isFinite(Number(p.precio)) &&
            Number(p.precio) >= 0
          )
        )
      )
      .map((p) => ({
        nombre: p.nombre,
        precio: p.precio === null ? null : Number(p.precio),
        cantidad: Math.max(1, Number(p.cantidad) || 1)
      }));

  } catch (error) {
    console.error("Error al cargar el carrito:", error);
    return [];
  }
}

let carrito = cargarCarrito();

function guardarCarrito() {
  try {
    localStorage.setItem(
      CLAVE_CARRITO,
      JSON.stringify(carrito)
    );
  } catch (error) {
    console.error("No se pudo guardar el carrito:", error);
  }
}


/* =========================================
   6. MOSTRAR EL CARRITO
========================================= */

const botonCarrito = $("#abrirCarrito");
const botonCarritoFlotante = $("#abrirCarritoFlotante");
const panelCarrito = $("#cartDrawer") || $("#panelCarrito");
const fondoCarrito = $("#drawerBackdrop");
const botonCerrarCarrito = $("#cerrarCarrito");

function renderizarCarrito() {
  const cantidadTotal = carrito.reduce(
    (total, producto) => total + producto.cantidad,
    0
  );

  const contadorSuperior = $("#cartCount");
  const contadorFlotante = $("#floatingCartCount");

  if (contadorSuperior) {
    contadorSuperior.textContent = cantidadTotal;
  }

  if (contadorFlotante) {
    contadorFlotante.textContent = cantidadTotal;
  }

  const contenedor = $("#cartItems") || $("#listaCarrito");

  if (!contenedor) return;

  contenedor.replaceChildren();

  if (carrito.length === 0) {
    const aviso = document.createElement("p");
    aviso.className = "empty-cart";
    aviso.textContent = "Todavía no agregaste productos.";
    contenedor.appendChild(aviso);
  }

  carrito.forEach((producto, indice) => {
    const linea = document.createElement("div");
    linea.className = "cart-line";

    const informacion = document.createElement("div");

    const nombre = document.createElement("strong");
    nombre.textContent = producto.nombre;

    const detalle = document.createElement("small");
    detalle.textContent = producto.precio === null
      ? `${producto.cantidad} × Consultar precio`
      : `${producto.cantidad} × ${formatoPrecio(producto.precio)}`;

    informacion.append(nombre, detalle);

    const acciones = document.createElement("div");
    const subtotal = document.createElement("strong");

    subtotal.textContent = producto.precio === null
      ? "Consultar precio"
      : formatoPrecio(producto.precio * producto.cantidad);

    const botonQuitar = document.createElement("button");
    botonQuitar.type = "button";
    botonQuitar.textContent = "Quitar";
    botonQuitar.className = "btn-quitar";

    botonQuitar.addEventListener("click", () => {
      carrito.splice(indice, 1);
      guardarCarrito();
      renderizarCarrito();
    });

    acciones.append(subtotal, document.createElement("br"), botonQuitar);
    linea.append(informacion, acciones);
    contenedor.appendChild(linea);
  });

  const total = carrito.reduce(
    (suma, producto) =>
      suma + (producto.precio === null
        ? 0
        : producto.precio * producto.cantidad),
    0
  );

  const elementoTotal =
    $("#cartTotal") ||
    $("#totalCarrito") ||
    $("#totalPedido");

  if (elementoTotal) {
    const hayPreciosPendientes = carrito.some(
      (producto) => producto.precio === null
    );

    elementoTotal.textContent = formatoPrecio(total) +
      (hayPreciosPendientes ? " + productos a consultar" : "");
  }
}

/* =========================================
   7. AGREGAR PRODUCTOS
========================================= */

$$(".add-cart, [data-agregar]").forEach((boton) => {
  boton.addEventListener("click", () => {
    const tarjeta = boton.closest(".producto-item, .product-card");

    if (!tarjeta) return;

    const nombre =
      boton.dataset.name ||
      tarjeta.dataset.nombre ||
      tarjeta.querySelector("h3")?.textContent.trim();

    const precioTexto =
      boton.dataset.price ?? tarjeta.dataset.precio;

    const precio = precioTexto === "" || precioTexto == null
      ? null
      : Number(precioTexto);

    const cantidadElemento = tarjeta.querySelector(".cantidad-valor");
    const cantidad = Math.max(
      1,
      Number(cantidadElemento?.textContent) || 1
    );

    if (!nombre || (precio !== null &&
        (!Number.isFinite(precio) || precio < 0))) {
      alert("No se pudo identificar correctamente el producto.");
      return;
    }

    const existente = carrito.find(
      (producto) => producto.nombre === nombre
    );

    if (existente) {
      existente.cantidad += cantidad;

      if (existente.precio === null && precio !== null) {
        existente.precio = precio;
      }
    } else {
      carrito.push({ nombre, precio, cantidad });
    }

    if (cantidadElemento) {
      cantidadElemento.textContent = "1";
    }

    guardarCarrito();
    renderizarCarrito();

    const modalProducto = document.getElementById("modalProductoAgregado");
const mensajeProducto = document.getElementById("mensajeProductoAgregado");

if (mensajeProducto) {
  mensajeProducto.textContent =
    `${cantidad} unidad(es) de ${nombre} se agregaron correctamente al carrito.`;
}

if (modalProducto && window.bootstrap) {
  bootstrap.Modal.getOrCreateInstance(modalProducto).show();
}

    const textoOriginal = boton.textContent;
    boton.textContent = "¡Agregado!";

    window.setTimeout(() => {
      boton.textContent = textoOriginal;
    }, 1000);
  });
});

/* =========================================
   8. ABRIR Y CERRAR EL CARRITO
========================================= */


function abrirCarrito() {
  if (!panelCarrito) return;

  panelCarrito.hidden = false;
  panelCarrito.classList.add("open");
  panelCarrito.setAttribute("aria-hidden", "false");

  fondoCarrito?.classList.remove("d-none");
  document.body.classList.add("cart-open");

  botonCarrito?.setAttribute("aria-expanded", "true");
}

function cerrarCarrito() {
  if (!panelCarrito) return;

  panelCarrito.classList.remove("open");
  panelCarrito.hidden = true;
  panelCarrito.setAttribute("aria-hidden", "true");

  fondoCarrito?.classList.add("d-none");
  document.body.classList.remove("cart-open");

  botonCarrito?.setAttribute("aria-expanded", "false");
}

botonCarrito?.addEventListener("click", abrirCarrito);
botonCarritoFlotante?.addEventListener("click", abrirCarrito);
botonCerrarCarrito?.addEventListener("click", cerrarCarrito);
fondoCarrito?.addEventListener("click", cerrarCarrito);

/* =========================================
   9. VACIAR EL CARRITO
========================================= */

$("#vaciarCarrito")?.addEventListener("click", () => {
  carrito = [];
  guardarCarrito();
  renderizarCarrito();
});


/* =========================================
   10. FINALIZAR PEDIDO POR WHATSAPP
========================================= */

const formularioPedido = $("#formularioPedido");
const botonFinalizar = $("#finalizarCompra");
const selectorEntrega = $("#tipoEntrega");
const datosRetiro = $("#datosRetiro");
const datosEnvio = $("#datosEnvio");

// Modal de Bootstrap para completar el pedido
const elementoModalPedido = document.getElementById("modalPedido");

const modalPedido = elementoModalPedido && window.bootstrap
  ? bootstrap.Modal.getOrCreateInstance(elementoModalPedido)
  : null;

// Abrir el modal al pulsar "Finalizar pedido"
botonFinalizar?.addEventListener("click", () => {
  if (carrito.length === 0) {
    alert("Primero agregá algún producto al carrito.");
    return;
  }

  if (modalPedido) {
    modalPedido.show();
  } else {
    alert("No se pudo abrir el formulario. Recargá la página e intentá nuevamente.");
  }
});



// Mostrar los campos correspondientes a la entrega elegida
function actualizarTipoEntrega() {
  const tipo = selectorEntrega?.value || "";
  const esRetiro = tipo === "Retiro por sucursal";
  const esEnvio = tipo === "Envío a domicilio";

  if (datosRetiro) datosRetiro.hidden = !esRetiro;
  if (datosEnvio) datosEnvio.hidden = !esEnvio;

  const direccion = $("#direccionEntrega");
  const localidad = $("#localidadEntrega");

  if (direccion) direccion.required = esEnvio;
  if (localidad) localidad.required = esEnvio;
}

selectorEntrega?.addEventListener("change", actualizarTipoEntrega);



// Preparar el pedido y abrir WhatsApp
formularioPedido?.addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (carrito.length === 0) {
    alert("Tu carrito está vacío. Agregá algún producto antes de continuar.");
    return;
  }

  const nombre = $("#clienteNombre")?.value.trim() || "";
  const telefono = $("#clienteTelefono")?.value.trim() || "";
  const formaPago = $("#formaPago")?.value || "";
  const tipoEntrega = selectorEntrega?.value || "";

  if (!nombre || !telefono || !formaPago || !tipoEntrega) {
    alert("Completá todos los datos obligatorios del pedido.");
    return;
  }

  const esEnvio = tipoEntrega === "Envío a domicilio";
  const direccion = $("#direccionEntrega")?.value.trim() || "";
  const localidad = $("#localidadEntrega")?.value.trim() || "";
  const referencias = $("#referenciasEntrega")?.value.trim() || "";
  const sucursal = $("#sucursalRetiro")?.value.trim() || "";

  if (esEnvio && (!direccion || !localidad)) {
    alert("Completá la dirección y la localidad para el envío.");
    return;
  }

  const detallePedido = carrito.map((producto) => {
    if (producto.precio === null || producto.precio === undefined) {
      return `${producto.cantidad} × ${producto.nombre} — Precio a consultar`;
    }

    const subtotal = producto.precio * producto.cantidad;

    return (
      `${producto.cantidad} × ${producto.nombre} — ` +
      `${formatoPrecio(producto.precio)} c/u = ${formatoPrecio(subtotal)}`
    );
  }).join("\n");

  const totalConocido = carrito.reduce(
    (suma, producto) =>
      suma + (
        producto.precio === null || producto.precio === undefined
          ? 0
          : producto.precio * producto.cantidad
      ),
    0
  );

  const hayPreciosPendientes = carrito.some(
    (producto) => producto.precio === null || producto.precio === undefined
  );

  let detalleEntrega = "";

  if (esEnvio) {
    detalleEntrega =
      "Entrega: Envío a domicilio\n" +
      "Dirección: " + direccion + "\n" +
      "Localidad: " + localidad +
      (referencias ? "\nReferencias: " + referencias : "");
  } else {
    detalleEntrega =
      "Entrega: Retiro por sucursal\n" +
      "Podré retirar por cualquiera de las sucursales" +
      (sucursal ? "\nSucursal preferida: " + sucursal : "");
  }

  const numeroWhatsApp = "5492646607905";

  const mensaje =
    "Hola, Mundo Pintura. Quiero realizar el siguiente pedido:\n\n" +
    "DATOS DEL CLIENTE\n" +
    "Nombre: " + nombre + "\n" +
    "Teléfono: " + telefono + "\n\n" +
    "PRODUCTOS\n" +
    detallePedido + "\n\n" +
    "Total de precios conocidos: " + formatoPrecio(totalConocido) +
    (hayPreciosPendientes
      ? "\nHay productos cuyo precio está pendiente de confirmar."
      : "") +
    "\n\nFORMA DE PAGO\n" + formaPago +
    "\n\nENTREGA\n" + detalleEntrega +
    "\n\nPor favor, confirmen la disponibilidad y el importe final del pedido.";

  const url =
    "https://wa.me/" + numeroWhatsApp +
    "?text=" + encodeURIComponent(mensaje);

  const ventanaWhatsApp = window.open(url, "_blank");

  if (!ventanaWhatsApp) {
    window.location.href = url;
  }
});

/* =========================================
   11. BUSCADOR DE SUCURSALES
========================================= */

const buscarSucursal = $("#buscarSucursal");
const tarjetasSucursales = $$(".branch-item");
const sinResultados = $("#sinResultados");

buscarSucursal?.addEventListener("input", () => {
  const texto = normalizarTexto(buscarSucursal.value);
  let cantidadVisibles = 0;

  tarjetasSucursales.forEach((tarjeta) => {
    const contenido = normalizarTexto(
      tarjeta.textContent + " " +
      (tarjeta.dataset.sucursal || "")
    );

    const coincide = contenido.includes(texto);

    tarjeta.classList.toggle("d-none", !coincide);

    if (coincide) cantidadVisibles++;
  });

  if (sinResultados) {
    sinResultados.hidden = cantidadVisibles > 0;
  }
});



/* =========================================
   12. FORMULARIO DE CONTACTO
========================================= */

const formContacto = $("#formContacto");
const mensajeContacto = $("#mensajeFormulario");

formContacto?.addEventListener("submit", (evento) => {
  evento.preventDefault();

  // Validar los campos obligatorios
  if (!formContacto.checkValidity()) {
    formContacto.reportValidity();
    return;
  }

  const nombre = $("#nombre", formContacto)?.value.trim() || "";
  const email = $("#email", formContacto)?.value.trim() || "";
  const motivo = $("#motivo", formContacto)?.value || "";
  const mensaje = $("#mensaje", formContacto)?.value.trim() || "";

  if (!nombre || !email || !motivo || !mensaje) {
    if (mensajeContacto) {
      mensajeContacto.textContent =
        "Completá todos los campos antes de continuar.";
    }
    return;
  }

  // Simular el envío del formulario
  const modal = document.getElementById("modalConsultaEnviada");

  if (modal) {
    bootstrap.Modal.getOrCreateInstance(modal).show();
  }

  // Limpiar el formulario
  formContacto.reset();

  if (mensajeContacto) {
    mensajeContacto.textContent = "";
  }
});


/* ========================================
   MUNDO PINTURA - PERFIL
======================================== */

const formularioDatos = document.getElementById("formPerfilDatos");

if (formularioDatos) {
  const campoNombre = document.getElementById("perfilNombre");
  const campoEmail = document.getElementById("perfilEmail");
  const campoTelefono = document.getElementById("perfilTelefono");

  const resumenNombre = document.getElementById("resumenNombre");
  const resumenEmail = document.getElementById("resumenEmail");
  const estadoPerfil = document.getElementById("estadoPerfil");

  formularioDatos.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (!formularioDatos.checkValidity()) {
      formularioDatos.reportValidity();
      return;
    }

    resumenNombre.textContent = campoNombre.value.trim();
    resumenEmail.textContent = campoEmail.value.trim();

    estadoPerfil.textContent =
      "Los datos se actualizaron en esta pantalla. Todavía no se guardaron en una cuenta.";

    // El teléfono queda disponible en el campo del formulario.
    // Para guardar todos los datos de manera permanente,
    // hay que conectar un sistema de usuarios o una base de datos.
  });
}



/* =================================
   MODALES MUNDO PINTURA
================================= */

// MODAL DE BIENVENIDA
document.addEventListener("DOMContentLoaded", () => {
  const bienvenida = document.getElementById("modalBienvenida");

  if (bienvenida) {
    const modal = new bootstrap.Modal(bienvenida);
    modal.show();
  }
});














function mostrarModalConsultaEnviada() {
    const modal = document.getElementById("modalConsultaEnviada");

    if (modal) {
        bootstrap.Modal.getOrCreateInstance(modal).show();
    }
}

/* =========================================
   13. INICIALIZACIÓN
========================================= */

renderizarCarrito();