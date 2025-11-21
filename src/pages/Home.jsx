import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { Calendar, Dumbbell, TrendingUp, List, Zap, Trophy, Target, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatTiempoLegible } from '../utils/formatters';

export default function Home() {
  const { rutinas, entrenamientos, calendario } = useApp();

  const hoy = format(new Date(), 'yyyy-MM-dd');
  const rutinaHoy = calendario.find(c => c.fecha === hoy);
  const ultimoEntrenamiento = entrenamientos[entrenamientos.length - 1];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-3">
            <Flame className="animate-bounce" size={32} />
            <h2 className="text-4xl font-extrabold">
              ¡Vamos a Entrenar!
            </h2>
          </div>
          <p className="text-xl text-white/90 mb-4 font-medium">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
          <p className="text-white/80 text-lg">
            Tu progreso comienza hoy. Cada repetición cuenta. 💪
          </p>
        </div>
        <div className="absolute top-0 right-0 opacity-10">
          <Dumbbell size={200} />
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-blue-500 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Rutinas</p>
              <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                {rutinas.length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <List className="text-blue-600" size={28} />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-green-500 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Entrenamientos</p>
              <p className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-400 bg-clip-text text-transparent">
                {entrenamientos.length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <Dumbbell className="text-green-600" size={28} />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-purple-500 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Programados</p>
              <p className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-400 bg-clip-text text-transparent">
                {calendario.length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <Calendar className="text-purple-600" size={28} />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-orange-500 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Racha</p>
              <p className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-red-400 bg-clip-text text-transparent">
                {entrenamientos.length > 0 ? Math.min(entrenamientos.length, 7) : 0}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <Flame className="text-orange-600" size={28} />
            </div>
          </div>
        </Card>
      </div>

      {/* Entrenamiento de Hoy */}
      {rutinaHoy && (
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
              <p className="text-gray-600 mb-4">
                Es momento de dar lo mejor de ti. Tu cuerpo te lo agradecerá.
              </p>
              <Link to="/entrenar">
                <Button className="w-full md:w-auto">
                  <div className="flex items-center space-x-2">
                    <Dumbbell size={20} />
                    <span>Iniciar Entrenamiento</span>
                  </div>
                </Button>
              </Link>
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
