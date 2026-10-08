/**
 * BharatUPI Embeddable Checkout SDK
 * Open source checkout integration for approved merchants
 */
(function (window, document) {
  "use strict";

  const BASE_URL = window.location.origin;

  function createCheckoutModal(paymentId, onComplete) {
    // Check if overlay already exists
    let existingOverlay = document.getElementById("bharatpay-modal-overlay");
    if (existingOverlay) {
      existingOverlay.remove();
    }

    const overlay = document.createElement("div");
    overlay.id = "bharatpay-modal-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(4px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    `;

    const container = document.createElement("div");
    container.style.cssText = `
      position: relative;
      width: 100%;
      max-width: 440px;
      height: 90vh;
      max-height: 720px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      transform: scale(0.96);
      transition: transform 0.2s ease-in-out;
    `;

    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    closeBtn.setAttribute("aria-label", "Close checkout");
    closeBtn.style.cssText = `
      position: absolute;
      top: 12px;
      right: 14px;
      background: rgba(0,0,0,0.06);
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 20px;
      font-weight: bold;
      color: #475569;
      cursor: pointer;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeBtn.onclick = function () {
      overlay.style.opacity = "0";
      container.style.transform = "scale(0.96)";
      setTimeout(() => overlay.remove(), 200);
    };

    const iframe = document.createElement("iframe");
    iframe.src = `${BASE_URL}/pay/${paymentId}?embedded=true`;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `;

    container.appendChild(closeBtn);
    container.appendChild(iframe);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      container.style.transform = "scale(1)";
    });

    window.addEventListener("message", function handler(event) {
      if (event.data && event.data.type === "BHARATUPI_PAYMENT_COMPLETED") {
        if (typeof onComplete === "function") {
          onComplete(event.data);
        }
      }
    });
  }

  // Global SDK Object
  window.BharatPay = {
    open: function (options) {
      if (!options || !options.paymentId) {
        console.error("BharatPay SDK: paymentId is required.");
        return;
      }
      createCheckoutModal(options.paymentId, options.onComplete);
    },
  };

  // Auto-bind to DOM elements with data-gateway-payment
  function autoBindButtons() {
    const buttons = document.querySelectorAll("[data-gateway-payment]");
    buttons.forEach((btn) => {
      if (!btn.getAttribute("data-bharatpay-bound")) {
        btn.setAttribute("data-bharatpay-bound", "true");
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          const paymentId = this.getAttribute("data-gateway-payment");
          if (paymentId) {
            window.BharatPay.open({ paymentId });
          }
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoBindButtons);
  } else {
    autoBindButtons();
  }

  // Observe dynamically inserted buttons
  if (typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver(autoBindButtons);
    observer.observe(document.body, { childList: true, subtree: true });
  }
})(window, document);
