import { useEffect, useState } from 'react';
import { frameApi } from '@/api/frameApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import FrameForm from './FrameForm';

export default function FramesPage() {
  const [frames, setFrames] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const LIMIT = 20;

  const load = () => {
    frameApi.list({ search, page, limit: LIMIT }).then((r) => {
      setFrames(r.data.data);
      setTotal(r.data.total);
    });
  };

  useEffect(() => { load(); }, [search, page]);

  function handleEdit(f) { setEditing(f); setOpen(true); }
  function handleNew() { setEditing(null); setOpen(true); }

  async function handleDelete(id) {
    if (!confirm('Desativar esta armação?')) return;
    await frameApi.remove(id);
    load();
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Armações</h1>
        <Button onClick={handleNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Armação</Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por código, marca, modelo..."
          className="pl-9"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Cor</TableHead>
              <TableHead className="hidden md:table-cell">Tamanho</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {frames.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  Nenhuma armação encontrada
                </TableCell>
              </TableRow>
            )}
            {frames.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-mono text-xs">{f.code}</TableCell>
                <TableCell className="font-medium">{f.brand || '—'}</TableCell>
                <TableCell>{f.model || '—'}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{f.type || '—'}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{f.color || '—'}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{f.size || '—'}</TableCell>
                <TableCell>{f.stock_qty}</TableCell>
                <TableCell>{formatCurrency(f.sale_price)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(f)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} armações</span>
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
            <DialogTitle>{editing ? 'Editar Armação' : 'Nova Armação'}</DialogTitle>
          </DialogHeader>
          <FrameForm frame={editing} onSaved={() => { setOpen(false); load(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
