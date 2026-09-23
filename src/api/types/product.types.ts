export type ProductCategory =
  | "beverage"
  | "snack"
  | "food"
  | "equipment"
  | "clothing"
  | "accessories"
  | "other";

export type ProductStatus = "active" | "out_of_stock" | "discontinued";

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  unit: string;
  sku?: string;
  status: ProductStatus | string;
  imageUrl?: string;
  description?: string;
  lowStockAlert?: number;
  createdAt?: string;
}

export interface CreateProductPayload {
  name: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  unit: string;
  sku?: string;
  status?: string;
  imageUrl?: string;
  description?: string;
  lowStockAlert?: number;
}

export interface OrderLineItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderItem {
  id: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderLineItem[] | string;
  totalAmount: number;
  status: "confirmed" | "pending" | "delivered" | "cancelled" | string;
  paymentMethod: "cash" | "bkash" | "nagad" | "rocket" | "card" | string;
  paymentStatus: "paid" | "partial" | "unpaid" | string;
  notes?: string;
  createdAt?: string;
}

export interface CreateOrderPayload {
  customerName?: string;
  customerPhone?: string;
  items: OrderLineItem[] | string;
  totalAmount: number;
  status?: string;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
}
