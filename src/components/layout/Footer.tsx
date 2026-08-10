import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer id="ubicacion" className="border-t border-line">
      <div className="container-site">
        <div className="grid gap-8 border-b border-line py-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="font-display mb-3.5 text-xl">
              Barba <span className="text-brass">Negra</span>
            </div>
            <p className="max-w-sm text-sm text-ash">
              Av. Los Robles 1234, Providencia, Santiago.
              <br />
              Lunes a sábado, 10:00 – 20:00.
            </p>
          </div>
          <div>
            <h4 className="label-mono mb-3.5">Servicios</h4>
            <ul className="space-y-2 text-sm text-ash">
              <li><Link to="/reservar" className="hover:text-brass">Corte clásico</Link></li>
              <li><Link to="/reservar" className="hover:text-brass">Arreglo de barba</Link></li>
              <li><Link to="/reservar" className="hover:text-brass">Corte + barba</Link></li>
              <li><Link to="/reservar" className="hover:text-brass">Afeitado clásico</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="label-mono mb-3.5">Contacto</h4>
            <ul className="space-y-2 text-sm text-ash">
              <li><a href="tel:+56912345678" className="hover:text-brass">+56 9 1234 5678</a></li>
              <li><a href="mailto:hola@barbanegra.cl" className="hover:text-brass">hola@barbanegra.cl</a></li>
              <li><a href="#" className="hover:text-brass">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-2 py-5 font-mono text-[11.5px] tracking-[0.08em] text-faint">
          <span>© 2026 Barba Negra Barbershop</span>
          <span>Hecho con oficio</span>
        </div>
      </div>
    </footer>
  )
}