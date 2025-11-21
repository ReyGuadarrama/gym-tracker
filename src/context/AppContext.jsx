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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
