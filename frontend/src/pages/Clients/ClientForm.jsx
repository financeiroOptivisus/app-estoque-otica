import { useEffect, useState } from 'react';
import { clientApi } from '@/api/clientApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ClientForm({ client, onSaved }) {
  const [form, setForm] = useState({
    name: '', phone: '', cpf_cnpj: '', email: '', address: '', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (client) setForm({
      name: client.name || '',
      phone: client.phone || '',
      cpf_cnpj: client.cpf_cnpj || '',
      email: client.email || '',
      address: client.address || '',
      notes: client.notes || '',
    });
  }, [client]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (client) await clientApi.update(client.id, form);
      else await clientApi.create(form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label>Nome / Razão Social *</Label>
        <Input value={form.name} onChange={set('name')} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Telefone / WhatsApp</Label>
          <Input value={form.phone} onChange={set('phone')} placeholder="(00) 00000-0000" />
        </div>
        <div className="space-y-1">
          <Label>CPF / CNPJ</Label>
          <Input value={form.cpf_cnpj} onChange={set('cpf_cnpj')} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>E-mail</Label>
        <Input type="email" value={form.email} onChange={set('email')} />
      </div>
      <div className="space-y-1">
        <Label>Endereço</Label>
        <Input value={form.address} onChange={set('address')} />
      </div>
      <div className="space-y-1">
        <Label>Observações</Label>
        <Textarea value={form.notes} onChange={set('notes')} rows={2} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
      </div>
    </form>
  );
}
