// // Función para verificar si un día es válido (jueves a domingo)
// function esDiaValido(fecha) {
//   const dia = fecha.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
//   return dia === 0 || dia === 4 || dia === 5 || dia === 6; // 0=domingo, 4=jueves, 5=viernes, 6=sábado
// }

// // Función para obtener el próximo día válido
// function obtenerProximoDiaValido(desde) {
//   const fecha = new Date(desde);
//   while (!esDiaValido(fecha)) {
//     fecha.setDate(fecha.getDate() + 1);
//     fecha.setHours(19, 0, 0, 0);
//   }
//   return fecha;
// }

// // Función para validar la fecha y hora seleccionada
// function validarFechaHora(fechaHora) {
//   const fecha = new Date(fechaHora);
//   const hora = fecha.getHours();
  
//   // Verificar si es un día válido
//   if (!esDiaValido(fecha)) {
//     return {
//       valido: false,
//       mensaje: 'Las reservas solo están disponibles de jueves a domingo.'
//     };
//   }
  
//   // Verificar si está dentro del horario permitido (19:00 - 23:00)
//   if (hora < 19 || hora >= 23) {
//     return {
//       valido: false,
//       mensaje: 'El horario de reserva es de 19:00 a 23:00 hs.'
//     };
//   }
  
//   return { valido: true };
// }

// // Inicialización cuando el DOM esté listo
// document.addEventListener('DOMContentLoaded', function() {
//   const ahora = new Date();
//   const inputFecha = document.getElementById('fechaReserva');
//   const form = document.getElementById('reservationForm');
  
//   if (!form) return; // Si no hay formulario, salir
  
//   // Establecer la fecha mínima (hoy o el próximo día válido)
//   let fechaMinima = new Date(ahora);
//   fechaMinima.setHours(ahora.getHours() + 2); // Mínimo 2 horas en el futuro
  
//   // Si la fecha mínima no es un día válido, ir al próximo día válido
//   if (!esDiaValido(fechaMinima)) {
//     fechaMinima = obtenerProximoDiaValido(fechaMinima);
//   } else {
//     // Si es un día válido pero fuera del horario, ajustar a la hora de apertura
//     if (fechaMinima.getHours() < 19) {
//       fechaMinima.setHours(19, 0, 0, 0);
//     } else if (fechaMinima.getHours() >= 23) {
//       // Si es después de las 23:00, ir al próximo día
//       fechaMinima.setDate(fechaMinima.getDate() + 1);
//       fechaMinima = obtenerProximoDiaValido(fechaMinima);
//     }
//   }
  
//   // Formatear para input datetime-local (YYYY-MM-DDThh:mm)
//   if (inputFecha) {
//     inputFecha.min = fechaMinima.toISOString().slice(0, 16);
//     inputFecha.value = fechaMinima.toISOString().slice(0, 16);
    
//     // Validar al cambiar la fecha/hora
//     inputFecha.addEventListener('input', function() {
//       const validacion = validarFechaHora(new Date(this.value));
//       if (!validacion.valido) {
//         // Solo mostrar el mensaje de error, no forzar el cambio
//         console.warn(validacion.mensaje);
//       }
//     });
//   }
  
//   // Manejar envío del formulario
//   form.addEventListener('submit', async function(e) {
//     e.preventDefault();
    
//     const submitBtn = form.querySelector('button[type="submit"]');
//     const originalBtnText = submitBtn.innerHTML;
    
//     try {
//       // Mostrar estado de carga
//       submitBtn.disabled = true;
//       submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
      
//       // Verificar sesión de usuario
//       let userData;
//       try {
//         const userDataStr = localStorage.getItem('userData');
//         console.log('userData from localStorage:', userDataStr);
//         userData = userDataStr ? JSON.parse(userDataStr) : null;
//       } catch (e) {
//         console.error('Error parsing userData from localStorage:', e);
//         userData = null;
//       }
//       const token = userData?.token;
//       console.log('Token:', token);
      
//       if (!userData || !token) {
//         window.location.href = 'login.html';
//         return;
//       }
      
//       // Obtener datos del formulario
//       const reservaData = {
//         fechaReserva: document.getElementById('fechaReserva').value,
//         descripcion: document.getElementById('descripcion').value || 'Sin comentarios adicionales',
//         responsable: document.getElementById('responsable').value,
//         metodoPago: document.getElementById('metodoPago').value,
//         localDTO: {
//           id: parseInt(document.getElementById('localId').value)
//         },
//         usuarioDTO: {
//           id: userData.id
//         }
//       };
      
//       // Validar campos requeridos
//       if (!reservaData.fechaReserva || !reservaData.responsable || !reservaData.metodoPago) {
//         throw new Error('Por favor complete todos los campos requeridos');
//       }
      
//       // Validar fecha/hora
//       const validacion = validarFechaHora(new Date(reservaData.fechaReserva));
//       if (!validacion.valido) {
//         throw new Error(validacion.mensaje);
//       }
      
//       // Enviar solicitud
//       const response = await fetch('https://comitas-app-backend.onrender.com/reservas', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(reservaData)
//       });
      
//       if (!response.ok) {
//         const responseText = await response.text();
//         console.error('Error response from server:', response.status, response.statusText, responseText);
//         let errorMessage = 'Error al procesar la reserva';
//         try {
//           if (responseText) {
//             const errorData = JSON.parse(responseText);
//             errorMessage = errorData.message || errorMessage;
//           }
//         } catch (e) {
//           console.error('Error parsing error response:', e);
//           errorMessage = `${response.status} - ${response.statusText}: ${responseText || 'No hay detalles del error'}`;
//         }
//         throw new Error(errorMessage);
//       }
      
//       const responseText = await response.text();
//       console.log('Response text:', responseText);
//       let result;
//       try {
//         result = responseText ? JSON.parse(responseText) : {};
//       } catch (e) {
//         console.error('Error parsing response JSON:', e);
//         throw new Error('Error al procesar la respuesta del servidor');
//       }
      
//       // Mostrar mensaje de éxito
//       await Swal.fire({
//         title: '¡Reserva exitosa!',
//         text: `Tu reserva ha sido confirmada con el ID interno: ${result.id}`,
//         icon: 'success',
//         confirmButtonColor: 'var(--primary-color)'
//       });
      
//       // Limpiar formulario
//       form.reset();
      
//     } catch (error) {
//       console.error('Error en la reserva:', error);
      
//       // Mostrar mensaje de error
//       await Swal.fire({
//         title: 'Error',
//         text: error.message || 'Ocurrió un error al procesar tu reserva. Por favor, inténtalo de nuevo.',
//         icon: 'error',
//         confirmButtonColor: 'var(--primary-color)'
//       });
      
//     } finally {
//       // Restaurar estado del botón
//       if (submitBtn) {
//         submitBtn.disabled = false;
//         submitBtn.innerHTML = originalBtnText;
//       }
//     }
//   });
// });
// reservas.js
const API_URL = 'http://localhost:8080';

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


