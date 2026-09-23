import React, { useState } from "react";
import { View, Text, Pressable, FlatList, TextInput, Modal, Alert, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Button, Input, Skeleton } from "@/components/ui";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/queries/useProducts";
import { formatTaka } from "@/lib/currency";
import type { ProductItem, CreateProductPayload, ProductCategory } from "@/api/types/product.types";

const CATEGORIES: ProductCategory[] = [
  "beverage",
  "snack",
  "food",
  "equipment",
  "clothing",
  "accessories",
  "other",
];

const UNITS = ["pcs", "can", "bottle", "box", "pair", "set"];

export default function ProductsScreen() {
  const router = useRouter();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("beverage");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [lowStockAlert, setLowStockAlert] = useState("5");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: products = [], isLoading, isRefetching, refetch } = useProducts();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  // Metrics
  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockCount = products.filter((p) => p.stock <= (p.lowStockAlert || 5)).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || p.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName("");
    setCategory("beverage");
    setPrice("");
    setCostPrice("");
    setStock("20");
    setUnit("pcs");
    setLowStockAlert("5");
    setSku("");
    setDescription("");
    setErrorMsg("");
    setShowModal(true);
  };

  const handleOpenEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory((p.category as ProductCategory) || "beverage");
    setPrice(String(p.price || ""));
    setCostPrice(String(p.costPrice || ""));
    setStock(String(p.stock || "0"));
    setUnit(p.unit || "pcs");
    setLowStockAlert(String(p.lowStockAlert || "5"));
    setSku(p.sku || "");
    setDescription(p.description || "");
    setErrorMsg("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrorMsg("Product name is required");
      return;
    }
    const priceNum = parseFloat(price);
    if (!priceNum || priceNum <= 0) {
      setErrorMsg("Please enter a valid retail price");
      return;
    }

    try {
      setErrorMsg("");
      const payload: CreateProductPayload = {
        name: name.trim(),
        category,
        price: priceNum,
        costPrice: parseFloat(costPrice) || 0,
        stock: parseInt(stock, 10) || 0,
        unit,
        lowStockAlert: parseInt(lowStockAlert, 10) || 5,
        sku: sku.trim() || undefined,
        description: description.trim() || undefined,
        status: (parseInt(stock, 10) || 0) > 0 ? "active" : "out_of_stock",
      };

      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      setShowModal(false);
      if (Platform.OS === "web") {
        window.alert(`Product ${editingProduct ? "updated" : "created"} successfully!`);
      } else {
        Alert.alert("Success", `Product ${editingProduct ? "updated" : "created"} successfully!`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save product");
    }
  };

  const handleDelete = (id: string, prodName: string) => {
    const confirmMsg = `Are you sure you want to delete "${prodName}" from inventory?`;
    if (Platform.OS === "web") {
      if (window.confirm(confirmMsg)) {
        deleteMutation.mutate(id);
      }
    } else {
      Alert.alert("Delete Product", confirmMsg, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(id),
        },
      ]);
    }
  };

  return (
    <ScreenWrapper className="pb-4">
      {/* Top Header */}
      <View className="flex-row items-center justify-between my-3">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center active:bg-zinc-800"
          >
            <Text className="text-white text-base font-bold">←</Text>
          </Pressable>
          <View>
            <Text className="text-white text-xl font-black">Product Stock</Text>
            <Text className="text-zinc-400 text-xs">
              {totalProducts} products in inventory
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleOpenAdd}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 active:bg-emerald-700 border border-emerald-500 shadow-md shadow-emerald-950 flex-row items-center"
        >
          <Text className="text-white font-bold text-xs">+ Product</Text>
        </Pressable>
      </View>

      {/* KPI Cards */}
      <View className="flex-row gap-2.5 mb-3.5">
        <Card className="flex-1 bg-zinc-900 border-zinc-800 p-3">
          <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
            Total Items
          </Text>
          <Text className="text-white font-black text-lg mt-1">{totalProducts}</Text>
          <Text className="text-zinc-500 text-[10px] mt-0.5">Catalog</Text>
        </Card>

        <Card className="flex-1 bg-zinc-900 border-zinc-800 p-3">
          <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
            Units in Stock
          </Text>
          <Text className="text-emerald-400 font-black text-lg mt-1">{totalUnits}</Text>
          <Text className="text-zinc-500 text-[10px] mt-0.5">Available</Text>
        </Card>

        <Card className="flex-1 bg-zinc-900 border-zinc-800 p-3">
          <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
            Low Stock
          </Text>
          <Text
            className={`font-black text-lg mt-1 ${
              lowStockCount > 0 ? "text-amber-400" : "text-zinc-400"
            }`}
          >
            {lowStockCount}
          </Text>
          <Text className="text-zinc-500 text-[10px] mt-0.5">Alerts</Text>
        </Card>
      </View>

      {/* Search Input */}
      <View className="flex-row items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 mb-3">
        <Text className="text-zinc-500 mr-2 text-sm">🔍</Text>
        <TextInput
          placeholder="Search products or SKU..."
          placeholderTextColor="#71717a"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-white text-xs"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Text className="text-zinc-400 text-xs px-1">✕</Text>
          </Pressable>
        )}
      </View>

      {/* Category Filter Chips */}
      <View className="flex-row flex-wrap gap-1.5 mb-3.5">
        {["all", ...CATEGORIES].map((c) => {
          const isSelected = selectedCategory === c;
          return (
            <Pressable
              key={c}
              onPress={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-full border capitalize ${
                isSelected
                  ? "bg-emerald-600 border-emerald-500"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isSelected ? "text-white" : "text-zinc-400"
                }`}
              >
                {c}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Products FlatList */}
      {isLoading ? (
        <View className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={85} borderRadius={16} />
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
            <Card className="bg-zinc-900/60 border-zinc-800 p-8 items-center justify-center my-6">
              <Text className="text-3xl mb-2">📦</Text>
              <Text className="text-zinc-300 font-bold text-sm">No products found</Text>
              <Text className="text-zinc-500 text-xs text-center mt-1">
                Tap "+ Product" to add items to your store
              </Text>
            </Card>
          }
          renderItem={({ item }) => {
            const isLowStock = item.stock <= (item.lowStockAlert || 5);
            return (
              <Card className="bg-zinc-900 border-zinc-800 p-3.5 mb-2.5">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-white font-bold text-sm" numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Badge label={item.category} variant="default" size="sm" />
                    </View>
                    <View className="flex-row items-center gap-2 mt-1">
                      <Text className="text-emerald-400 font-black text-sm">
                        {formatTaka(item.price)}
                      </Text>
                      {item.costPrice ? (
                        <>
                          <Text className="text-zinc-600">•</Text>
                          <Text className="text-zinc-500 text-xs">
                            Cost: {formatTaka(item.costPrice)}
                          </Text>
                        </>
                      ) : null}
                    </View>
                  </View>

                  {/* Stock Pill & Actions */}
                  <View className="items-end gap-1.5">
                    <View
                      className={`px-2.5 py-1 rounded-lg border ${
                        item.stock <= 0
                          ? "bg-red-500/15 border-red-500/30"
                          : isLowStock
                          ? "bg-amber-500/15 border-amber-500/30"
                          : "bg-emerald-500/15 border-emerald-500/30"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          item.stock <= 0
                            ? "text-red-400"
                            : isLowStock
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {item.stock} {item.unit}
                      </Text>
                    </View>

                    <View className="flex-row gap-1">
                      <Pressable
                        onPress={() => handleOpenEdit(item)}
                        className="w-7 h-7 rounded-lg bg-zinc-800 items-center justify-center active:bg-zinc-700"
                      >
                        <Text className="text-zinc-300 text-xs font-bold">⚙️</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(item.id, item.name)}
                        className="w-7 h-7 rounded-lg bg-zinc-800 items-center justify-center active:bg-red-500/20"
                      >
                        <Text className="text-red-400 text-xs font-bold">🗑️</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>

                {item.description ? (
                  <View className="mt-2 pt-2 border-t border-zinc-800/80">
                    <Text className="text-zinc-400 text-xs">{item.description}</Text>
                  </View>
                ) : null}
              </Card>
            );
          }}
        />
      )}

      {/* Add / Edit Product Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-5 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white font-black text-lg">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </Text>
              <Pressable
                onPress={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 items-center justify-center"
              >
                <Text className="text-zinc-400 font-bold">✕</Text>
              </Pressable>
            </View>

            {errorMsg ? (
              <View className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl mb-3">
                <Text className="text-red-400 text-xs font-semibold">{errorMsg}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Product Name *"
                placeholder="e.g. Red Bull Energy Drink 250ml"
                value={name}
                onChangeText={setName}
              />

              {/* Category Chips */}
              <Text className="text-zinc-400 text-xs mb-1.5">Category *</Text>
              <View className="flex-row flex-wrap gap-1.5 mb-3.5">
                {CATEGORIES.map((c) => {
                  const isSelected = category === c;
                  return (
                    <Pressable
                      key={c}
                      onPress={() => setCategory(c)}
                      className={`px-3 py-1.5 rounded-xl border capitalize ${
                        isSelected
                          ? "bg-emerald-600 border-emerald-500"
                          : "bg-zinc-950 border-zinc-800"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        {c}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="Retail Price (BDT ৳) *"
                    placeholder="180"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Cost Price (BDT ৳)"
                    placeholder="130"
                    value={costPrice}
                    onChangeText={setCostPrice}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="Stock Count *"
                    placeholder="24"
                    value={stock}
                    onChangeText={setStock}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Low Stock Alert"
                    placeholder="5"
                    value={lowStockAlert}
                    onChangeText={setLowStockAlert}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Unit Selector */}
              <Text className="text-zinc-400 text-xs mb-1.5">Packaging Unit</Text>
              <View className="flex-row flex-wrap gap-1.5 mb-3.5">
                {UNITS.map((u) => {
                  const isSelected = unit === u;
                  return (
                    <Pressable
                      key={u}
                      onPress={() => setUnit(u)}
                      className={`px-3 py-1.5 rounded-xl border uppercase ${
                        isSelected
                          ? "bg-emerald-600 border-emerald-500"
                          : "bg-zinc-950 border-zinc-800"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        {u}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Input
                label="SKU / Barcode (Optional)"
                placeholder="e.g. RB-250-CAN"
                value={sku}
                onChangeText={setSku}
              />

              <Input
                label="Description (Optional)"
                placeholder="Brand, flavour or sizing notes"
                value={description}
                onChangeText={setDescription}
              />

              <View className="flex-row gap-2.5 mt-3 mb-4">
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setShowModal(false)}
                  className="flex-1"
                />
                <Button
                  title={editingProduct ? "Update Product" : "Create Product"}
                  variant="primary"
                  loading={createMutation.isPending || updateMutation.isPending}
                  onPress={handleSubmit}
                  className="flex-1 bg-emerald-600 active:bg-emerald-700"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
