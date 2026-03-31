import { useEffect, useState } from 'react';
import { financialApi } from '@/api/financialApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FinStatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function FinancialPage() {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [payDialog, setPayDialog] = useState(null);
  const [payForm, setPayForm] = useState({ payment_date: new Date().toISOString().split('T')[0], payment_method: 'Dinheiro' });
  const LIMIT = 20;

  const load = () => {
    financialApi.list({ status, page, limit: LIMIT }).then((r) => {
      setRecords(r.data.data);
      setTotal(r.data.total);
    });
  };

  useEffect(() => { load(); }, [status, page]);

  async function handleLoadDetail(id) {
    if (expanded === id) { setExpanded(null); return; }
    const r = await financialApi.get(id);
    setRecords((prev) => prev.map((rec) => rec.id === id ? { ...rec, installments: r.data.installments } : rec));
    setExpanded(id);
  }

  async function handlePay() {
    await financialApi.payInstallment(payDialog.financial_id, payDialog.installment_id, payForm);
    setPayDialog(null);
    load();
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Financeiro</h1>

      <Select value={status} onValueChange={(v) => { setStatus(v === 'todos' ? '' : v); setPage(1); }}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Todos os status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="Pendente">Pendente</SelectItem>
          <SelectItem value="Parcial">Parcial</SelectItem>
          <SelectItem value="Pago">Pago</SelectItem>
        </SelectContent>
      </Select>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>OS</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Vencimento</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="hidden md:table-cell">Pago</TableHead>
              <TableHead className="hidden md:table-cell">Saldo</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhum registro encontrado</TableCell></TableRow>
            )}
            {records.map((rec) => (
              <>
                <TableRow key={rec.id} className="cursor-pointer" onClick={() => handleLoadDetail(rec.id)}>
                  <TableCell>
                    {expanded === rec.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold">{rec.os_code}</TableCell>
                  <TableCell className="text-sm">{rec.client_name}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{formatDate(rec.due_date)}</TableCell>
                  <TableCell className="text-sm font-medium">{formatCurrency(rec.total_amount)}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-green-600">{formatCurrency(rec.amount_paid)}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-orange-600">{formatCurrency(rec.balance)}</TableCell>
                  <TableCell><FinStatusBadge status={rec.status} /></TableCell>
                </TableRow>
                {expanded === rec.id && rec.installments && rec.installments.map((inst) => (
                  <TableRow key={`inst-${inst.id}`} className="bg-muted/30">
                    <TableCell />
                    <TableCell colSpan={2} className="text-xs text-muted-foreground pl-8">
                      Parcela {inst.installment_num} — Venc: {formatDate(inst.due_date)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{inst.payment_date ? formatDate(inst.payment_date) : '—'}</TableCell>
                    <TableCell className="text-xs">{formatCurrency(inst.amount)}</TableCell>
                    <TableCell className="hidden md:table-cell" />
                    <TableCell className="hidden md:table-cell" />
                    <TableCell>
                      {inst.status === 'Pendente' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={(e) => { e.stopPropagation(); setPayDialog({ financial_id: rec.id, installment_id: inst.id }); }}
                        >
                          Pagar
                        </Button>
                      ) : (
                        <span className="text-xs text-green-600 font-medium">✓ Pago</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} registros</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
            <span className="px-2 py-1">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Próximo</Button>
          </div>
        </div>
      )}

      <Dialog open={!!payDialog} onOpenChange={() => setPayDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Registrar Pagamento</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Data do Pagamento</label>
              <Input type="date" value={payForm.payment_date} onChange={(e) => setPayForm({ ...payForm, payment_date: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <Select value={payForm.payment_method} onValueChange={(v) => setPayForm({ ...payForm, payment_method: v })}>
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
            <Button onClick={handlePay} className="w-full">Confirmar Pagamento</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
