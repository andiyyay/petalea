import api from "./api";

/**
 * Create a new payment
 * @param {Object} paymentData - Payment details
 * @param {Array} paymentData.items - Cart items
 * @param {number} paymentData.subtotal - Subtotal amount
 * @param {number} paymentData.shipping_cost - Shipping cost
 * @param {number} paymentData.total - Total amount
 * @param {Object} paymentData.shipping_info - Shipping information
 * @param {string} paymentData.payment_method - Selected payment method
 * @returns {Promise<Object>} Payment response with payment_url
 */
export const createPayment = async (paymentData) => {
  const token = localStorage.getItem("token");
  const response = await api.post("/payment/create", paymentData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Check payment status
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} Payment status response
 */
export const getPaymentStatus = async (paymentId) => {
  const token = localStorage.getItem("token");
  const response = await api.get(`/payment/${paymentId}/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export default {
  createPayment,
  getPaymentStatus,
};
