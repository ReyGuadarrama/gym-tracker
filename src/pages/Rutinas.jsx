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
    ejercicios: [{ nombre: '', series: '', reps: '', descanso: '' }],
  });

  const resetFormulario = () => {
    setFormData({
      nombre: '',
      ejercicios: [{ nombre: '', series: '', reps: '', descanso: '' }],
    });
    setMostrarFormulario(false);
    setRutinaEditando(null);
  };

  const agregarEjercicio = () => {
    setFormData({
      ...formData,
      ejercicios: [...formData.ejercicios, { nombre: '', series: '', reps: '', descanso: '' }],
    });
  };

  const eliminarEjercicio = (index) => {
    setFormData({
      ...formData,
      ejercicios: formData.ejercicios.filter((_, i) => i !== index),
    });
  };

  const actualizarEjercicio = (index, campo, valor) => {
    const nuevosEjercicios = [...formData.ejercicios];
    nuevosEjercicios[index] = { ...nuevosEjercicios[index], [campo]: valor };
    setFormData({ ...formData, ejercicios: nuevosEjercicios });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      alert('Por favor ingresa un nombre para la rutina');
      return;
    }

    const ejerciciosValidos = formData.ejercicios.filter(
      ej => ej.nombre.trim() && ej.series && ej.reps
    );

    if (ejerciciosValidos.length === 0) {
      alert('Por favor agrega al menos un ejercicio válido');
      return;
    }

    const rutina = {
      nombre: formData.nombre,
      ejercicios: ejerciciosValidos.map(ej => ({
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
    setFormData({
      nombre: rutina.nombre,
      ejercicios: rutina.ejercicios.map(ej => ({
        nombre: ej.nombre,
        series: ej.series.toString(),
        reps: ej.reps.toString(),
        descanso: ej.descanso.toString(),
      })),
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
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Ejercicios</h4>
                <Button
                  type="button"
                  variant="outline"
                  onClick={agregarEjercicio}
                  className="text-sm"
                >
                  <Plus size={16} className="inline mr-1" />
                  Agregar Ejercicio
                </Button>
              </div>

              {formData.ejercicios.map((ejercicio, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <Input
                      label="Nombre del Ejercicio"
                      value={ejercicio.nombre}
                      onChange={(e) => actualizarEjercicio(index, 'nombre', e.target.value)}
                      placeholder="Ej: Sentadillas"
                      className="flex-1 mr-2"
                    />
                    {formData.ejercicios.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarEjercicio(index)}
                        className="text-red-500 hover:text-red-700 mt-7"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      label="Series"
                      type="number"
                      min="1"
                      value={ejercicio.series}
                      onChange={(e) => actualizarEjercicio(index, 'series', e.target.value)}
                      placeholder="4"
                    />
                    <Input
                      label="Repeticiones"
                      type="number"
                      min="1"
                      value={ejercicio.reps}
                      onChange={(e) => actualizarEjercicio(index, 'reps', e.target.value)}
                      placeholder="12"
                    />
                    <Input
                      label="Descanso (seg)"
                      type="number"
                      min="0"
                      value={ejercicio.descanso}
                      onChange={(e) => actualizarEjercicio(index, 'descanso', e.target.value)}
                      placeholder="60"
                    />
                  </div>
                </div>
              ))}
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
