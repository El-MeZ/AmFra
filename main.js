/* ================================================
   AmFra – Landing Page
   main.js

   Módulos incluidos:
   1. Sistema de detección de sección visible (IntersectionObserver)
   2. Activación de animaciones al hacer scroll
   3. Navegación lateral (puntos)
   4. Scroll suave al hacer clic en los puntos de nav
   5. Sistema de partículas (Canvas API)
   6. Partículas globales (todo el sitio)
   7. Partículas por sección (efecto específico)
================================================ */

/* ==============================================
   Esperamos a que el HTML esté completamente
   cargado antes de ejecutar cualquier JS
============================================== */
document.addEventListener('DOMContentLoaded', () => {

  /* ============================================
     1. SELECCIÓN DE ELEMENTOS DEL DOM
     Guardamos referencias a los elementos que
     vamos a usar repetidamente.
  ============================================ */
  const secciones  = document.querySelectorAll('.seccion');   // Todos los paneles
  const navDots    = document.querySelectorAll('.nav-dot');   // Puntos de navegación
  const canvasHero = document.getElementById('canvasHero');  // Canvas del hero


  /* ============================================
     2. INTERSECTION OBSERVER
     Esta API detecta cuándo un elemento entra
     o sale del área visible de la pantalla.

     Cuando una sección es visible:
     → Le añadimos la clase 'es-activa'
     → Actualizamos el punto de nav correspondiente
  ============================================ */
  const opcionesObserver = {
    root: null,          // Observa respecto a la ventana del navegador
    rootMargin: '0px',
    threshold: 0.3,      // Se activa cuando el 30% de la sección es visible
  };

  const observadorSecciones = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      // Cuando la sección entra en pantalla:
      if (entrada.isIntersecting) {
        // 1. Añadimos la clase que activa las animaciones CSS
        entrada.target.classList.add('es-activa');

        // 2. Identificamos el índice de la sección
        const indice = Array.from(secciones).indexOf(entrada.target);

        // 3. Actualizamos el punto de navegación activo
        actualizarNavDot(indice);

        // 4. Iniciamos partículas específicas de esa sección
        iniciarParticulasSeccion(entrada.target);
      }
    });
  }, opcionesObserver);

  // Aplicamos el observer a cada sección
  secciones.forEach((seccion) => {
    observadorSecciones.observe(seccion);
  });


  /* ============================================
     3. NAVEGACIÓN LATERAL – PUNTOS
     Actualiza visualmente qué punto está activo
     según la sección visible.
  ============================================ */
  function actualizarNavDot(indiceActivo) {
    navDots.forEach((dot, i) => {
      // Si es el punto de la sección activa → marcarlo
      if (i === indiceActivo) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }


  /* ============================================
     4. SCROLL SUAVE AL HACER CLIC EN PUNTOS NAV
     Cada punto tiene un atributo data-seccion
     con el número de sección a la que apunta.
  ============================================ */
  navDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      // Leemos a qué sección debe ir
      const indiceSec = parseInt(dot.getAttribute('data-seccion'), 10);
      const seccionDestino = secciones[indiceSec];

      if (seccionDestino) {
        // Scroll suave hasta esa sección
        seccionDestino.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });


  /* ============================================
     5. SISTEMA DE PARTÍCULAS GLOBAL (HERO)
     Partículas flotantes sobre el video del hero.
     Usamos Canvas API para dibujarlas y animarlas.
  ============================================ */
  if (canvasHero) {
    iniciarParticulasHero(canvasHero);
  }

  /* ------------------------------------------
     Función: iniciarParticulasHero
     Crea y anima partículas doradas sobre el hero.
     @param {HTMLCanvasElement} canvas - El canvas donde dibujar
  ------------------------------------------ */
  function iniciarParticulasHero(canvas) {
    const ctx = canvas.getContext('2d');   // Contexto 2D para dibujar

    // Ajustamos el canvas al tamaño de la ventana
    function ajustarTamano() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    ajustarTamano();

    // Si se redimensiona la ventana, reajustamos el canvas
    window.addEventListener('resize', ajustarTamano);

    // ------ Configuración de partículas ------
    const totalParticulas = 60;   // Cuántas partículas hay en pantalla
    const particulas = [];

    // Colores que pueden tener las partículas
    const coloresHero = [
      'rgba(201, 168, 76, 0.6)',   // Dorado
      'rgba(232, 201, 126, 0.4)',  // Dorado claro
      'rgba(245, 240, 232, 0.3)', // Crema
    ];

    /* Creamos cada partícula con propiedades aleatorias */
    for (let i = 0; i < totalParticulas; i++) {
      particulas.push(crearParticula());
    }

    /* ------------------------------------------
       crearParticula(): devuelve un objeto con
       todas las propiedades de una partícula nueva.
    ------------------------------------------ */
    function crearParticula() {
      return {
        x:        Math.random() * canvas.width,    // Posición horizontal aleatoria
        y:        Math.random() * canvas.height,   // Posición vertical aleatoria
        radio:    Math.random() * 2 + 0.5,         // Tamaño entre 0.5 y 2.5px
        colorIdx: Math.floor(Math.random() * coloresHero.length), // Color aleatorio
        velocidadX: (Math.random() - 0.5) * 0.4,  // Movimiento horizontal suave
        velocidadY: -Math.random() * 0.5 - 0.2,   // Siempre sube lentamente
        opacidad:  Math.random(),                   // Opacidad inicial aleatoria
        oscilacion: Math.random() * Math.PI * 2,   // Fase inicial para oscilar
      };
    }

    /* ------------------------------------------
       Loop de animación: se ejecuta ~60 veces/seg
       1. Limpia el canvas
       2. Mueve cada partícula
       3. Dibuja cada partícula
    ------------------------------------------ */
    function animarParticulas() {
      // Limpiamos el canvas (fondo transparente)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particulas.forEach((p, indice) => {
        // Movemos la partícula
        p.x += p.velocidadX + Math.sin(p.oscilacion) * 0.3;
        p.y += p.velocidadY;
        p.oscilacion += 0.02;

        // Si la partícula salió por arriba, la reiniciamos abajo
        if (p.y < -10) {
          particulas[indice] = {
            ...crearParticula(),
            y: canvas.height + 10,  // Empieza desde abajo
          };
        }

        // Dibujamos la partícula como un círculo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
        ctx.fillStyle = coloresHero[p.colorIdx];
        ctx.fill();
      });

      // Solicitamos el siguiente frame de animación
      requestAnimationFrame(animarParticulas);
    }

    // Iniciamos el loop
    animarParticulas();
  }


  /* ============================================
     6. PARTÍCULAS ESPECÍFICAS POR SECCIÓN
     Cada sección tiene su propio canvas y tipo
     de partícula según su temática y color.
  ============================================ */

  /* Mapa de configuración por canvas ID:
     cada entrada define el comportamiento
     de las partículas de esa sección */
  const configParticulas = {
    'canvasPapeleria': {
      color:    'rgba(143, 188, 143, 0.4)',   // Verde salvia
      cantidad: 25,
      tamano:   1.5,
      forma:    'circulo',
    },
    'canvasPoleras': {
      color:    'rgba(192, 57, 43, 0.35)',    // Rojo
      cantidad: 30,
      tamano:   1.8,
      forma:    'circulo',
    },
    'canvasTazas': {
      color:    'rgba(201, 168, 76, 0.5)',    // Dorado
      cantidad: 35,
      tamano:   1.2,
      forma:    'circulo',
    },
    'canvasTarjetas': {
      color:    'rgba(74, 127, 165, 0.4)',    // Azul
      cantidad: 20,
      tamano:   2,
      forma:    'circulo',
    },
    'canvasContacto': {
      color:    'rgba(37, 211, 102, 0.3)',    // Verde WhatsApp
      cantidad: 40,
      tamano:   1.5,
      forma:    'circulo',
    },
  };

  /* ------------------------------------------
     Set para saber qué canvas ya fueron iniciados
     (evita iniciar el mismo canvas dos veces)
  ------------------------------------------ */
  const canvasInicados = new Set();

  /* ------------------------------------------
     iniciarParticulasSeccion(seccion):
     Busca el canvas dentro de la sección y
     lo configura según su ID.
  ------------------------------------------ */
  function iniciarParticulasSeccion(seccion) {
    // Buscamos el canvas de partículas dentro de la sección
    const canvas = seccion.querySelector('.canvas-seccion');

    if (!canvas) return;                        // Si no hay canvas, salimos
    if (canvasInicados.has(canvas.id)) return;  // Si ya está iniciado, salimos

    // Marcamos este canvas como iniciado
    canvasInicados.add(canvas.id);

    // Buscamos la configuración para este canvas
    const config = configParticulas[canvas.id];
    if (!config) return;

    // Iniciamos las partículas con la configuración encontrada
    iniciarCanvasSeccion(canvas, config);
  }

  /* ------------------------------------------
     iniciarCanvasSeccion(canvas, config):
     Crea y anima partículas para un canvas
     de sección específico.
  ------------------------------------------ */
  function iniciarCanvasSeccion(canvas, config) {
    const ctx = canvas.getContext('2d');

    // Ajustamos el canvas al tamaño de su contenedor (la sección)
    function ajustar() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    ajustar();
    window.addEventListener('resize', ajustar);

    const particulas = [];

    // Creamos las partículas de la sección
    for (let i = 0; i < config.cantidad; i++) {
      particulas.push({
        x:           Math.random() * canvas.width,
        y:           Math.random() * canvas.height,
        radio:       Math.random() * config.tamano + 0.5,
        velocidadX:  (Math.random() - 0.5) * 0.3,
        velocidadY:  -Math.random() * 0.3 - 0.1,
        oscilacion:  Math.random() * Math.PI * 2,
      });
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particulas.forEach((p, i) => {
        p.x += p.velocidadX + Math.sin(p.oscilacion) * 0.2;
        p.y += p.velocidadY;
        p.oscilacion += 0.01;

        // Reinicia la partícula si sale por arriba
        if (p.y < -5) {
          particulas[i].y = canvas.height + 5;
          particulas[i].x = Math.random() * canvas.width;
        }

        // Dibujamos
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
        ctx.fillStyle = config.color;
        ctx.fill();
      });

      requestAnimationFrame(loop);
    }

    loop();
  }


  /* ============================================
     7. LINKS DE ANCLA CON SCROLL SUAVE
     Los botones "Solicitar diseño" enlazan a #seccion-5.
     Este código asegura que el scroll sea suave.
  ============================================ */
  document.querySelectorAll('a[href^="#"]').forEach((enlace) => {
    enlace.addEventListener('click', (e) => {
      const destino = document.querySelector(enlace.getAttribute('href'));
      if (destino) {
        e.preventDefault();       // Evitamos el salto brusco por defecto
        destino.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });


  /* ============================================
     8. INICIALIZACIÓN
     La primera sección (hero) se activa de inmediato
     sin esperar al scroll.
  ============================================ */
  if (secciones.length > 0) {
    setTimeout(() => {
      secciones[0].classList.add('es-activa');
    }, 100);  // Pequeño delay para que las animaciones CSS se disparen bien
  }

}); // Fin del DOMContentLoaded
