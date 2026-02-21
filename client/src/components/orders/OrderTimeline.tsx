import type { OrderStatus } from '../../types';

const STATUS_STEPS: Exclude<OrderStatus, 'cancelled'>[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
];

const STEP_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Roasting',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

interface OrderTimelineProps {
  status: OrderStatus;
  orientation?: 'horizontal' | 'vertical';
}

export function OrderTimeline({ status, orientation = 'horizontal' }: OrderTimelineProps) {
  const isCancelled = status === 'cancelled';
  const currentStep = isCancelled ? -1 : STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number]);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <span className="text-sm font-medium text-red-600">Order cancelled</span>
      </div>
    );
  }

  if (orientation === 'vertical') {
    return (
      <div className="space-y-0">
        {STATUS_STEPS.map((step, i) => {
          const done = i <= currentStep;
          const active = i === currentStep;
          const last = i === STATUS_STEPS.length - 1;

          return (
            <div key={step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                    done
                      ? 'bg-espresso-700 border-espresso-700 text-white'
                      : 'bg-white border-stone-200 text-stone-400'
                  } ${active ? 'ring-2 ring-espresso-300 ring-offset-1' : ''}`}
                >
                  {done && !active ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs font-bold">{i + 1}</span>
                  )}
                </div>
                {!last && (
                  <div className={`w-0.5 h-8 ${i < currentStep ? 'bg-espresso-600' : 'bg-stone-200'}`} />
                )}
              </div>
              <div className="pb-8 pt-1">
                <span className={`text-sm font-medium ${done ? 'text-espresso-800' : 'text-stone-400'}`}>
                  {STEP_LABELS[step]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between relative">
      <div className="absolute left-0 right-0 top-4 h-0.5 bg-stone-200 -z-10" />
      <div
        className="absolute left-0 top-4 h-0.5 bg-espresso-600 -z-10 transition-all duration-500"
        style={{ width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
      />
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentStep;
        const active = i === currentStep;
        return (
          <div key={step} className="flex flex-col items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                done
                  ? 'bg-espresso-700 border-espresso-700 text-white'
                  : 'bg-white border-stone-300 text-stone-400'
              } ${active ? 'ring-2 ring-espresso-300 ring-offset-2' : ''}`}
            >
              {done && !active ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="text-xs font-bold">{i + 1}</span>
              )}
            </div>
            <span className={`text-xs font-medium capitalize hidden sm:block ${done ? 'text-espresso-700' : 'text-stone-400'}`}>
              {STEP_LABELS[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
