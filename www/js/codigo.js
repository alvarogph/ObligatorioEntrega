navigator.geolocation.getCurrentPosition(GuardarUbicacion, MostrarError);
const BaseURL = "https://calcount.develotion.com/";
const BaseURLImage = "https://calcount.develotion.com/imgs/";
const ruteo = document.querySelector("#ruteo");
let paises = new Array();
let paisesBusqueda = new Array();
let alimentos = new Array();
let usuariosPaises = new Array();
let latitudDispositivo;
let longitudDispositivo;

let map;

Inicializar();

function Inicializar() {
  CargarPaisBusqueda();
  CargarPaises();
  CargarUsuariosPorPais();
  OcultarPantallas();
  OcultarOMostrarItemsMenu("none");
  AgregarEventos();

  if (
    localStorage.getItem("token") != null &&
    localStorage.getItem("token") != ""
  ) {
    ruteo.push("/AgregarComida");
  } else {
    OcultarOMostrarItemsMenu("none");
    ruteo.push("/");
  }
}

function OcultarOMostrarItemsMenu(display) {
  let itemsMenu = document.querySelectorAll(".Logueado");
  for (let i = 0; i < itemsMenu.length; i++) {
    itemsMenu[i].style.display = display;
  }
}

function OcultarOMostrarItemsMenuNoLogueado(display) {
  let itemsMenu = document.querySelectorAll(".noLogueado");
  for (let i = 0; i < itemsMenu.length; i++) {
    itemsMenu[i].style.display = display;
  }
}

function OcultarPantallas() {
  let pantallas = document.querySelectorAll(".ion-page");
  for (let i = 1; i < pantallas.length; i++) {
    pantallas[i].style.display = "none";
  }
}

function AgregarEventos() {
  ruteo.addEventListener("ionRouteWillChange", Navegar);
  document.querySelector("#btnLogin").addEventListener("click", Login);
  document.querySelector("#btnRegistro").addEventListener("click", Registro);
  document
    .querySelector("#btnRegistroComida")
    .addEventListener("click", RegistroComida);
  document
    .querySelector("#btnBuscador")
    .addEventListener("click", BuscadorComidas);
  document
    .querySelector("#btnBuscadorMapa")
    .addEventListener("click", BuscadorUsuariosPorPais);
}

function Navegar(evt) {
  OcultarPantallas();
  switch (evt.detail.to) {
    case "/Login":
      document.querySelector("#mensajeLogin").innerHTML = "";
      document.querySelector("#login").style.display = "block";
      break;
    case "/Registro":
      document.querySelector("#mensajeRegistro").innerHTML = "";
      CargarPaisesEnSelect();
      document.querySelector("#registro").style.display = "block";
      break;
    case "/RegistroComida":
      document.querySelector("#mensajeRegistroComida").innerHTML = "";
      ObtenerAlimentos();
      CargarAlimentosenSelect();
      document.querySelector("#registroComida").style.display = "block";
      break;
    case "/ListadoComidas":
      document.querySelector("#listadoComidas").style.display = "block";
      ObtenerAlimentos();
      ListadoComidas();
      break;
    case "/CerrarSesion":
      CerrarSesion();
      OcultarOMostrarItemsMenuNoLogueado("block");
      OcultarOMostrarItemsMenu("none");
      ruteo.push("/");
      break;
    case "/InformeCalorias":
      mostrarCalorias();
      document.querySelector("#informeCalorias").style.display = "block";
      break;
    case "/Mapa":
      document.querySelector("#mapa").style.display = "block";
      CargarMapa();
      setTimeout(() => {
        // CargarMapa(), 
       AgregarMarcadorAlMapa();
      }, 1000);

      break;
    default:
      document.querySelector("#inicio").style.display = "block";
      break;
  }
}

function CerrarMenu() {
  document.querySelector("#menu").close();
}

function CargarPaisesEnSelect() {
  let data = "";
  if (paises.length > 0) {
    paises.forEach((element) => {
      data += `<ion-select-option value="${element.ccn3}">${element.name.common}</ion-select-option>`;
    });
  }
  document.querySelector("#slcPaisRegistro").innerHTML = data;
}

