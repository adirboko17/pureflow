declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/** Google Ads phone-call conversion. Fire on click; do not hijack tel: navigation. */
export function trackPhoneClick() {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "conversion", {
      send_to: "AW-18371071580/5jc4CN3Wx-AcENycgbhE",
    });
  }
}
