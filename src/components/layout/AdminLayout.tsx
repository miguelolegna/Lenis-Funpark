import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Activity,
  Mail,
  Ticket,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import NotificationPopover from './NotificationPopover';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const navItems: NavItem[] = [
  { name: 'Dashboard Geral', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Reservas', path: '/admin/reservas', icon: CalendarCheck },
  { name: 'Semáforo', path: '/admin/semaforo', icon: Activity },
  { name: 'Mensagens', path: '/admin/contactos', icon: Mail },
  { name: 'Convites', path: '/admin/convites', icon: Ticket },
  { name: 'Admins', path: '/admin/admins', icon: Users },
];

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>('admin@lenisfunpark.pt');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function getAdminUser() {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.email) {
        setAdminEmail(data.session.user.email);
      } else {
        const stored = localStorage.getItem('admin_session');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.email) setAdminEmail(parsed.email);
          } catch {
            // fallback
          }
        }
      }
    }
    getAdminUser();
  }, []);

  // Fechar gaveta móvel ao mudar de rota
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('admin_session');
    } catch (err) {
      console.error('Erro ao terminar sessão:', err);
    } finally {
      navigate('/admin/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* Topbar Mobile */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b-2 border-surface-alt sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-secondary hover:bg-surface-alt transition-colors"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-black text-lg text-secondary tracking-tight">Leni's FunPark</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/20">
              Admin
            </span>
          </div>
        </div>

        {/* Notificações Interativas com Popover (Mobile) */}
        <NotificationPopover variant="icon" onCloseParentDrawer={() => setMobileMenuOpen(false)} />
      </header>

      {/* Overlay Backdrop para Mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-secondary/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Fixa no Desktop / Drawer no Mobile) */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 w-64 bg-white border-r-2 border-surface-alt flex flex-col justify-between transition-transform duration-300 ease-in-out h-screen ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header da Sidebar */}
          <div className="p-6 border-b border-surface-alt flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-secondary tracking-tight">Leni's FunPark</span>
              </div>
              <p className="text-xs font-semibold text-secondary/50 mt-1">Painel Administrativo</p>
            </div>
            {/* Fechar no mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg text-secondary/60 hover:text-secondary md:hidden"
              aria-label="Fechar navegação"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de Notificação Rápida Interativa */}
          <div className="px-4 pt-4 pb-2">
            <NotificationPopover variant="sidebar" onCloseParentDrawer={() => setMobileMenuOpen(false)} />
          </div>

          {/* Links de Navegação das 6 Páginas */}
          <nav className="p-3 space-y-1.5 flex-1" aria-label="Navegação da Administração">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin' || item.path === '/admin/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-primary text-white shadow-sm shadow-primary/20'
                        : 'text-secondary/70 hover:bg-surface-alt hover:text-secondary'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-secondary/60'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-surface-alt text-secondary'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer da Sidebar: Utilizador e Logout */}
        <div className="p-4 border-t border-surface-alt bg-surface/50">
          <div className="mb-3 px-2">
            <span className="block text-[11px] font-bold text-secondary/50 uppercase tracking-wider">
              Sessão Iniciada
            </span>
            <span className="block text-xs font-bold text-secondary truncate" title={adminEmail || 'Administrador'}>
              {adminEmail || 'Administrador'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-surface-alt text-accent font-bold text-sm rounded-xl hover:bg-accent/10 hover:border-accent/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 min-w-0 min-h-screen bg-surface overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