function CargarPaises() {
  fetch("https://restcountries.com/v3.1/all")
    .then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject({});
      }
    })
    .then(function (datos) {
      for (let i = 0; i < datos.length; i++) {
        paises.push(datos[i]);
      }
    })
    .catch(function (error) {});
}

function Registro() {
  let usuario = document.querySelector("#txtNombre").value;
  let password = document.querySelector("#txtPasswordRegistro").value;
  let codigoPais = document.querySelector("#slcPaisRegistro").value;
  let calorias = document.querySelector("#txtCaloriasRegistro").value;

  try {
    ValidarDatos(usuario, password, codigoPais, calorias);
    let user = {
      usuario: usuario,
      password: password,
      idPais: codigoPais,
      caloriasDiarias: calorias,
    };
    fetch(BaseURL + "usuarios.php", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (datos) {
        if (datos.codigo == 200) {
          document.querySelector("#mensajeRegistro").innerHTML =
            "Registro exitoso";
          LimpiarCampos();
        } else {
          document.querySelector(
            "#mensajeRegistro"
          ).innerHTML = `${datos.mensaje}`;
        }
      })
      .catch(function (Error) {
        document.querySelector(
          "#mensajeRegistro"
        ).innerHTML = `${Error.message}`;
      });
  } catch (Error) {
    document.querySelector("#mensajeRegistro").innerHTML = `${Error.message}`;
  }
}

function ValidarDatos(usuario, password, pais, calorias) {
  if (usuario.trim().length == 0) {
    throw new Error("El usuario es obligatorio");
  }
  if (password.trim().length == 0) {
    throw new Error("La password obligatoria");
  }
  if (!pais) {
    throw new Error("El pais es obligatorio");
  }
  if (calorias.trim().length == 0) {
    throw new Error("La cantidad de calorias es obligatoria");
  }
}

function LimpiarCampos() {
  document.querySelector("#txtNombre").value = "";
  document.querySelector("#txtPasswordRegistro").value = "";
  document.querySelector("#slcPaisRegistro").value = "";
  document.querySelector("#txtCaloriasRegistro").value = "";
}

function Login() {
  let usuario = document.querySelector("#txtNombreUsuario").value;
  let password = document.querySelector("#txtPassword").value;
  try {
    if (usuario.trim().length == 0 || password.trim().length == 0) {
      throw new Error("Datos incorrectos");
    }
    fetch(BaseURL + "login.php", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        usuario: usuario,
        password: password,
      }),
    })
      .then(function (response) {
        if (response.codigo == 409) {
          return Promise.reject({});
        }
        return response.json();
      })
      .then(function (datos) {
        if (datos.codigo == 200) {
          document.querySelector("#txtNombreUsuario").value = "";
          document.querySelector("#txtPassword").value = "";
          localStorage.setItem("token", datos.apiKey);
          localStorage.setItem("idusuario", datos.id);
          localStorage.setItem("caloriasDiarias", datos.caloriasDiarias);
          OcultarOMostrarItemsMenuNoLogueado("none");
          OcultarOMostrarItemsMenu("block");
          ruteo.push("/RegistroComida");
        } else {
          document.querySelector(
            "#mensajeLogin"
          ).innerHTML = `${datos.mensaje}`;
        }
      })
      .catch(function (Error) {
        document.querySelector("#mensajeLogin").innerHTML = `${Error.message}`;
      });
  } catch (Error) {
    document.querySelector("#mensajeLogin").innerHTML = `${Error.message}`;
  }
}

function CerrarSesion() {
  localStorage.clear();
}

