import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Plus, X, Save, ChevronRight } from 'lucide-react';

export default function EntrenamientoManual() {
  const navigate = useNavigate();
  const { rutinas, guardarEntrenamientoManual } = useApp();

  const [rutinaSeleccionada, setRutinaSeleccionada] = useState('');
  const [nombreRutinaManual, setNombreRutinaManual] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [tiempoTotal, setTiempoTotal] = useState('');
  const [ejercicios, setEjercicios] = useState([
    {
      nombre: '',
      series: [{ peso: '', reps: '', tiempoSerie: '' }],
    },
  ]);

  // Auto-llenar ejercicios cuando se selecciona una rutina
  useEffect(() => {
    if (rutinaSeleccionada) {
      const rutina = rutinas.find((r) => r.id === rutinaSeleccionada);
      if (rutina) {
        const ejerciciosPreLlenados = rutina.ejercicios.map((ej) => ({
          nombre: ej.nombre,
          series: Array(ej.series).fill(null).map(() => ({
            peso: '',
            reps: '',
            tiempoSerie: '',
          })),
        }));
        setEjercicios(ejerciciosPreLlenados);
      }
    } else {
      // Si se deselecciona la rutina, volver al estado inicial
      setEjercicios([
        {
          nombre: '',
          series: [{ peso: '', reps: '', tiempoSerie: '' }],
        },
      ]);
    }
  }, [rutinaSeleccionada, rutinas]);

  const agregarEjercicio = () => {
    setEjercicios([
      ...ejercicios,
      {
        nombre: '',
        series: [{ peso: '', reps: '', tiempoSerie: '' }],
      },
    ]);
  };

  const eliminarEjercicio = (idx) => {
    setEjercicios(ejercicios.filter((_, i) => i !== idx));
  };

  const actualizarEjercicio = (idx, campo, valor) => {
    const nuevosEjercicios = [...ejercicios];
    nuevosEjercicios[idx][campo] = valor;
    setEjercicios(nuevosEjercicios);
  };

  const agregarSerie = (ejercicioIdx) => {
    const nuevosEjercicios = [...ejercicios];
    nuevosEjercicios[ejercicioIdx].series.push({ peso: '', reps: '', tiempoSerie: '' });
    setEjercicios(nuevosEjercicios);
  };

  const eliminarSerie = (ejercicioIdx, serieIdx) => {
    const nuevosEjercicios = [...ejercicios];
    nuevosEjercicios[ejercicioIdx].series = nuevosEjercicios[ejercicioIdx].series.filter(
      (_, i) => i !== serieIdx
    );
    setEjercicios(nuevosEjercicios);
  };

  const actualizarSerie = (ejercicioIdx, serieIdx, campo, valor) => {
    const nuevosEjercicios = [...ejercicios];
    nuevosEjercicios[ejercicioIdx].series[serieIdx][campo] = valor;
    setEjercicios(nuevosEjercicios);
  };

  const validarFormulario = () => {
    if (!fecha || !hora) {
      alert('Por favor ingresa la fecha y hora del entrenamiento');
      return false;
    }

    if (!rutinaSeleccionada && !nombreRutinaManual) {
      alert('Por favor selecciona una rutina o ingresa un nombre');
      return false;
    }

    for (let i = 0; i < ejercicios.length; i++) {
      const ejercicio = ejercicios[i];
      if (!ejercicio.nombre) {
        alert(`Por favor ingresa el nombre del ejercicio ${i + 1}`);
        return false;
      }

      for (let j = 0; j < ejercicio.series.length; j++) {
        const serie = ejercicio.series[j];
        if (!serie.peso || !serie.reps) {
          alert(`Por favor completa los datos de la serie ${j + 1} del ejercicio "${ejercicio.nombre}"`);
          return false;
        }
      }
    }

    return true;
  };

  const guardarEntrenamiento = () => {
    if (!validarFormulario()) return;

    // Construir la fecha ISO completa
    const fechaISO = new Date(`${fecha}T${hora}`).toISOString();

    // Obtener información de la rutina
    const rutina = rutinas.find((r) => r.id === rutinaSeleccionada);
    const rutinaId = rutina?.id || 'manual';
    const rutinaNombre = rutina?.nombre || nombreRutinaManual;

    // Construir los ejercicios en el formato correcto
    const ejerciciosFormateados = ejercicios.map((ej) => ({
      ejercicioId: rutina?.ejercicios.find((e) => e.nombre === ej.nombre)?.id || `manual-${Date.now()}`,
      nombre: ej.nombre,
      series: ej.series.map((s) => ({
        peso: parseFloat(s.peso),
        reps: parseInt(s.reps),
        tiempoSerie: parseInt(s.tiempoSerie) || 0,
      })),
      tiempoDescansoTotal: 0,
    }));

    const entrenamiento = {
      rutinaId,
      rutinaNombre,
      ejercicios: ejerciciosFormateados,
      tiempoTotal: parseInt(tiempoTotal) || 0,
    };

    guardarEntrenamientoManual(entrenamiento, fechaISO);
    alert('Entrenamiento guardado exitosamente');
    navigate('/progreso');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Agregar Entrenamiento Manual</h2>
        <p className="text-gray-600 mt-1">
          Ingresa los datos de un entrenamiento pasado
        </p>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Información General</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rutina (opcional)
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={rutinaSeleccionada}
              onChange={(e) => setRutinaSeleccionada(e.target.value)}
            >
              <option value="">Seleccionar rutina existente...</option>
              {rutinas.map((rutina) => (
                <option key={rutina.id} value={rutina.id}>
                  {rutina.nombre}
                </option>
              ))}
            </select>
          </div>

          {!rutinaSeleccionada && (
            <Input
              label="Nombre del entrenamiento"
              value={nombreRutinaManual}
              onChange={(e) => setNombreRutinaManual(e.target.value)}
              placeholder="Ej: Día de pierna"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha *"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
            <Input
              label="Hora *"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
            />
          </div>

          <Input
            label="Tiempo total (segundos)"
            type="number"
            value={tiempoTotal}
            onChange={(e) => setTiempoTotal(e.target.value)}
            placeholder="Ej: 3600 (1 hora)"
          />
        </div>
      </Card>

      {ejercicios.map((ejercicio, ejercicioIdx) => (
        <Card key={ejercicioIdx}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">Ejercicio {ejercicioIdx + 1}</h3>
            {ejercicios.length > 1 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => eliminarEjercicio(ejercicioIdx)}
              >
                <X size={16} />
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <Input
              label={rutinaSeleccionada ? "Nombre del ejercicio (de rutina)" : "Nombre del ejercicio *"}
              value={ejercicio.nombre}
              onChange={(e) => actualizarEjercicio(ejercicioIdx, 'nombre', e.target.value)}
              placeholder="Ej: Press de banca"
              disabled={rutinaSeleccionada ? true : false}
            />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Series *</label>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => agregarSerie(ejercicioIdx)}
                >
                  <Plus size={16} className="mr-1" />
                  Serie
                </Button>
              </div>

              {ejercicio.series.map((serie, serieIdx) => (
                <div key={serieIdx} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">
                      Peso (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={serie.peso}
                      onChange={(e) =>
                        actualizarSerie(ejercicioIdx, serieIdx, 'peso', e.target.value)
                      }
                      placeholder="20"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">
                      Reps *
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={serie.reps}
                      onChange={(e) =>
                        actualizarSerie(ejercicioIdx, serieIdx, 'reps', e.target.value)
                      }
                      placeholder="10"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">
                      Tiempo (seg)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={serie.tiempoSerie}
                      onChange={(e) =>
                        actualizarSerie(ejercicioIdx, serieIdx, 'tiempoSerie', e.target.value)
                      }
                      placeholder="45"
                    />
                  </div>
                  {ejercicio.series.length > 1 && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => eliminarSerie(ejercicioIdx, serieIdx)}
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}

      <Button variant="secondary" className="w-full" onClick={agregarEjercicio}>
        <Plus size={20} className="mr-2" />
        Agregar Ejercicio
      </Button>

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button className="flex-1" onClick={guardarEntrenamiento}>
          <Save size={20} className="mr-2" />
          Guardar Entrenamiento
        </Button>
      </div>
    </div>
  );
}
