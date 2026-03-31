import { Badge } from '@/components/ui/badge';

const OS_STATUS = {
  'Em producao': { label: 'Em produção', variant: 'warning' },
  'Montagem': { label: 'Montagem', variant: 'info' },
  'Pronto': { label: 'Pronto', variant: 'success' },
  'Entregue': { label: 'Entregue', variant: 'muted' },
};

const FIN_STATUS = {
  'Pendente': { label: 'Pendente', variant: 'warning' },
  'Parcial': { label: 'Parcial', variant: 'info' },
  'Pago': { label: 'Pago', variant: 'success' },
};

export function OsStatusBadge({ status }) {
  const s = OS_STATUS[status] || { label: status, variant: 'outline' };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function FinStatusBadge({ status }) {
  const s = FIN_STATUS[status] || { label: status, variant: 'outline' };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
