import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../lib/auth'

const NAV_ITEMS = [
  { to: '/', label: 'Startseite', icon: '⌂' },
  { to: '/journal', label: 'Journal', icon: '☰' },
  { to: '/statistik/live', label: 'Live', icon: '◆' },
  { to: '/statistik/propfirm', label: 'Prop', icon: '◇' },
]

const SETTINGS_ITEM = { to: '/einstellungen', label: 'Einstellungen', icon: '⚙' }

export function AppShell() {
  const { signOut } = useAuth()

  return (
    <div className="app-shell">
      <nav className="side-nav">
        <div className="brand">
          <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" className="brand-logo" />
          <span>Trading Journal</span>
        </div>
        <div className="nav-list">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
        <NavLink
          to={SETTINGS_ITEM.to}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{SETTINGS_ITEM.icon}</span>
          <span>{SETTINGS_ITEM.label}</span>
        </NavLink>
        <button type="button" className="nav-item logout-btn" onClick={() => signOut()}>
          <span className="nav-icon">↩</span>
          <span>Abmelden</span>
        </button>
      </nav>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
        <NavLink
          to={SETTINGS_ITEM.to}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{SETTINGS_ITEM.icon}</span>
          <span>{SETTINGS_ITEM.label}</span>
        </NavLink>
      </nav>
    </div>
  )
}
