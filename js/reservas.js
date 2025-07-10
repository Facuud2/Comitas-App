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
    // Si es un día no válido, establecer la hora a las 19:00 del próximo día válido
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
  inputFecha.min = fechaMinima.toISOString().slice(0, 16);
  
  // Establecer un valor por defecto (mínimo)
  inputFecha.value = fechaMinima.toISOString().slice(0, 16);
  
  // Validar al cambiar la fecha/hora
  inputFecha.addEventListener('input', function() {
    const validacion = validarFechaHora(this.value);
    if (!validacion.valido) {
      alert(validacion.mensaje);
      // Restaurar al valor mínimo permitido
      this.value = inputFecha.min;
    }
  });
  
  // Manejar envío del formulario
  form.addEventListener('submit', async function(e) {
  e.preventDefault();

  const userSession = JSON.parse(localStorage.getItem('userSession'));
  const token = localStorage.getItem('JWTtoken');

  if (!userSession || !token) {
    alert('Debe iniciar sesión para hacer una reserva.');
    return;
  }

  // Validar fecha y hora
  const fechaHora = document.getElementById('fechaReserva').value;
  const validacion = validarFechaHora(fechaHora);
  if (!validacion.valido) {
    alert(validacion.mensaje);
    return;
  }

  const reservaData = {
    fechaReserva: fechaHora,
    descripcion: document.getElementById('descripcion').value,
    responsable: document.getElementById('responsable').value,
    metodoPago: document.getElementById('metodoPago').value,
    localDTO: {
      id: parseInt(document.getElementById('localId').value)
    },
    usuarioDTO: {
      id: parseInt(userSession.id)
    }
  };

  try {
    const response = await fetch('https://comitas-app-backend.onrender.com/reservas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reservaData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    alert(`¡Reserva confirmada con éxito! ID: ${result.id}`);
    form.reset();
  } catch (error) {
    console.error('Error en la reserva:', error);
    alert('Ocurrió un error al procesar su reserva. Por favor, intente nuevamente.');
  }
});
});