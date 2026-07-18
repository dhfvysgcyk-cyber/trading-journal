import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { DiamondIcon, GearIcon, HomeIcon, JournalIcon } from '../ui/icons'

const STARTSEITE_ITEM = { to: '/', label: 'Startseite', icon: '⌂' }
const JOURNAL_ITEM = { to: '/journal', label: 'Journal', icon: '☰' }
const LIVE_ITEM = { to: '/statistik/live', label: 'Live', icon: '◆' }
const PROP_ITEM = { to: '/statistik/propfirm', label: 'Prop', icon: '◇' }
const SETTINGS_ITEM = { to: '/einstellungen', label: 'Einstellungen', icon: '⚙' }

// Desktop sidebar keeps the logical reading order (with text labels).
const NAV_ITEMS = [STARTSEITE_ITEM, JOURNAL_ITEM, LIVE_ITEM, PROP_ITEM]

// Mobile bottom nav: Startseite centered, Live/Prop to its left, Journal/Einstellungen to its right.
// Icon-only, so each entry carries its own SVG instead of the sidebar's text glyph.
const BOTTOM_NAV_ITEMS = [
  { to: LIVE_ITEM.to, label: LIVE_ITEM.label, icon: <DiamondIcon filled /> },
  { to: PROP_ITEM.to, label: PROP_ITEM.label, icon: <DiamondIcon /> },
  { to: STARTSEITE_ITEM.to, label: STARTSEITE_ITEM.label, icon: <HomeIcon /> },
  { to: JOURNAL_ITEM.to, label: JOURNAL_ITEM.label, icon: <JournalIcon /> },
  { to: SETTINGS_ITEM.to, label: SETTINGS_ITEM.label, icon: <GearIcon /> },
]

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
        {BOTTOM_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            aria-label={item.label}
            title={item.label}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          >
            {item.icon}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
