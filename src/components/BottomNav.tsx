import { NavLink as RouterNavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: '🏠', label: 'Home' },
  { to: '/quest', icon: '⚔️', label: 'Quest' },
  { to: '/skills', icon: '✨', label: 'Skills' },
  { to: '/titles', icon: '🏷️', label: 'Títulos' },
  { to: '/shop', icon: '🏪', label: 'Tienda' },
  { to: '/history', icon: '📜', label: 'Historial' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md animate-slide-up">
      <div className="flex justify-around items-center max-w-lg mx-auto h-16">
        {navItems.map((item, i) => (
          <RouterNavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 transition-all duration-200 ${
                isActive
                  ? 'text-primary scale-110'
                  : 'text-muted-foreground hover:text-foreground hover:scale-105'
              }`
            }
          >
            <span className="text-xl transition-transform duration-200">{item.icon}</span>
            <span className="text-[10px] font-display uppercase tracking-wider">{item.label}</span>
          </RouterNavLink>
        ))}
      </div>
    </nav>
  );
}
