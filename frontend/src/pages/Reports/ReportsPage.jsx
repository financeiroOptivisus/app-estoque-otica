import { useEffect, useState } from 'react';
import { reportApi } from '@/api/reportApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ReportsPage() {
  const [tab, setTab] = useState('revenue');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    setData(null);
    try {
      if (tab === 'revenue') {
        const r = await reportApi.revenue({ date_from: dateFrom, date_to: dateTo });
        setData(r.data);
      } else if (tab === 'debtors') {
        const r = await reportApi.debtors();
        setData(r.data);
      } else if (tab === 'low-stock') {
        const r = await reportApi.lowStock();
        setData(r.data);
      } else if (tab === 'top-lenses') {
        const r = await reportApi.topLenses({ date_from: dateFrom, date_to: dateTo });
        setData(r.data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [tab]);

  const tabs = [
    { id: 'revenue', label: 'Faturamento' },
    { id: 'top-lenses', label: 'Top Lentes' },
    { id: 'debtors', label: 'Devedores' },
    { id: 'low-stock', label: 'Estoque Baixo' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Relatórios</h1>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {(tab === 'revenue' || tab === 'top-lenses') && (
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">De</label>
            <Input type="date" className="w-40" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Até</label>
            <Input type="date" className="w-40" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <Button onClick={loadData} size="sm">Filtrar</Button>
        </div>
      )}

      {loading && <p className="text-muted-foreground">Carregando...</p>}

      {!loading && data && tab === 'revenue' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Faturamento por Mês</CardTitle></CardHeader>
          <CardContent>
            {data.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum dado no período.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.map((r) => ({ month: r.month, Faturamento: Number(r.revenue) }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Bar dataKey="Faturamento" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mês</TableHead>
                        <TableHead className="text-right">Faturamento</TableHead>
                        <TableHead className="text-right">OS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((r) => (
                        <TableRow key={r.month}>
                          <TableCell>{r.month}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(r.revenue)}</TableCell>
                          <TableCell className="text-right">{r.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && data && tab === 'debtors' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Clientes Devedores</CardTitle></CardHeader>
          <CardContent>
            {data.length === 0 ? <p className="text-muted-foreground text-sm">Nenhum devedor.</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead className="text-right">OS em Aberto</TableHead>
                    <TableHead className="text-right">Total Devedor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-xs">{d.code}</TableCell>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>{d.phone || '-'}</TableCell>
                      <TableCell className="text-right">{d.os_count}</TableCell>
                      <TableCell className="text-right font-bold text-destructive">{formatCurrency(d.total_debt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && data && tab === 'low-stock' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Estoque Baixo</CardTitle></CardHeader>
          <CardContent>
            {data.length === 0 ? <p className="text-muted-foreground text-sm">Nenhum item com estoque baixo.</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Índice</TableHead>
                    <TableHead className="text-right">Estoque Atual</TableHead>
                    <TableHead className="text-right">Mínimo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-xs">{l.code}</TableCell>
                      <TableCell>{l.type}</TableCell>
                      <TableCell>{l.brand || '-'}</TableCell>
                      <TableCell>{l.index_value || '-'}</TableCell>
                      <TableCell className="text-right font-bold text-destructive">{l.stock_qty}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{l.low_stock_alert}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && data && tab === 'top-lenses' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Lentes Mais Vendidas</CardTitle></CardHeader>
          <CardContent>
            {data.length === 0 ? <p className="text-muted-foreground text-sm">Nenhum dado no período.</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Índice</TableHead>
                    <TableHead className="text-right">Qtd Vendida</TableHead>
                    <TableHead className="text-right">Faturamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((l, i) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-muted-foreground font-bold">{i + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{l.code}</TableCell>
                      <TableCell>{l.type}</TableCell>
                      <TableCell>{l.brand || '-'}</TableCell>
                      <TableCell>{l.index_value || '-'}</TableCell>
                      <TableCell className="text-right font-bold">{l.total_sold}</TableCell>
                      <TableCell className="text-right">{formatCurrency(l.total_revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
