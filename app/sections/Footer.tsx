const navLinks = [
  { href: '#eventos', label: 'Eventos' },
  { href: '#artistas', label: 'Artistas' },
  { href: '#historia', label: 'Historia' },
  { href: '#archivo', label: 'Archivo' },
  { href: '#editorial', label: 'Editorial' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <p>
            Colectivo independiente dedicado a la promoción del
            techno y la cultura de club en Alicante.
          </p>
        </div>

        <div className="footer-col">
          <h4>Navegación</h4>
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contacto</h4>
          <ul>
            <li><a href="#">hola@fader.club</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">SoundCloud</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 FADER Colectivo. Todos los derechos reservados.</span>
        <span>Alicante, España</span>
      </div>
    </footer>
  )
}
