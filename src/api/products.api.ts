import { apiClient } from "./client";
import type { ProductItem, CreateProductPayload } from "./types/product.types";

export const productsApi = {
  list: async (): Promise<ProductItem[]> => {
    const res = await apiClient.get<ProductItem[]>("/products");
    return res.data;
  },

  getById: async (id: string): Promise<ProductItem> => {
    const res = await apiClient.get<ProductItem>(`/products/${id}`);
    return res.data;
  },

  create: async (payload: CreateProductPayload): Promise<ProductItem> => {
    const res = await apiClient.post<ProductItem>("/products", payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<CreateProductPayload>): Promise<ProductItem> => {
    const res = await apiClient.put<ProductItem>(`/products/${id}`, payload);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};
