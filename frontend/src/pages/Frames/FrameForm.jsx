import { useEffect, useState } from 'react';
import { frameApi } from '@/api/frameApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const FRAME_TYPES = ['Acetato', 'Nylon', 'Metal', 'Parafusada'];

export default function FrameForm({ frame, onSaved }) {
  const [form, setForm] = useState({
    brand: '', model: '', color: '', type: '', size: '',
    stock_qty: '0', cost_price: '0', sale_price: '0', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (frame) setForm({
      brand: frame.brand || '',
      model: frame.model || '',
      color: frame.color || '',
      type: frame.type || '',
      size: frame.size || '',
      stock_qty: String(frame.stock_qty ?? 0),
      cost_price: String(frame.cost_price ?? 0),
      sale_price: String(frame.sale_price ?? 0),
      notes: frame.notes || '',
    });
  }, [frame]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setVal = (k) => (v) => setForm({ ...form, [k]: v });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (frame) await frameApi.update(frame.id, form);
      else await frameApi.create(form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Marca</Label>
          <Input value={form.brand} onChange={set('brand')} />
        </div>
        <div className="space-y-1">
          <Label>Modelo</Label>
          <Input value={form.model} onChange={set('model')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Tipo</Label>
          <Select value={form.type} onValueChange={setVal('type')}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">—</SelectItem>
              {FRAME_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Cor</Label>
          <Input value={form.color} onChange={set('color')} />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Tamanho</Label>
        <Input value={form.size} onChange={set('size')} placeholder="ex: 52-18-140" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label>Estoque</Label>
          <Input type="number" min="0" value={form.stock_qty} onChange={set('stock_qty')} />
        </div>
        <div className="space-y-1">
          <Label>Custo (R$)</Label>
          <Input type="number" step="0.01" min="0" value={form.cost_price} onChange={set('cost_price')} />
        </div>
        <div className="space-y-1">
          <Label>Venda (R$)</Label>
          <Input type="number" step="0.01" min="0" value={form.sale_price} onChange={set('sale_price')} />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Observações</Label>
        <Textarea value={form.notes} onChange={set('notes')} rows={2} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
      </div>
    </form>
  );
}