function ObtenerAlimentos() {
  if (
    localStorage.getItem("token") != null &&
    localStorage.getItem("token") != ""
  ) {
    fetch(BaseURL + "alimentos.php", {
      headers: {
        "Content-type": "application/json",
        apikey: localStorage.getItem("token"),
        iduser: localStorage.getItem("idusuario"),
      },
    })
      .then(function (response) {
        if (response.status == 401) {
          return Promise.reject({});
        }
        return response.json();
      })
      .then(function (datos) {
        if (datos.codigo == 200) {
          alimentos = datos.alimentos;
          CargarAlimentosenSelect();
        }
      });
  }
}

function CargarAlimentosenSelect() {
  let data = `<ion-select-option value="-1" selected></ion-select-option>`;
  if (alimentos.length > 0) {
    alimentos.forEach((element) => {
      data += `<ion-select-option value="${element.id}">${element.nombre} - Porcion = ${element.porcion} </ion-select-option>`;
    });
  }
  document.querySelector("#slcAlimento").innerHTML = data;
}

function RegistroComida() {
  let cantidad = document.querySelector("#cantidadRegistro").value;
  let idAlimento = document.querySelector("#slcAlimento").value;
  let fecha = document.querySelector("#fechaRegistro").value;
  let fechaHoy = new Date().toISOString();
  document.querySelector("#mensajeRegistroComida").innerHTML = "";

  if (!idAlimento || !fecha || !cantidad) {
    document.querySelector("#mensajeRegistroComida").innerHTML =
      "Debe completar todos los campos.";
    return;
  }

  if (fecha > fechaHoy) {
    document.querySelector("#mensajeRegistroComida").innerHTML =
      "La fecha no puede ser futura";
    return;
  }

  try {
    fetch(BaseURL + "registros.php", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        apikey: localStorage.getItem("token"),
        iduser: localStorage.getItem("idusuario"),
      },
      body: JSON.stringify({
        idAlimento: idAlimento,
        idUsuario: localStorage.getItem("idusuario"),
        cantidad: cantidad,
        fecha: fecha,
      }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (datos) {
        if (datos.codigo == 401) {
          document.querySelector("#mensajeRegistroComida").innerHTML =
            "Inicie sesion para registrar comidas";
          datos.mensaje;
        }
        if (datos.codigo == 200) {
          document.querySelector("#mensajeRegistroComida").innerHTML =
            datos.mensaje;
          console.log(datos);
          document.querySelector("#slcAlimento").value = "";
          document.querySelector("#fechaRegistro").value = "";
          document.querySelector("#cantidad").innerHTML = "";
        }
      })
      .catch(function (Error) {
        document.querySelector(
          "#mensajeRegistro"
        ).innerHTML = `${Error.message}`;
      });
  } catch (Error) {
    document.querySelector(
      "#mensajeRegistroComida"
    ).innerHTML = `${Error.message}`;
  }
}

function ListadoComidas() {
  if (
    localStorage.getItem("token") != null &&
    localStorage.getItem("token") != ""
  ) {
    fetch(
      BaseURL + "registros.php?idUsuario=" + localStorage.getItem("idusuario"),
      {
        headers: {
          apikey: localStorage.getItem("token"),
          iduser: localStorage.getItem("idusuario"),
        },
      }
    )
      .then(function (response) {
        if (response.status == 401) {
          ruteo.push("/Login");
          return Promise.reject({
          });
        }
        return response.json();
      })
      .then(function (datos) {
        let caloriasTotales = [];
        let caloriasComida;
        let CaloriasSuma = 0;
        let datosProductos = "";
        ObtenerAlimentos();
        let arrayRegistros = datos.registros;
        arrayRegistros.forEach((registro) => {
          const alimento = alimentos.find(
            (alimento) => alimento.id === registro.idAlimento
          );
          if (alimento) {
            caloriasComida = alimento.calorias * registro.cantidad;
            caloriasTotales.push(caloriasComida);
            datosProductos += `<ion-card>
  <img alt="${alimento.nombre}"$
  
  src="${BaseURLImage}${alimento.imagen}.png" />
  <ion-card-header>
    <ion-card-title>${alimento.nombre}</ion-card-title>   
  </ion-card-header>
  <ion-card-content>
  <p>Calorías: ${alimento.calorias * registro.cantidad}</p>
  <p>Fecha: ${registro.fecha}</p>

  <ion-button onclick='BorrarComida("${
    registro.id
  }")'>Eliminar registro</ion-button>
  </ion-card-content>
</ion-card>`;
          }
        });
        for (let i = 0; i < caloriasTotales.length; i++) {
          CaloriasSuma += caloriasTotales[i];
        }

        localStorage.setItem("caloriasTotales", CaloriasSuma);
        document.querySelector("#listadoRegistros").innerHTML = datosProductos;
      })
      .catch(function (Error) {
        document.querySelector("#listadoRegistros").innerHTML = Error.message;
      });
  } else {
    document.querySelector("#listadoRegistros").innerHTML =
      "Debes iniciar sesión para" + " visualizar el listado de productos";
  }
}

