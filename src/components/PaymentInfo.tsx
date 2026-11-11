import { useContent } from '../data/store';

/** Shows the payment methods/instructions entered in Admin → Business. Renders nothing when blank. */
export function PaymentInfo({ compact = false }: { compact?: boolean }) {
  const { biz } = useContent();
  if (!biz?.paymentMethods?.trim() && !biz?.paymentInstructions?.trim()) return null;
  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.04)',
        borderRadius: 12,
        padding: compact ? '8px 12px' : '12px 14px',
        fontSize: 12.5,
        lineHeight: 1.5,
        textAlign: 'left',
      }}
    >
      {biz.paymentMethods?.trim() && (
        <div>
          <b>Payment:</b> {biz.paymentMethods}
        </div>
      )}
      {biz.paymentInstructions?.trim() && (
        <div style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{biz.paymentInstructions}</div>
      )}
    </div>
  );
}
