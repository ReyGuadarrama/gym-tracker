import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function Timer({ duracion, onComplete, autoStart = false, label = 'Temporizador' }) {
  const [tiempo, setTiempo] = useState(duracion);
  const [activo, setActivo] = useState(autoStart);
  const [completado, setCompletado] = useState(false);

  useEffect(() => {
    let intervalo = null;

    if (activo && tiempo > 0) {
      intervalo = setInterval(() => {
        setTiempo((t) => {
          if (t <= 1) {
            setActivo(false);
            setCompletado(true);
            if (onComplete) onComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [activo, tiempo, onComplete]);

  const toggle = () => setActivo(!activo);

  const reset = () => {
    setTiempo(duracion);
    setActivo(false);
    setCompletado(false);
  };

  const formatTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className={`text-4xl font-bold mb-4 ${completado ? 'text-green-600' : 'text-gray-900'}`}>
        {formatTiempo(tiempo)}
      </div>
      <div className="flex justify-center space-x-2">
        <Button
          variant="secondary"
          onClick={toggle}
          className="flex items-center space-x-1"
        >
          {activo ? <Pause size={18} /> : <Play size={18} />}
          <span>{activo ? 'Pausar' : 'Iniciar'}</span>
        </Button>
        <Button variant="secondary" onClick={reset}>
          <RotateCcw size={18} />
        </Button>
      </div>
    </div>
  );
}
