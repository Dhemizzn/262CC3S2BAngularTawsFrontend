export interface PaymentStatusResult {
  status: string;
  receiptType?: 'boleta' | 'factura' | string;
  documentNumber?: string;
  transactionId?: number;
}
