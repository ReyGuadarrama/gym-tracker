import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function Calendario() {
  const { rutinas, calendario, programarRutina } = useApp();
  const [semanaActual, setSemanaActual] = useState(new Date());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [mostrarSelector, setMostrarSelector] = useState(false);

  const inicioSemana = startOfWeek(semanaActual, { weekStartsOn: 1 }); // Lunes
  const finSemana = endOfWeek(semanaActual, { weekStartsOn: 1 });

  const diasSemana = [];
  let dia = inicioSemana;
  while (dia <= finSemana) {
    diasSemana.push(dia);
    dia = addDays(dia, 1);
  }

  const obtenerRutinaDia = (fecha) => {
    const fechaStr = format(fecha, 'yyyy-MM-dd');
    const prog = calendario.find(c => c.fecha === fechaStr);
    if (!prog) return null;
    return rutinas.find(r => r.id === prog.rutinaId);
  };

  const seleccionarRutina = (rutinaId) => {
    if (fechaSeleccionada) {
      const fechaStr = format(fechaSeleccionada, 'yyyy-MM-dd');
      programarRutina(fechaStr, rutinaId);
      setMostrarSelector(false);
      setFechaSeleccionada(null);
    }
  };

  const eliminarProgramacion = (fecha) => {
    const fechaStr = format(fecha, 'yyyy-MM-dd');
    programarRutina(fechaStr, null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Calendario</h2>
        <div className="flex items-center justify-center space-x-3">
          <Button
            variant="secondary"
            onClick={() => setSemanaActual(addDays(semanaActual, -7))}
            className="!p-2 md:!p-3 flex-shrink-0"
          >
            <ChevronLeft size={20} />
          </Button>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-xl shadow-lg min-w-[180px] md:min-w-[220px] text-center">
            <span className="text-sm md:text-base font-semibold whitespace-nowrap">
              {format(inicioSemana, 'd MMM', { locale: es })} - {format(finSemana, 'd MMM yyyy', { locale: es })}
            </span>
          </div>
          <Button
            variant="secondary"
            onClick={() => setSemanaActual(addDays(semanaActual, 7))}
            className="!p-2 md:!p-3 flex-shrink-0"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      {rutinas.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Primero debes crear rutinas antes de programarlas
          </p>
          <Button onClick={() => window.location.href = '/rutinas'}>
            Ir a Rutinas
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {diasSemana.map((dia, index) => {
          const rutinaDia = obtenerRutinaDia(dia);
          const esHoy = isSameDay(dia, new Date());

          return (
            <Card
              key={index}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                esHoy ? 'border-2 border-blue-500' : ''
              }`}
              onClick={() => {
                if (rutinas.length > 0) {
                  setFechaSeleccionada(dia);
                  setMostrarSelector(true);
                }
              }}
            >
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">
                  {format(dia, 'EEE', { locale: es })}
                </p>
                <p className={`text-2xl font-bold ${esHoy ? 'text-blue-600' : 'text-gray-900'}`}>
                  {format(dia, 'd')}
                </p>
                <p className="text-xs text-gray-500">
                  {format(dia, 'MMM', { locale: es })}
                </p>
              </div>

              {rutinaDia ? (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {rutinaDia.nombre}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {rutinaDia.ejercicios.length} ejercicios
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('¿Eliminar esta programación?')) {
                        eliminarProgramacion(dia);
                      }
                    }}
                    className="text-xs text-red-600 hover:text-red-800 mt-2"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-400">Sin rutina</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {mostrarSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Seleccionar Rutina
              </h3>
              <button
                onClick={() => {
                  setMostrarSelector(false);
                  setFechaSeleccionada(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {fechaSeleccionada && (
              <p className="text-sm text-gray-600 mb-4">
                {format(fechaSeleccionada, "EEEE, d 'de' MMMM", { locale: es })}
              </p>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {rutinas.map((rutina) => (
                <button
                  key={rutina.id}
                  onClick={() => seleccionarRutina(rutina.id)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <p className="font-medium">{rutina.nombre}</p>
                  <p className="text-sm text-gray-600">
                    {rutina.ejercicios.length} ejercicios
                  </p>
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              className="w-full mt-4"
              onClick={() => {
                setMostrarSelector(false);
                setFechaSeleccionada(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
