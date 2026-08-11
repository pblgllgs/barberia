import { Routes, Route } from 'react-router-dom'
import SiteLayout from '@/components/layout/SiteLayout'
import Home from '@/pages/Home'
import Reservar from '@/pages/Reservar'
import MisReservas from '@/pages/MisReservas'
import Registro from '@/pages/Registro'
import IniciarSesion from '@/pages/IniciarSesion'
import Perfil from '@/pages/Perfil'
import AdminLayout from '@/components/layout/AdminLayout'
import Login from '@/pages/admin/Login'
import Dashboard from '@/pages/admin/Dashboard'
import Servicios from '@/pages/admin/Servicios'
import Barberos from '@/pages/admin/Barberos'
import Horarios from '@/pages/admin/Horarios'
import ReservasAdmin from '@/pages/admin/ReservasAdmin'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="reservar" element={<Reservar />} />
        <Route path="mis-reservas" element={<MisReservas />} />
        <Route path="registro" element={<Registro />} />
        <Route path="iniciar-sesion" element={<IniciarSesion />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>
      <Route path="admin/login" element={<Login />} />
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="reservas" element={<ReservasAdmin />} />
        <Route path="servicios" element={<Servicios />} />
        <Route path="barberos" element={<Barberos />} />
        <Route path="horarios" element={<Horarios />} />
      </Route>
    </Routes>
  )
}