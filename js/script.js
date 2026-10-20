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
            youtube: "YouTube",
            titulo: "Tras el Marco | Arte, historias y cultura"
        },
        en: {
            inicio: "Home",
            explora: "Explore",
            articulos: "Articles",
            exposiciones: "Exhibitions",
            podcast: "Podcast",
            youtube: "YouTube",
            titulo: "Tras el Marco | Art, Stories and Culture"
        }
    };

    function cambiarIdioma(idioma) {

        if (!traduccionesMenu[idioma]) {
            return;
        }

        document.documentElement.lang = idioma;

        // Traducir el contenido de la portada.
        document.querySelectorAll("[data-es][data-en]").forEach((elemento) => {

            const traduccion = elemento.dataset[idioma];

            // Los títulos pueden contener un salto de línea.
            // El resto del contenido se inserta como texto.
            if (elemento.matches("h1, h2")) {
                const partes = traduccion.split(/<br\s*\/?>/i);
                elemento.replaceChildren();

                partes.forEach((parte, indice) => {
                    if (indice > 0) {
                        elemento.appendChild(document.createElement("br"));
                    }

                    elemento.appendChild(document.createTextNode(parte));
                });
            } else {
                elemento.textContent = traduccion;
            }
        });

        // Traducir los enlaces del menú.
        const enlaces = document.querySelectorAll(".nav-links a");

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

        // Cambiar el título de la pestaña.
        document.title = traduccionesMenu[idioma].titulo;

        // Actualizar el botón activo.
        document.querySelectorAll("[data-lang]").forEach((boton) => {

            const activo = boton.dataset.lang === idioma;

            boton.classList.toggle("idioma-activo", activo);
            boton.setAttribute("aria-pressed", String(activo));
        });

        // Guardar el idioma elegido.
        try {
            localStorage.setItem("trasElMarcoIdioma", idioma);
        } catch (error) {
            console.warn("No se pudo guardar el idioma.");
        }
    }

    // ==========================================
    // 4. BOTONES ES / EN
    // ==========================================

    document.querySelectorAll("[data-lang]").forEach((boton) => {

        boton.addEventListener("click", () => {
            cambiarIdioma(boton.dataset.lang);
        });

    });

    // Recuperar el idioma anterior.
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
