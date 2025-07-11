// Constantes
const API_URL = 'https://comitas-app-backend.onrender.com';
const LOCALS = [
  { id: 1, name: 'Sucursal Centro' },
];

// Funciones de utilidad
function validarFechaHora(fecha) {
  const fechaLocal = new Date(fecha);
  const dia = fechaLocal.getDay(); // 0 = domingo ... 6 = sábado
  const horaLocal = fechaLocal.getHours();
  const minutosLocal = fechaLocal.getMinutes();

  // Validar día de la semana (Jueves a Domingo)
  if (![0, 4, 5, 6].includes(dia)) {
    return {
      valido: false,
      mensaje: 'Solo se aceptan reservas de Jueves a Domingo.'
    };
  }

  // Validar rango horario (19:00 - 23:00)
  if (horaLocal < 19 || horaLocal > 23 || (horaLocal === 23 && minutosLocal > 1)) {
    return {
      valido: false,
      mensaje: 'Horario permitido: entre las 19:00 y 23:00 hs (hora Argentina).'
    };
  }

  // Validar última reserva (hasta 22:45)
  if (horaLocal === 22 && minutosLocal > 45) {
    return { 
      valido: false, 
      mensaje: 'La última reserva posible es a las 22:45 hs.' 
    };
  }

  return { valido: true };
}

async function verificarReservaExistente(usuarioId, fechaISO, token) {
  const fechaSoloDia = fechaISO.split('T')[0];
  
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
    return data.tieneReserva;
  } catch (error) {
    console.error('Error en verificarReservaExistente:', error);
    throw error;
  }
}

// Configuración de la interfaz
function configurarNavbar(username) {
  const loginNavItem = document.getElementById('loginNavItem');
  if (!loginNavItem) return;

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

function cargarSucursales() {
  const localSelect = document.getElementById('localId');
  if (!localSelect) return;

  while (localSelect.options.length > 1) localSelect.remove(1);
  LOCALS.forEach(loc => {
    const option = document.createElement('option');
    option.value = loc.id;
    option.textContent = loc.name;
    localSelect.appendChild(option);
  });
}

function inicializarFecha() {
  const fechaInput = document.getElementById('fechaReserva');
  if (!fechaInput) return;

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  fechaInput.min = today + 'T00:00';
  fechaInput.value = now.toISOString().slice(0, 16);
  
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
      
      fechaInput.value = '';
    }
  });
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticación
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (!userData?.token) {
    window.location.href = 'login.html';
    return;
  }

  const { username, id: userId, token } = userData;

  // Configurar interfaz
  const responsableInput = document.getElementById('responsable');
  if (responsableInput && username) {
    responsableInput.value = username;
  }

  configurarNavbar(username);
  cargarSucursales();
  inicializarFecha();

  // Manejador del formulario
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
      localDTO: { localId: parseInt(document.getElementById('localId').value) },
      usuarioDTO: { id: userId }
    };

    // Verificar reserva existente
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
          confirmButtonColor: 'var(--primary-color)'
        });
        return;
      }
    } catch (error) {
      console.warn('No se pudo verificar reservas existentes:', error);
      // Continuar con el proceso a pesar del error
    }

    // Procesar reserva
    try {
      // Validaciones
      if (!reserva.fechaReserva || !reserva.metodoPago || !reserva.responsable || !reserva.localDTO.localId) {
        throw new Error('Por favor, complete todos los campos obligatorios.');
      }

      const validacion = validarFechaHora(new Date(reserva.fechaReserva));
      if (!validacion.valido) {
        throw new Error(validacion.mensaje);
      }

      // Enviar reserva
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
        confirmButtonColor: 'var(--primary-color)'
      });
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
});
