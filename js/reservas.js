const API_URL = 'https://comitas-app-backend.onrender.com';

// Sucursales disponibles (podrían venir de una API real)
const LOCALS = [
  { id: 1, name: 'Sucursal Centro' },
];

document.addEventListener('DOMContentLoaded', () => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (!userData || !userData.token) {
    window.location.href = 'login.html';
    return;
  }

  const username = userData.username;
  const userId = userData.id;
  const token = userData.token;

  const responsableInput = document.getElementById('responsable');
  if (responsableInput && username) {
    responsableInput.value = username;
  }


    // Manejo del formulario
    const form = document.getElementById('reservationForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Procesando`;
  
      const reserva = {
        fechaReserva: document.getElementById('fechaReserva').value,
        descripcion: document.getElementById('descripcion').value || 'Sin comentarios',
        responsable: document.getElementById('responsable').value,
        metodoPago: document.getElementById('metodoPago').value,
        localDTO: { id: document.getElementById('localId').value },
        usuarioDTO: { id: userId }
      };
  
      async function verificarReservaExistente(usuarioId, fechaISO, token) {
        const fechaSoloDia = fechaISO.split('T')[0]; // yyyy-MM-dd
        
        try {
          const url = `${API_URL}/usuarios/${usuarioId}/reserva-dia?fecha=${fechaSoloDia}`;
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al verificar reservas existentes');
          }
          
          const data = await response.json();
          return data.tieneReserva; // true o false
        } catch (error) {
          console.error('Error en verificarReservaExistente:', error);
          throw error;
        }
      }
  
      // Verificar si ya tiene reserva para la fecha seleccionada
      try {
        const yaTieneReserva = await verificarReservaExistente(userId, reserva.fechaReserva, token);
        if (yaTieneReserva) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          
          await Swal.fire({
            icon: 'warning',
            title: '¡Reserva existente!',
            html: `
              <p>Ya tienes una reserva registrada para el día seleccionado.</p>
              <p class="mb-0">Si necesitas modificar tu reserva, por favor contacta con el restaurante.</p>
            `,
            confirmButtonText: 'Entendido',
            confirmButtonColor: 'var(--primary-color)',
            customClass: {
              confirmButton: 'swal-confirm-btn'
            }
          });
          return; // Detener el proceso de reserva
        }
      } catch (error) {
        console.warn('No se pudo verificar reservas existentes:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        // Continuar con el proceso a pesar del error en la verificación
      }
  
      try {
        // Validaciones adicionales
        if (!reserva.fechaReserva || !reserva.metodoPago || !reserva.responsable || !reserva.localDTO.id) {
          throw new Error('Por favor, complete todos los campos obligatorios.');
        }
  
        const validacion = validarFechaHora(new Date(reserva.fechaReserva));
        if (!validacion.valido) {
          throw new Error(validacion.mensaje);
        }
  
  
        const response = await fetch(`${API_URL}/reservas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(reserva)
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al registrar la reserva.');
        }
  
        const result = await response.json();
        await Swal.fire({
          icon: 'success',
          title: '¡Reserva confirmada!',
          text: `Tu reserva fue registrada con ID interno ${result.id}.`,
          confirmButtonColor: 'var(--primary-color)'
        });
  
        form.reset();
        submitBtn.innerHTML = originalText;
      } catch (err) {
        console.error('Error en el proceso de reserva:', err);
        
        let errorMessage = 'Ocurrió un error al procesar tu reserva.';
        let errorTitle = 'Error';
        
        if (err.message.includes('tienes una reserva')) {
          errorTitle = 'Reserva duplicada';
          errorMessage = err.message;
        } else if (err.message.includes('fecha no válida') || err.message.includes('horario permitido')) {
          errorTitle = 'Fecha no disponible';
          errorMessage = err.message;
        } else if (err.message.includes('network') || err.message.includes('Failed to fetch')) {
          errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.';
        } else if (err.message.includes('complete todos los campos')) {
          errorTitle = 'Campos incompletos';
          errorMessage = err.message;
        }
        
        await Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
          confirmButtonText: 'Entendido',
          confirmButtonColor: 'var(--primary-color)',
          customClass: {
            confirmButton: 'swal-confirm-btn'
          }
        });
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });

  // Mostrar estado de sesión en navbar
  const loginNavItem = document.getElementById('loginNavItem');
  if (loginNavItem) {
    const parent = loginNavItem.closest('ul');
    loginNavItem.remove();

    const loggedInItem = document.createElement('li');
    loggedInItem.className = 'nav-item ms-lg-3';
    loggedInItem.innerHTML = `
      <span class="btn btn-outline-light disabled">
        <i class="fas fa-user-check me-2"></i>${username}
      </span>
    `;

    const logoutItem = document.createElement('li');
    logoutItem.className = 'nav-item ms-lg-2';
    logoutItem.innerHTML = `
      <button class="btn btn-outline-light" id="logoutBtn">
        <i class="fas fa-sign-out-alt me-2"></i>Cerrar sesión
      </button>
    `;

    parent.appendChild(loggedInItem);
    parent.appendChild(logoutItem);

    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('userData');
      window.location.href = 'index.html';
    });
  }

  // Pre-cargar sucursales
  const localSelect = document.getElementById('localId');
  if (localSelect) {
    while (localSelect.options.length > 1) localSelect.remove(1);
    LOCALS.forEach(loc => {
      const option = document.createElement('option');
      option.value = loc.id;
      option.textContent = loc.name;
      localSelect.appendChild(option);
    });
  }

  // Inicializar selector de fecha
  const fechaInput = document.getElementById('fechaReserva');
  if (fechaInput) {
    const now = new Date();
    
    // Configurar la fecha mínima como hoy
    const today = now.toISOString().split('T')[0];
    fechaInput.min = today + 'T00:00';
    
    // Establecer la fecha actual como valor por defecto
    fechaInput.value = now.toISOString().slice(0, 16);
    
    // Validar cuando el usuario seleccione una fecha/hora
    fechaInput.addEventListener('change', () => {
      const selectedDate = new Date(fechaInput.value);
      const valid = validarFechaHora(selectedDate);
      
      if (!valid.valido) {
        Swal.fire({
          icon: 'warning',
          title: 'Horario no disponible',
          text: 'Por favor, selecciona un horario entre 19:00 y 23:00 hs de Jueves a Domingo.',
          confirmButtonColor: 'var(--primary-color)'
        });
        
        // No ajustamos automáticamente, solo mostramos el mensaje
        fechaInput.value = ''; // Limpiar el campo para que el usuario elija otra vez
      }
    });
  }

  // Validar rango de fecha/hora permitido
  function validarFechaHora(fecha) {
    // Asegurarse de trabajar con la hora local de Argentina (GMT-3)
    const fechaLocal = new Date(fecha);
    const dia = fechaLocal.getDay(); // 0 = domingo ... 6 = sábado
    const horaLocal = fechaLocal.getHours();
    const minutosLocal = fechaLocal.getMinutes();

    // Días permitidos: Jueves (4), Viernes (5), Sábado (6), Domingo (0)
    if (![0, 4, 5, 6].includes(dia)) {
      return {
        valido: false,
        mensaje: 'Solo se aceptan reservas de Jueves a Domingo.'
      };
    }

    // Rango horario: desde 19:00 (inclusive) hasta 23:01 (hora de Argentina)
    if (horaLocal  < 19 || horaLocal > 23 || (horaLocal === 23 && minutosLocal > 1)) {
      return {
        valido: false,
        mensaje: 'Horario permitido: entre las 19:00 y 23:00 hs (hora Argentina).'
      };
    }

    return { valido: true };
  }


    // Validar horario (19:00 a 23:00) en hora de Argentina
    const fechaLocal = new Date();
    const horaLocal = fechaLocal.getHours();
    const minutosLocal = fechaLocal.getMinutes();
    
    if (horaLocal < 19 || horaLocal > 23 || (horaLocal === 23 && minutosLocal > 1)) {
      return { 
        valido: false, 
        mensaje: 'El horario permitido es de 19:00 a 23:00 hs (hora Argentina).' 
      };
    }

    // Validar que no sea después de las 22:45 (para permitir al menos 15 minutos de servicio)
    if (horaLocal === 22 && minutosLocal > 45) {
      return { 
        valido: false, 
        mensaje: 'La última reserva posible es a las 22:45 hs.' 
      };
    }

    return { valido: true };
  });


