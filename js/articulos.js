"use strict";

document.addEventListener("DOMContentLoaded", async () => {

    const listado = document.getElementById("listado-articulos");
    const detalle = document.getElementById("detalle-articulo");

    if (!listado && !detalle) return;

    let articulos = [];

    function idiomaActual() {
        return document.documentElement.lang === "en" ? "en" : "es";
    }

    function traducir(valor) {

        if (typeof valor === "string") return valor;

        return valor?.[idiomaActual()] || valor?.es || "";
    }

    function crearElemento(etiqueta, clase, texto) {

        const elemento = document.createElement(etiqueta);

        if (clase) elemento.className = clase;

        if (texto !== undefined) {
            elemento.textContent = texto;
        }

        return elemento;
    }

    function crearImagen(articulo) {

        const imagen = document.createElement("img");

        imagen.src = articulo.imagen;
        imagen.alt = traducir(articulo.imagenAlt);
        imagen.loading = "lazy";

        return imagen;
    }

    // ==========================================
    // 1. CREAR TARJETAS
    // ==========================================

    function crearTarjeta(articulo, destacado = false) {

        const tarjeta = crearElemento(
            "article",
            destacado
                ? "articulo-destacado revelar visible"
                : "articulo-tarjeta revelar visible"
        );

        const contenedorImagen = crearElemento(
            "div",
            destacado
                ? "articulo-destacado-imagen"
                : "articulo-tarjeta-imagen"
        );

        contenedorImagen.appendChild(crearImagen(articulo));

        const contenido = crearElemento(
            "div",
            destacado
                ? "articulo-destacado-contenido"
                : "articulo-tarjeta-contenido"
        );

        contenido.appendChild(
            crearElemento(
                "span",
                "articulo-categoria",
                traducir(articulo.categoria)
            )
        );

        contenido.appendChild(
            crearElemento(
                "h3",
                "",
                traducir(articulo.titulo)
            )
        );

        contenido.appendChild(
            crearElemento(
                "p",
                "",
                traducir(articulo.resumen)
            )
        );

        if (articulo.publicado) {

            const enlace = crearElemento(
                "a",
                "articulo-estado",
                idiomaActual() === "en"
                    ? "Read article ↗"
                    : "Leer artículo ↗"
            );

            enlace.href = "articulo.html?id=" +
                encodeURIComponent(articulo.id);

            contenido.appendChild(enlace);

        } else {

            contenido.appendChild(
                crearElemento(
                    "span",
                    "articulo-estado",
                    idiomaActual() === "en"
                        ? "Coming soon"
                        : "Próximamente"
                )
            );
        }

        tarjeta.appendChild(contenedorImagen);
        tarjeta.appendChild(contenido);

        return tarjeta;
    }

    // ==========================================
    // 2. MOSTRAR LISTADO
    // ==========================================

    function mostrarListado() {

        if (!listado) return;

        listado.replaceChildren();

        const destacado = articulos.find(
            articulo => articulo.destacado
        );

        if (destacado) {
            listado.appendChild(crearTarjeta(destacado, true));
        }

        const titulo = crearElemento(
            "div",
            "articulos-listado-cabecera"
        );

        titulo.appendChild(
            crearElemento(
                "span",
                "articulos-etiqueta",
                idiomaActual() === "en"
                    ? "KEEP EXPLORING"
                    : "PARA SEGUIR DESCUBRIENDO"
            )
        );

        titulo.appendChild(
            crearElemento(
                "h2",
                "",
                idiomaActual() === "en"
                    ? "More stories to discover"
                    : "Más historias por descubrir"
            )
        );

        listado.appendChild(titulo);

        const cuadricula = crearElemento(
            "div",
            "articulos-grid"
        );

        articulos
            .filter(articulo => articulo !== destacado)
            .forEach(articulo => {

                cuadricula.appendChild(
                    crearTarjeta(articulo)
                );
            });

        listado.appendChild(cuadricula);
    }

    // ==========================================
    // 3. MOSTRAR ARTÍCULO COMPLETO
    // ==========================================

    function mostrarDetalle() {

        if (!detalle) return;

        detalle.replaceChildren();

        const parametros = new URLSearchParams(
            window.location.search
        );

        const id = parametros.get("id");

        const articulo = articulos.find(
            elemento =>
                elemento.id === id &&
                elemento.publicado
        );

        if (!articulo) {

            detalle.appendChild(
                crearElemento(
                    "h1",
                    "",
                    idiomaActual() === "en"
                        ? "Article not found"
                        : "Artículo no encontrado"
                )
            );

            return;
        }

        const cabecera = crearElemento(
            "header",
            "detalle-cabecera"
        );

        cabecera.appendChild(
            crearElemento(
                "span",
                "articulos-etiqueta",
                traducir(articulo.categoria)
            )
        );

        cabecera.appendChild(
            crearElemento(
                "h1",
                "",
                traducir(articulo.titulo)
            )
        );

        cabecera.appendChild(
            crearElemento(
                "p",
                "detalle-resumen",
                traducir(articulo.resumen)
            )
        );

        const autor = crearElemento(
            "p",
            "detalle-autor",
            articulo.autor || "Tras el Marco"
        );

        if (articulo.fecha) {
            autor.textContent += " · " + articulo.fecha;
        }

        cabecera.appendChild(autor);
        detalle.appendChild(cabecera);

        const imagen = crearElemento(
            "figure",
            "detalle-imagen"
        );

        imagen.appendChild(crearImagen(articulo));
        detalle.appendChild(imagen);

        const cuerpo = crearElemento(
            "div",
            "detalle-cuerpo"
        );

        const bloques =
            articulo.contenido?.[idiomaActual()] || [];

        bloques.forEach((bloque) => {

            if (bloque.tipo === "titulo") {

                cuerpo.appendChild(
                    crearElemento(
                        "h2",
                        "",
                        bloque.texto
                    )
                );

            } else if (bloque.tipo === "parrafo") {

                cuerpo.appendChild(
                    crearElemento(
                        "p",
                        "",
                        bloque.texto
                    )
                );
            }
        });

        detalle.appendChild(cuerpo);

        const volver = crearElemento(
            "a",
            "detalle-volver",
            idiomaActual() === "en"
                ? "← Back to articles"
                : "← Volver a Artículos"
        );

        volver.href = "articulos.html";

        detalle.appendChild(volver);

        document.title =
            traducir(articulo.titulo) + " | Tras el Marco";
    }

    // ==========================================
    // 4. ACTUALIZAR IDIOMA
    // ==========================================

    function actualizar() {

        mostrarListado();
        mostrarDetalle();
    }

    // Escuchar los cambios de idioma de script.js.
    document.addEventListener(
        "traselmarco:idioma",
        actualizar
    );

    // ==========================================
    // 5. CARGAR LOS ARTÍCULOS
    // ==========================================

    try {

        const respuesta = await fetch(
            "../data/articulos.json"
        );

        if (!respuesta.ok) {

            throw new Error(
                "No se ha podido cargar articulos.json"
            );
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos.articulos)) {

            throw new Error(
                "El archivo JSON no contiene una lista de artículos válida."
            );
        }

        articulos = datos.articulos;

        actualizar();

    } catch (error) {

        console.error(
            "Error cargando artículos:",
            error
        );

        const destino = listado || detalle;

        destino.replaceChildren();

        destino.appendChild(
            crearElemento(
                "p",
                "",
                idiomaActual() === "en"
                    ? "Articles could not be loaded. Please check the JSON file."
                    : "No se han podido cargar los artículos. Comprueba el archivo JSON."
            )
        );
    }

});
