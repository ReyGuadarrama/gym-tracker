import { useState, useEffect } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import Button from './Button';

export default function Stopwatch({ onStop, label = 'Cronómetro' }) {
  const [tiempo, setTiempo] = useState(0);
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    let intervalo = null;

    if (activo) {
      intervalo = setInterval(() => {
        setTiempo((t) => t + 1);
      }, 1000);
    }

    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [activo]);

  const toggle = () => setActivo(!activo);

  const detener = () => {
    setActivo(false);
    if (onStop) onStop(tiempo);
    setTiempo(0);
  };

  const formatTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="text-3xl font-bold mb-3 text-gray-900">
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
        {tiempo > 0 && (
          <Button variant="danger" onClick={detener}>
            <Square size={18} />
          </Button>
        )}
      </div>
    </div>
  );
}
