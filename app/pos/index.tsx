import React, { useState } from "react";
import { View, Text, Pressable, FlatList, TextInput, Modal, ScrollView, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Button, Input, Skeleton } from "@/components/ui";
import { useProducts } from "@/hooks/queries/useProducts";
import { useCreateOrder } from "@/hooks/queries/useOrders";
import { useAuthStore } from "@/stores/auth.store";
import { formatTaka } from "@/lib/currency";
import { showAlert } from "@/lib/alerts";
import { printOrderInvoice, shareOrderInvoicePdf, type InvoiceData } from "@/lib/invoicePrint";
import type { ProductItem, OrderLineItem, CreateOrderPayload } from "@/api/types/product.types";

const CATEGORIES = ["All", "beverage", "snack", "food", "equipment", "clothing", "other"];
const PAYMENT_METHODS = ["cash", "bkash", "nagad", "rocket", "card"];

export default function PosScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin" || user?.role === "owner";
  const isStaff = user?.role === "staff";
  const canOperatePOS = isAdmin || isStaff;

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Cart State
  const [cart, setCart] = useState<OrderLineItem[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);

  // Customer Checkout Form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [checkoutNotes, setCheckoutNotes] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [completedInvoice, setCompletedInvoice] = useState<InvoiceData | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { data: products = [], isLoading, isRefetching, refetch } = useProducts();
  const createOrderMutation = useCreateOrder();

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || p.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Cart operations
  const addToCart = (product: ProductItem) => {
    if (product.stock <= 0) {
      showAlert("Out of Stock", "This product is currently out of stock!");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          Alert.alert("Stock Limit", `Only ${product.stock} ${product.unit} available in stock!`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
          subtotal: product.price,
        },
      ];
    });
  };

  const updateQuantity = (productId?: string, delta: number = 0) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.productId === productId) {
            const product = products.find((p) => p.id === productId);
            const newQty = item.quantity + delta;
            if (product && newQty > product.stock) {
              Alert.alert("Stock Limit", `Only ${product.stock} available!`);
              return item;
            }
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (productId?: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setCheckoutError("");
      const payload: CreateOrderPayload = {
        customerName: customerName.trim() || "Walk-in Customer",
        customerPhone: customerPhone.trim() || undefined,
        items: cart,
        totalAmount: totalCartAmount,
        status: "confirmed",
        paymentMethod,
        paymentStatus: "paid",
        notes: checkoutNotes.trim() || undefined,
      };

      const created = await createOrderMutation.mutateAsync(payload);
      const invoiceData: InvoiceData = {
        invoiceNo: created?.id ? created.id.slice(0, 8).toUpperCase() : `ORD-${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleDateString(),
        customerName: payload.customerName || "Walk-in Customer",
        customerPhone: payload.customerPhone,
        servedBy: user?.fullName || user?.name || "Counter Staff",
        paymentMethod: payload.paymentMethod,
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
        notes: payload.notes,
        items: cart.map((c) => ({
          productName: c.productName,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          subtotal: c.subtotal,
        })),
        totalAmount: totalCartAmount,
      };

      setCompletedInvoice(invoiceData);
      setCart([]);
      setShowCartModal(false);
      setCustomerName("");
      setCustomerPhone("");
      setCheckoutNotes("");
      setShowSuccessModal(true);
    } catch (err: any) {
      setCheckoutError(err.message || "Failed to complete checkout");
    }
  };

  if (!canOperatePOS) {
    return (
      <ScreenWrapper className="p-4 items-center justify-center">
        <Card className="p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 items-center max-w-sm rounded-3xl shadow-sm">
          <Text className="text-4xl mb-3">🛒</Text>
          <Text className="text-slate-900 dark:text-white text-lg font-bold mb-1">Staff Access Only</Text>
          <Text className="text-slate-500 dark:text-zinc-400 text-xs text-center mb-5 leading-relaxed">
            The Point of Sale Register is restricted to authorized store staff and administrators.
          </Text>
          <View className="w-full gap-2.5">
            <Button
              title="Browse Product Catalog"
              variant="primary"
              onPress={() => router.replace("/pos/products" as any)}
            />
            <Button
              title="Back to Dashboard"
              variant="secondary"
              onPress={() => router.back()}
            />
          </View>
        </Card>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="pb-4">
      {/* Top Header */}
      <View className="flex-row items-center justify-between my-3">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 items-center justify-center shadow-sm shadow-slate-200/50 dark:shadow-none active:scale-95"
          >
            <Text className="text-slate-800 dark:text-white text-base font-bold">←</Text>
          </Pressable>
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-slate-900 dark:text-white text-xl font-black tracking-tight">Sales POS</Text>
              <Badge label={`Cashier: ${user?.fullName || user?.name || "Staff"}`} variant="info" size="sm" />
            </View>
            <Text className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5">Drinks, Snacks & Equipment Counter</Text>
          </View>
        </View>

        {/* Quick Links: Inventory & Orders */}
        <View className="flex-row gap-1.5">
          <Pressable
            onPress={() => router.push("/pos/products" as any)}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 items-center justify-center shadow-sm shadow-slate-200/50 dark:shadow-none active:scale-95"
            accessibilityLabel="Products Inventory"
          >
            <Text className="text-base">📦</Text>
          </Pressable>
          {isAdmin && (
            <Pressable
              onPress={() => router.push("/pos/orders" as any)}
              className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 items-center justify-center shadow-sm shadow-slate-200/50 dark:shadow-none active:scale-95"
              accessibilityLabel="Order Transactions"
            >
              <Text className="text-base">📋</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 mb-3 shadow-sm shadow-slate-200/40 dark:shadow-none">
        <Text className="text-slate-400 dark:text-zinc-500 mr-2 text-sm">🔍</Text>
        <TextInput
          placeholder="Search products, drinks, gear..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-slate-900 dark:text-white text-xs"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Text className="text-slate-400 dark:text-zinc-400 text-xs px-1">✕</Text>
          </Pressable>
        )}
      </View>

      {/* Category Chips */}
      <View>
        <View className="flex-row flex-wrap gap-2 mb-3.5">
          {CATEGORIES.map((c) => {
            const isSelected = selectedCategory === c;
            return (
              <Pressable
                key={c}
                onPress={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-full border capitalize ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-600/30"
                    : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? "text-white" : "text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Product Catalog Grid */}
      {isLoading ? (
        <View className="gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={80} borderRadius={16} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          onRefresh={refetch}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Card className="bg-white/80 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-8 items-center justify-center my-6 rounded-2xl">
              <Text className="text-3xl mb-2">🛍️</Text>
              <Text className="text-slate-800 dark:text-zinc-300 font-bold text-sm">No products found</Text>
              <Text className="text-slate-500 dark:text-zinc-500 text-xs text-center mt-1">
                Go to Inventory to add drinks, snacks or sports equipment
              </Text>
            </Card>
          }
          renderItem={({ item }) => {
            const isOutOfStock = item.stock <= 0;
            const isLowStock = !isOutOfStock && item.stock <= (item.lowStockAlert || 5);
            const inCartItem = cart.find((c) => c.productId === item.id);

            return (
              <Pressable
                onPress={() => addToCart(item)}
                disabled={isOutOfStock}
                className={`mb-2.5 active:scale-[0.98] ${isOutOfStock ? "opacity-50" : ""}`}
              >
                <Card
                  className={`p-3.5 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none border ${
                    inCartItem
                      ? "border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/20"
                      : "bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    {/* Left Info */}
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center gap-2">
                        <View className="flex-1">
                          <Text className="text-slate-900 dark:text-white font-bold text-sm" numberOfLines={1}>
                            {item.name}
                          </Text>
                        </View>
                        <Badge label={item.category} variant="default" size="sm" />
                      </View>
                      <View className="flex-row items-center gap-2 mt-1">
                        <Text className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                          {formatTaka(item.price)}
                        </Text>
                        <Text className="text-slate-300 dark:text-zinc-600">•</Text>
                        <Text
                          className={`text-xs font-semibold ${
                            isOutOfStock
                              ? "text-rose-500 dark:text-red-400"
                              : isLowStock
                              ? "text-amber-500 dark:text-amber-400"
                              : "text-slate-500 dark:text-zinc-400"
                          }`}
                        >
                          {isOutOfStock ? "Out of Stock" : `${item.stock} ${item.unit} left`}
                        </Text>
                      </View>
                    </View>

                    {/* Right Cart Counter / Add Action */}
                    {inCartItem ? (
                      <View className="flex-row items-center gap-1.5 bg-emerald-600 px-3 py-1.5 rounded-xl shadow-sm shadow-emerald-600/30">
                        <Text className="text-white font-bold text-xs">
                          {inCartItem.quantity} in cart
                        </Text>
                      </View>
                    ) : (
                      <View className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 items-center justify-center">
                        <Text className="text-emerald-600 dark:text-emerald-400 font-black text-base">+</Text>
                      </View>
                    )}
                  </View>
                </Card>
              </Pressable>
            );
          }}
        />
      )}

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <View className="mt-2 pt-2 border-t border-slate-200/80 dark:border-zinc-800">
          <Pressable
            onPress={() => setShowCartModal(true)}
            className="p-3.5 rounded-2xl bg-emerald-600 active:bg-emerald-700 flex-row items-center justify-between shadow-xl shadow-emerald-600/30 border border-emerald-500"
          >
            <View className="flex-row items-center gap-2.5">
              <View className="w-8 h-8 rounded-full bg-emerald-800/80 items-center justify-center">
                <Text className="text-white font-black text-xs">{totalCartCount}</Text>
              </View>
              <Text className="text-white font-black text-sm">View Cart</Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Text className="text-white font-black text-base">{formatTaka(totalCartAmount)}</Text>
              <Text className="text-white font-bold text-sm">Checkout →</Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* Cart & Checkout Sheet Modal */}
      <Modal visible={showCartModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 dark:bg-black/80 justify-end">
          <View className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 rounded-t-3xl p-5 max-h-[90%] shadow-2xl">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-slate-900 dark:text-white font-black text-lg">Current Sale Order</Text>
                <Text className="text-slate-500 dark:text-zinc-400 text-xs">
                  {totalCartCount} items • Total: {formatTaka(totalCartAmount)}
                </Text>
              </View>
              <Pressable
                onPress={() => setShowCartModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 items-center justify-center"
              >
                <Text className="text-slate-500 dark:text-zinc-400 font-bold">✕</Text>
              </Pressable>
            </View>

            {checkoutError ? (
              <View className="p-3 bg-rose-50 dark:bg-red-500/15 border border-rose-200 dark:border-red-500/30 rounded-2xl mb-3">
                <Text className="text-rose-600 dark:text-red-400 text-xs font-semibold">{checkoutError}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
              {/* Cart Line Items */}
              <View className="gap-2 mb-4">
                {cart.map((item) => (
                  <View
                    key={item.productId}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 flex-row items-center justify-between shadow-xs"
                  >
                    <View className="flex-1 mr-2">
                      <Text className="text-slate-900 dark:text-white font-bold text-xs" numberOfLines={1}>
                        {item.productName}
                      </Text>
                      <Text className="text-slate-500 dark:text-zinc-400 text-[11px] mt-0.5">
                        {formatTaka(item.unitPrice)} each
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                      <Pressable
                        onPress={() => updateQuantity(item.productId, -1)}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-zinc-800 items-center justify-center active:bg-slate-300 dark:active:bg-zinc-700"
                      >
                        <Text className="text-slate-800 dark:text-white font-bold text-xs">-</Text>
                      </Pressable>
                      <Text className="text-slate-900 dark:text-white font-bold text-xs w-6 text-center">
                        {item.quantity}
                      </Text>
                      <Pressable
                        onPress={() => updateQuantity(item.productId, 1)}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-zinc-800 items-center justify-center active:bg-slate-300 dark:active:bg-zinc-700"
                      >
                        <Text className="text-slate-800 dark:text-white font-bold text-xs">+</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => removeFromCart(item.productId)}
                        className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-red-500/15 items-center justify-center active:bg-rose-100 dark:active:bg-red-500/30 ml-1"
                      >
                        <Text className="text-rose-600 dark:text-red-400 text-[10px] font-bold">✕</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>

              {/* Customer Inputs */}
              <Input
                label="Customer Name (Optional)"
                placeholder="Walk-in Customer"
                value={customerName}
                onChangeText={setCustomerName}
              />

              <Input
                label="Customer Phone (Optional)"
                placeholder="017XXXXXXXX"
                value={customerPhone}
                onChangeText={setCustomerPhone}
                keyboardType="phone-pad"
              />

              {/* Payment Method Selector */}
              <Text className="text-slate-500 dark:text-zinc-400 text-xs mb-1.5 font-medium">Payment Method *</Text>
              <View className="flex-row flex-wrap gap-1.5 mb-3.5">
                {PAYMENT_METHODS.map((m) => {
                  const isSelected = paymentMethod === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setPaymentMethod(m)}
                      className={`px-3.5 py-1.5 rounded-xl border uppercase ${
                        isSelected
                          ? "bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-600/30"
                          : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? "text-white" : "text-slate-600 dark:text-zinc-400"
                        }`}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Input
                label="Sale Notes (Optional)"
                placeholder="Receipt # or discount details"
                value={checkoutNotes}
                onChangeText={setCheckoutNotes}
              />

              <View className="flex-row gap-2.5 mt-3 mb-4">
                <Button
                  title="Clear Cart"
                  variant="secondary"
                  onPress={() => {
                    setCart([]);
                    setShowCartModal(false);
                  }}
                  className="flex-1"
                />
                <Button
                  title={`Charge ${formatTaka(totalCartAmount)}`}
                  variant="primary"
                  loading={createOrderMutation.isPending}
                  onPress={handleCheckout}
                  className="flex-1 bg-emerald-600 active:bg-emerald-700"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sale Success & Invoice Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View className="flex-1 bg-black/60 dark:bg-black/80 items-center justify-center p-4">
          <View className="w-full max-w-sm">
            <Card className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-2xl items-center">
              <View className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 items-center justify-center mb-3 shadow-xs">
                <Text className="text-emerald-600 dark:text-emerald-400 text-2xl font-black">✓</Text>
              </View>
              <Text className="text-slate-900 dark:text-white font-black text-xl tracking-tight">Sale Completed!</Text>
              <Text className="text-slate-500 dark:text-zinc-400 text-xs text-center mt-1 mb-4">
                Invoice #{completedInvoice?.invoiceNo} recorded successfully
              </Text>

              {completedInvoice && (
                <View className="w-full bg-slate-50 dark:bg-zinc-950/80 rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800 mb-4 gap-2">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-500 dark:text-zinc-400 text-xs">Customer</Text>
                    <Text className="text-slate-900 dark:text-white text-xs font-bold">
                      {completedInvoice.customerName}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-500 dark:text-zinc-400 text-xs">Payment Method</Text>
                    <Text className="text-slate-900 dark:text-white text-xs font-bold uppercase">
                      {completedInvoice.paymentMethod}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-500 dark:text-zinc-400 text-xs">Items Sold</Text>
                    <Text className="text-slate-900 dark:text-white text-xs font-bold">
                      {completedInvoice.items.reduce((s, i) => s + i.quantity, 0)} items
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                    <Text className="text-slate-900 dark:text-white text-xs font-bold">Grand Total</Text>
                    <Text className="text-emerald-600 dark:text-emerald-400 text-lg font-black">
                      {formatTaka(completedInvoice.totalAmount)}
                    </Text>
                  </View>
                </View>
              )}

              <View className="w-full gap-2">
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => completedInvoice && printOrderInvoice(completedInvoice)}
                    className="flex-1 py-3 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 active:bg-slate-200 dark:active:bg-zinc-700 border border-slate-200 dark:border-zinc-700 items-center justify-center flex-row gap-1.5"
                  >
                    <Text className="text-slate-800 dark:text-white font-bold text-xs">🖨️ Print</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => completedInvoice && shareOrderInvoicePdf(completedInvoice)}
                    className="flex-1 py-3 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 active:bg-slate-200 dark:active:bg-zinc-700 border border-slate-200 dark:border-zinc-700 items-center justify-center flex-row gap-1.5"
                  >
                    <Text className="text-slate-800 dark:text-white font-bold text-xs">📤 PDF</Text>
                  </Pressable>
                </View>

                <Button
                  title="+ New Sale"
                  variant="primary"
                  onPress={() => {
                    setShowSuccessModal(false);
                    setCompletedInvoice(null);
                  }}
                  className="w-full bg-emerald-600 active:bg-emerald-700 mt-1"
                />
              </View>
            </Card>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
