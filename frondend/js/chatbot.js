// =================================================================
// MÓDULO: CHATBOT DE AYUDA - SISTEMA ETS ESCOM
// =================================================================

(function () {

    // -----------------------------------------------------------------
    // BASE DE CONOCIMIENTO (FAQ)
    // -----------------------------------------------------------------
    const KB = [
        {
            keywords: ['inscribir', 'inscripcion', 'inscripción', 'registrar', 'registro', 'apuntar'],
            answer: `Para inscribirte a un ETS:<br>
            1. Ve a <b>Inscribir ETS</b> en el menú lateral.<br>
            2. Selecciona el examen disponible.<br>
            3. Confirma tu inscripción.<br>
            <small class="text-muted">Recuerda que el examen debe estar en estado <b>Abierto</b> y debes realizar el pago para que tu inscripción sea válida.</small>`
        },
        {
            keywords: ['pago', 'pagar', 'ficha', 'estado pago', 'aprobado', 'pendiente'],
            answer: `El estado de pago es actualizado por el <b>Administrador Escolar</b> tras verificar tu comprobante en ventanilla.<br>
            <small class="text-muted">Si tu pago aparece como <b>Pendiente</b> y ya pagaste, acércate al departamento de Control Escolar con tu recibo.</small>`
        },
        {
            keywords: ['calificacion', 'calificación', 'nota', 'resultado', 'acta'],
            answer: `Tus calificaciones aparecen en la sección <b>Mi Kardex</b> una vez que el profesor ha cerrado y asentado el acta del examen.<br>
            <small class="text-muted">Si tienes dudas sobre una calificación, puedes solicitar una <b>revisión de examen</b> directamente al profesor sinodal.</small>`
        },
        {
            keywords: ['kardex', 'historial', 'materias', 'carrera'],
            answer: `Tu Kardex muestra todas las materias con ETS que has presentado y sus calificaciones.<br>
            Puedes consultarlo desde el menú <b>Mi Kardex</b>.`
        },
        {
            keywords: ['revision', 'revisión', 'reclamar', 'inconformidad', 'apelar'],
            answer: `Si deseas solicitar una revisión de calificación:<br>
            1. Comunícate directamente con tu profesor sinodal.<br>
            2. El profesor podrá procesar la petición desde su <b>Panel Docente → Peticiones de Revisión</b>.<br>
            <small class="text-muted">El cambio queda registrado de forma definitiva en el acta.</small>`
        },
        {
            keywords: ['fecha', 'hora', 'horario', 'cuando', 'día', 'dia', 'salon', 'salón', 'lugar'],
            answer: `La fecha, hora y salón de cada ETS están disponibles en la vista <b>Inscribir ETS</b>.<br>
            El administrador los publica cuando el examen pasa a estado <b>Abierto</b>.`
        },
        {
            keywords: ['contraseña', 'contrasena', 'password', 'clave', 'olvidé', 'olvide', 'acceso', 'login'],
            answer: `Si olvidaste tu contraseña, comunícate con el <b>Departamento de Control Escolar</b> para que un administrador restablezca tu acceso.<br>
            <small class="text-muted">No existe recuperación automática por correo en esta versión del sistema.</small>`
        },
        {
            keywords: ['profesor', 'sinodal', 'docente', 'quien', 'quién', 'responsable'],
            answer: `Cada examen tiene asignado un <b>Sinodal/Profesor</b> que es responsable de la lista de alumnos y de asentar las calificaciones.<br>
            Puedes ver el nombre del sinodal en la información del ETS al que te inscribiste.`
        },
        {
            keywords: ['cupo', 'lleno', 'capacidad', 'disponible', 'lugares'],
            answer: `Cada ETS tiene un <b>cupo máximo de alumnos</b>. Si el examen está lleno, ya no aparecerá como disponible para inscripción.<br>
            Consulta al administrador escolar si necesitas información sobre cupos adicionales.`
        },
        {
            keywords: ['ayuda', 'soporte', 'problema', 'error', 'fallo', 'no funciona', 'contacto', 'correo', 'mail'],
            answer: `Para soporte técnico o administrativo:<br>
            📧 <b>control.escolar@escom.ipn.mx</b><br>
            🏢 Departamento de Control Escolar, edificio principal.<br>
            <small class="text-muted">Horario: Lunes a Viernes de 9:00 a 14:00 hrs.</small>`
        },
        {
            keywords: ['ets', 'examen', 'que es', 'qué es', 'suficiencia', 'titulo', 'título'],
            answer: `Un <b>ETS (Examen a Título de Suficiencia)</b> es una evaluación que permite a los alumnos acreditar una materia sin haberla cursado en el semestre regular, siempre que cumplan los requisitos académicos establecidos por el IPN.`
        },
        {
            keywords: ['hola', 'buenos', 'buenas', 'saludos', 'hi', 'hello'],
            answer: `¡Hola! 👋 Soy el asistente virtual del <b>Sistema ETS ESCOM</b>.<br>
            Puedo ayudarte con información sobre inscripciones, pagos, calificaciones, kardex y más.<br>
            <small class="text-muted">¿En qué te puedo ayudar?</small>`
        },
        {
            keywords: ['gracias', 'ok', 'entendido', 'listo', 'perfecto', 'bien'],
            answer: `¡Con gusto! 😊 Si tienes otra duda, aquí estoy. ¡Mucho éxito en tu ETS!`
        }
    ];

    const RESPUESTA_DEFAULT = `No encontré información específica sobre eso. Para una respuesta más detallada, contacta al <b>Departamento de Control Escolar</b>.<br>
    <small class="text-muted">Prueba con palabras clave como: <i>inscripción, pago, calificación, kardex, revisión, horario, contraseña</i>.</small>`;

    // -----------------------------------------------------------------
    // LÓGICA DE BÚSQUEDA DE RESPUESTA
    // -----------------------------------------------------------------
    function obtenerRespuesta(mensaje) {
        const msgNorm = mensaje.toLowerCase()
            .normalize('NFD').replace(/[̀-ͯ]/g, ''); // quitar acentos

        for (const item of KB) {
            for (const kw of item.keywords) {
                const kwNorm = kw.normalize('NFD').replace(/[̀-ͯ]/g, '');
                if (msgNorm.includes(kwNorm)) {
                    return item.answer;
                }
            }
        }
        return RESPUESTA_DEFAULT;
    }

    // -----------------------------------------------------------------
    // ESTILOS DEL CHATBOT
    // -----------------------------------------------------------------
    const estilos = `
        #chatbot-toggle {
            position: fixed;
            bottom: 28px;
            right: 28px;
            width: 58px;
            height: 58px;
            border-radius: 50%;
            background: linear-gradient(135deg, #0055A5, #003366);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(0,85,165,0.45);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        #chatbot-toggle:hover {
            transform: scale(1.1);
            box-shadow: 0 8px 24px rgba(0,85,165,0.6);
        }
        #chatbot-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background: #dc3545;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 0.7rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            display: none;
        }
        #chatbot-window {
            position: fixed;
            bottom: 100px;
            right: 28px;
            width: 360px;
            max-width: calc(100vw - 40px);
            height: 480px;
            max-height: calc(100vh - 120px);
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 16px 48px rgba(0,0,0,0.18);
            z-index: 9998;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transform: scale(0.8) translateY(20px);
            opacity: 0;
            pointer-events: none;
            transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
        }
        #chatbot-window.abierto {
            transform: scale(1) translateY(0);
            opacity: 1;
            pointer-events: all;
        }
        #chatbot-header {
            background: linear-gradient(135deg, #0055A5, #003366);
            color: white;
            padding: 14px 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
        }
        #chatbot-header .chat-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
        }
        #chatbot-header .chat-info small {
            opacity: 0.8;
            font-size: 0.72rem;
        }
        #chatbot-header .btn-close-chat {
            margin-left: auto;
            background: none;
            border: none;
            color: white;
            font-size: 1.1rem;
            cursor: pointer;
            opacity: 0.8;
            padding: 4px 6px;
            border-radius: 6px;
            transition: opacity 0.2s, background 0.2s;
        }
        #chatbot-header .btn-close-chat:hover {
            opacity: 1;
            background: rgba(255,255,255,0.15);
        }
        #chatbot-messages {
            flex: 1;
            overflow-y: auto;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: #f8f9fb;
        }
        #chatbot-messages::-webkit-scrollbar { width: 4px; }
        #chatbot-messages::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        .chat-msg {
            max-width: 88%;
            padding: 9px 13px;
            border-radius: 14px;
            font-size: 0.875rem;
            line-height: 1.5;
            word-break: break-word;
            animation: msgFadeIn 0.2s ease;
        }
        @keyframes msgFadeIn {
            from { opacity:0; transform: translateY(6px); }
            to   { opacity:1; transform: translateY(0); }
        }
        .chat-msg.bot {
            background: #fff;
            border: 1px solid #e8eaed;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .chat-msg.user {
            background: linear-gradient(135deg, #0055A5, #003366);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }
        .chat-typing {
            display: flex;
            gap: 4px;
            align-items: center;
            padding: 10px 14px;
        }
        .chat-typing span {
            width: 8px;
            height: 8px;
            background: #adb5bd;
            border-radius: 50%;
            display: inline-block;
            animation: typingBounce 1.2s ease-in-out infinite;
        }
        .chat-typing span:nth-child(2) { animation-delay: 0.2s; }
        .chat-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-6px); }
        }
        #chatbot-input-area {
            padding: 10px 12px;
            border-top: 1px solid #e8eaed;
            display: flex;
            gap: 8px;
            flex-shrink: 0;
            background: #fff;
        }
        #chatbot-input {
            flex: 1;
            border: 1px solid #dee2e6;
            border-radius: 24px;
            padding: 8px 14px;
            font-size: 0.875rem;
            outline: none;
            transition: border-color 0.2s;
            font-family: inherit;
        }
        #chatbot-input:focus { border-color: #0055A5; }
        #chatbot-send {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: linear-gradient(135deg, #0055A5, #003366);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.95rem;
            flex-shrink: 0;
            transition: transform 0.15s, box-shadow 0.15s;
        }
        #chatbot-send:hover {
            transform: scale(1.08);
            box-shadow: 0 4px 12px rgba(0,85,165,0.35);
        }
        .chat-sugerencias {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 6px;
        }
        .chat-chip {
            font-size: 0.78rem;
            padding: 4px 10px;
            border-radius: 20px;
            background: #e8f0fe;
            color: #0055A5;
            border: 1px solid #c5d8f7;
            cursor: pointer;
            transition: background 0.15s;
            white-space: nowrap;
        }
        .chat-chip:hover { background: #c5d8f7; }
    `;

    const SUGERENCIAS_INICIALES = ['¿Cómo me inscribo?', 'Estado de mi pago', 'Ver mi Kardex', 'Revisión de calificación', '¿Qué es un ETS?'];

    // -----------------------------------------------------------------
    // CONSTRUCCIÓN DEL DOM
    // -----------------------------------------------------------------
    function construirWidget() {
        // Inyectar estilos
        const styleEl = document.createElement('style');
        styleEl.textContent = estilos;
        document.head.appendChild(styleEl);

        // Botón flotante
        const toggle = document.createElement('button');
        toggle.id = 'chatbot-toggle';
        toggle.title = 'Asistente de Ayuda';
        toggle.innerHTML = `<i class="bi bi-chat-dots-fill"></i><span id="chatbot-badge">1</span>`;

        // Ventana del chat
        const ventana = document.createElement('div');
        ventana.id = 'chatbot-window';
        ventana.setAttribute('role', 'dialog');
        ventana.setAttribute('aria-label', 'Chatbot de ayuda');
        ventana.innerHTML = `
            <div id="chatbot-header">
                <div class="chat-avatar"><i class="bi bi-mortarboard-fill"></i></div>
                <div class="chat-info">
                    <div style="font-weight:600;font-size:0.9rem;">Asistente ETS</div>
                    <small>ESCOM · IPN · Control Escolar</small>
                </div>
                <button class="btn-close-chat" id="chatbot-close" title="Cerrar">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
            <div id="chatbot-messages"></div>
            <div id="chatbot-input-area">
                <input type="text" id="chatbot-input" placeholder="Escribe tu pregunta..." maxlength="200" autocomplete="off">
                <button id="chatbot-send" title="Enviar"><i class="bi bi-send-fill"></i></button>
            </div>
        `;

        document.body.appendChild(toggle);
        document.body.appendChild(ventana);

        // Mostrar badge inicial para llamar la atención
        setTimeout(() => {
            const badge = document.getElementById('chatbot-badge');
            if (badge) badge.style.display = 'flex';
        }, 2000);

        // Eventos
        toggle.addEventListener('click', toggleChat);
        document.getElementById('chatbot-close').addEventListener('click', cerrarChat);
        document.getElementById('chatbot-send').addEventListener('click', enviarMensaje);
        document.getElementById('chatbot-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') enviarMensaje();
        });

        // Mensaje de bienvenida
        setTimeout(mostrarBienvenida, 300);
    }

    // -----------------------------------------------------------------
    // CONTROL DE APERTURA / CIERRE
    // -----------------------------------------------------------------
    let estaAbierto = false;

    function toggleChat() {
        estaAbierto ? cerrarChat() : abrirChat();
    }

    function abrirChat() {
        estaAbierto = true;
        document.getElementById('chatbot-window').classList.add('abierto');
        document.getElementById('chatbot-toggle').innerHTML = `<i class="bi bi-x-lg"></i>`;
        const badge = document.getElementById('chatbot-badge');
        if (badge) badge.style.display = 'none';
        setTimeout(() => document.getElementById('chatbot-input').focus(), 200);
    }

    function cerrarChat() {
        estaAbierto = false;
        document.getElementById('chatbot-window').classList.remove('abierto');
        document.getElementById('chatbot-toggle').innerHTML = `<i class="bi bi-chat-dots-fill"></i><span id="chatbot-badge" style="display:none;"></span>`;
    }

    // -----------------------------------------------------------------
    // MENSAJES
    // -----------------------------------------------------------------
    function mostrarBienvenida() {
        const msgsEl = document.getElementById('chatbot-messages');
        if (!msgsEl) return;

        const bienvenida = document.createElement('div');
        bienvenida.className = 'chat-msg bot';
        bienvenida.innerHTML = `
            👋 ¡Hola! Soy el asistente del <b>Sistema ETS ESCOM</b>.<br>
            Puedo ayudarte con dudas sobre inscripciones, pagos, calificaciones y más.<br>
            <div class="chat-sugerencias mt-2">
                ${SUGERENCIAS_INICIALES.map(s => `<span class="chat-chip" data-msg="${s}">${s}</span>`).join('')}
            </div>
        `;
        msgsEl.appendChild(bienvenida);

        // Eventos en los chips
        bienvenida.querySelectorAll('.chat-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const msg = chip.getAttribute('data-msg');
                procesarMensaje(msg);
            });
        });

        scrollAbajo();
    }

    function agregarMensaje(texto, tipo) {
        const msgsEl = document.getElementById('chatbot-messages');
        const div = document.createElement('div');
        div.className = `chat-msg ${tipo}`;
        if (tipo === 'user') {
            div.textContent = texto;
        } else {
            div.innerHTML = texto;
        }
        msgsEl.appendChild(div);
        scrollAbajo();
        return div;
    }

    function mostrarTyping() {
        const msgsEl = document.getElementById('chatbot-messages');
        const typing = document.createElement('div');
        typing.className = 'chat-msg bot chat-typing-wrapper';
        typing.id = 'typing-indicator';
        typing.innerHTML = `<div class="chat-typing"><span></span><span></span><span></span></div>`;
        msgsEl.appendChild(typing);
        scrollAbajo();
    }

    function quitarTyping() {
        const t = document.getElementById('typing-indicator');
        if (t) t.remove();
    }

    function scrollAbajo() {
        const msgsEl = document.getElementById('chatbot-messages');
        if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
    }

    // -----------------------------------------------------------------
    // FLUJO DE CONVERSACIÓN
    // -----------------------------------------------------------------
    function enviarMensaje() {
        const input = document.getElementById('chatbot-input');
        const texto = (input.value || '').trim();
        if (!texto) return;
        input.value = '';
        procesarMensaje(texto);
    }

    function procesarMensaje(texto) {
        if (!estaAbierto) abrirChat();

        agregarMensaje(texto, 'user');

        // Deshabilitar input mientras "piensa"
        const input = document.getElementById('chatbot-input');
        const btnSend = document.getElementById('chatbot-send');
        input.disabled = true;
        btnSend.disabled = true;

        mostrarTyping();

        // Simular latencia de respuesta
        setTimeout(() => {
            quitarTyping();
            const respuesta = obtenerRespuesta(texto);
            agregarMensaje(respuesta, 'bot');
            input.disabled = false;
            btnSend.disabled = false;
            input.focus();
        }, 700 + Math.random() * 400);
    }

    // -----------------------------------------------------------------
    // INICIALIZACIÓN
    // -----------------------------------------------------------------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', construirWidget);
    } else {
        construirWidget();
    }

})();
