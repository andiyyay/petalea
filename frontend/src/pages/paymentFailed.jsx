import { useEffect, useState } from "react";

export default function PaymentFailed({ onClose, onTryAgain }) {
  const [animating, setAnimating] = useState(true);
  const [failureReason, setFailureReason] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setAnimating(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reason = urlParams.get("reason");
    const message = urlParams.get("message");
    if (reason || message) {
      setFailureReason(message || reason || "Terjadi kesalahan saat memproses pembayaran Anda.");
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`bg-white rounded-2xl p-8 max-w-md w-full text-center transform transition-all duration-500 ${
          animating ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transform transition-all duration-500 ${
                animating ? "scale-0" : "scale-100"
              }`}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Pembayaran Gagal
          </h2>
          <p className="text-gray-500">
            Mohon maaf, pembayaran Anda tidak dapat diproses
          </p>
        </div>

        {failureReason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm text-red-700 text-left">{failureReason}</p>
            </div>
          </div>
        )}

        <div className="space-y-3 mb-6 text-sm text-gray-500">
          <p>Possible reasons:</p>
          <ul className="text-left space-y-2 pl-4">
            <li className="flex items-start gap-2">
              <span className="text-[#e11d48]">•</span>
              <span>Saldo atau limit kartu kredit tidak mencukupi</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#e11d48]">•</span>
              <span>Waktu pembayaran telah habis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#e11d48]">•</span>
              <span>Ada kesalahan pada data pembayaran</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onClose();
              if (onTryAgain) onTryAgain();
            }}
            className="flex-1 px-6 py-3 bg-[#e11d48] text-white rounded-full font-semibold hover:bg-[#be123c] transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Coba Lagi
          </button>
          <button
            onClick={() => {
              onClose();
            }}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.6 13h11.4l2-8H6" />
            </svg>
            Kembali ke Keranjang
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Butuh bantuan?{" "}
            <a href="mailto:support@petalea.com" className="text-[#e11d48] font-medium hover:underline">
              Hubungi Kami
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
