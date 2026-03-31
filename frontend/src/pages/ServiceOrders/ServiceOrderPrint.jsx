import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { serviceOrderApi } from '@/api/serviceOrderApi';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ServiceOrderPrint() {
  const { id } = useParams();
  const [os, setOs] = useState(null);

  useEffect(() => {
    serviceOrderApi.print(id).then((r) => {
      setOs(r.data);
      setTimeout(() => window.print(), 500);
    });
  }, [id]);

  if (!os) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 font-sans text-sm">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">BF LENTES</h1>
        <p className="text-xs text-gray-600">Laboratório Óptico</p>
        <div className="mt-2">
          <span className="text-xl font-bold">OS: {os.code}</span>
        </div>
      </div>

      {/* Client */}
      <div className="mb-4 p-3 border rounded">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><strong>Cliente:</strong> {os.client_name} ({os.client_code})</div>
          <div><strong>Telefone:</strong> {os.client_phone || '-'}</div>
          <div><strong>Data Entrada:</strong> {formatDate(os.entry_date)}</div>
          <div><strong>Previsão:</strong> {formatDate(os.delivery_date)}</div>
          <div><strong>Status:</strong> {os.status}</div>
        </div>
      </div>

      {/* Prescription */}
      <div className="mb-4">
        <h2 className="font-bold mb-2">RECEITA</h2>
        <table className="w-full border text-xs">
          <thead className="bg-gray-100">
            <tr>
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
              { eye: 'OD', s: os.od_sphere, c: os.od_cylinder, a: os.od_axis, add: os.od_addition, pd: os.od_pd },
              { eye: 'OE', s: os.oe_sphere, c: os.oe_cylinder, a: os.oe_axis, add: os.oe_addition, pd: os.oe_pd },
            ].map((row) => (
              <tr key={row.eye}>
                <td className="border p-1 font-bold">{row.eye}</td>
                <td className="border p-1 text-center">{row.s ?? '-'}</td>
                <td className="border p-1 text-center">{row.c ?? '-'}</td>
                <td className="border p-1 text-center">{row.a ?? '-'}</td>
                <td className="border p-1 text-center">{row.add ?? '-'}</td>
                <td className="border p-1 text-center">{row.pd ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Frame */}
      {(os.frame_brand || os.frame_model) && (
        <div className="mb-4 p-2 border rounded text-xs">
          <strong>Armação:</strong> {[os.frame_brand, os.frame_model, os.frame_color].filter(Boolean).join(' / ')}
        </div>
      )}

      {/* Items */}
      {os.items?.length > 0 && (
        <div className="mb-4">
          <h2 className="font-bold mb-2">LENTES</h2>
          <table className="w-full border text-xs">
            <thead className="bg-gray-100">
              <tr>
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
                  <td className="border p-1">{item.lens_type} {item.lens_brand}</td>
                  <td className="border p-1 text-center">{item.index_value || '-'}</td>
                  <td className="border p-1 text-center">{item.eye}</td>
                  <td className="border p-1 text-center">{item.qty}</td>
                  <td className="border p-1 text-right">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes */}
      {os.technical_notes && (
        <div className="mb-4 p-2 border rounded text-xs">
          <strong>Obs. Técnicas:</strong> {os.technical_notes}
        </div>
      )}

      {/* Control & Total */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border rounded p-3 text-xs">
          <p className="font-bold mb-2">CONTROLE DE PRODUÇÃO</p>
          <p>Surfaçagem: {os.surfacing_done ? '✓ Concluída' : '[ ] Pendente'}</p>
          <p>Montagem: {os.assembly_done ? '✓ Concluída' : '[ ] Pendente'}</p>
        </div>
        <div className="border rounded p-3 text-xs text-right">
          {os.discount > 0 && <p>Desconto: {formatCurrency(os.discount)}</p>}
          <p className="text-xl font-bold">Total: {formatCurrency(os.total_value)}</p>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t text-xs text-center text-gray-500">
        <div className="flex justify-between">
          <p>Assinatura Técnico: ___________________________</p>
          <p>Assinatura Cliente: ___________________________</p>
        </div>
      </div>
    </div>
  );
}
