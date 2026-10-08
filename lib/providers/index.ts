import { PaymentProvider } from "./types";
import { mockUPIProvider } from "./mock-upi";

export * from "./types";
export * from "./mock-upi";

export function getPaymentProvider(providerName: string = "MockUPIProvider"): PaymentProvider {
  switch (providerName) {
    case "MockUPIProvider":
    default:
      return mockUPIProvider;
  }
}
