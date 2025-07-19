const API_URL = 'https://comitas-app-backend.onrender.com';

// Sucursales disponibles (podrían venir de una API real)
const LOCALS = [
  { id: 1, name: 'Sucursal Centro' },
  { id: 2, name: 'Sucursal Norte' },
  { id: 3, name: 'Sucursal Sur' }
];

document.addEventListener('DOMContentLoaded', () => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (!userData || !userData.token) {
    window.location.href = 'login.html';
    return;
  }

  const token = userData.token;
  const username = userData.username;
  const userId = userData.id;

  const responsableInput = document.getElementById('responsable');
  if (responsableInput && username) {
    responsableInput.value = username;
  }

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
    now.setHours(now.getHours() + 2); // mínimo 2 horas después
    const minFecha = now.toISOString().slice(0, 16);
    fechaInput.min = minFecha;
    fechaInput.value = minFecha;

    fechaInput.addEventListener('input', () => {
      const valid = validarFechaHora(new Date(fechaInput.value));
      if (!valid.valido) {
        Swal.fire({
          icon: 'warning',
          title: 'Fecha no válida',
          text: valid.mensaje,
          confirmButtonColor: 'var(--primary-color)'
        });
        fechaInput.value = minFecha;
      }
    });
  }

  // Validar rango de fecha/hora permitido
  function validarFechaHora(fecha) {
    const dia = fecha.getDay(); // 0 = Domingo, 6 = Sábado
    const hora = fecha.getHours();

    if (![0, 4, 5, 6].includes(dia)) {
      return { valido: false, mensaje: 'Solo se aceptan reservas de Jueves a Domingo.' };
    }

    if (hora < 19 || hora >= 23) {
      return { valido: false, mensaje: 'El horario permitido es de 19:00 a 23:00 hs.' };
    }

    return { valido: true };
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
      responsable: responsableInput.value,
      metodoPago: document.getElementById('metodoPago').value,
      localDTO: { id: parseInt(localSelect.value) },
      usuarioDTO: { id: userId }
    };

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
      await Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message || 'Ocurrió un error inesperado.',
        confirmButtonColor: 'var(--primary-color)'
      });
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
});
