import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { serviceOrderApi } from '@/api/serviceOrderApi';
import { clientApi } from '@/api/clientApi';
import { lensApi } from '@/api/lensApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, ArrowLeft, Printer } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const ORDER_TYPES = [
  'Fabricacao',
  'Montagem',
  'Montagem Visao Simples',
  'Montagem Acetato/Nylon/Metal',
  'Montagem Parafusada',
];

const FRAME_TYPES = ['Acetato', 'Nylon', 'Metal', 'Parafusada'];

const SERVICES = [
  { key: 'svc_incolor',      label: 'Surfaçagem Incolor' },
  { key: 'svc_antireflexo',  label: 'Antireflexo' },
  { key: 'svc_filtro_azul',  label: 'Filtro Azul' },
  { key: 'svc_fotosensivel', label: 'Fotossensível' },
  { key: 'svc_fotoar',       label: 'Foto AR' },
  { key: 'svc_alto_indice',  label: 'Alto Índice' },
  { key: 'svc_policarbonato',label: 'Policarbonato' },
];

const EMPTY_FORM = {
  code: '',
  client_id: '',
  order_type: 'Fabricacao',
  entry_date: new Date().toISOString().split('T')[0],
  delivery_date: '',
  status: 'Em producao',
  technical_notes: '',
  od_sphere: '', od_cylinder: '', od_axis: '', od_addition: '', od_pd: '',
  oe_sphere: '', oe_cylinder: '', oe_axis: '', oe_addition: '', oe_pd: '',
  frame_brand: '', frame_model: '', frame_color: '',
  frame_type: '', frame_size: '', frame_height: '', frame_measure: '', frame_height_measure: '',
  surfacing_done: false, assembly_done: false,
  svc_incolor: false, svc_antireflexo: false, svc_filtro_azul: false,
  svc_fotosensivel: false, svc_fotoar: false, svc_alto_indice: false, svc_policarbonato: false,
  discount: '0',
};

