export interface CheckoutBillingData {
  receiptType?: 'boleta' | 'factura';
  dni?: string;
  ruc?: string;
  businessName?: string;
  fiscalAddress?: string;
}
