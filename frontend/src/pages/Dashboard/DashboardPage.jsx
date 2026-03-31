import { useEffect, useState } from 'react';
import { reportApi } from '@/api/reportApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ClipboardList, AlertTriangle, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    reportApi.dashboard().then((r) => setData(r.data));
  }, []);

  if (!data) return <div className="text-muted-foreground">Carregando...</div>;

  const chartData = data.revenue_chart.map((r) => ({
    month: r.month,
    Faturamento: Number(r.revenue),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          label="Faturamento Mensal"
          value={formatCurrency(data.monthly_revenue)}
          bg="bg-green-50"
        />
        <MetricCard
          icon={<ClipboardList className="h-5 w-5 text-blue-600" />}
          label="OS em Aberto"
          value={data.open_os}
          bg="bg-blue-50"
        />
        <MetricCard
          icon={<Users className="h-5 w-5 text-orange-600" />}
          label="Clientes Devedores"
          value={data.debtors}
          bg="bg-orange-50"
        />
        <MetricCard
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          label="Estoque Baixo"
          value={data.low_stock}
          bg="bg-red-50"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Faturamento Últimos 6 Meses</CardTitle></CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="Faturamento" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Lentes Mais Vendidas</CardTitle></CardHeader>
          <CardContent>
            {data.top_lenses.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
            ) : (
              <div className="space-y-3">
                {data.top_lenses.map((l, i) => (
                  <div key={l.code} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{l.code} - {l.brand}</p>
                        <p className="text-xs text-muted-foreground">{l.type} {l.index_value && `· ${l.index_value}`}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">{l.total_sold} un</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, bg }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-md ${bg}`}>{icon}</div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
