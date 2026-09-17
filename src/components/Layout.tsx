import { Outlet, NavLink } from 'react-router-dom';
import './Layout.css';

export function Layout() {
  return (
    <div className="layout">
      <header className="header">
        <h1>SpeakAI</h1>
        <nav className="nav">
          <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''} end>Characters</NavLink>
          <NavLink to="/history" className={({isActive}) => isActive ? 'active' : ''}>History</NavLink>
          <NavLink to="/memory" className={({isActive}) => isActive ? 'active' : ''}>Memory</NavLink>
          <NavLink to="/settings" className={({isActive}) => isActive ? 'active' : ''}>Settings</NavLink>
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
