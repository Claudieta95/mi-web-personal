"use strict";

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. ANIMACIONES AL DESPLAZARSE
    // ==========================================

    const elementos = document.querySelectorAll(".revelar");

    const movimientoReducido = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (movimientoReducido || !("IntersectionObserver" in window)) {

        elementos.forEach((elemento) => {
            elemento.classList.add("visible");
        });

    } else {

        const observador = new IntersectionObserver((entradas) => {

            entradas.forEach((entrada) => {

                if (entrada.isIntersecting) {
                    entrada.target.classList.add("visible");
                    observador.unobserve(entrada.target);
                }

            });

        }, {
            threshold: 0.15
        });

        elementos.forEach((elemento) => {
            observador.observe(elemento);
        });
    }

    // ==========================================
    // 2. EFECTO INMERSIVO DEL MARCO
    // ==========================================

    const marco = document.querySelector(".marco");

    if (marco && !movimientoReducido) {

        const escena = marco.closest(".marco-escena");

        if (escena) {

            escena.addEventListener("pointermove", (evento) => {

                if (evento.pointerType === "touch") {
                    return;
                }

                const rectangulo = escena.getBoundingClientRect();

                const x = (evento.clientX - rectangulo.left) /
                          rectangulo.width;

                const y = (evento.clientY - rectangulo.top) /
                          rectangulo.height;

                const giroY = (x - 0.5) * 12;
                const giroX = (0.5 - y) * 8;

                marco.style.transform =
                    `perspective(1000px) rotateX(${giroX}deg) rotateY(${giroY}deg) scale(1.025)`;
            });

            escena.addEventListener("pointerleave", () => {
                marco.style.transform = "";
            });
        }
    }

    // ==========================================
    // 3. TRADUCCIONES
    // ==========================================

    const traduccionesMenu = {
        es: {
            inicio: "Inicio",
            explora: "Explora",
            articulos: "Artículos",
            exposiciones: "Exposiciones",
            podcast: "Podcast",
            youtube: "YouTube"
        },
        en: {
            inicio: "Home",
            explora: "Explore",
            articulos: "Articles",
            exposiciones: "Exhibitions",
            podcast: "Podcast",
            youtube: "YouTube"
        }
    };

    const titulosPaginas = {
        inicio: {
            es: "Tras el Marco | Arte, historias y cultura",
            en: "Tras el Marco | Art, Stories and Culture"
        },
        explora: {
            es: "Explora | Tras el Marco",
            en: "Explore | Tras el Marco"
        },
        articulos: {
            es: "Artículos | Tras el Marco",
            en: "Articles | Tras el Marco"
        },
        articulo: {
            es: "Artículo | Tras el Marco",
            en: "Article | Tras el Marco"
        },
        exposiciones: {
            es: "Exposiciones | Tras el Marco",
            en: "Exhibitions | Tras el Marco"
        },
        podcast: {
            es: "Podcast | Tras el Marco",
            en: "Podcast | Tras el Marco"
        },
        youtube: {
            es: "YouTube | Tras el Marco",
            en: "YouTube | Tras el Marco"
        }
    };

    function obtenerPaginaActual() {

        const ruta = window.location.pathname;
        const archivo = ruta.split("/").pop() || "index.html";

        if (archivo === "index.html") return "inicio";
        if (archivo === "explora.html") return "explora";
        if (archivo === "articulos.html") return "articulos";
        if (archivo === "articulo.html") return "articulo";
        if (archivo === "exposiciones.html") return "exposiciones";
        if (archivo === "podcast.html") return "podcast";
        if (archivo === "youtube.html") return "youtube";

        return "inicio";
    }

    function cambiarIdioma(idioma) {

        if (!traduccionesMenu[idioma]) {
            return;
        }

        document.documentElement.lang = idioma;

        // Traducir todos los elementos con data-es y data-en.
        document.querySelectorAll("[data-es][data-en]").forEach((elemento) => {

            const traduccion = elemento.dataset[idioma];

            if (elemento.matches("h1, h2")) {

                const partes = traduccion.split(/<br\s*\/?>/i);

                elemento.replaceChildren();

                partes.forEach((parte, indice) => {

                    if (indice > 0) {
                        elemento.appendChild(document.createElement("br"));
                    }

                    elemento.appendChild(
                        document.createTextNode(parte)
                    );
                });

            } else {

                elemento.textContent = traduccion;
            }
        });

        // Traducir ambos tipos de menú.
        const enlaces = document.querySelectorAll(
            ".nav-links a, .menu a"
        );

        const claves = [
            "inicio",
            "explora",
            "articulos",
            "exposiciones",
            "podcast",
            "youtube"
        ];

        enlaces.forEach((enlace, indice) => {

            if (claves[indice]) {

                enlace.textContent =
                    traduccionesMenu[idioma][claves[indice]];
            }
        });

        // Mantener el título correcto de cada página.
        const pagina = obtenerPaginaActual();

        if (titulosPaginas[pagina]) {

            document.title = titulosPaginas[pagina][idioma];
        }

        // Actualizar los botones ES / EN.
        document.querySelectorAll(
            "[data-lang], [data-idioma]"
        ).forEach((boton) => {

            const idiomaBoton =
                boton.dataset.lang || boton.dataset.idioma;

            const activo = idiomaBoton === idioma;

            boton.classList.toggle("idioma-activo", activo);
            boton.setAttribute("aria-pressed", String(activo));
        });

        // Guardar el idioma seleccionado.
        try {

            localStorage.setItem("trasElMarcoIdioma", idioma);

        } catch (error) {

            console.warn("No se pudo guardar el idioma.");
        }

        // Avisar a otros scripts del cambio de idioma.
        document.dispatchEvent(
            new CustomEvent("traselmarco:idioma", {
                detail: { idioma }
            })
        );
    }

    // ==========================================
    // 4. BOTONES ES / EN
    // ==========================================

    document.querySelectorAll(
        "[data-lang], [data-idioma]"
    ).forEach((boton) => {

        boton.addEventListener("click", () => {

            const idioma =
                boton.dataset.lang || boton.dataset.idioma;

            cambiarIdioma(idioma);
        });
    });

    // ==========================================
    // 5. RECUPERAR EL IDIOMA GUARDADO
    // ==========================================

    let idiomaInicial = "es";

    try {

        const idiomaGuardado =
            localStorage.getItem("trasElMarcoIdioma");

        if (traduccionesMenu[idiomaGuardado]) {

            idiomaInicial = idiomaGuardado;
        }

    } catch (error) {

        idiomaInicial = "es";
    }

    cambiarIdioma(idiomaInicial);

});
