import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AuthSuccess from './pages/AuthSuccess';
import Home from './pages/Home';
import Inventories from './pages/Inventories';
import InventoryDetail from './pages/InventoryDetail';
import AuthButton from './components/AuthButton';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="navbar bg-body-tertiary">
        <div className="container">
          <Link className="navbar-brand" to="/">Inventory</Link>
          <div className="d-flex gap-3">
            <Link to="/inventories" className="nav-link">Inventories</Link>
            <AuthButton />
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inventories" element={<Inventories />} />
        <Route path="/inventories/:id" element={<InventoryDetail />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
