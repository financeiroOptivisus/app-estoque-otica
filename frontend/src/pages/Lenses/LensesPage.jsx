import { useEffect, useState } from 'react';
import { lensApi } from '@/api/lensApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import LensForm from './LensForm';

export default function LensesPage() {
  const [lenses, setLenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const LIMIT = 20;

  const load = () => {
    lensApi.list({ search, low_stock: lowStock, page, limit: LIMIT }).then((r) => {
      setLenses(r.data.data);
      setTotal(r.data.total);
    });
  };

  useEffect(() => { load(); }, [search, lowStock, page]);

  function handleEdit(lens) { setEditing(lens); setOpen(true); }
  function handleNew() { setEditing(null); setOpen(true); }

  async function handleDelete(id) {
    if (!confirm('Desativar esta lente?')) return;
    await lensApi.remove(id);
    load();
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Lentes / Estoque</h1>
        <Button onClick={handleNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Lente</Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, marca, tipo..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Button
          variant={lowStock ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => { setLowStock(!lowStock); setPage(1); }}
        >
          <AlertTriangle className="h-4 w-4 mr-1" /> Estoque Baixo
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Marca</TableHead>
              <TableHead className="hidden md:table-cell">Índice</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="hidden md:table-cell">Custo</TableHead>
              <TableHead>Venda</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lenses.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhuma lente encontrada</TableCell></TableRow>
            )}
            {lenses.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-mono text-xs">{l.code}</TableCell>
                <TableCell className="text-sm">{l.type}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{l.brand || '-'}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{l.index_value || '-'}</TableCell>
                <TableCell>
                  {l.stock_qty <= l.low_stock_alert ? (
                    <Badge variant="destructive">{l.stock_qty}</Badge>
                  ) : (
                    <Badge variant="success">{l.stock_qty}</Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">{formatCurrency(l.cost_price)}</TableCell>
                <TableCell className="text-sm font-medium">{formatCurrency(l.sale_price)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(l)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} lentes</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
            <span className="px-2 py-1">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Próximo</Button>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Lente' : 'Nova Lente'}</DialogTitle>
          </DialogHeader>
          <LensForm lens={editing} onSaved={() => { setOpen(false); load(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
