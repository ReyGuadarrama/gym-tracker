import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Rutinas from './pages/Rutinas';
import Calendario from './pages/Calendario';
import Entrenar from './pages/Entrenar';
import Progreso from './pages/Progreso';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="rutinas" element={<Rutinas />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="entrenar" element={<Entrenar />} />
            <Route path="progreso" element={<Progreso />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
