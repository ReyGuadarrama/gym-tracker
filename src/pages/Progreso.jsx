import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatPeso, formatNumero, formatVolumen } from '../utils/formatters';
import { Trash2, AlertTriangle, Database, ChevronDown, ChevronUp, Plus, TrendingDown } from 'lucide-react';

export default function Progreso() {
  const navigate = useNavigate();
  const {
    entrenamientos,
    eliminarEntrenamiento,
    eliminarEntrenamientosPorEjercicio,
    limpiarTodosLosDatos
  } = useApp();
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState('');
  const [mostrarGestion, setMostrarGestion] = useState(false);
  const [ejercicioAEliminar, setEjercicioAEliminar] = useState('');
  const [confirmacionTotal, setConfirmacionTotal] = useState('');

  // Obtener lista única de ejercicios
  const ejerciciosUnicos = useMemo(() => {
    const ejercicios = new Set();
    entrenamientos.forEach((entrenamiento) => {
      entrenamiento.ejercicios.forEach((ejercicio) => {
        ejercicios.add(ejercicio.nombre);
      });
    });
    return Array.from(ejercicios).sort();
  }, [entrenamientos]);

  // Preparar datos para gráficas - AGRUPADO POR ENTRENAMIENTO
  const datosGrafica = useMemo(() => {
    if (!ejercicioSeleccionado) return [];

    const datosPorEntrenamiento = [];

    entrenamientos.forEach((entrenamiento) => {
      const ejercicio = entrenamiento.ejercicios.find(
        (e) => e.nombre === ejercicioSeleccionado
      );

      if (ejercicio && ejercicio.series.length > 0) {
        const fecha = format(new Date(entrenamiento.fecha), 'dd/MM');
        const fechaHora = format(new Date(entrenamiento.fecha), 'dd/MM HH:mm');

        // Calcular promedios del entrenamiento
        const pesoPromedio = ejercicio.series.reduce((sum, s) => sum + s.peso, 0) / ejercicio.series.length;
        const repsPromedio = ejercicio.series.reduce((sum, s) => sum + s.reps, 0) / ejercicio.series.length;

        // Calcular volumen total incluyendo dropsets
        const volumenTotal = ejercicio.series.reduce((sum, s) => {
          let volumenSerie = s.peso * s.reps;

          // Agregar volumen de dropsets si existen
          if (s.dropsets && s.dropsets.length > 0) {
            const volumenDropsets = s.dropsets.reduce((dsSum, ds) => dsSum + (ds.peso * ds.reps), 0);
            volumenSerie += volumenDropsets;
          }

          return sum + volumenSerie;
        }, 0);

        datosPorEntrenamiento.push({
          fecha: fecha,
          fechaHora: fechaHora,
          fechaCompleta: entrenamiento.fecha,
          pesoPromedio: parseFloat(pesoPromedio.toFixed(2)),
          repsPromedio: parseFloat(repsPromedio.toFixed(1)),
          volumenTotal: volumenTotal,
          numSeries: ejercicio.series.length,
        });
      }
    });

    return datosPorEntrenamiento.sort(
      (a, b) => new Date(a.fechaCompleta) - new Date(b.fechaCompleta)
    );
  }, [ejercicioSeleccionado, entrenamientos]);

  // Funciones de gestión de datos
  const handleEliminarEntrenamiento = (entrenamientoId, nombreRutina) => {
    if (window.confirm(`¿Estás seguro de eliminar el entrenamiento "${nombreRutina}"?\n\nEsta acción no se puede deshacer.`)) {
      eliminarEntrenamiento(entrenamientoId);
      alert('Entrenamiento eliminado correctamente.');
    }
  };

  const handleEliminarEjercicio = () => {
    if (!ejercicioAEliminar) {
      alert('Por favor selecciona un ejercicio');
      return;
    }

    const numEntrenamientos = entrenamientos.filter(e =>
      e.ejercicios.some(ej => ej.nombre === ejercicioAEliminar)
    ).length;

    if (window.confirm(
      `⚠️ ADVERTENCIA ⚠️\n\n` +
      `Estás a punto de eliminar TODOS los datos del ejercicio "${ejercicioAEliminar}".\n\n` +
      `Esto incluye:\n` +
      `- ${numEntrenamientos} entrenamientos registrados\n` +
      `- Todas las estadísticas y progreso\n\n` +
      `Esta acción NO se puede deshacer.\n\n` +
      `¿Estás completamente seguro?`
    )) {
      eliminarEntrenamientosPorEjercicio(ejercicioAEliminar);
      setEjercicioAEliminar('');
      if (ejercicioSeleccionado === ejercicioAEliminar) {
        setEjercicioSeleccionado('');
      }
      alert(`Todos los datos de "${ejercicioAEliminar}" han sido eliminados.`);
    }
  };

  const handleLimpiarTodo = () => {
    if (confirmacionTotal !== 'ELIMINAR TODO') {
      alert('Por favor escribe "ELIMINAR TODO" para confirmar');
      return;
    }

    if (window.confirm(
      `🚨 ÚLTIMA CONFIRMACIÓN 🚨\n\n` +
      `Vas a eliminar TODOS tus datos de entrenamiento:\n` +
      `- ${entrenamientos.length} entrenamientos\n` +
      `- Todo el progreso histórico\n` +
      `- Todas las estadísticas\n\n` +
      `ESTA ACCIÓN ES IRREVERSIBLE.\n\n` +
      `¿Continuar?`
    )) {
      limpiarTodosLosDatos();
      setConfirmacionTotal('');
      setEjercicioSeleccionado('');
      setMostrarGestion(false);
      alert('Todos los datos han sido eliminados.');
    }
  };

  // Calcular estadísticas útiles para detectar progreso y estancamiento
  const estadisticas = useMemo(() => {
    if (datosGrafica.length === 0) return null;

    const numEntrenamientos = datosGrafica.length;
    const volumenTotal = datosGrafica.reduce((acc, d) => acc + d.volumenTotal, 0);

    // Mejor entrenamiento (mayor volumen)
    const mejorEntrenamiento = datosGrafica.reduce((max, d) =>
      d.volumenTotal > max.volumenTotal ? d : max
    );

    // Sobrecarga progresiva: comparar últimos 3 vs primeros 3 entrenamientos
    const numComparar = Math.min(3, Math.floor(numEntrenamientos / 2));
    let sobrecarga = 0;
    let tendencia = 'estable';

    if (numEntrenamientos >= 2) {
      const primeros = datosGrafica.slice(0, numComparar);
      const ultimos = datosGrafica.slice(-numComparar);

      const volumenPrimeros = primeros.reduce((sum, d) => sum + d.volumenTotal, 0) / primeros.length;
      const volumenUltimos = ultimos.reduce((sum, d) => sum + d.volumenTotal, 0) / ultimos.length;

      sobrecarga = ((volumenUltimos - volumenPrimeros) / volumenPrimeros * 100);

      if (sobrecarga > 5) tendencia = 'subiendo';
      else if (sobrecarga < -5) tendencia = 'bajando';
    }

    // Progreso últimas 2 semanas
    const haceDosSemanasMs = Date.now() - (14 * 24 * 60 * 60 * 1000);
    const entrenamientosRecientes = datosGrafica.filter(d =>
      new Date(d.fechaCompleta).getTime() > haceDosSemanasMs
    );

    // Volumen promedio por entrenamiento
    const volumenPromedio = volumenTotal / numEntrenamientos;

    return {
      numEntrenamientos,
      volumenTotal: Math.round(volumenTotal),
      volumenPromedio: Math.round(volumenPromedio),
      sobrecarga: sobrecarga.toFixed(1),
      tendencia,
      mejorVolumen: Math.round(mejorEntrenamiento.volumenTotal),
      mejorFecha: mejorEntrenamiento.fechaHora,
      entrenamientosRecientes: entrenamientosRecientes.length,
    };
  }, [datosGrafica]);

  if (entrenamientos.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Progreso</h2>
          <Button
            variant="secondary"
            onClick={() => navigate('/entrenamiento-manual')}
            className="flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Agregar Entrenamiento Manual
          </Button>
        </div>
        <Card className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Aún no tienes entrenamientos registrados. ¡Comienza a entrenar para ver tu progreso!
          </p>
          <p className="text-sm text-gray-500">
            También puedes agregar entrenamientos pasados manualmente usando el botón de arriba.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Progreso</h2>
        <Button
          variant="secondary"
          onClick={() => navigate('/entrenamiento-manual')}
          className="flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Agregar Entrenamiento Manual
        </Button>
      </div>

      <Card>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Ejercicio
        </label>
        <select
          value={ejercicioSeleccionado}
          onChange={(e) => setEjercicioSeleccionado(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">-- Selecciona un ejercicio --</option>
          {ejerciciosUnicos.map((ejercicio) => (
            <option key={ejercicio} value={ejercicio}>
              {ejercicio}
            </option>
          ))}
        </select>
      </Card>

      {ejercicioSeleccionado && estadisticas && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Total Entrenamientos */}
            <Card className="border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 mb-1">Total Entrenamientos</p>
              <p className="text-3xl font-bold text-blue-600">
                {estadisticas.numEntrenamientos}
              </p>
              <p className="text-xs text-gray-500 mt-1">sesiones</p>
            </Card>

            {/* Volumen Total Acumulado */}
            <Card className="border-l-4 border-purple-500">
              <p className="text-sm text-gray-600 mb-1">Volumen Total</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatVolumen(estadisticas.volumenTotal)} kg
              </p>
              <p className="text-xs text-gray-500 mt-1">acumulado</p>
            </Card>

            {/* Sobrecarga Progresiva */}
            <Card className={`border-l-4 ${
              estadisticas.tendencia === 'subiendo' ? 'border-green-500' :
              estadisticas.tendencia === 'bajando' ? 'border-red-500' :
              'border-orange-500'
            }`}>
              <p className="text-sm text-gray-600 mb-1">Sobrecarga</p>
              <p className={`text-2xl font-bold ${
                estadisticas.tendencia === 'subiendo' ? 'text-green-600' :
                estadisticas.tendencia === 'bajando' ? 'text-red-600' :
                'text-orange-600'
              }`}>
                {estadisticas.sobrecarga > 0 ? '+' : ''}{estadisticas.sobrecarga}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {estadisticas.tendencia === 'subiendo' && '📈 Progresando'}
                {estadisticas.tendencia === 'bajando' && '📉 Cuidado'}
                {estadisticas.tendencia === 'estable' && '➡️ Estable'}
              </p>
            </Card>

            {/* Mejor Entrenamiento */}
            <Card className="border-l-4 border-yellow-500">
              <p className="text-sm text-gray-600 mb-1">Mejor Volumen</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatVolumen(estadisticas.mejorVolumen)} kg
              </p>
              <p className="text-xs text-gray-500 mt-1">{estadisticas.mejorFecha}</p>
            </Card>

            {/* Actividad Reciente */}
            <Card className="border-l-4 border-green-500">
              <p className="text-sm text-gray-600 mb-1">Últimas 2 Semanas</p>
              <p className="text-3xl font-bold text-green-600">
                {estadisticas.entrenamientosRecientes}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {estadisticas.entrenamientosRecientes >= 4 ? '🔥 Constante' : 'entrenamientos'}
              </p>
            </Card>
          </div>

          <Card title="Peso Promedio por Entrenamiento">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosGrafica}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                  formatter={(value, name) => {
                    if (name === 'Peso Promedio') return [`${formatPeso(value)} kg`, 'Peso Promedio'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pesoPromedio"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Peso Promedio"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Repeticiones Promedio por Entrenamiento">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosGrafica}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis label={{ value: 'Repeticiones', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                  formatter={(value, name) => {
                    if (name === 'Reps Promedio') return [`${formatNumero(value)} reps`, 'Reps Promedio'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="repsPromedio"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Reps Promedio"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Volumen Total por Entrenamiento">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosGrafica}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis label={{ value: 'Volumen (kg)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                  formatter={(value, name) => {
                    if (name === 'Volumen Total') return [`${formatVolumen(value)} kg`, 'Volumen Total'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="volumenTotal"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Volumen Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Historial por Entrenamiento">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-center">Series</th>
                    <th className="px-4 py-2 text-right">Peso Prom.</th>
                    <th className="px-4 py-2 text-right">Reps Prom.</th>
                    <th className="px-4 py-2 text-right">Volumen Total</th>
                  </tr>
                </thead>
                <tbody>
                  {datosGrafica.slice().reverse().map((dato, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{dato.fechaHora}</td>
                      <td className="px-4 py-2 text-center text-gray-600">{dato.numSeries}</td>
                      <td className="px-4 py-2 text-right font-medium text-blue-600">
                        {formatPeso(dato.pesoPromedio)} kg
                      </td>
                      <td className="px-4 py-2 text-right text-green-600">
                        {formatNumero(dato.repsPromedio)}
                      </td>
                      <td className="px-4 py-2 text-right text-purple-600 font-bold">
                        {formatVolumen(dato.volumenTotal)} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Detalle de Series">
            <div className="space-y-4">
              {entrenamientos
                .filter((e) => e.ejercicios.some((ej) => ej.nombre === ejercicioSeleccionado))
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                .slice(0, 5)
                .map((entrenamiento) => {
                  const ejercicio = entrenamiento.ejercicios.find(
                    (e) => e.nombre === ejercicioSeleccionado
                  );

                  return (
                    <div key={entrenamiento.id} className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        {format(new Date(entrenamiento.fecha), "d 'de' MMMM, HH:mm", { locale: es })}
                      </h4>
                      <div className="space-y-2">
                        {ejercicio.series.map((serie, idx) => (
                          <div key={idx} className="bg-white rounded p-3 border border-gray-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                Serie {idx + 1}
                              </span>
                              <span className="text-sm text-gray-600">
                                {formatPeso(serie.peso)}kg × {formatNumero(serie.reps)} reps
                              </span>
                            </div>
                            {serie.dropsets && serie.dropsets.length > 0 && (
                              <div className="ml-4 mt-2 space-y-1">
                                {serie.dropsets.map((dropset, dropIdx) => (
                                  <div
                                    key={dropIdx}
                                    className="flex items-center justify-between text-xs text-orange-600 bg-orange-50 rounded px-2 py-1"
                                  >
                                    <div className="flex items-center gap-1">
                                      <TrendingDown size={12} />
                                      <span>Dropset {dropIdx + 1}</span>
                                    </div>
                                    <span>
                                      {formatPeso(dropset.peso)}kg × {formatNumero(dropset.reps)} reps
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Mostrando los últimos 5 entrenamientos
            </p>
          </Card>
        </>
      )}

      {/* Sección de Gestión de Datos */}
      {entrenamientos.length > 0 && (
        <Card className="border-2 border-red-200 bg-red-50">
          <div className="space-y-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setMostrarGestion(!mostrarGestion)}
            >
              <div className="flex items-center space-x-3">
                <Database className="text-red-600" size={24} />
                <div>
                  <h3 className="text-lg font-bold text-red-900">Gestión de Datos</h3>
                  <p className="text-sm text-red-700">Eliminar entrenamientos o limpiar datos</p>
                </div>
              </div>
              {mostrarGestion ? (
                <ChevronUp className="text-red-600" size={24} />
              ) : (
                <ChevronDown className="text-red-600" size={24} />
              )}
            </div>

            {mostrarGestion && (
              <div className="space-y-6 pt-4 border-t-2 border-red-200">
                {/* Eliminar entrenamientos individuales */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Trash2 className="text-orange-600" size={20} />
                    <h4 className="font-semibold text-gray-900">Eliminar Entrenamientos Individuales</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Últimos 10 entrenamientos registrados:
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {entrenamientos
                      .slice()
                      .reverse()
                      .slice(0, 10)
                      .map((entrenamiento) => (
                        <div
                          key={entrenamiento.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{entrenamiento.rutinaNombre}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(entrenamiento.fecha), "d 'de' MMMM, HH:mm", { locale: es })} •{' '}
                              {entrenamiento.ejercicios.length} ejercicios
                            </p>
                          </div>
                          <button
                            onClick={() => handleEliminarEntrenamiento(entrenamiento.id, entrenamiento.rutinaNombre)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Eliminar todos los datos de un ejercicio */}
                <div className="bg-white p-4 rounded-lg border border-orange-300">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="text-orange-600" size={20} />
                    <h4 className="font-semibold text-gray-900">Eliminar Todos los Datos de un Ejercicio</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    ⚠️ Esto eliminará permanentemente todo el historial del ejercicio seleccionado.
                  </p>
                  <div className="flex gap-2">
                    <select
                      value={ejercicioAEliminar}
                      onChange={(e) => setEjercicioAEliminar(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">-- Selecciona un ejercicio --</option>
                      {ejerciciosUnicos.map((ejercicio) => (
                        <option key={ejercicio} value={ejercicio}>
                          {ejercicio}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={handleEliminarEjercicio}
                      variant="danger"
                      className="bg-orange-600 hover:bg-orange-700"
                      disabled={!ejercicioAEliminar}
                    >
                      <Trash2 size={18} className="mr-2" />
                      Eliminar Ejercicio
                    </Button>
                  </div>
                </div>

                {/* Limpiar todos los datos */}
                <div className="bg-red-100 p-4 rounded-lg border-2 border-red-400">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="text-red-700" size={24} />
                    <h4 className="font-bold text-red-900">🚨 Zona Peligrosa: Eliminar TODOS los Datos</h4>
                  </div>
                  <p className="text-sm text-red-800 mb-3">
                    ⚠️ ADVERTENCIA: Esto eliminará TODOS tus entrenamientos y progreso de manera permanente.
                    Esta acción NO se puede deshacer.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-red-900 mb-2">
                        Para confirmar, escribe: <span className="font-bold">ELIMINAR TODO</span>
                      </label>
                      <input
                        type="text"
                        value={confirmacionTotal}
                        onChange={(e) => setConfirmacionTotal(e.target.value)}
                        placeholder="Escribe: ELIMINAR TODO"
                        className="w-full px-3 py-2 border-2 border-red-400 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      />
                    </div>
                    <Button
                      onClick={handleLimpiarTodo}
                      variant="danger"
                      className="w-full bg-red-700 hover:bg-red-800"
                      disabled={confirmacionTotal !== 'ELIMINAR TODO'}
                    >
                      <Trash2 size={18} className="mr-2" />
                      Eliminar Todos los Datos ({entrenamientos.length} entrenamientos)
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
