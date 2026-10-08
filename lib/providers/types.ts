export interface CreatePaymentProviderParams {
  paymentId: string;
  merchantOrderId: string;
  amount: number;
  currency: string;
  description?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  merchant: {
    id: string;
    businessName: string;
    legalName: string;
  };
  environment: "TEST" | "LIVE";
}

export interface ProviderPaymentResult {
  providerPaymentId: string;
  qrPayload: string;
  upiIntentUrl: string;
  upiCollectSupported: boolean;
  isTestMode: boolean;
  status: "PENDING" | "SUCCESS" | "FAILED";
}

export interface ProviderStatusResult {
  providerPaymentId: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  rrn?: string;
  upiVpa?: string;
  rawResponse?: Record<string, unknown>;
}

export interface VerifyPaymentParams {
  paymentId: string;
  providerPaymentId: string;
  rrn?: string;
  environment: "TEST" | "LIVE";
}

export interface ProviderVerifyResult {
  verified: boolean;
  status: "SUCCESS" | "FAILED" | "PENDING";
  rrn?: string;
  message?: string;
}

export interface RefundPaymentParams {
  paymentId: string;
  providerPaymentId: string;
  amount: number;
  reason?: string;
  environment: "TEST" | "LIVE";
}

export interface ProviderRefundResult {
  refundId: string;
  status: "SUCCESS" | "FAILED" | "PROCESSING";
  message?: string;
}

export interface UPIRequestParams {
  vpa: string;
  amount: number;
  paymentId: string;
  description?: string;
}

export interface UPIRequestResult {
  success: boolean;
  message: string;
  collectRequestId?: string;
}

export interface PaymentProvider {
  name: string;
  createPayment(params: CreatePaymentProviderParams): Promise<ProviderPaymentResult>;
  getPaymentStatus(providerPaymentId: string): Promise<ProviderStatusResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<ProviderVerifyResult>;
  refundPayment(params: RefundPaymentParams): Promise<ProviderRefundResult>;
  generateUPIRequest(params: UPIRequestParams): Promise<UPIRequestResult>;
}
