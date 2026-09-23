import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Alert, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenWrapper, Input, Button, Card, Badge } from "@/components/ui";
import { useTurf, useCreateTurf, useUpdateTurf, useDeleteTurf } from "@/hooks/queries/useTurfs";
import { useAuthStore, selectUser } from "@/stores/auth.store";
import type { Turf } from "@/api/types/turf.types";

const PITCH_TYPES = [
  "5-a-side",
  "7-a-side",
  "11-a-side",
  "futsal",
  "cricket",
  "badminton",
  "multi-purpose",
];

const AVAILABLE_AMENITIES = [
  "Floodlights",
  "Changing Room",
  "Shower",
  "Parking",
  "Mineral Water",
  "Air Conditioning",
  "WiFi",
  "Cafeteria",
  "First Aid",
  "Locker Room",
  "Spectator Seating",
];

export default function ManageTurfScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const user = useAuthStore(selectUser);

  const { data: existingTurf, isLoading: loadingTurf } = useTurf(id || "");
  const createTurfMutation = useCreateTurf();
  const updateTurfMutation = useUpdateTurf();
  const deleteTurfMutation = useDeleteTurf();

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState("5-a-side");
  const [size, setSize] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<"active" | "maintenance" | "inactive">("active");
  const [basePrice, setBasePrice] = useState("2000");
  const [peakPrice, setPeakPrice] = useState("3000");
  const [nightPrice, setNightPrice] = useState("2500");
  const [openingHour, setOpeningHour] = useState("6");
  const [closingHour, setClosingHour] = useState("23");
  const [peakHoursStart, setPeakHoursStart] = useState("17");
  const [peakHoursEnd, setPeakHoursEnd] = useState("21");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (existingTurf && isEdit) {
      setName(existingTurf.name || "");
      setType(existingTurf.type || "5-a-side");
      setSize(existingTurf.size || "");
      setLocation(existingTurf.location || "");
      setImageUrl(existingTurf.imageUrl || "");
      setStatus(existingTurf.status || "active");
      setBasePrice(String(existingTurf.basePrice || 2000));
      setPeakPrice(String(existingTurf.peakPrice || 3000));
      setNightPrice(String(existingTurf.nightPrice || 2500));
      setOpeningHour(String(existingTurf.openingHour ?? 6));
      setClosingHour(String(existingTurf.closingHour ?? 23));
      setPeakHoursStart(String(existingTurf.peakHoursStart ?? 17));
      setPeakHoursEnd(String(existingTurf.peakHoursEnd ?? 21));
      setAmenities(existingTurf.amenities || []);
    }
  }, [existingTurf, isEdit]);

  const toggleAmenity = (item: string) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter((a) => a !== item));
    } else {
      setAmenities([...amenities, item]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMessage("Turf Name is required");
      return;
    }

    const basePriceNum = parseFloat(basePrice);
    if (isNaN(basePriceNum) || basePriceNum <= 0) {
      setErrorMessage("Please enter a valid base price per hour");
      return;
    }

    try {
      setErrorMessage("");
      const payload: Partial<Turf> = {
        name: name.trim(),
        type,
        size: size.trim(),
        location: location.trim(),
        imageUrl: imageUrl.trim() || undefined,
        status,
        basePrice: basePriceNum,
        peakPrice: parseFloat(peakPrice) || basePriceNum,
        nightPrice: parseFloat(nightPrice) || basePriceNum,
        openingHour: parseInt(openingHour, 10) || 6,
        closingHour: parseInt(closingHour, 10) || 23,
        peakHoursStart: parseInt(peakHoursStart, 10) || 17,
        peakHoursEnd: parseInt(peakHoursEnd, 10) || 21,
        amenities,
      };

      if (isEdit && id) {
        await updateTurfMutation.mutateAsync({ id, payload });
      } else {
        await createTurfMutation.mutateAsync(payload);
      }

      if (Platform.OS === "web") {
        window.alert(isEdit ? "Turf updated successfully!" : "Turf created successfully!");
      } else {
        Alert.alert("Success", isEdit ? "Turf updated successfully!" : "Turf created successfully!");
      }
      router.back();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save turf details");
    }
  };

  const handleDelete = () => {
    if (!id) return;

    const confirmDelete = async () => {
      try {
        await deleteTurfMutation.mutateAsync(id);
        if (Platform.OS === "web") {
          window.alert("Turf deleted successfully.");
        } else {
          Alert.alert("Deleted", "Turf deleted successfully.");
        }
        router.replace("/(tabs)/explore");
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to delete turf");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to delete this turf? This cannot be undone.")) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        "Delete Turf",
        "Are you sure you want to permanently delete this turf ground?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: confirmDelete },
        ]
      );
    }
  };

  const isSaving = createTurfMutation.isPending || updateTurfMutation.isPending;

  return (
    <ScreenWrapper scrollable className="pb-10">
      {/* Top Header */}
      <View className="flex-row items-center justify-between my-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center"
        >
          <Text className="text-white text-base font-bold">←</Text>
        </Pressable>
        <Text className="text-white font-bold text-lg">
          {isEdit ? "Edit Turf Ground" : "Add New Turf"}
        </Text>
        <View className="w-10" />
      </View>

      {errorMessage ? (
        <View className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 mb-4">
          <Text className="text-red-400 text-xs font-medium">{errorMessage}</Text>
        </View>
      ) : null}

      {/* Basic Info Section */}
      <Card className="mb-4 bg-zinc-900 border-zinc-800 p-4">
        <Text className="text-white font-bold text-base mb-3">Pitch Details</Text>

        <Input
          label="Turf / Pitch Name *"
          placeholder="e.g. Wembley Arena"
          value={name}
          onChangeText={setName}
        />

        <Text className="text-zinc-400 text-xs mb-2">Pitch Sport / Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-4">
          {PITCH_TYPES.map((t) => {
            const isSelected = type === t;
            return (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                className={`px-3.5 py-2 rounded-xl border ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-500"
                    : "bg-zinc-950 border-zinc-800"
                }`}
              >
                <Text
                  className={`text-xs font-semibold uppercase ${
                    isSelected ? "text-white" : "text-zinc-400"
                  }`}
                >
                  {t.replace(/-/g, " ")}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Size / Dimensions"
              placeholder="e.g. 40x20m"
              value={size}
              onChangeText={setSize}
            />
          </View>
          <View className="flex-1">
            <Input
              label="Location / Area"
              placeholder="e.g. Gulshan, Dhaka"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        <Input
          label="Banner Image URL"
          placeholder="https://images.unsplash.com/..."
          value={imageUrl}
          onChangeText={setImageUrl}
          autoCapitalize="none"
        />

        {/* Status Selector */}
        <Text className="text-zinc-400 text-xs mb-2">Operating Status</Text>
        <View className="flex-row gap-2 mb-2">
          {(["active", "maintenance", "inactive"] as const).map((s) => {
            const isSelected = status === s;
            return (
              <Pressable
                key={s}
                onPress={() => setStatus(s)}
                className={`flex-1 py-2 rounded-xl border items-center justify-center ${
                  isSelected
                    ? s === "active"
                      ? "bg-emerald-500/20 border-emerald-500"
                      : s === "maintenance"
                      ? "bg-amber-500/20 border-amber-500"
                      : "bg-zinc-800 border-zinc-700"
                    : "bg-zinc-950 border-zinc-800"
                }`}
              >
                <Text
                  className={`text-xs font-bold capitalize ${
                    isSelected
                      ? s === "active"
                        ? "text-emerald-400"
                        : s === "maintenance"
                        ? "text-amber-400"
                        : "text-zinc-300"
                      : "text-zinc-500"
                  }`}
                >
                  {s}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Hourly Pricing Section */}
      <Card className="mb-4 bg-zinc-900 border-zinc-800 p-4">
        <Text className="text-white font-bold text-base mb-3">Hourly Rates (BDT ৳)</Text>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Base Rate (৳) *"
              placeholder="2000"
              keyboardType="numeric"
              value={basePrice}
              onChangeText={setBasePrice}
            />
          </View>
          <View className="flex-1">
            <Input
              label="Peak Rate (৳)"
              placeholder="3000"
              keyboardType="numeric"
              value={peakPrice}
              onChangeText={setPeakPrice}
            />
          </View>
          <View className="flex-1">
            <Input
              label="Night Rate (৳)"
              placeholder="2500"
              keyboardType="numeric"
              value={nightPrice}
              onChangeText={setNightPrice}
            />
          </View>
        </View>
      </Card>

      {/* Operating Schedule Section */}
      <Card className="mb-4 bg-zinc-900 border-zinc-800 p-4">
        <Text className="text-white font-bold text-base mb-3">Operating Hours (24h format)</Text>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Open (Hour 0-23)"
              placeholder="6"
              keyboardType="numeric"
              value={openingHour}
              onChangeText={setOpeningHour}
            />
          </View>
          <View className="flex-1">
            <Input
              label="Close (Hour 0-23)"
              placeholder="23"
              keyboardType="numeric"
              value={closingHour}
              onChangeText={setClosingHour}
            />
          </View>
        </View>

        <View className="flex-row gap-3 mt-1">
          <View className="flex-1">
            <Input
              label="Peak Starts (Hour)"
              placeholder="17"
              keyboardType="numeric"
              value={peakHoursStart}
              onChangeText={setPeakHoursStart}
            />
          </View>
          <View className="flex-1">
            <Input
              label="Peak Ends (Hour)"
              placeholder="21"
              keyboardType="numeric"
              value={peakHoursEnd}
              onChangeText={setPeakHoursEnd}
            />
          </View>
        </View>
      </Card>

      {/* Amenities Section */}
      <Card className="mb-6 bg-zinc-900 border-zinc-800 p-4">
        <Text className="text-white font-bold text-base mb-1">Available Amenities</Text>
        <Text className="text-zinc-400 text-xs mb-3">Tap to toggle features included at this pitch</Text>

        <View className="flex-row flex-wrap gap-2">
          {AVAILABLE_AMENITIES.map((amenity) => {
            const isSelected = amenities.includes(amenity);
            return (
              <Pressable
                key={amenity}
                onPress={() => toggleAmenity(amenity)}
                className={`px-3 py-1.5 rounded-full border ${
                  isSelected
                    ? "bg-emerald-500/20 border-emerald-500"
                    : "bg-zinc-950 border-zinc-800"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    isSelected ? "text-emerald-400 font-bold" : "text-zinc-400"
                  }`}
                >
                  {isSelected ? "✓ " : "+ "}
                  {amenity}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Actions */}
      <Button
        title={isSaving ? "Saving..." : isEdit ? "Update Pitch" : "Create Pitch"}
        variant="primary"
        size="lg"
        loading={isSaving}
        onPress={handleSave}
        className="w-full mb-3"
      />

      {isEdit && (
        <Button
          title="Delete Turf Ground"
          variant="danger"
          loading={deleteTurfMutation.isPending}
          onPress={handleDelete}
          className="w-full"
        />
      )}
    </ScreenWrapper>
  );
}