function BuscadorComidas() {
  let fechaDesde = document.querySelector("#buscadorDesde").value;
  let fechaHasta = document.querySelector("#buscadorHasta").value;

  if (
    localStorage.getItem("token") != null &&
    localStorage.getItem("token") != ""
  ) {
    fetch(
      BaseURL + "registros.php?idUsuario=" + localStorage.getItem("idusuario"),
      {
        headers: {
          apikey: localStorage.getItem("token"),
          iduser: localStorage.getItem("idusuario"),
        },
      }
    )
      .then(function (response) {
        if (response.status == 401) {
          ruteo.push("/Login");
          return Promise.reject({
          });
        }
        return response.json();
      })
      .then(function (datos) {
        let datosProductos = "";
        ObtenerAlimentos();
        let arrayRegistros = datos.registros;
        arrayRegistros.forEach((registro) => {
          const alimento = alimentos.find(
            (alimento) => alimento.id === registro.idAlimento
          );
          if (
            alimento &&
            registro.fecha >= fechaDesde &&
            registro.fecha <= fechaHasta
          ) {
            datosProductos += `<ion-card>
  <img alt="${alimento.nombre}" ${console.log(alimento.imagen)}$
  
  src="${BaseURLImage}${alimento.imagen}.png" />
  <ion-card-header>
    <ion-card-title>${alimento.nombre}</ion-card-title>   
  </ion-card-header>
  <ion-card-content>
  <p>Calorías: ${alimento.calorias}</p>
  <p>Fecha: ${registro.fecha}</p>

  <ion-button onclick='BorrarComida("${
    registro.id
  }")'>Eliminar registro</ion-button>
  </ion-card-content>
</ion-card>`;
          }
        });

        document.querySelector("#listadoRegistros").innerHTML = datosProductos;
      })
      .catch(function (Error) {
        document.querySelector("#listadoRegistros").innerHTML = Error.message;
      });
  } else {
    document.querySelector("#listadoRegistros").innerHTML =
      "Debes iniciar sesión para" + " visualizar el listado de productos";
  }
}

