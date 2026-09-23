import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Button, Input, Skeleton } from "@/components/ui";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/queries/useUsers";
import { useAuthStore } from "@/stores/auth.store";
import { formatDate } from "@/lib/date";
import type { PlatformUser, UserRole, UserStatus } from "@/api/types/user.types";

const ROLE_OPTIONS: { label: string; value: UserRole; icon: string; desc: string }[] = [
  { label: "Staff", value: "staff", icon: "🛠️", desc: "Front desk booking & POS counter" },
  { label: "Partner", value: "partner", icon: "🤝", desc: "View dividend shares & financial metrics" },
  { label: "Admin", value: "admin", icon: "👑", desc: "Full administrative & platform control" },
  { label: "Customer", value: "customer", icon: "⚽", desc: "Regular player booking turf slots" },
];

const STATUS_OPTIONS: { label: string; value: UserStatus; variant: "success" | "warning" | "danger" }[] = [
  { label: "Active", value: "active", variant: "success" },
  { label: "Inactive", value: "inactive", variant: "warning" },
  { label: "Suspended", value: "suspended", variant: "danger" },
];

export default function UsersManagementScreen() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === "admin";

  const { data: users = [], isLoading, refetch, isRefetching } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("staff");
  const [status, setStatus] = useState<UserStatus>("active");
  const [errorMsg, setErrorMsg] = useState("");

  // Access Guard
  if (!isAdmin) {
    return (
      <ScreenWrapper className="p-4 items-center justify-center">
        <Card className="p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 items-center max-w-sm rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none">
          <Text className="text-4xl mb-3">🔒</Text>
          <Text className="text-slate-900 dark:text-white text-lg font-bold mb-1">Access Restricted</Text>
          <Text className="text-slate-500 dark:text-zinc-400 text-xs text-center mb-4">
            Only System Administrators have permission to manage staff, partners, and user roles.
          </Text>
          <Button title="Back to Dashboard" variant="primary" onPress={() => router.back()} />
        </Card>
      </ScreenWrapper>
    );
  }

  // KPI Metrics
  const totalUsers = users.length;
  const staffCount = users.filter((u) => u.role === "staff").length;
  const partnerCount = users.filter((u) => u.role === "partner").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRole === "all" ||
      (selectedRole === "customer" ? u.role === "customer" || u.role === "user" : u.role === selectedRole);

    const matchesStatus =
      selectedStatus === "all" || u.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setFullName("");
    setEmail("");
    setPassword("");
    setRole("staff");
    setStatus("active");
    setErrorMsg("");
    setShowModal(true);
  };

  const openEditModal = (user: PlatformUser) => {
    setEditingUser(user);
    setFullName(user.fullName || "");
    setEmail(user.email || "");
    setPassword("");
    setRole((user.role === "user" ? "customer" : user.role) || "staff");
    setStatus(user.status || "active");
    setErrorMsg("");
    setShowModal(true);
  };

  const handleSaveUser = () => {
    if (!fullName.trim()) {
      setErrorMsg("Full name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("A valid email address is required.");
      return;
    }
    if (!editingUser && !password.trim()) {
      setErrorMsg("A password of at least 6 characters is required for new accounts.");
      return;
    }

    if (editingUser) {
      updateMutation.mutate(
        {
          id: editingUser.id,
          payload: {
            fullName: fullName.trim(),
            email: email.trim(),
            password: password.trim() ? password.trim() : undefined,
            role,
            status,
          },
        },
        {
          onSuccess: () => setShowModal(false),
          onError: (err: any) => setErrorMsg(err.message || "Failed to update user."),
        }
      );
    } else {
      createMutation.mutate(
        {
          fullName: fullName.trim(),
          email: email.trim(),
          password: password.trim() || "00000000",
          role,
          status,
        },
        {
          onSuccess: () => setShowModal(false),
          onError: (err: any) => setErrorMsg(err.message || "Failed to create user."),
        }
      );
    }
  };

  const handleDeleteUser = (user: PlatformUser) => {
    if (user.id === currentUser?.id) {
      if (Platform.OS === "web") {
        window.alert("You cannot delete your own logged-in administrator account!");
      } else {
        Alert.alert("Action Blocked", "You cannot delete your own logged-in administrator account!");
      }
      return;
    }

    const confirmDelete = () => {
      deleteMutation.mutate(user.id);
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Permanently delete account for "${user.fullName}" (${user.email})?`)) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        "Delete User Account",
        `Are you sure you want to permanently delete "${user.fullName}"? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete Account", style: "destructive", onPress: confirmDelete },
        ]
      );
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "info";
      case "partner":
        return "warning";
      case "staff":
        return "success";
      default:
        return "default";
    }
  };

  const renderUserCard = ({ item }: { item: PlatformUser }) => {
    const isCurrent = item.id === currentUser?.id;
    const initials = item.fullName
      ? item.fullName
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "U";

    return (
      <Card className="mb-3 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-3 flex-1 mr-2">
            {/* Initials Avatar */}
            <View className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 items-center justify-center">
              <Text className="text-slate-800 dark:text-white font-black text-sm">{initials}</Text>
            </View>

            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-slate-900 dark:text-white font-bold text-base" numberOfLines={1}>
                  {item.fullName}
                </Text>
                {isCurrent ? (
                  <View className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-full">
                    <Text className="text-emerald-700 dark:text-emerald-400 text-[9px] font-extrabold">YOU</Text>
                  </View>
                ) : null}
              </View>
              <Text className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5" numberOfLines={1}>
                {item.email}
              </Text>
            </View>
          </View>

          {/* Role Badge */}
          <Badge
            label={item.role?.toUpperCase() || "STAFF"}
            variant={getRoleBadgeVariant(item.role)}
            size="sm"
          />
        </View>

        {/* Status and Joined Date */}
        <View className="flex-row items-center justify-between pt-2.5 border-t border-slate-100 dark:border-zinc-800/60">
          <View className="flex-row items-center gap-2">
            <View
              className={`w-2 h-2 rounded-full ${
                item.status === "active"
                  ? "bg-emerald-500"
                  : item.status === "suspended"
                  ? "bg-red-500"
                  : "bg-slate-400 dark:bg-zinc-500"
              }`}
            />
            <Text className="text-slate-600 dark:text-zinc-400 text-xs capitalize font-medium">
              {item.status || "active"}
            </Text>
            {item.createdAt ? (
              <Text className="text-slate-400 dark:text-zinc-500 text-[10px]">
                • Joined {formatDate(item.createdAt)}
              </Text>
            ) : null}
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => openEditModal(item)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 active:bg-slate-200 dark:active:bg-zinc-700 flex-row items-center"
            >
              <Text className="text-slate-700 dark:text-zinc-200 text-xs font-semibold">✏️ Edit</Text>
            </Pressable>

            {!isCurrent ? (
              <Pressable
                onPress={() => handleDeleteUser(item)}
                className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 items-center justify-center active:bg-red-100 dark:active:bg-red-900/60"
              >
                <Text className="text-red-500 dark:text-red-400 text-xs font-bold">🗑️</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Card>
    );
  };

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
            <Text className="text-slate-900 dark:text-white text-2xl font-black">User Access</Text>
            <Text className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5">
              Staff, partners & administrators
            </Text>
          </View>
        </View>

        <Button title="+ Add User" variant="primary" size="sm" onPress={openCreateModal} />
      </View>

      {/* 4 Metric Summary Cards */}
      <View className="flex-row gap-2 mb-3">
        <Card className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-2.5 items-center rounded-2xl shadow-sm shadow-slate-200/40 dark:shadow-none">
          <Text className="text-slate-500 dark:text-zinc-500 text-[9px] uppercase font-bold">Total</Text>
          <Text className="text-slate-900 dark:text-white text-base font-black mt-0.5">{totalUsers}</Text>
        </Card>
        <Card className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-2.5 items-center rounded-2xl shadow-sm shadow-slate-200/40 dark:shadow-none">
          <Text className="text-slate-500 dark:text-zinc-500 text-[9px] uppercase font-bold">Staff</Text>
          <Text className="text-emerald-600 dark:text-emerald-400 text-base font-black mt-0.5">{staffCount}</Text>
        </Card>
        <Card className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-2.5 items-center rounded-2xl shadow-sm shadow-slate-200/40 dark:shadow-none">
          <Text className="text-slate-500 dark:text-zinc-500 text-[9px] uppercase font-bold">Partners</Text>
          <Text className="text-amber-600 dark:text-amber-400 text-base font-black mt-0.5">{partnerCount}</Text>
        </Card>
        <Card className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-2.5 items-center rounded-2xl shadow-sm shadow-slate-200/40 dark:shadow-none">
          <Text className="text-slate-500 dark:text-zinc-500 text-[9px] uppercase font-bold">Admins</Text>
          <Text className="text-blue-600 dark:text-blue-400 text-base font-black mt-0.5">{adminCount}</Text>
        </Card>
      </View>

      {/* Search Input */}
      <View className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 flex-row items-center mb-3 shadow-sm shadow-slate-200/40 dark:shadow-none">
        <Text className="text-slate-400 dark:text-zinc-500 mr-2">🔍</Text>
        <TextInput
          placeholder="Search by full name or email address..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-slate-900 dark:text-white text-xs"
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery("")}>
            <Text className="text-slate-400 dark:text-zinc-500 text-xs font-bold">✕</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Role Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          {[
            { label: "All Roles", value: "all" },
            { label: "Staff", value: "staff" },
            { label: "Partners", value: "partner" },
            { label: "Admins", value: "admin" },
            { label: "Customers", value: "customer" },
          ].map((f) => {
            const isSelected = selectedRole === f.value;
            return (
              <Pressable
                key={f.value}
                onPress={() => setSelectedRole(f.value)}
                className={`px-3 py-1.5 rounded-full border mr-1 ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-600/30"
                    : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm shadow-slate-200/30 dark:shadow-none"
                }`}
              >
                <Text
                  className={`text-[11px] font-bold ${
                    isSelected ? "text-white" : "text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Users List */}
      {isLoading ? (
        <View className="space-y-3">
          <Skeleton height={100} borderRadius={16} />
          <Skeleton height={100} borderRadius={16} />
          <Skeleton height={100} borderRadius={16} />
        </View>
      ) : filteredUsers.length === 0 ? (
        <Card className="p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl items-center justify-center my-6 border-dashed shadow-sm shadow-slate-200/40 dark:shadow-none">
          <Text className="text-4xl mb-2">👥</Text>
          <Text className="text-slate-900 dark:text-white font-bold text-sm">No Users Found</Text>
          <Text className="text-slate-500 dark:text-zinc-400 text-xs text-center mt-1 mb-4">
            {searchQuery
              ? "No accounts match your current query or role filter."
              : "No user accounts registered in this category."}
          </Text>
          <Button title="+ Add New Account" variant="primary" size="sm" onPress={openCreateModal} />
        </Card>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderUserCard}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}

      {/* Add / Edit User Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/60 dark:bg-black/80 justify-end">
          <View className="bg-white dark:bg-zinc-900 rounded-t-3xl border-t border-slate-200 dark:border-zinc-800 p-5 max-h-[90%] shadow-2xl">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-slate-900 dark:text-white text-lg font-bold">
                  {editingUser ? "Edit User Account" : "Add Team Member"}
                </Text>
                <Text className="text-slate-500 dark:text-zinc-400 text-xs">
                  {editingUser ? `Updating access for ${editingUser.email}` : "Configure permissions and platform role"}
                </Text>
              </View>
              <Pressable
                onPress={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 items-center justify-center"
              >
                <Text className="text-slate-500 dark:text-zinc-400 text-sm font-bold">✕</Text>
              </Pressable>
            </View>

            {errorMsg ? (
              <View className="bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 p-3 rounded-xl mb-4">
                <Text className="text-red-600 dark:text-red-300 text-xs font-semibold">{errorMsg}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
              <Input
                label="Full Name *"
                placeholder="e.g. Sabbir Tanvir"
                value={fullName}
                onChangeText={setFullName}
              />

              <Input
                label="Email Address *"
                placeholder="name@turfslot.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Input
                label={editingUser ? "Change Password (Leave blank to keep current)" : "Password *"}
                placeholder="Minimum 6 characters"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              {/* Role Selection */}
              <View>
                <Text className="text-slate-700 dark:text-zinc-400 text-xs font-semibold mb-2">
                  System Role & Access Scope
                </Text>
                <View className="space-y-2">
                  {ROLE_OPTIONS.map((opt) => {
                    const isSelected = role === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => setRole(opt.value)}
                        className={`p-3 rounded-xl border flex-row items-center justify-between ${
                          isSelected
                            ? "bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 dark:border-emerald-600"
                            : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                        }`}
                      >
                        <View className="flex-row items-center gap-3 flex-1 mr-2">
                          <Text className="text-xl">{opt.icon}</Text>
                          <View>
                            <Text
                              className={`text-xs font-bold ${
                                isSelected ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                              }`}
                            >
                              {opt.label}
                            </Text>
                            <Text className="text-slate-500 dark:text-zinc-500 text-[10px] mt-0.5">
                              {opt.desc}
                            </Text>
                          </View>
                        </View>
                        <View
                          className={`w-5 h-5 rounded-full border items-center justify-center ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                          }`}
                        >
                          {isSelected && <Text className="text-white text-[10px] font-bold">✓</Text>}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Status Selection */}
              <View>
                <Text className="text-slate-700 dark:text-zinc-400 text-xs font-semibold mb-2">
                  Account Status
                </Text>
                <View className="flex-row gap-2">
                  {STATUS_OPTIONS.map((opt) => {
                    const isSelected = status === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => setStatus(opt.value)}
                        className={`flex-1 py-2 rounded-xl border items-center ${
                          isSelected
                            ? "bg-emerald-600 border-emerald-500"
                            : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            isSelected ? "text-white" : "text-slate-700 dark:text-zinc-300"
                          }`}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="flex-row gap-3 pt-4">
                <Button
                  title="Cancel"
                  variant="outline"
                  className="flex-1"
                  onPress={() => setShowModal(false)}
                />
                <Button
                  title={editingUser ? "Update Account" : "Create Account"}
                  variant="primary"
                  className="flex-1"
                  loading={createMutation.isPending || updateMutation.isPending}
                  onPress={handleSaveUser}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
