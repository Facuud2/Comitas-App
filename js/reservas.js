// Función para verificar si un día es válido (jueves a domingo)
function esDiaValido(fecha) {
  const dia = fecha.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
  return dia === 0 || dia === 4 || dia === 5 || dia === 6; // 0=domingo, 4=jueves, 5=viernes, 6=sábado
}

// Función para obtener el próximo día válido
function obtenerProximoDiaValido(desde) {
  const fecha = new Date(desde);
  while (!esDiaValido(fecha)) {
    fecha.setDate(fecha.getDate() + 1);
    fecha.setHours(19, 0, 0, 0);
  }
  return fecha;
}

// Función para validar la fecha y hora seleccionada
function validarFechaHora(fechaHora) {
  const fecha = new Date(fechaHora);
  const hora = fecha.getHours();
  
  // Verificar si es un día válido
  if (!esDiaValido(fecha)) {
    return {
      valido: false,
      mensaje: 'Las reservas solo están disponibles de jueves a domingo.'
    };
  }
  
  // Verificar si está dentro del horario permitido (19:00 - 23:00)
  if (hora < 19 || hora >= 23) {
    return {
      valido: false,
      mensaje: 'El horario de reserva es de 19:00 a 23:00 hs.'
    };
  }
  
  return { valido: true };
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  const ahora = new Date();
  const inputFecha = document.getElementById('fechaReserva');
  const form = document.getElementById('reservationForm');
  
  if (!form) return; // Si no hay formulario, salir
  
  // Establecer la fecha mínima (hoy o el próximo día válido)
  let fechaMinima = new Date(ahora);
  fechaMinima.setHours(ahora.getHours() + 2); // Mínimo 2 horas en el futuro
  
  // Si la fecha mínima no es un día válido, ir al próximo día válido
  if (!esDiaValido(fechaMinima)) {
    fechaMinima = obtenerProximoDiaValido(fechaMinima);
  } else {
    // Si es un día válido pero fuera del horario, ajustar a la hora de apertura
    if (fechaMinima.getHours() < 19) {
      fechaMinima.setHours(19, 0, 0, 0);
    } else if (fechaMinima.getHours() >= 23) {
      // Si es después de las 23:00, ir al próximo día
      fechaMinima.setDate(fechaMinima.getDate() + 1);
      fechaMinima = obtenerProximoDiaValido(fechaMinima);
    }
  }
  
  // Formatear para input datetime-local (YYYY-MM-DDThh:mm)
  if (inputFecha) {
    inputFecha.min = fechaMinima.toISOString().slice(0, 16);
    inputFecha.value = fechaMinima.toISOString().slice(0, 16);
    
    // Validar al cambiar la fecha/hora
    inputFecha.addEventListener('input', function() {
      const validacion = validarFechaHora(new Date(this.value));
      if (!validacion.valido) {
        // Solo mostrar el mensaje de error, no forzar el cambio
        console.warn(validacion.mensaje);
      }
    });
  }
  
  // Manejar envío del formulario
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    try {
      // Mostrar estado de carga
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
      
      // Verificar sesión de usuario
      const userData = JSON.parse(localStorage.getItem('userData') || 'null');
      const token = userData?.token;
      
      if (!userData || !token) {
        window.location.href = 'login.html';
        return;
      }
      
      // Obtener datos del formulario
      const reservaData = {
        fechaReserva: document.getElementById('fechaReserva').value,
        descripcion: document.getElementById('descripcion').value || 'Sin comentarios adicionales',
        responsable: document.getElementById('responsable').value,
        metodoPago: document.getElementById('metodoPago').value,
        localDTO: {
          id: parseInt(document.getElementById('localId').value)
        },
        usuarioDTO: {
          id: userData.id
        }
      };
      
      // Validar campos requeridos
      if (!reservaData.fechaReserva || !reservaData.responsable || !reservaData.metodoPago) {
        throw new Error('Por favor complete todos los campos requeridos');
      }
      
      // Validar fecha/hora
      const validacion = validarFechaHora(new Date(reservaData.fechaReserva));
      if (!validacion.valido) {
        throw new Error(validacion.mensaje);
      }
      
      // Enviar solicitud
      const response = await fetch('https://comitas-app-backend.onrender.com/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reservaData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al procesar la reserva');
      }
      
      const result = await response.json();
      
      // Mostrar mensaje de éxito
      await Swal.fire({
        title: '¡Reserva exitosa!',
        text: `Tu reserva ha sido confirmada con el ID interno: ${result.id}`,
        icon: 'success',
        confirmButtonColor: 'var(--primary-color)'
      });
      
      // Limpiar formulario
      form.reset();
      
    } catch (error) {
      console.error('Error en la reserva:', error);
      
      // Mostrar mensaje de error
      await Swal.fire({
        title: 'Error',
        text: error.message || 'Ocurrió un error al procesar tu reserva. Por favor, inténtalo de nuevo.',
        icon: 'error',
        confirmButtonColor: 'var(--primary-color)'
      });
      
    } finally {
      // Restaurar estado del botón
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });
});