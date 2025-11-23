import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Plus, Trash2, Edit, X } from 'lucide-react';

export default function Rutinas() {
  const { rutinas, agregarRutina, actualizarRutina, eliminarRutina } = useApp();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [rutinaEditando, setRutinaEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    ejerciciosConfirmados: [],
    ejercicioActual: { nombre: '', series: '', reps: '', descanso: '' },
  });

  const resetFormulario = () => {
    setFormData({
      nombre: '',
      ejerciciosConfirmados: [],
      ejercicioActual: { nombre: '', series: '', reps: '', descanso: '' },
    });
    setMostrarFormulario(false);
    setRutinaEditando(null);
  };

  const confirmarEjercicio = () => {
    const { ejercicioActual } = formData;

    // Validar que el ejercicio tenga al menos nombre, series y reps
    if (!ejercicioActual.nombre.trim() || !ejercicioActual.series || !ejercicioActual.reps) {
      alert('Por favor completa al menos el nombre, series y repeticiones del ejercicio');
      return;
    }

    setFormData({
      ...formData,
      ejerciciosConfirmados: [...formData.ejerciciosConfirmados, ejercicioActual],
      ejercicioActual: { nombre: '', series: '', reps: '', descanso: '' },
    });
  };

  const eliminarEjercicioConfirmado = (index) => {
    setFormData({
      ...formData,
      ejerciciosConfirmados: formData.ejerciciosConfirmados.filter((_, i) => i !== index),
    });
  };

  const editarEjercicioConfirmado = (index) => {
    const ejercicio = formData.ejerciciosConfirmados[index];
    setFormData({
      ...formData,
      ejerciciosConfirmados: formData.ejerciciosConfirmados.filter((_, i) => i !== index),
      ejercicioActual: ejercicio,
    });
  };

  const actualizarEjercicioActual = (campo, valor) => {
    setFormData({
      ...formData,
      ejercicioActual: { ...formData.ejercicioActual, [campo]: valor },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      alert('Por favor ingresa un nombre para la rutina');
      return;
    }

    // Incluir el ejercicio actual si tiene datos válidos
    let todosLosEjercicios = [...formData.ejerciciosConfirmados];
    if (formData.ejercicioActual.nombre.trim() && formData.ejercicioActual.series && formData.ejercicioActual.reps) {
      todosLosEjercicios.push(formData.ejercicioActual);
    }

    if (todosLosEjercicios.length === 0) {
      alert('Por favor agrega al menos un ejercicio válido');
      return;
    }

    const rutina = {
      nombre: formData.nombre,
      ejercicios: todosLosEjercicios.map(ej => ({
        nombre: ej.nombre,
        series: parseInt(ej.series),
        reps: parseInt(ej.reps),
        descanso: parseInt(ej.descanso) || 60,
      })),
    };

    if (rutinaEditando) {
      actualizarRutina(rutinaEditando.id, rutina);
    } else {
      agregarRutina(rutina);
    }

    resetFormulario();
  };

  const editarRutina = (rutina) => {
    setRutinaEditando(rutina);

    // Si hay ejercicios, poner todos menos el último como confirmados
    // y el último como el actual en edición
    const ejerciciosMapeados = rutina.ejercicios.map(ej => ({
      nombre: ej.nombre,
      series: ej.series.toString(),
      reps: ej.reps.toString(),
      descanso: ej.descanso.toString(),
    }));

    setFormData({
      nombre: rutina.nombre,
      ejerciciosConfirmados: ejerciciosMapeados,
      ejercicioActual: { nombre: '', series: '', reps: '', descanso: '' },
    });
    setMostrarFormulario(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mis Rutinas</h2>
        <Button
          onClick={() => setMostrarFormulario(true)}
          className="flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nueva Rutina</span>
        </Button>
      </div>

      {mostrarFormulario && (
        <Card title={rutinaEditando ? 'Editar Rutina' : 'Nueva Rutina'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre de la Rutina"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Día de Piernas"
              required
            />

            <div className="space-y-3">
              <h4 className="font-medium">Ejercicios</h4>

              {/* Formulario del ejercicio actual - siempre arriba */}
              <div className="p-4 border-2 border-blue-300 rounded-lg space-y-3 bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">
                    {formData.ejerciciosConfirmados.length === 0 ? 'Primer Ejercicio' : 'Nuevo Ejercicio'}
                  </span>
                </div>

                <Input
                  label="Nombre del Ejercicio"
                  value={formData.ejercicioActual.nombre}
                  onChange={(e) => actualizarEjercicioActual('nombre', e.target.value)}
                  placeholder="Ej: Sentadillas"
                />

                <div className="grid grid-cols-3 gap-2">
                  <Input
                    label="Series"
                    type="number"
                    min="1"
                    value={formData.ejercicioActual.series}
                    onChange={(e) => actualizarEjercicioActual('series', e.target.value)}
                    placeholder="3"
                  />
                  <Input
                    label="Repeticiones"
                    type="number"
                    min="1"
                    value={formData.ejercicioActual.reps}
                    onChange={(e) => actualizarEjercicioActual('reps', e.target.value)}
                    placeholder="12"
                  />
                  <Input
                    label="Descanso (seg)"
                    type="number"
                    min="0"
                    value={formData.ejercicioActual.descanso}
                    onChange={(e) => actualizarEjercicioActual('descanso', e.target.value)}
                    placeholder="60"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={confirmarEjercicio}
                  className="w-full text-sm bg-white"
                >
                  <Plus size={16} className="inline mr-1" />
                  Agregar Ejercicio
                </Button>
              </div>

              {/* Lista de ejercicios confirmados - tarjetas pequeñas */}
              {formData.ejerciciosConfirmados.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-medium">
                    Ejercicios agregados ({formData.ejerciciosConfirmados.length}):
                  </p>
                  {formData.ejerciciosConfirmados.map((ejercicio, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{ejercicio.nombre}</p>
                        <p className="text-sm text-gray-600">
                          {ejercicio.series} series × {ejercicio.reps} reps • {ejercicio.descanso || 60}s descanso
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => editarEjercicioConfirmado(index)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar ejercicio"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarEjercicioConfirmado(index)}
                          className="text-red-500 hover:text-red-700"
                          title="Eliminar ejercicio"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                {rutinaEditando ? 'Actualizar' : 'Guardar'} Rutina
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={resetFormulario}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rutinas.length === 0 ? (
          <Card className="col-span-full text-center py-8">
            <p className="text-gray-600 mb-4">No tienes rutinas creadas aún</p>
            <Button onClick={() => setMostrarFormulario(true)}>
              Crear Primera Rutina
            </Button>
          </Card>
        ) : (
          rutinas.map((rutina) => (
            <Card key={rutina.id}>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{rutina.nombre}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editarRutina(rutina)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de eliminar esta rutina?')) {
                          eliminarRutina(rutina.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-medium">
                    {rutina.ejercicios.length} ejercicios:
                  </p>
                  <ul className="space-y-1">
                    {rutina.ejercicios.map((ejercicio, idx) => (
                      <li key={idx} className="text-sm text-gray-700 pl-4 border-l-2 border-gray-300">
                        {ejercicio.nombre} - {ejercicio.series}x{ejercicio.reps} ({ejercicio.descanso}s)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
