/* ================================================
   AmFra – Landing Page
   js/main.js

   Módulos:
   1. IntersectionObserver — animaciones al hacer scroll
   2. Navegación lateral — puntos sincronizados con scroll
   3. Partículas hero — 140 partículas multicolores
   4. Partículas por sección — color según categoría
   5. Scroll suave en links de ancla
   6. Modal de pedido — contador de unidades + WhatsApp
================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────
     1. SELECCIÓN DE ELEMENTOS
  ───────────────────────────────────── */
  const secciones = document.querySelectorAll('.seccion');
  const navDots   = document.querySelectorAll('.nav-dot');
  const cards     = document.querySelectorAll('.prod-card');
  const headers   = document.querySelectorAll('.categoria-header');


  /* ─────────────────────────────────────
     2. INTERSECTION OBSERVER
     Activa animaciones de entrada cuando
     los elementos son visibles.
  ───────────────────────────────────── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      el.classList.add('es-activa');

      // Delay escalonado para tarjetas (efecto cascada)
      if (el.classList.contains('prod-card')) {
        const siblings = [...el.parentElement.children];
        const idx = siblings.indexOf(el);
        el.style.transitionDelay = (idx % 4) * 0.08 + 's';
      }

      // Actualizar punto de nav según sección visible
      if (el.classList.contains('seccion')) {
        const idx = Array.from(secciones).indexOf(el);
        navDots.forEach((d, i) => d.classList.toggle('active', i === idx));

        // Iniciar partículas de esa sección cuando entra
        iniciarParticulasSeccion(el);
      }
    });
  }, { threshold: 0.12 });

  // Observamos secciones, tarjetas y encabezados
  secciones.forEach(s => observer.observe(s));
  cards.forEach(c => observer.observe(c));
  headers.forEach(h => observer.observe(h));


  /* ─────────────────────────────────────
     3. NAV LATERAL — click → scroll suave
  ───────────────────────────────────── */
  navDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.seccion, 10);
      const destino = secciones[idx];
      if (destino) destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });


  /* ─────────────────────────────────────
     4. PARTÍCULAS HERO
     140 partículas multicolores que suben.
     Colores: dorado, rosa neón, cyan, blanco,
     verde neón, naranja — representan creatividad.
  ───────────────────────────────────── */
  (function iniciarHero() {
    const canvas = document.getElementById('canvasHero');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth  || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Colores vibrantes — uno por partícula
    const COLS = [
      'rgba(255,215,0,',    // dorado
      'rgba(255,60,172,',   // rosa neón
      'rgba(0,245,255,',    // cyan
      'rgba(255,255,255,',  // blanco
      'rgba(57,255,20,',    // verde neón
      'rgba(255,149,0,',    // naranja
    ];

    const N = 140; // cantidad de partículas

    function nuevaParticula() {
      return {
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        r:  Math.random() * 2.3 + 0.3,          // radio entre 0.3 y 2.6px
        vx: (Math.random() - 0.5) * 0.5,        // movimiento horizontal suave
        vy: -(Math.random() * 0.65 + 0.15),     // siempre sube
        a:  Math.random() * 0.75 + 0.2,         // opacidad
        ci: Math.floor(Math.random() * COLS.length),
        o:  Math.random() * Math.PI * 2,        // fase de oscilación
      };
    }

    const ps = Array.from({ length: N }, nuevaParticula);

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ps.forEach((p, i) => {
        // Mover partícula
        p.x += p.vx + Math.sin(p.o) * 0.38;
        p.y += p.vy;
        p.o += 0.018;

        // Si salió por arriba, reiniciar abajo
        if (p.y < -8) {
          ps[i] = { ...nuevaParticula(), y: canvas.height + 8 };
        }

        // Dibujar
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = COLS[p.ci] + p.a + ')';
        ctx.fill();
      });

      requestAnimationFrame(loop);
    }

    loop();
  })();


  /* ─────────────────────────────────────
     5. PARTÍCULAS POR SECCIÓN
     Cada categoría tiene su propio color
     de partículas. Se inician solo cuando
     la sección entra en pantalla.
  ───────────────────────────────────── */

  // Configuración de partículas por canvas ID
  const CFG_PARTICULAS = {
    canvasPapeleria:   { color: 'rgba(0,200,83,',   n: 50, r: 1.6 },
    canvasSublimacion: { color: 'rgba(255,149,0,',  n: 100, r: 1.4 },
    canvasPoleras:     { color: 'rgba(255,60,172,', n: 100, r: 1.7 },
    canvasOtros:       { color: 'rgba(0,122,255,',  n: 100, r: 1.5 },
    canvas3d:          { color: 'rgba(175,82,222,', n: 100, r: 1.8 },
    canvasContacto:    { color: 'rgba(37,211,102,', n: 300, r: 1.4 },
  };

  // Evitamos iniciar el mismo canvas más de una vez
  const iniciados = new Set();

  function iniciarParticulasSeccion(seccion) {
    const canvas = seccion.querySelector('.canvas-seccion');
    if (!canvas || iniciados.has(canvas.id)) return;
    iniciados.add(canvas.id);

    const cfg = CFG_PARTICULAS[canvas.id];
    if (!cfg) return;

    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function nuevaP() {
      return {
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        r:  Math.random() * cfg.r + 0.4,
        vx: (Math.random() - 0.5) * 0.32,
        vy: -(Math.random() * 0.38 + 0.08),
        o:  Math.random() * Math.PI * 2,
        a:  Math.random() * 0.5 + 0.15,
      };
    }

    const ps = Array.from({ length: cfg.n }, nuevaP);

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ps.forEach((p, i) => {
        p.x += p.vx + Math.sin(p.o) * 0.22;
        p.y += p.vy;
        p.o += 0.012;

        if (p.y < -5) {
          ps[i] = { ...nuevaP(), y: canvas.height + 5 };
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = cfg.color + p.a + ')';
        ctx.fill();
      });

      requestAnimationFrame(loop);
    }

    loop();
  }


  /* ─────────────────────────────────────
     6. SCROLL SUAVE EN LINKS DE ANCLA
  ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const destino = document.querySelector(a.getAttribute('href'));
      if (destino) {
        e.preventDefault();
        destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* ─────────────────────────────────────
     7. MODAL DE PEDIDO
     Abre al hacer clic en cualquier "Pedir".
     Incluye contador de unidades y genera
     el mensaje de WhatsApp automáticamente.
  ───────────────────────────────────── */
  const overlay       = document.getElementById('modalOverlay');
  const btnCerrar     = document.getElementById('modalCerrar');
  const modalProducto = document.getElementById('modalProducto');
  const cantNum       = document.getElementById('cantNum');
  const btnMenos      = document.getElementById('cantMenos');
  const btnMas        = document.getElementById('cantMas');
  const modalWsp      = document.getElementById('modalWsp');

  // Número de WhatsApp real de AmFra
  const WSP_NUM = '56949312725';

  let productoActual = '';
  let cantidad = 1;

  // Función que actualiza el link de WhatsApp con producto y cantidad
  function actualizarLink() {
    const msg = `Hola AmFra! 👋 Quiero pedir:\n\n• Producto: ${productoActual}\n• Cantidad: ${cantidad} unidad${cantidad > 1 ? 'es' : ''}\n\n¿Puedes cotizarme? 🎨`;
    modalWsp.href = `https://wa.me/${WSP_NUM}?text=${encodeURIComponent(msg)}`;
  }

  // Abrir modal al hacer clic en "Pedir"
  document.querySelectorAll('.btn-pedir').forEach(btn => {
    btn.addEventListener('click', () => {
      productoActual = btn.dataset.producto || 'Producto';
      cantidad = 1;
      cantNum.textContent = cantidad;
      modalProducto.textContent = productoActual;
      actualizarLink();
      overlay.classList.add('abierto');
      document.body.style.overflow = 'hidden'; // evita scroll de fondo
    });
  });

  // Cerrar modal
  function cerrarModal() {
    overlay.classList.remove('abierto');
    document.body.style.overflow = '';
  }

  btnCerrar.addEventListener('click', cerrarModal);

  // Cerrar al hacer clic fuera del modal
  overlay.addEventListener('click', e => {
    if (e.target === overlay) cerrarModal();
  });

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarModal();
  });

  // Botón +
  btnMas.addEventListener('click', () => {
    if (cantidad < 999) {
      cantidad++;
      cantNum.textContent = cantidad;
      actualizarLink();
    }
  });

  // Botón −
  btnMenos.addEventListener('click', () => {
    if (cantidad > 1) {
      cantidad--;
      cantNum.textContent = cantidad;
      actualizarLink();
    }
  });

}); // fin DOMContentLoaded
