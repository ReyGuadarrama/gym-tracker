import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Timer from '../components/Timer';
import Stopwatch from '../components/Stopwatch';
import { Check, ChevronRight, Clock } from 'lucide-react';
import { formatPeso, formatNumero } from '../utils/formatters';

export default function Entrenar() {
  const location = useLocation();
  const {
    rutinas,
    guardarEntrenamiento,
    obtenerUltimoEntrenamiento,
    obtenerTiempoPromedioRutina,
    formatearTiempoEstimado,
  } = useApp();

  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);
  const [ejercicioActual, setEjercicioActual] = useState(0);
  const [serieActual, setSerieActual] = useState(0);
  const [datosEntrenamiento, setDatosEntrenamiento] = useState([]);
  const [mostrarDescanso, setMostrarDescanso] = useState(false);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [formSerie, setFormSerie] = useState({ peso: '', reps: '' });

  // Efecto para manejar la rutina preseleccionada desde el calendario
  useEffect(() => {
    if (location.state?.rutinaPreseleccionada && !rutinaSeleccionada) {
      setRutinaSeleccionada(location.state.rutinaPreseleccionada);
    }
  }, [location.state]);

  useEffect(() => {
    if (rutinaSeleccionada && !tiempoInicio) {
      setTiempoInicio(Date.now());
      inicializarDatos();
    }
  }, [rutinaSeleccionada]);

  const inicializarDatos = () => {
    const datos = rutinaSeleccionada.ejercicios.map((ej) => {
      const ultimoEjercicio = obtenerUltimoEntrenamiento(rutinaSeleccionada.id, ej.id);
      return {
        ejercicioId: ej.id,
        nombre: ej.nombre,
        seriesPlaneadas: ej.series,
        repsPlaneadas: ej.reps,
        descanso: ej.descanso,
        series: [],
        ultimoEntrenamiento: ultimoEjercicio,
      };
    });
    setDatosEntrenamiento(datos);
  };

  const ejercicio = datosEntrenamiento[ejercicioActual];
  const seriesCompletadas = ejercicio?.series.length || 0;
  const totalSeries = ejercicio?.seriesPlaneadas || 0;

  const registrarSerie = (tiempoSerie) => {
    if (!formSerie.peso || !formSerie.reps) {
      alert('Por favor ingresa el peso y las repeticiones');
      return;
    }

    const nuevaSerie = {
      peso: parseFloat(formSerie.peso),
      reps: parseInt(formSerie.reps),
      tiempoSerie: tiempoSerie,
    };

    const nuevosDatos = [...datosEntrenamiento];
    nuevosDatos[ejercicioActual].series.push(nuevaSerie);
    setDatosEntrenamiento(nuevosDatos);

    setFormSerie({ peso: '', reps: '' });
    setSerieActual(serieActual + 1);

    // Si no es la última serie, mostrar descanso
    if (serieActual + 1 < totalSeries) {
      setMostrarDescanso(true);
    } else {
      // Siguiente ejercicio
      siguienteEjercicio();
    }
  };

  const siguienteEjercicio = () => {
    if (ejercicioActual + 1 < datosEntrenamiento.length) {
      setEjercicioActual(ejercicioActual + 1);
      setSerieActual(0);
      setMostrarDescanso(false);
    } else {
      finalizarEntrenamiento();
    }
  };

  const finalizarEntrenamiento = () => {
    const tiempoTotal = Math.floor((Date.now() - tiempoInicio) / 1000);

    const entrenamiento = {
      rutinaId: rutinaSeleccionada.id,
      rutinaNombre: rutinaSeleccionada.nombre,
      ejercicios: datosEntrenamiento.map((ej) => ({
        ejercicioId: ej.ejercicioId,
        nombre: ej.nombre,
        series: ej.series,
        tiempoDescansoTotal: 0,
      })),
      tiempoTotal: tiempoTotal,
    };

    guardarEntrenamiento(entrenamiento);

    alert('¡Entrenamiento completado! 💪');
    setRutinaSeleccionada(null);
    setEjercicioActual(0);
    setSerieActual(0);
    setDatosEntrenamiento([]);
    setTiempoInicio(null);
  };

  const omitirDescanso = () => {
    setMostrarDescanso(false);
  };

  if (!rutinaSeleccionada) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Iniciar Entrenamiento</h2>

        {rutinas.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-600 mb-4">
              No tienes rutinas creadas. Crea una rutina primero.
            </p>
            <Button onClick={() => (window.location.href = '/rutinas')}>
              Ir a Rutinas
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rutinas.map((rutina) => (
              <Card
                key={rutina.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setRutinaSeleccionada(rutina)}
              >
                <h3 className="text-lg font-semibold mb-2">{rutina.nombre}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {rutina.ejercicios.length} ejercicios
                </p>
                <ul className="space-y-1 mb-4">
                  {rutina.ejercicios.slice(0, 3).map((ej, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      • {ej.nombre} ({ej.series}x{ej.reps})
                    </li>
                  ))}
                  {rutina.ejercicios.length > 3 && (
                    <li className="text-sm text-gray-500">
                      ...y {rutina.ejercicios.length - 3} más
                    </li>
                  )}
                </ul>

                {/* Tiempo estimado */}
                {(() => {
                  const tiempoPromedio = obtenerTiempoPromedioRutina(rutina.id);
                  const tiempoFormateado = formatearTiempoEstimado(tiempoPromedio);
                  return tiempoFormateado ? (
                    <p className="text-sm text-blue-600 font-medium mb-3 pb-3 border-b">
                      ⏱ Duración estimada: {tiempoFormateado}
                    </p>
                  ) : null;
                })()}

                <Button className="w-full">Comenzar</Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (mostrarDescanso && ejercicio) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold">Descanso</h3>
            <p className="text-gray-600">
              Serie {serieActual} de {totalSeries} completada
            </p>
            <Timer
              duracion={ejercicio.descanso}
              onComplete={omitirDescanso}
              autoStart={true}
              label="Tiempo de descanso"
            />
            <Button onClick={omitirDescanso} variant="secondary" className="mt-4">
              Omitir Descanso
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!ejercicio) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{rutinaSeleccionada.nombre}</h2>
        <p className="text-gray-600">
          Ejercicio {ejercicioActual + 1} de {datosEntrenamiento.length}
        </p>
      </div>

      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{
            width: `${((ejercicioActual + 1) / datosEntrenamiento.length) * 100}%`,
          }}
        />
      </div>

      <Card>
        <h3 className="text-xl font-bold mb-2">{ejercicio.nombre}</h3>
        <p className="text-gray-600 mb-4">
          Serie {serieActual + 1} de {totalSeries} ({ejercicio.repsPlaneadas} reps planeadas)
        </p>

        {ejercicio.ultimoEntrenamiento && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Último entrenamiento:</p>
            <div className="space-y-1">
              {ejercicio.ultimoEntrenamiento.series.map((serie, idx) => (
                <p key={idx} className="text-sm text-blue-700">
                  Serie {idx + 1}: {formatPeso(serie.peso)}kg × {formatNumero(serie.reps)} reps
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            label="Peso (kg)"
            type="number"
            step="0.5"
            value={formSerie.peso}
            onChange={(e) => setFormSerie({ ...formSerie, peso: e.target.value })}
            placeholder="20"
          />
          <Input
            label="Repeticiones"
            type="number"
            value={formSerie.reps}
            onChange={(e) => setFormSerie({ ...formSerie, reps: e.target.value })}
            placeholder={ejercicio.repsPlaneadas.toString()}
          />
        </div>

        <Stopwatch
          onStop={registrarSerie}
          label="Tiempo de la serie"
        />

        {seriesCompletadas > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Series completadas:
            </p>
            {ejercicio.series.map((serie, idx) => (
              <div key={idx} className="flex items-center text-sm text-gray-600 mb-1">
                <Check size={16} className="text-green-600 mr-2" />
                Serie {idx + 1}: {formatPeso(serie.peso)}kg × {formatNumero(serie.reps)} reps ({serie.tiempoSerie}s)
              </div>
            ))}
          </div>
        )}
      </Card>

      {seriesCompletadas >= totalSeries && (
        <Button className="w-full" onClick={siguienteEjercicio}>
          {ejercicioActual + 1 < datosEntrenamiento.length
            ? 'Siguiente Ejercicio'
            : 'Finalizar Entrenamiento'}
          <ChevronRight size={20} className="ml-2" />
        </Button>
      )}

      <Button
        variant="danger"
        className="w-full"
        onClick={() => {
          if (window.confirm('¿Estás seguro de cancelar el entrenamiento?')) {
            setRutinaSeleccionada(null);
            setEjercicioActual(0);
            setSerieActual(0);
            setDatosEntrenamiento([]);
            setTiempoInicio(null);
          }
        }}
      >
        Cancelar Entrenamiento
      </Button>
    </div>
  );
}
