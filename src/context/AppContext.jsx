import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Rutinas: { id, nombre, ejercicios: [{id, nombre, series, reps, descanso}] }
  const [rutinas, setRutinas] = useLocalStorage('rutinas', []);

  // Calendario: { fecha, rutinaId }
  const [calendario, setCalendario] = useLocalStorage('calendario', []);

  // Entrenamientos: {
  //   id, fecha, rutinaId, rutinaNombre,
  //   ejercicios: [{
  //     ejercicioId, nombre,
  //     series: [{peso, reps, tiempoSerie}],
  //     tiempoDescansoTotal
  //   }],
  //   tiempoTotal
  // }
  const [entrenamientos, setEntrenamientos] = useLocalStorage('entrenamientos', []);

  // Funciones para rutinas
  const agregarRutina = (rutina) => {
    const nuevaRutina = {
      ...rutina,
      id: Date.now().toString(),
      ejercicios: rutina.ejercicios.map((ej, idx) => ({
        ...ej,
        id: `${Date.now()}-${idx}`,
      })),
    };
    setRutinas([...rutinas, nuevaRutina]);
    return nuevaRutina;
  };

  const actualizarRutina = (id, rutinaActualizada) => {
    setRutinas(rutinas.map(r => r.id === id ? { ...rutinaActualizada, id } : r));
  };

  const eliminarRutina = (id) => {
    setRutinas(rutinas.filter(r => r.id !== id));
    // También eliminar del calendario
    setCalendario(calendario.filter(c => c.rutinaId !== id));
  };

  // Funciones para calendario
  const programarRutina = (fecha, rutinaId) => {
    const existente = calendario.find(c => c.fecha === fecha);
    if (existente) {
      setCalendario(calendario.map(c =>
        c.fecha === fecha ? { ...c, rutinaId } : c
      ));
    } else {
      setCalendario([...calendario, { fecha, rutinaId }]);
    }
  };

  const obtenerRutinaPorFecha = (fecha) => {
    const programacion = calendario.find(c => c.fecha === fecha);
    if (!programacion) return null;
    return rutinas.find(r => r.id === programacion.rutinaId);
  };

  // Funciones para entrenamientos
  const guardarEntrenamiento = (entrenamiento) => {
    const nuevoEntrenamiento = {
      ...entrenamiento,
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
    };
    setEntrenamientos([...entrenamientos, nuevoEntrenamiento]);
    return nuevoEntrenamiento;
  };

  const obtenerUltimoEntrenamiento = (rutinaId, ejercicioId) => {
    const entrenamientosRutina = entrenamientos
      .filter(e => e.rutinaId === rutinaId)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (entrenamientosRutina.length === 0) return null;

    const ultimoEntrenamiento = entrenamientosRutina[0];
    const ejercicio = ultimoEntrenamiento.ejercicios.find(e => e.ejercicioId === ejercicioId);

    return ejercicio || null;
  };

  const obtenerHistorialEjercicio = (ejercicioNombre) => {
    const historial = [];

    entrenamientos.forEach(entrenamiento => {
      entrenamiento.ejercicios.forEach(ejercicio => {
        if (ejercicio.nombre.toLowerCase() === ejercicioNombre.toLowerCase()) {
          ejercicio.series.forEach((serie, idx) => {
            historial.push({
              fecha: entrenamiento.fecha,
              serie: idx + 1,
              peso: serie.peso,
              reps: serie.reps,
              tiempo: serie.tiempoSerie,
            });
          });
        }
      });
    });

    return historial.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  };

  const obtenerTiempoPromedioRutina = (rutinaId) => {
    const entrenamientosRutina = entrenamientos.filter(e => e.rutinaId === rutinaId);

    if (entrenamientosRutina.length === 0) return null;

    const tiempoTotal = entrenamientosRutina.reduce((sum, e) => sum + e.tiempoTotal, 0);
    const promedio = Math.floor(tiempoTotal / entrenamientosRutina.length);

    return promedio;
  };

  const formatearTiempoEstimado = (segundos) => {
    if (!segundos) return null;

    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);

    if (horas > 0) {
      return `~${horas}h ${minutos}min`;
    }
    return `~${minutos} min`;
  };

  // Métricas motivantes
  const calcularVolumenMensual = () => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const entrenamientosMes = entrenamientos.filter(e => {
      const fechaEntrenamiento = new Date(e.fecha);
      return fechaEntrenamiento >= inicioMes;
    });

    let volumenTotal = 0;
    entrenamientosMes.forEach(entrenamiento => {
      entrenamiento.ejercicios.forEach(ejercicio => {
        ejercicio.series.forEach(serie => {
          volumenTotal += serie.peso * serie.reps;
        });
      });
    });

    return Math.round(volumenTotal);
  };

  const calcularRachaActual = () => {
    if (entrenamientos.length === 0) return 0;

    // Ordenar entrenamientos por fecha descendente
    const entrenamientosOrdenados = [...entrenamientos].sort((a, b) =>
      new Date(b.fecha) - new Date(a.fecha)
    );

    // Obtener fechas únicas (un entrenamiento por día)
    const fechasUnicas = [...new Set(entrenamientosOrdenados.map(e =>
      new Date(e.fecha).toISOString().split('T')[0]
    ))];

    let racha = 0;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let i = 0; i < fechasUnicas.length; i++) {
      const fechaEntrenamiento = new Date(fechasUnicas[i]);
      fechaEntrenamiento.setHours(0, 0, 0, 0);

      const diferenciaDias = Math.floor((hoy - fechaEntrenamiento) / (1000 * 60 * 60 * 24));

      if (diferenciaDias === racha) {
        racha++;
      } else {
        break;
      }
    }

    return racha;
  };

  const calcularProgresoSemanal = () => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes
    inicioSemana.setHours(0, 0, 0, 0);

    const entrenamientosSemana = entrenamientos.filter(e => {
      const fechaEntrenamiento = new Date(e.fecha);
      return fechaEntrenamiento >= inicioSemana;
    });

    // Obtener fechas únicas
    const fechasUnicas = new Set(entrenamientosSemana.map(e =>
      new Date(e.fecha).toISOString().split('T')[0]
    ));

    return {
      completados: fechasUnicas.size,
      objetivo: 5, // Meta de 5 entrenamientos por semana
      porcentaje: Math.min((fechasUnicas.size / 5) * 100, 100)
    };
  };

  const calcularTiempoMensual = () => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const entrenamientosMes = entrenamientos.filter(e => {
      const fechaEntrenamiento = new Date(e.fecha);
      return fechaEntrenamiento >= inicioMes;
    });

    const tiempoTotal = entrenamientosMes.reduce((sum, e) => sum + (e.tiempoTotal || 0), 0);

    const horas = Math.floor(tiempoTotal / 3600);
    const minutos = Math.floor((tiempoTotal % 3600) / 60);

    return { horas, minutos, total: tiempoTotal };
  };

  const value = {
    rutinas,
    calendario,
    entrenamientos,
    agregarRutina,
    actualizarRutina,
    eliminarRutina,
    programarRutina,
    obtenerRutinaPorFecha,
    guardarEntrenamiento,
    obtenerUltimoEntrenamiento,
    obtenerHistorialEjercicio,
    obtenerTiempoPromedioRutina,
    formatearTiempoEstimado,
    calcularVolumenMensual,
    calcularRachaActual,
    calcularProgresoSemanal,
    calcularTiempoMensual,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
