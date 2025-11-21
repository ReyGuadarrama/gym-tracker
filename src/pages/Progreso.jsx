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

  // Preparar datos para gráficas
  const datosGrafica = useMemo(() => {
    if (!ejercicioSeleccionado) return [];

    const datos = [];
    const datosPorFecha = new Map();

    entrenamientos.forEach((entrenamiento) => {
      const ejercicio = entrenamiento.ejercicios.find(
        (e) => e.nombre === ejercicioSeleccionado
      );

      if (ejercicio) {
        const fecha = format(new Date(entrenamiento.fecha), 'dd/MM');

        ejercicio.series.forEach((serie, idx) => {
          const key = `${fecha}-${idx}`;
          if (!datosPorFecha.has(key)) {
            datosPorFecha.set(key, {
              fecha: fecha,
              fechaCompleta: entrenamiento.fecha,
              serie: idx + 1,
              peso: serie.peso,
              reps: serie.reps,
              volumen: serie.peso * serie.reps,
            });
          }
        });
      }
    });

    return Array.from(datosPorFecha.values()).sort(
      (a, b) => new Date(a.fechaCompleta) - new Date(b.fechaCompleta)
    );
  }, [ejercicioSeleccionado, entrenamientos]);

  // Calcular peso máximo, volumen total, etc.
  const estadisticas = useMemo(() => {
    if (datosGrafica.length === 0) return null;

    const pesoMaximo = Math.max(...datosGrafica.map((d) => d.peso));
    const repsMaximas = Math.max(...datosGrafica.map((d) => d.reps));
    const volumenTotal = datosGrafica.reduce((acc, d) => acc + d.volumen, 0);
    const promedioReps = (
      datosGrafica.reduce((acc, d) => acc + d.reps, 0) / datosGrafica.length
    ).toFixed(1);

    return {
      pesoMaximo,
      repsMaximas,
      volumenTotal: volumenTotal.toFixed(0),
      promedioReps,
      totalSeries: datosGrafica.length,
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
            <Card>
              <p className="text-sm text-gray-600">Peso Máximo</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatPeso(estadisticas.pesoMaximo)} kg
              </p>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">Reps Máximas</p>
              <p className="text-2xl font-bold text-green-600">
                {formatNumero(estadisticas.repsMaximas)}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">Volumen Total</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatVolumen(estadisticas.volumenTotal)} kg
              </p>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">Promedio Reps</p>
              <p className="text-2xl font-bold text-orange-600">
                {estadisticas.promedioReps}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">Total Series</p>
              <p className="text-2xl font-bold text-gray-900">
                {estadisticas.totalSeries}
              </p>
            </Card>
          </div>

          <Card title="Progresión de Peso">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosGrafica}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                  formatter={(value, name) => {
                    if (name === 'peso') return [`${formatPeso(value)} kg`, 'Peso'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Peso"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Progresión de Repeticiones">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosGrafica}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis label={{ value: 'Repeticiones', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                  formatter={(value, name) => {
                    if (name === 'reps') return [`${formatNumero(value)} reps`, 'Repeticiones'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="reps"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Repeticiones"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Volumen por Serie (Peso × Reps)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosGrafica}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis label={{ value: 'Volumen (kg)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                  formatter={(value, name) => {
                    if (name === 'volumen') return [`${formatVolumen(value)} kg`, 'Volumen'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="volumen"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Volumen"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Historial Detallado">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">Serie</th>
                    <th className="px-4 py-2 text-right">Peso (kg)</th>
                    <th className="px-4 py-2 text-right">Reps</th>
                    <th className="px-4 py-2 text-right">Volumen (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {datosGrafica.map((dato, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2">{dato.fecha}</td>
                      <td className="px-4 py-2">Serie {dato.serie}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatPeso(dato.peso)}</td>
                      <td className="px-4 py-2 text-right">{formatNumero(dato.reps)}</td>
                      <td className="px-4 py-2 text-right text-purple-600 font-medium">
                        {formatVolumen(dato.volumen)}
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
