import { environtment } from "../utils/midtrans";


export const loadMidtrans = () => {
  return new Promise((resolve, reject) => {
    if (window.snap) {
      resolve(window.snap);
      return;
    }

    const script = document.createElement("script");
    script.src = environtment.MIDTRANS_SNAP_URL;
    script.setAttribute("data-client-key", environtment.MIDTRANS_CLIENT_KEY);
    script.onload = () => resolve(window.snap);
    script.onerror = reject;
    document.body.appendChild(script);
  });
};
