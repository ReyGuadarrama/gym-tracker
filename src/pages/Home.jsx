import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { Calendar, Dumbbell, TrendingUp, List, Zap, Trophy, Target, Flame, Weight, Clock, Award } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatTiempoLegible } from '../utils/formatters';

export default function Home() {
  const {
    rutinas,
    entrenamientos,
    calendario,
    calcularVolumenMensual,
    calcularRachaActual,
    calcularProgresoSemanal,
    calcularTiempoMensual
  } = useApp();

  const navigate = useNavigate();

  const hoy = format(new Date(), 'yyyy-MM-dd');
  const programacionHoy = calendario.find(c => c.fecha === hoy);
  const rutinaHoy = programacionHoy ? rutinas.find(r => r.id === programacionHoy.rutinaId) : null;
  const ultimoEntrenamiento = entrenamientos[entrenamientos.length - 1];

  // Verificar si el entrenamiento de hoy ya fue completado
  const entrenamientoHoyCompletado = rutinaHoy ? entrenamientos.some(e => {
    const fechaEntrenamiento = format(new Date(e.fecha), 'yyyy-MM-dd');
    return fechaEntrenamiento === hoy && e.rutinaId === rutinaHoy.id;
  }) : false;

  // Calcular métricas motivantes
  const volumenMensual = calcularVolumenMensual();
  const rachaActual = calcularRachaActual();
  const progresoSemanal = calcularProgresoSemanal();
  const tiempoMensual = calcularTiempoMensual();

  return (
    <div className="space-y-6 w-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <Flame className="animate-bounce flex-shrink-0" size={28} />
            <h2 className="text-2xl md:text-4xl font-extrabold">
              ¡Vamos a Entrenar!
            </h2>
          </div>
          <p className="text-base md:text-xl text-white/90 mb-3 md:mb-4 font-medium">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
          <p className="text-white/80 text-sm md:text-lg">
            Tu progreso comienza hoy. Cada repetición cuenta. 💪
          </p>
        </div>
        <div className="absolute top-0 right-0 opacity-10 hidden md:block">
          <Dumbbell size={200} />
        </div>
      </div>

      {/* Tarjetas de Estadísticas Motivantes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Volumen Mensual - Peso total levantado */}
        <Card className="border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-gray-600 text-xs md:text-sm font-medium mb-1">Volumen del Mes</p>
              <p className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                {volumenMensual > 0 ? (
                  <>
                    {volumenMensual >= 1000
                      ? `${(volumenMensual / 1000).toFixed(1)}t`
                      : `${volumenMensual}kg`
                    }
                  </>
                ) : '0kg'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Levantados 💪</p>
            </div>
            <div className="bg-blue-600 p-2.5 md:p-3 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Weight className="text-white" size={24} />
            </div>
          </div>
        </Card>

        {/* Racha Actual */}
        <Card className="border-l-4 border-orange-500 bg-gradient-to-br from-orange-50 to-red-100">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-gray-600 text-xs md:text-sm font-medium mb-1">Racha Actual</p>
              <p className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
                {rachaActual} {rachaActual === 1 ? 'día' : 'días'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {rachaActual > 0 ? '¡Sigue así! 🔥' : 'Comienza hoy'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2.5 md:p-3 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Flame className="text-white" size={24} />
            </div>
          </div>
        </Card>

        {/* Meta Semanal */}
        <Card className="border-l-4 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-100">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-gray-600 text-xs md:text-sm font-medium mb-1">Meta Semanal</p>
              <p className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                {progresoSemanal.completados}/{progresoSemanal.objetivo}
              </p>
              <div className="mt-1.5">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${progresoSemanal.porcentaje}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-pink-500 p-2.5 md:p-3 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Target className="text-white" size={24} />
            </div>
          </div>
        </Card>

        {/* Tiempo Mensual */}
        <Card className="border-l-4 border-green-500 bg-gradient-to-br from-green-50 to-emerald-100">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-gray-600 text-xs md:text-sm font-medium mb-1">Tiempo del Mes</p>
              <p className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                {tiempoMensual.horas > 0
                  ? `${tiempoMensual.horas}h ${tiempoMensual.minutos}m`
                  : `${tiempoMensual.minutos}m`
                }
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Entrenando ⏱️</p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-emerald-500 p-2.5 md:p-3 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Clock className="text-white" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Entrenamiento de Hoy */}
      {rutinaHoy && !entrenamientoHoyCompletado && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg">
              <Target className="text-white" size={32} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-2xl font-bold text-gray-900">¡Rutina de Hoy!</h3>
                <Zap className="text-yellow-500" size={24} />
              </div>
              <p className="text-gray-700 font-medium mb-1">{rutinaHoy.nombre}</p>
              <p className="text-gray-600 mb-4">
                {rutinaHoy.ejercicios.length} ejercicios • Es momento de dar lo mejor de ti 💪
              </p>
              <Button
                className="w-full md:w-auto"
                onClick={() => navigate('/entrenar', { state: { rutinaPreseleccionada: rutinaHoy } })}
              >
                <div className="flex items-center space-x-2">
                  <Dumbbell size={20} />
                  <span>Iniciar Entrenamiento</span>
                </div>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Entrenamiento Completado */}
      {rutinaHoy && entrenamientoHoyCompletado && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-4 rounded-2xl shadow-lg animate-bounce">
              <Trophy className="text-white" size={32} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-2xl font-bold text-green-800">¡Entrenamiento Completado!</h3>
                <Award className="text-yellow-500" size={24} />
              </div>
              <p className="text-green-700 font-medium mb-1">{rutinaHoy.nombre}</p>
              <p className="text-green-600 mb-2">
                ¡Excelente trabajo! Has completado tu rutina de hoy. 🎉
              </p>
              <div className="flex flex-wrap gap-2 text-sm text-green-700">
                <span className="bg-green-200 px-3 py-1 rounded-full font-medium">✓ {rutinaHoy.ejercicios.length} ejercicios</span>
                <span className="bg-green-200 px-3 py-1 rounded-full font-medium">🔥 Racha: {rachaActual} días</span>
              </div>
              <p className="text-green-600 mt-3 text-sm italic">
                "El éxito es la suma de pequeños esfuerzos repetidos día tras día."
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Último Entrenamiento */}
      {ultimoEntrenamiento && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-4 rounded-2xl shadow-lg">
              <Trophy className="text-white" size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Último Entrenamiento</h3>
              <div className="space-y-1 text-gray-700">
                <p className="text-lg font-semibold">{ultimoEntrenamiento.rutinaNombre}</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(ultimoEntrenamiento.fecha), "d 'de' MMMM, HH:mm", { locale: es })}
                </p>
                <p className="text-sm font-medium text-green-700">
                  ✓ {ultimoEntrenamiento.ejercicios.length} ejercicios completados
                </p>
                {ultimoEntrenamiento.tiempoTotal && (
                  <p className="text-sm text-gray-600">
                    ⏱️ Duración: {formatTiempoLegible(ultimoEntrenamiento.tiempoTotal)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Accesos Rápidos */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Zap className="text-yellow-500" size={28} />
          <span>Accesos Rápidos</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/rutinas">
            <Card className="card-hover cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-4 rounded-2xl shadow-lg">
                  <List className="text-white" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Gestionar Rutinas</h3>
                  <p className="text-sm text-gray-600 mt-1">Crea y edita tus rutinas de entrenamiento</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/progreso">
            <Card className="card-hover cursor-pointer bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-purple-600 to-pink-500 p-4 rounded-2xl shadow-lg">
                  <TrendingUp className="text-white" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Ver Progreso</h3>
                  <p className="text-sm text-gray-600 mt-1">Analiza tu evolución con gráficas</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Mensaje Motivacional */}
      {entrenamientos.length === 0 && rutinas.length === 0 && (
        <Card className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <div className="py-6">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 rounded-full">
                <Target className="text-white" size={48} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              ¡Comienza Tu Viaje Fitness! 🚀
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Este es el primer paso hacia una mejor versión de ti. Crea tu primera rutina y empieza a alcanzar tus metas.
            </p>
            <Link to="/rutinas">
              <Button>
                <div className="flex items-center space-x-2">
                  <List size={20} />
                  <span>Crear Mi Primera Rutina</span>
                </div>
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
