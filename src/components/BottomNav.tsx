import { NavLink as RouterNavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: '🏠', label: 'Home' },
  { to: '/quest', icon: '⚔️', label: 'Quest' },
  { to: '/skills', icon: '✨', label: 'Skills' },
  { to: '/titles', icon: '🏷️', label: 'Títulos' },
  { to: '/history', icon: '📜', label: 'Historial' },
  { to: '/monarch', icon: '👑', label: 'Monarca' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="flex justify-around items-center max-w-lg mx-auto h-16">
        {navItems.map(item => (
          <RouterNavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-display uppercase tracking-wider">{item.label}</span>
          </RouterNavLink>
        ))}
      </div>
    </nav>
  );
}
