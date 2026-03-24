import api from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Order state constants
export const ORDER_STATES = {
  WAITING_PAYMENT: "WAITING_PAYMENT",
  WAITING_PROCESSING: "WAITING_PROCESSING",
  PROCESSED: "PROCESSED",
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

// Order state metadata for UI
export const ORDER_STATE_INFO = {
  [ORDER_STATES.WAITING_PAYMENT]: {
    label: "Menunggu Dibayar",
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
    borderColor: "border-orange-500",
    icon: "clock",
  },
  [ORDER_STATES.WAITING_PROCESSING]: {
    label: "Menunggu Diproses",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-500",
    icon: "hourglass",
  },
  [ORDER_STATES.PROCESSED]: {
    label: "Diproses",
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
    borderColor: "border-purple-500",
    icon: "package",
  },
  [ORDER_STATES.READY_FOR_PICKUP]: {
    label: "Selesai Diproses",
    color: "teal",
    bgColor: "bg-teal-100",
    textColor: "text-teal-800",
    borderColor: "border-teal-500",
    icon: "checkCircle",
  },
  [ORDER_STATES.COMPLETED]: {
    label: "Selesai",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    borderColor: "border-green-500",
    icon: "checkCircle",
  },
  [ORDER_STATES.CANCELLED]: {
    label: "Dibatalkan",
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    borderColor: "border-red-500",
    icon: "xCircle",
  },
};

// Progress flow for orders
export const ORDER_PROGRESS_FLOW = [
  ORDER_STATES.WAITING_PAYMENT,
  ORDER_STATES.WAITING_PROCESSING,
  ORDER_STATES.PROCESSED,
  ORDER_STATES.READY_FOR_PICKUP,
  ORDER_STATES.COMPLETED,
];

export const orderService = {
  // Get order history for current user
  getOrderHistory: async () => {
    const config = getAuthHeaders();
    const response = await api.get("/orders", config);
    return response.data.data;
  },

  // Get active orders for current user
  getActiveOrders: async () => {
    const config = getAuthHeaders();
    const response = await api.get("/orders/active", config);
    return response.data.data;
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const config = getAuthHeaders();
    const response = await api.get(`/orders/${orderId}`, config);
    return response.data.data;
  },

  // Admin: Get all orders
  getAllOrders: async () => {
    const config = getAuthHeaders();
    const response = await api.get("/admin/orders", config);
    return response.data.data;
  },

  // Admin: Get order by ID
  getAdminOrderById: async (orderId) => {
    const config = getAuthHeaders();
    const response = await api.get(`/admin/orders/${orderId}`, config);
    return response.data.data;
  },

  // Admin: Transition order to PROCESSED
  transitionToProcessed: async (orderId) => {
    const config = getAuthHeaders();
    const response = await api.post(
      `/admin/orders/${orderId}/processed`,
      {},
      config
    );
    return response.data;
  },

  // Admin: Transition order to READY_FOR_PICKUP
  transitionToReadyForPickup: async (orderId) => {
    const config = getAuthHeaders();
    const response = await api.post(
      `/admin/orders/${orderId}/ready`,
      {},
      config
    );
    return response.data;
  },

  // Admin: Transition order to COMPLETED
  transitionToCompleted: async (orderId) => {
    const config = getAuthHeaders();
    const response = await api.post(
      `/admin/orders/${orderId}/complete`,
      {},
      config
    );
    return response.data;
  },

  // Admin: Cancel order
  cancelOrder: async (orderId, cancelledBy, reason) => {
    const config = getAuthHeaders();
    const response = await api.post(
      `/admin/orders/${orderId}/cancel`,
      { cancelled_by: cancelledBy, reason },
      config
    );
    return response.data;
  },

  // User: Cancel own order
  userCancelOrder: async (orderId, reason) => {
    const config = getAuthHeaders();
    const response = await api.post(
      `/orders/${orderId}/cancel`,
      { reason },
      config
    );
    return response.data;
  },

  // Get status label
  getStatusLabel: (status) => {
    return ORDER_STATE_INFO[status]?.label || status;
  },

  // Get status color classes
  getStatusColor: (status) => {
    const info = ORDER_STATE_INFO[status];
    return info
      ? `${info.bgColor} ${info.textColor}`
      : "bg-gray-100 text-gray-800";
  },

  // Get status border color
  getStatusBorderColor: (status) => {
    return ORDER_STATE_INFO[status]?.borderColor || "border-gray-500";
  },

  // Get status icon type (for use in components)
  getStatusIconType: (status) => {
    return ORDER_STATE_INFO[status]?.icon || "circle";
  },

  // Get progress step index
  getProgressStep: (status) => {
    return ORDER_PROGRESS_FLOW.indexOf(status);
  },

  // Check if action is available for a state
  canTransitionTo: (currentState, targetState) => {
    const transitions = {
      [ORDER_STATES.WAITING_PROCESSING]: [ORDER_STATES.PROCESSED],
      [ORDER_STATES.PROCESSED]: [ORDER_STATES.READY_FOR_PICKUP],
      [ORDER_STATES.READY_FOR_PICKUP]: [ORDER_STATES.COMPLETED],
    };
    return transitions[currentState]?.includes(targetState) || false;
  },

  // Get available actions for a state
  getAvailableActions: (status) => {
    const actions = {
      [ORDER_STATES.WAITING_PAYMENT]: ["cancel"],
      [ORDER_STATES.WAITING_PROCESSING]: ["process"],
      [ORDER_STATES.PROCESSED]: ["ready"],
      [ORDER_STATES.READY_FOR_PICKUP]: ["complete"],
    };
    return actions[status] || [];
  },
};

export default orderService;