function BorrarComida(id) {
  if (
    localStorage.getItem("token") != null &&
    localStorage.getItem("token") != ""
  ) {
    fetch(BaseURL + `registros.php?idRegistro=${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        apikey: localStorage.getItem("token"),
        iduser: localStorage.getItem("idusuario"),
      },
    }).then(function (response) {
      if (response.status == 200) {
        alert("Registro Eliminado");
        ListadoComidas();
      }
      return response.json();
    });
  }
}

function mostrarCalorias() {
  ListadoComidas();
  if (
    localStorage.getItem("token") != null &&
    localStorage.getItem("token") != ""
  ) {
    document.querySelector("#txtCaloriasTotales").innerHTML =
      localStorage.getItem("caloriasTotales");

    fetch(
      BaseURL + "registros.php?idUsuario=" + localStorage.getItem("idusuario"),
      {
        headers: {
          apikey: localStorage.getItem("token"),
          iduser: localStorage.getItem("idusuario"),
        },
      }
    )
      .then((response) => {
        if (response.status == 401) {
          return Promise.reject({
          });
        }
        return response.json();
      })
      .then((datos) => {
        let datosCalorias = "";
        let caloriasDia = 0;
        let fecha = new Date().toISOString().split("T")[0]; //Parseo para compara fechas
        let registros = datos.registros;

        registros.forEach((registro) => {
          const alimento = alimentos.find(
            (alimento) => alimento.id === registro.idAlimento
          );
          if (alimento && registro.fecha === fecha) {
            caloriasDia += registro.cantidad * alimento.calorias;
          }
        });

        if (caloriasDia > localStorage.getItem("caloriasDiarias")) {
          document.querySelector("#txtCaloriasDia").style.color = "red";

          if (caloriasDia / 1.1 < localStorage.getItem("caloriasDiarias")) {
            console.log(localStorage.getItem("caloriasDiarias"));
            document.querySelector("#txtCaloriasDia").style.color = "yellow";
          }
        } else {
          document.querySelector("#txtCaloriasDia").style.color = "green"; // Otherwise, keep the default color
        }
        
        document.querySelector("#txtCaloriasTotales").innerHTML = localStorage.getItem("caloriasTotales");
        document.querySelector("#txtCaloriasDia").innerHTML = caloriasDia;
      })
      .catch(function (Error) {
        document.querySelector("#txtInforme").innerHTML = Error.message;
      });
  } else {
    document.querySelector("#txtInforme").innerHTML =
      "Debes iniciar sesión para" + " visualizar el listado de productos";
  }
}

function GuardarUbicacion(geolocation) {
  latitudDispositivo = geolocation.coords.latitude;
  longitudDispositivo = geolocation.coords.longitude;
}

function MostrarError() {
  console.log(Error);
}

function CargarMapa() {
  map = L.map("map").setView([latitudDispositivo, longitudDispositivo], 13);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxzoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  L.marker([latitudDispositivo, longitudDispositivo]).addTo(map);
}

function CargarUsuariosPorPais() {
  if (
    localStorage.getItem("token") != null &&
    localStorage.getItem("token") != ""
  ) {
    fetch(BaseURL + "usuariosPorPais.php", {
      headers: {
        "Content-type": "application/json",
        apikey: localStorage.getItem("token"),
        iduser: localStorage.getItem("idusuario"),
      },
    })
      .then(function (response) {
        if (response.status == 401) {
          return Promise.reject({
            codigo: response.status,
            message: "Debes iniciar sesión para" + " obtener los paises",
          });
        }
        return response.json();
      })
      .then(function (datos) {
        if (datos.codigo == 200) {
          console.log(datos.paises);
          usuariosPaises = datos.paises;
        }
      });
  }
}

function CargarPaisBusqueda() {
  fetch(BaseURL + "paises.php", {
    headers: {
      "Content-type": "application/json",
    },
  })
    .then(function (response) {
      if (response.status == 401) {
        return Promise.reject({
          codigo: response.status,
          message: "Debes iniciar sesión para" + " obtener los paises",
        });
      }
      return response.json();
    })
    .then(function (datos) {
      if (datos.codigo == 200) {
        console.log(datos.paises);
        paisesBusqueda = datos.paises;
      }
    });
}

function BuscadorUsuariosPorPais() {
  if (map != null) {
    map.remove();}
    CargarMapa();

  let cantidadUsuarios = document.querySelector("#numBuscadorMapa").value;
  let usuariosPais = [];
  let usuariosPaisCoordenadas = [];

  usuariosPaises.forEach((element) => {
    if (element.cantidadDeUsuarios > cantidadUsuarios) {
      usuariosPais.push(element);
    }
  });

  usuariosPais.forEach((element) => {
    let paisBusqueda = paisesBusqueda.find(
      (pais) => pais.name === element.name
    );
    if (paisBusqueda) {
      usuariosPaisCoordenadas.push(paisBusqueda);
    }
  });

  usuariosPaisCoordenadas.forEach((element) => {
    AgregarMarcadorAlMapa(element.latitude, element.longitude);
  });
}

function AgregarMarcadorAlMapa(lat, lng) {
  L.marker([lat, lng]).addTo(map);
  }



