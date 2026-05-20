import { cn } from '@/components/atoms/Button';

type LotacaoStatus = 'livre' | 'composto' | 'cheio';

export function LotacaoWidget({ status = 'livre' }: { status?: LotacaoStatus }) {
  const getStatusColor = () => {
    switch (status) {
      case 'cheio':
        return 'bg-brand-red';
      case 'composto':
        return 'bg-brand-yellow';
      case 'livre':
        return 'bg-green-500';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'cheio':
        return 'Lotação: Esgotada';
      case 'composto':
        return 'Lotação: Composto';
      case 'livre':
        return 'Lotação: Livre';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-dark/50 border border-brand-light/10 rounded-full">
      <div className="relative flex h-3 w-3">
        <span className={cn("relative inline-flex rounded-full h-3 w-3", getStatusColor())}></span>
      </div>
      <span className="text-xs font-medium text-brand-light tracking-wider">
        {getStatusText()}
      </span>
    </div>
  );
}
