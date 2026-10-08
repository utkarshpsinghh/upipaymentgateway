import {
  PaymentProvider,
  CreatePaymentProviderParams,
  ProviderPaymentResult,
  ProviderStatusResult,
  VerifyPaymentParams,
  ProviderVerifyResult,
  RefundPaymentParams,
  ProviderRefundResult,
  UPIRequestParams,
  UPIRequestResult,
} from "./types";

export class MockUPIProvider implements PaymentProvider {
  public readonly name = "MockUPIProvider";

  async createPayment(params: CreatePaymentProviderParams): Promise<ProviderPaymentResult> {
    if (params.environment === "LIVE") {
      throw new Error(
        "LIVE mode requires an approved bank/PSP integration. MockUPIProvider is strictly restricted to TEST MODE."
      );
    }

    const providerPaymentId = `mock_upi_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const cleanMerchantName = params.merchant.businessName.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 25);
    const cleanDescription = (params.description || "Order Payment").slice(0, 30);

    // Standard NPCI UPI URI Scheme (Marked TEST)
    const testPa = "test-merchant@bharatupi";
    const upiUri = `upi://pay?pa=${testPa}&pn=${encodeURIComponent(
      cleanMerchantName
    )}&am=${params.amount.toFixed(2)}&cu=INR&tr=${params.paymentId}&tn=${encodeURIComponent(
      cleanDescription
    )}&mc=5411`;

    return {
      providerPaymentId,
      qrPayload: upiUri,
      upiIntentUrl: upiUri,
      upiCollectSupported: true,
      isTestMode: true,
      status: "PENDING",
    };
  }

  async getPaymentStatus(providerPaymentId: string): Promise<ProviderStatusResult> {
    return {
      providerPaymentId,
      status: "PENDING",
      rrn: `TEST${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      rawResponse: {
        provider: "MockUPIProvider",
        mode: "TEST",
        providerPaymentId,
      },
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<ProviderVerifyResult> {
    if (params.environment === "LIVE") {
      return {
        verified: false,
        status: "FAILED",
        message: "Live payments cannot be verified using mock provider.",
      };
    }

    const generatedRrn = params.rrn || `${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    return {
      verified: true,
      status: "SUCCESS",
      rrn: generatedRrn,
      message: "Test UPI Payment successfully verified via Mock Provider.",
    };
  }

  async refundPayment(params: RefundPaymentParams): Promise<ProviderRefundResult> {
    if (params.environment === "LIVE") {
      throw new Error("Live refunds cannot be processed with Mock provider");
    }

    const refundId = `rfnd_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      refundId,
      status: "SUCCESS",
      message: `Test refund of INR ${params.amount} simulated successfully`,
    };
  }

  async generateUPIRequest(params: UPIRequestParams): Promise<UPIRequestResult> {
    if (!params.vpa || !params.vpa.includes("@")) {
      return {
        success: false,
        message: "Invalid UPI VPA format. Must be formatted like user@okhdfcbank or phone@upi",
      };
    }

    return {
      success: true,
      message: `UPI Collect request for ₹${params.amount} simulated and sent to ${params.vpa}. (TEST MODE)`,
      collectRequestId: `col_${Date.now()}`,
    };
  }
}

export const mockUPIProvider = new MockUPIProvider();
