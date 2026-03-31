import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Glasses, ClipboardList, DollarSign, BarChart2, LogOut, ScanLine, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/lenses', icon: Glasses, label: 'Lentes' },
  { to: '/frames', icon: ScanLine, label: 'Armações' },
  { to: '/service-orders', icon: ClipboardList, label: 'Ordens de Serviço' },
  { to: '/financial', icon: DollarSign, label: 'Financeiro' },
  { to: '/reports', icon: BarChart2, label: 'Relatórios' },
];

export function Sidebar({ mobileOpen, onClose }) {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();

  const content = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">BF Lentes</h1>
            <p className="text-xs text-muted-foreground">Laboratório Óptico</p>
          </div>
          <button onClick={onClose} className="md:hidden p-1"><X className="h-5 w-5" /></button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname.startsWith(to)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground mb-2 px-3">{user?.name}</div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-64 border-r bg-background flex-col h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <aside className="relative w-64 bg-background h-full z-50">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
