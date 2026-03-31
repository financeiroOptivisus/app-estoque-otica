import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { serviceOrderApi } from '@/api/serviceOrderApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OsStatusBadge } from '@/components/shared/StatusBadge';
import { Plus, Search, Pencil, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUSES = ['', 'Em producao', 'Montagem', 'Pronto', 'Entregue'];

export default function ServiceOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const load = () => {
    serviceOrderApi.list({ status, page, limit: LIMIT }).then((r) => {
      setOrders(r.data.data);
      setTotal(r.data.total);
    });
  };

  useEffect(() => { load(); }, [status, page]);

  const totalPages = Math.ceil(total / LIMIT);

  const filtered = search
    ? orders.filter((o) =>
        o.code.toLowerCase().includes(search.toLowerCase()) ||
        o.client_name.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Ordens de Serviço</h1>
        <Button onClick={() => navigate('/service-orders/new')} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nova OS
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por OS ou cliente..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v === 'todos' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="Em producao">Em produção</SelectItem>
            <SelectItem value="Montagem">Montagem</SelectItem>
            <SelectItem value="Pronto">Pronto</SelectItem>
            <SelectItem value="Entregue">Entregue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Total</TableHead>
              <TableHead className="hidden md:table-cell">Surfaç.</TableHead>
              <TableHead className="hidden md:table-cell">Montag.</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhuma OS encontrada</TableCell></TableRow>
            )}
            {filtered.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs font-bold">{o.code}</TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{o.client_name}</div>
                  <div className="text-xs text-muted-foreground">{o.client_code}</div>
                </TableCell>
                <TableCell className="text-sm">{formatDate(o.entry_date)}</TableCell>
                <TableCell><OsStatusBadge status={o.status} /></TableCell>
                <TableCell className="hidden md:table-cell text-sm">{formatCurrency(o.total_value)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {o.surfacing_done ? <span className="text-green-600 text-xs font-medium">✓</span> : <span className="text-muted-foreground text-xs">—</span>}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {o.assembly_done ? <span className="text-green-600 text-xs font-medium">✓</span> : <span className="text-muted-foreground text-xs">—</span>}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/service-orders/${o.id}/edit`)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => window.open(`/service-orders/${o.id}/print`, '_blank')}>
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} ordens</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
            <span className="px-2 py-1">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Próximo</Button>
          </div>
        </div>
      )}
    </div>
  );
}
