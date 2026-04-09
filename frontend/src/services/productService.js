import api from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  };
};

export const productService = {
  // Get all products (public)
  getAll: async () => {
    const response = await api.get("/products");
    return response.data;
  },

  // Get single product (public)
  getById: async (id) => {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
  },

  // Create product (admin only)
  create: async (formData) => {
    const config = getAuthHeaders();
    const response = await api.post("/admin/products", formData, config);
    return response.data;
  },

  // Update product (admin only)
  update: async (id, formData) => {
    const config = getAuthHeaders();
    const response = await api.put(`/admin/products/${id}`, formData, config);
    return response.data;
  },

  // Delete product (admin only)
  delete: async (id) => {
    const config = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
    const response = await api.delete(`/admin/products/${id}`, config);
    return response.data;
  },
};
