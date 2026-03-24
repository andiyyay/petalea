import { useState } from "react";

const PAYMENT_METHODS = {
  virtual_account: {
    label: "Virtual Account",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    methods: [
      { id: "bca_va", name: "BCA Virtual Account", color: "bg-blue-600" },
      { id: "mandiri_va", name: "Mandiri Bill", color: "bg-yellow-500" },
      { id: "bni_va", name: "BNI Virtual Account", color: "bg-orange-500" },
      { id: "bri_va", name: "BRI Virtual Account", color: "bg-blue-500" },
      { id: "permata_va", name: "Permata Bank", color: "bg-yellow-600" },
    ],
  },
  ewallet: {
    label: "E-Wallet",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
    methods: [
      { id: "gopay", name: "GoPay", color: "bg-green-500" },
      { id: "ovo", name: "OVO", color: "bg-purple-500" },
      { id: "dana", name: "DANA", color: "bg-blue-500" },
      { id: "shopeepay", name: "ShopeePay", color: "bg-orange-500" },
      { id: "linkaja", name: "LinkAja", color: "bg-red-500" },
    ],
  },
  qris: {
    label: "QRIS",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    methods: [{ id: "qris", name: "QRIS (All Payment)", color: "bg-gray-700" }],
  },
  credit_card: {
    label: "Kartu Kredit",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    methods: [
      { id: "credit_card", name: "Kartu Kredit / Debit", color: "bg-gray-600" },
    ],
  },
  retail_outlet: {
    label: "Retail Outlet",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    methods: [
      { id: "alfamart", name: "Alfamart", color: "bg-blue-700" },
      { id: "indomaret", name: "Indomaret", color: "bg-red-600" },
    ],
  },
};

export default function PaymentMethodSelector({ selected, onSelect }) {
  const [expandedCategory, setExpandedCategory] = useState("virtual_account");

  const handleCategoryClick = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleMethodSelect = (methodId, categoryKey) => {
    // Auto-expand the category when selecting a method
    setExpandedCategory(categoryKey);
    onSelect(methodId);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Metode Pembayaran
      </label>

      {Object.entries(PAYMENT_METHODS).map(([key, category]) => (
        <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => handleCategoryClick(key)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="text-[#e11d48]">{category.icon}</div>
              <span className="font-medium text-gray-800">{category.label}</span>
            </div>
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
              className={`transition-transform duration-200 ${
                expandedCategory === key ? "rotate-180" : ""
              }`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {expandedCategory === key && (
            <div className="p-3 bg-white space-y-2">
              {category.methods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => handleMethodSelect(method.id, key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                    selected === method.id
                      ? "border-[#e11d48] bg-pink-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className={`w-10 h-10 ${method.color} rounded-md flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">
                      {method.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-800 text-left flex-1">
                    {method.name}
                  </span>
                  {selected === method.id && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#e11d48"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
