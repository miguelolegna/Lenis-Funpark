import { Outlet } from 'react-router-dom';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-brand-dark text-brand-light flex flex-col">
      <header className="bg-[#082E32] border-b border-white/10 p-4">
        <h1 className="text-xl font-bold text-brand-yellow">Leni's Funpark - Admin</h1>
      </header>
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
