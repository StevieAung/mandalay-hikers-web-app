import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <Link className="logo light-logo" to="/">
          Hikers
        </Link>
        <p>© 2024 Hikers Mandalay. Built for the rugged.</p>
      </div>
      <nav>
        <a>Privacy Policy</a>
        <a>Safety Guidelines</a>
        <a>Trail Conduct</a>
      </nav>
    </footer>
  )
}
