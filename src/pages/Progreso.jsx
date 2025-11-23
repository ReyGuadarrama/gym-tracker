import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatPeso, formatNumero, formatVolumen } from '../utils/formatters';

export default function Progreso() {
  const { entrenamientos } = useApp();
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState('');

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
        const volumenTotal = ejercicio.series.reduce((sum, s) => sum + (s.peso * s.reps), 0);

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
        <h2 className="text-2xl font-bold text-gray-900">Progreso</h2>
        <Card className="text-center py-8">
          <p className="text-gray-600">
            Aún no tienes entrenamientos registrados. ¡Comienza a entrenar para ver tu progreso!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Progreso</h2>

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
        </>
      )}
    </div>
  );
}