export default function ServiceOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [clients, setClients] = useState([]);
  const [lenses, setLenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState([]);
  const [financial, setFinancial] = useState({
    payment_method: 'Dinheiro', installments_qty: '1',
    due_date: new Date().toISOString().split('T')[0], notes: '',
  });

  useEffect(() => {
    clientApi.list({ limit: 500 }).then((r) => setClients(r.data.data));
    lensApi.list({ limit: 500 }).then((r) => setLenses(r.data.data));
    if (isEdit) {
      serviceOrderApi.get(id).then((r) => {
        const os = r.data;
        setForm({
          code: os.code || '',
          client_id: String(os.client_id),
          order_type: os.order_type || 'Fabricacao',
          entry_date: os.entry_date?.split('T')[0] || '',
          delivery_date: os.delivery_date?.split('T')[0] || '',
          status: os.status,
          technical_notes: os.technical_notes || '',
          od_sphere: os.od_sphere ?? '', od_cylinder: os.od_cylinder ?? '',
          od_axis: os.od_axis ?? '', od_addition: os.od_addition ?? '', od_pd: os.od_pd ?? '',
          oe_sphere: os.oe_sphere ?? '', oe_cylinder: os.oe_cylinder ?? '',
          oe_axis: os.oe_axis ?? '', oe_addition: os.oe_addition ?? '', oe_pd: os.oe_pd ?? '',
          frame_brand: os.frame_brand || '', frame_model: os.frame_model || '',
          frame_color: os.frame_color || '', frame_type: os.frame_type || '',
          frame_size: os.frame_size || '', frame_height: os.frame_height || '',
          frame_measure: os.frame_measure || '', frame_height_measure: os.frame_height_measure || '',
          surfacing_done: Boolean(os.surfacing_done), assembly_done: Boolean(os.assembly_done),
          svc_incolor: Boolean(os.svc_incolor), svc_antireflexo: Boolean(os.svc_antireflexo),
          svc_filtro_azul: Boolean(os.svc_filtro_azul), svc_fotosensivel: Boolean(os.svc_fotosensivel),
          svc_fotoar: Boolean(os.svc_fotoar), svc_alto_indice: Boolean(os.svc_alto_indice),
          svc_policarbonato: Boolean(os.svc_policarbonato),
          discount: String(os.discount ?? 0),
        });
        setItems(os.items?.map((i) => ({
          lens_id: String(i.lens_id), eye: i.eye, qty: String(i.qty),
          unit_price: String(i.unit_price), subtotal: String(i.subtotal),
          lens_code: i.lens_code, lens_type: i.lens_type,
        })) || []);
      });
    }
  }, [id]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setVal = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setCheck = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));
  const setFin = (k) => (e) => setFinancial((f) => ({ ...f, [k]: e.target.value }));
  const setFinVal = (k) => (v) => setFinancial((f) => ({ ...f, [k]: v }));

  function addItem() {
    setItems((prev) => [...prev, { lens_id: '', eye: 'PAR', qty: '1', unit_price: '0', subtotal: '0' }]);
  }

  function removeItem(i) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateItem(i, k, v) {
    setItems((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [k]: v };
      if (k === 'lens_id') {
        const lens = lenses.find((l) => String(l.id) === v);
        if (lens) updated[i].unit_price = String(lens.sale_price);
      }
      const qty = Number(updated[i].qty) || 0;
      const price = Number(updated[i].unit_price) || 0;
      updated[i].subtotal = String(qty * price);
      return updated;
    });
  }

  const itemsTotal = items.reduce((s, i) => s + Number(i.subtotal), 0);
  const total = itemsTotal - Number(form.discount || 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        items: items.map((i) => ({
          lens_id: Number(i.lens_id), eye: i.eye,
          qty: Number(i.qty), unit_price: Number(i.unit_price), subtotal: Number(i.subtotal),
        })),
        total_value: total,
        financial: !isEdit ? {
          client_id: Number(form.client_id),
          total_amount: total,
          payment_method: financial.payment_method,
          installments_qty: Number(financial.installments_qty),
          due_date: financial.due_date,
          notes: financial.notes,
        } : undefined,
      };
      if (isEdit) await serviceOrderApi.update(id, payload);
      else await serviceOrderApi.create(payload);
      navigate('/service-orders');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/service-orders')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{isEdit ? `Editar OS` : 'Nova Ordem de Serviço'}</h1>
        </div>
        {isEdit && (
          <Button variant="outline" size="sm" onClick={() => window.open(`/service-orders/${id}/print`, '_blank')}>
            <Printer className="h-4 w-4 mr-1" /> Imprimir
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Dados Gerais */}
        <Card>
          <CardHeader><CardTitle className="text-base">Dados Gerais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Código da OS</Label>
                <Input
                  value={form.code}
                  onChange={set('code')}
                  placeholder="Deixe vazio para gerar automaticamente"
                />
              </div>
              <div className="space-y-1">
                <Label>Tipo da Ordem *</Label>
                <Select value={form.order_type} onValueChange={setVal('order_type')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ORDER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Cliente *</Label>
              <Select value={form.client_id} onValueChange={setVal('client_id')} required>
                <SelectTrigger><SelectValue placeholder="Selecione o cliente..." /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.code} — {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Data de Entrada *</Label>
                <Input type="date" value={form.entry_date} onChange={set('entry_date')} required />
              </div>
              <div className="space-y-1">
                <Label>Previsão de Entrega</Label>
                <Input type="date" value={form.delivery_date} onChange={set('delivery_date')} />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={setVal('status')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Em producao">Em produção</SelectItem>
                    <SelectItem value="Montagem">Montagem</SelectItem>
                    <SelectItem value="Pronto">Pronto</SelectItem>
                    <SelectItem value="Entregue">Entregue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.surfacing_done} onChange={setCheck('surfacing_done')} />
                Surfaçagem concluída
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.assembly_done} onChange={setCheck('assembly_done')} />
                Montagem concluída
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Receita */}
        <Card>
          <CardHeader><CardTitle className="text-base">Receita</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs">
                    <th className="text-left pb-2 pr-2 w-28">Olho</th>
                    <th className="pb-2 pr-2">Esf.</th>
                    <th className="pb-2 pr-2">Cil.</th>
                    <th className="pb-2 pr-2">Eixo</th>
                    <th className="pb-2 pr-2">Adição</th>
                    <th className="pb-2">D.P.</th>
                  </tr>
                </thead>
                <tbody>
                  {[['od', 'OD (Direito)'], ['oe', 'OE (Esquerdo)']].map(([eye, label]) => (
                    <tr key={eye}>
                      <td className="pr-2 font-medium pb-2 whitespace-nowrap text-xs">{label}</td>
                      {['sphere', 'cylinder', 'axis', 'addition', 'pd'].map((f) => (
                        <td key={f} className="pr-2 pb-2">
                          <Input
                            type="number"
                            step={f === 'axis' ? '1' : '0.25'}
                            className="w-20"
                            value={form[`${eye}_${f}`]}
                            onChange={set(`${eye}_${f}`)}
                            placeholder={f === 'axis' ? '0' : '0.00'}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Armação */}
        <Card>
          <CardHeader><CardTitle className="text-base">Armação</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label>Marca</Label>
                <Input value={form.frame_brand} onChange={set('frame_brand')} />
              </div>
              <div className="space-y-1">
                <Label>Modelo</Label>
                <Input value={form.frame_model} onChange={set('frame_model')} />
              </div>
              <div className="space-y-1">
                <Label>Cor</Label>
                <Input value={form.frame_color} onChange={set('frame_color')} />
              </div>
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select value={form.frame_type} onValueChange={setVal('frame_type')}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">—</SelectItem>
                    {FRAME_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label>Tamanho</Label>
                <Input value={form.frame_size} onChange={set('frame_size')} placeholder="52-18-140" />
              </div>
              <div className="space-y-1">
                <Label>Medida da Armação</Label>
                <Input value={form.frame_measure} onChange={set('frame_measure')} placeholder="mm" />
              </div>
              <div className="space-y-1">
                <Label>Altura</Label>
                <Input type="number" step="0.5" value={form.frame_height} onChange={set('frame_height')} placeholder="mm" />
              </div>
              <div className="space-y-1">
                <Label>Medida da Altura</Label>
                <Input type="number" step="0.5" value={form.frame_height_measure} onChange={set('frame_height_measure')} placeholder="mm" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lentes */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Lentes</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.length === 0 && <p className="text-muted-foreground text-sm">Nenhuma lente adicionada.</p>}
            {items.map((item, i) => (
              <div key={i} className="flex flex-wrap gap-2 items-end p-3 border rounded-md">
                <div className="space-y-1 flex-1 min-w-44">
                  <Label>Lente</Label>
                  <Select value={item.lens_id} onValueChange={(v) => updateItem(i, 'lens_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {lenses.map((l) => (
                        <SelectItem key={l.id} value={String(l.id)}>
                          {l.code} — {l.type}{l.brand ? ` ${l.brand}` : ''}{l.index_value ? ` ${l.index_value}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 w-20">
                  <Label>Olho</Label>
                  <Select value={item.eye} onValueChange={(v) => updateItem(i, 'eye', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAR">Par</SelectItem>
                      <SelectItem value="OD">OD</SelectItem>
                      <SelectItem value="OE">OE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 w-16">
                  <Label>Qtd</Label>
                  <Input type="number" min="1" value={item.qty} onChange={(e) => updateItem(i, 'qty', e.target.value)} />
                </div>
                <div className="space-y-1 w-24">
                  <Label>Preço Unit.</Label>
                  <Input type="number" step="0.01" value={item.unit_price} onChange={(e) => updateItem(i, 'unit_price', e.target.value)} />
                </div>
                <div className="space-y-1 w-24">
                  <Label>Subtotal</Label>
                  <div className="h-10 flex items-center text-sm font-medium">{formatCurrency(item.subtotal)}</div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}

            <Separator />
            <div className="flex items-center justify-end gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Label>Desconto (R$)</Label>
                <Input type="number" step="0.01" min="0" className="w-24" value={form.discount} onChange={set('discount')} />
              </div>
              <div className="text-lg font-bold">Total: {formatCurrency(total)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Serviços */}
        <Card>
          <CardHeader><CardTitle className="text-base">Serviços</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SERVICES.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form[key]} onChange={setCheck(key)} />
                  {label}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Observações Técnicas */}
        <Card>
          <CardHeader><CardTitle className="text-base">Observações Técnicas</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={form.technical_notes} onChange={set('technical_notes')} rows={3} />
          </CardContent>
        </Card>

        {/* Pagamento (só criação) */}
        {!isEdit && (
          <Card>
            <CardHeader><CardTitle className="text-base">Pagamento</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Forma de Pagamento</Label>
                  <Select value={financial.payment_method} onValueChange={setFinVal('payment_method')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Cartao Credito">Cartão Crédito</SelectItem>
                      <SelectItem value="Cartao Debito">Cartão Débito</SelectItem>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Parcelas</Label>
                  <Input type="number" min="1" max="24" value={financial.installments_qty} onChange={setFin('installments_qty')} />
                </div>
                <div className="space-y-1">
                  <Label>Vencimento</Label>
                  <Input type="date" value={financial.due_date} onChange={setFin('due_date')} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Observações</Label>
                <Input value={financial.notes} onChange={setFin('notes')} />
              </div>
            </CardContent>
          </Card>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/service-orders')}>Cancelar</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar OS'}
          </Button>
        </div>
      </form>
    </div>
  );
}
