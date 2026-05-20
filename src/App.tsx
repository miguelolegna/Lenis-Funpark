import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Marcacoes from './pages/Marcacoes';
import Sobre from './pages/Sobre';
import { AdminLayout } from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marcacoes" element={<Marcacoes />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
