import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { serviceOrderApi } from '@/api/serviceOrderApi';
import { formatCurrency } from '@/lib/utils';

// Format prescription value: always show sign, show 0.00
function rx(val) {
  if (val === null || val === undefined || val === '') return '—';
  const n = Number(val);
  if (n === 0) return '0,00';
  return (n > 0 ? '+' : '') + n.toFixed(2).replace('.', ',');
}

function rxAxis(val) {
  if (val === null || val === undefined || val === '') return '—';
  return String(val) + '°';
}

const SERVICES_LABELS = {
  svc_incolor: 'Surfaçagem Incolor',
  svc_antireflexo: 'Antireflexo',
  svc_filtro_azul: 'Filtro Azul',
  svc_fotosensivel: 'Fotossensível',
  svc_fotoar: 'Foto AR',
  svc_alto_indice: 'Alto Índice',
  svc_policarbonato: 'Policarbonato',
};

function OSSheet({ os }) {
  const activeServices = Object.entries(SERVICES_LABELS)
    .filter(([k]) => os[k])
    .map(([, label]) => label);

  return (
    <div className="p-6 text-xs font-sans" style={{ pageBreakInside: 'avoid' }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-3 mb-3">
        <div>
          <div className="text-xl font-bold">BF LENTES</div>
          <div className="text-gray-500">Laboratório Óptico</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{os.code}</div>
          <div className="text-gray-500">{os.order_type || '—'}</div>
        </div>
      </div>

      {/* Client info */}
      <div className="grid grid-cols-3 gap-1 mb-3 p-2 border rounded">
        <div><strong>Cliente:</strong> {os.client_name} ({os.client_code})</div>
        <div><strong>Telefone:</strong> {os.client_phone || '—'}</div>
        <div><strong>Entrada:</strong> {fmtDate(os.entry_date)}</div>
        <div><strong>Entrega:</strong> {fmtDate(os.delivery_date)}</div>
        <div><strong>Status:</strong> {os.status}</div>
      </div>

      {/* Prescription */}
      <table className="w-full border mb-3" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th className="border p-1 text-left">Olho</th>
            <th className="border p-1">Esférico</th>
            <th className="border p-1">Cilíndrico</th>
            <th className="border p-1">Eixo</th>
            <th className="border p-1">Adição</th>
            <th className="border p-1">D.P.</th>
          </tr>
        </thead>
        <tbody>
          {[
            { label: 'OD', s: os.od_sphere, c: os.od_cylinder, a: os.od_axis, add: os.od_addition, pd: os.od_pd },
            { label: 'OE', s: os.oe_sphere, c: os.oe_cylinder, a: os.oe_axis, add: os.oe_addition, pd: os.oe_pd },
          ].map((row) => (
            <tr key={row.label}>
              <td className="border p-1 font-bold">{row.label}</td>
              <td className="border p-1 text-center">{rx(row.s)}</td>
              <td className="border p-1 text-center">{rx(row.c)}</td>
              <td className="border p-1 text-center">{rxAxis(row.a)}</td>
              <td className="border p-1 text-center">{rx(row.add)}</td>
              <td className="border p-1 text-center">{row.pd ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Frame */}
      <div className="grid grid-cols-2 gap-2 mb-3 p-2 border rounded">
        <div className="font-semibold col-span-2">Armação</div>
        <div><strong>Marca/Modelo:</strong> {[os.frame_brand, os.frame_model].filter(Boolean).join(' / ') || '—'}</div>
        <div><strong>Cor:</strong> {os.frame_color || '—'}</div>
        <div><strong>Tipo:</strong> {os.frame_type || '—'}</div>
        <div><strong>Tamanho:</strong> {os.frame_size || '—'}</div>
        <div><strong>Medida arm.:</strong> {os.frame_measure || '—'}</div>
        <div><strong>Altura:</strong> {os.frame_height ? `${os.frame_height} mm` : '—'}</div>
        <div><strong>Medida altura:</strong> {os.frame_height_measure ? `${os.frame_height_measure} mm` : '—'}</div>
      </div>

      {/* Lenses */}
      {os.items?.length > 0 && (
        <table className="w-full border mb-3" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th className="border p-1 text-left">Código</th>
              <th className="border p-1 text-left">Tipo / Marca</th>
              <th className="border p-1">Índice</th>
              <th className="border p-1">Olho</th>
              <th className="border p-1">Qtd</th>
              <th className="border p-1 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {os.items.map((item, i) => (
              <tr key={i}>
                <td className="border p-1 font-mono">{item.lens_code}</td>
                <td className="border p-1">{item.lens_type}{item.lens_brand ? ` — ${item.lens_brand}` : ''}</td>
                <td className="border p-1 text-center">{item.index_value || '—'}</td>
                <td className="border p-1 text-center">{item.eye}</td>
                <td className="border p-1 text-center">{item.qty}</td>
                <td className="border p-1 text-right">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Services */}
      {activeServices.length > 0 && (
        <div className="mb-3 p-2 border rounded">
          <strong>Serviços:</strong> {activeServices.join(' · ')}
        </div>
      )}

      {/* Notes */}
      {os.technical_notes && (
        <div className="mb-3 p-2 border rounded">
          <strong>Obs. Técnicas:</strong> {os.technical_notes}
        </div>
      )}

      {/* Control + Total */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="border rounded p-2">
          <div className="font-bold mb-1">Controle de Produção</div>
          <div>Surfaçagem: {os.surfacing_done ? '✓ Concluída' : '[ ] Pendente'}</div>
          <div>Montagem: {os.assembly_done ? '✓ Concluída' : '[ ] Pendente'}</div>
        </div>
        <div className="border rounded p-2 text-right">
          {os.discount > 0 && <div>Desconto: -{formatCurrency(os.discount)}</div>}
          <div className="text-lg font-bold">Total: {formatCurrency(os.total_value)}</div>
        </div>
      </div>

      <div className="flex justify-between pt-2 border-t text-gray-500">
        <span>Assinatura Técnico: _________________________</span>
        <span>Assinatura Cliente: _________________________</span>
      </div>
    </div>
  );
}

function fmtDate(date) {
  if (!date) return '—';
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
}

export default function ServiceOrderPrint() {
  const { id } = useParams();
  const [os, setOs] = useState(null);

  useEffect(() => {
    serviceOrderApi.print(id).then((r) => {
      setOs(r.data);
      setTimeout(() => window.print(), 600);
    });
  }, [id]);

  if (!os) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 10mm; size: A4; }
          body { margin: 0; }
          .page-break { page-break-before: always; }
        }
      `}</style>

      {/* 1ª via — Laboratório */}
      <div>
        <div className="text-center text-xs text-gray-400 py-1 border-b print:block">
          1ª via — Laboratório
        </div>
        <OSSheet os={os} />
      </div>

      {/* Divisor */}
      <div className="border-t-2 border-dashed border-gray-400 my-2 mx-6 print:my-0" />

      {/* 2ª via — Cliente */}
      <div>
        <div className="text-center text-xs text-gray-400 py-1 border-b print:block">
          2ª via — Cliente
        </div>
        <OSSheet os={os} />
      </div>
    </>
  );
}
