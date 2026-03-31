import { useEffect, useState } from 'react';
import { lensApi } from '@/api/lensApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const TYPES = ['Monofocal', 'Bifocal', 'Progressiva', 'Intervil', 'Ocupacional'];
const INDEXES = ['1.49', '1.50', '1.53', '1.56', '1.59', '1.60', '1.67', '1.74'];
const TREATMENTS = ['Incolor', 'Antireflexo', 'Filtro Azul', 'Fotossensível', 'Foto AR', 'Foto Filtro Azul'];
const EYES = ['Ambos', 'Direito', 'Esquerdo'];
const MULTIFOCAL = ['Bifocal', 'Progressiva', 'Intervil'];

export default function LensForm({ lens, onSaved }) {
  const [form, setForm] = useState({
    type: '', index_value: '', brand: '', supplier: '',
    stock_qty: '0', low_stock_alert: '5',
    cost_price: '0', sale_price: '0', description: '',
    treatment: '', diameter: '',
    base: '', addition_min: '', addition_max: '', eye: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lens) setForm({
      type: lens.type || '',
      index_value: lens.index_value || '',
      brand: lens.brand || '',
      supplier: lens.supplier || '',
      stock_qty: String(lens.stock_qty ?? 0),
      low_stock_alert: String(lens.low_stock_alert ?? 5),
      cost_price: String(lens.cost_price ?? 0),
      sale_price: String(lens.sale_price ?? 0),
      description: lens.description || '',
      treatment: lens.treatment || '',
      diameter: lens.diameter || '',
      base: lens.base || '',
      addition_min: lens.addition_min || '',
      addition_max: lens.addition_max || '',
      eye: lens.eye || '',
    });
  }, [lens]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setVal = (k) => (v) => setForm({ ...form, [k]: v });

  const isMultifocal = MULTIFOCAL.includes(form.type);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (lens) await lensApi.update(lens.id, form);
      else await lensApi.create(form);
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
          <Label>Tipo *</Label>
          <Select value={form.type} onValueChange={setVal('type')} required>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Índice</Label>
          <Select value={String(form.index_value)} onValueChange={setVal('index_value')}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {INDEXES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Tratamento</Label>
          <Select value={form.treatment} onValueChange={setVal('treatment')}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {TREATMENTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Diâmetro (mm)</Label>
          <Input type="number" step="0.5" min="0" value={form.diameter} onChange={set('diameter')} placeholder="65" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Marca</Label>
          <Input value={form.brand} onChange={set('brand')} />
        </div>
        <div className="space-y-1">
          <Label>Fornecedor</Label>
          <Input value={form.supplier} onChange={set('supplier')} />
        </div>
      </div>

      {/* Multifocal fields: Bifocal, Progressiva, Intervil */}
      {isMultifocal && (
        <div className="border rounded-md p-3 space-y-3 bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Campos {form.type}</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Base</Label>
              <Input type="number" step="0.25" value={form.base} onChange={set('base')} placeholder="4.00" />
            </div>
            <div className="space-y-1">
              <Label>Adição Mín.</Label>
              <Input type="number" step="0.25" value={form.addition_min} onChange={set('addition_min')} placeholder="1.00" />
            </div>
            <div className="space-y-1">
              <Label>Adição Máx.</Label>
              <Input type="number" step="0.25" value={form.addition_max} onChange={set('addition_max')} placeholder="3.50" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Olho</Label>
            <Select value={form.eye} onValueChange={setVal('eye')}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {EYES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Qtd em Estoque</Label>
          <Input type="number" min="0" value={form.stock_qty} onChange={set('stock_qty')} />
        </div>
        <div className="space-y-1">
          <Label>Alerta (mín.)</Label>
          <Input type="number" min="0" value={form.low_stock_alert} onChange={set('low_stock_alert')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Custo (R$)</Label>
          <Input type="number" step="0.01" min="0" value={form.cost_price} onChange={set('cost_price')} />
        </div>
        <div className="space-y-1">
          <Label>Preço de Venda (R$)</Label>
          <Input type="number" step="0.01" min="0" value={form.sale_price} onChange={set('sale_price')} />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Descrição</Label>
        <Textarea value={form.description} onChange={set('description')} rows={2} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
      </div>
    </form>
  );
}
