import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Share,
  Linking,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Button, Skeleton } from "@/components/ui";
import {
  useProfitLossReport,
  useCashPositionReport,
  useReceivablesReport,
  usePartnerSharesReport,
} from "@/hooks/queries/useReports";
import { useAuthStore } from "@/stores/auth.store";
import { formatTaka } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { ReportQueryParams } from "@/api/types/report.types";

export default function ReportsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";
  const isPartner = user?.role === "partner";
  const isAuthorized = isAdmin || isPartner;

  const [period, setPeriod] = useState<"monthly" | "weekly" | "daily" | "yearly">("monthly");
  const [activeTab, setActiveTab] = useState<"pnl" | "cash" | "receivables" | "shares">("pnl");

  const queryParams: ReportQueryParams = { period };

  const {
    data: pnl,
    isLoading: pnlLoading,
    refetch: refetchPnl,
    isRefetching: pnlRefetching,
  } = useProfitLossReport(queryParams, isAuthorized);

  const {
    data: cash,
    isLoading: cashLoading,
    refetch: refetchCash,
    isRefetching: cashRefetching,
  } = useCashPositionReport({}, isAuthorized && isAdmin);

  const {
    data: receivables,
    isLoading: recLoading,
    refetch: refetchRec,
    isRefetching: recRefetching,
  } = useReceivablesReport({}, isAuthorized && isAdmin);

  const {
    data: partnerShares,
    isLoading: sharesLoading,
    refetch: refetchShares,
    isRefetching: sharesRefetching,
  } = usePartnerSharesReport(queryParams, isAuthorized);

  if (!isAuthorized) {
    return (
      <ScreenWrapper className="p-4 items-center justify-center">
        <Card className="p-8 bg-zinc-900 border-zinc-800 items-center max-w-sm">
          <Text className="text-4xl mb-3">🔒</Text>
          <Text className="text-white text-lg font-bold mb-1">Access Restricted</Text>
          <Text className="text-zinc-400 text-xs text-center mb-4">
            Executive financial reports and balance analytics are reserved for Administrators and Equity Partners.
          </Text>
          <Button title="Back to Dashboard" variant="primary" onPress={() => router.back()} />
        </Card>
      </ScreenWrapper>
    );
  }

  // Poisha converter helper
  const fmtPoisha = (poisha: number | undefined | null) => {
    return formatTaka((poisha || 0) / 100);
  };

  const handleShareSummary = async () => {
    if (!pnl) return;
    const rev = fmtPoisha(pnl.revenue.total);
    const exp = fmtPoisha(pnl.expenses.total);
    const net = fmtPoisha(pnl.netProfit);
    const fromStr = pnl.period?.from ? formatDate(pnl.period.from) : "Start";
    const toStr = pnl.period?.to ? formatDate(pnl.period.to) : "End";

    const msg = `📊 *TurfSlot Executive Financial Report (${period.toUpperCase()})*\nPeriod: ${fromStr} - ${toStr}\n\n• Total Revenue: ${rev}\n• Total Expenses: ${exp}\n• Net Profit: ${net}\n\nGenerated via TurfSlot Mobile App.`;

    try {
      await Share.share({ message: msg });
    } catch {
      // ignore
    }
  };

  const isRefreshing =
    pnlRefetching || cashRefetching || recRefetching || sharesRefetching;

  const handleRefresh = () => {
    refetchPnl();
    if (isAdmin) {
      refetchCash();
      refetchRec();
    }
    refetchShares();
  };

  return (
    <ScreenWrapper className="pb-6">
      <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
        {/* Top Header */}
        <View className="flex-row items-center justify-between my-2">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center"
            >
              <Text className="text-white text-base font-bold">←</Text>
            </Pressable>
            <View>
              <Text className="text-white text-2xl font-black">Financial Reports</Text>
              <Text className="text-zinc-400 text-xs mt-0.5">
                P&L statements & cash position
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleShareSummary}
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 flex-row items-center"
          >
            <Text className="text-emerald-400 text-xs font-semibold">🔗 Export</Text>
          </Pressable>
        </View>

        {/* Period Selector Pills */}
        <View className="flex-row bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800">
          {(["daily", "weekly", "monthly", "yearly"] as const).map((p) => {
            const isSelected = period === p;
            return (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                className={`flex-1 py-2 rounded-xl items-center ${
                  isSelected ? "bg-emerald-600" : ""
                }`}
              >
                <Text
                  className={`text-xs font-bold capitalize ${
                    isSelected ? "text-white" : "text-zinc-400"
                  }`}
                >
                  {p}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Tab Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
          <View className="flex-row gap-2">
            {[
              { id: "pnl", label: "📊 Profit & Loss", show: true },
              { id: "cash", label: "💵 Cash Position", show: isAdmin },
              { id: "receivables", label: "⏳ Receivables", show: isAdmin },
              { id: "shares", label: "🤝 Partner Shares", show: true },
            ]
              .filter((t) => t.show)
              .map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-full border ${
                      isSelected
                        ? "bg-zinc-800 border-zinc-600"
                        : "bg-zinc-900/60 border-zinc-800"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? "text-emerald-400" : "text-zinc-400"
                      }`}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
          </View>
        </ScrollView>

        {/* TAB 1: PROFIT & LOSS */}
        {activeTab === "pnl" && (
          <View className="space-y-4">
            {pnlLoading ? (
              <View className="space-y-3">
                <Skeleton height={100} borderRadius={16} />
                <Skeleton height={100} borderRadius={16} />
                <Skeleton height={200} borderRadius={16} />
              </View>
            ) : pnl ? (
              <>
                {/* 3 Metric Summary Cards */}
                <View className="grid grid-cols-3 gap-2.5">
                  <Card className="bg-zinc-900 border-zinc-800 p-3">
                    <Text className="text-zinc-500 text-[10px] uppercase font-bold">
                      Revenue
                    </Text>
                    <Text className="text-white text-base font-black mt-0.5" numberOfLines={1}>
                      {fmtPoisha(pnl.revenue.total)}
                    </Text>
                    <Text className="text-zinc-500 text-[10px] mt-1.5">Gross collections</Text>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800 p-3">
                    <Text className="text-zinc-500 text-[10px] uppercase font-bold">
                      Expenses
                    </Text>
                    <Text className="text-red-400 text-base font-black mt-0.5" numberOfLines={1}>
                      {fmtPoisha(pnl.expenses.total)}
                    </Text>
                    <Text className="text-zinc-500 text-[10px] mt-1.5">COGS & operations</Text>
                  </Card>

                  <Card className="bg-emerald-950/40 border-emerald-800/50 p-3">
                    <Text className="text-emerald-400 text-[10px] uppercase font-bold">
                      Net Profit
                    </Text>
                    <Text className="text-emerald-300 text-base font-black mt-0.5" numberOfLines={1}>
                      {fmtPoisha(pnl.netProfit)}
                    </Text>
                    <Text className="text-emerald-500 text-[10px] mt-1.5">
                      {pnl.revenue.total > 0
                        ? `${Math.round((pnl.netProfit / pnl.revenue.total) * 100)}% margin`
                        : "0% margin"}
                    </Text>
                  </Card>
                </View>

                {/* Gross Profit Bar */}
                <Card className="bg-zinc-900 border-zinc-800 p-3.5 flex-row justify-between items-center">
                  <View>
                    <Text className="text-zinc-400 text-xs font-semibold">Gross Operating Profit</Text>
                    <Text className="text-zinc-500 text-[10px]">Revenue minus Cost of Goods Sold (COGS)</Text>
                  </View>
                  <Text className="text-white font-extrabold text-sm">
                    {fmtPoisha(pnl.grossProfit)}
                  </Text>
                </Card>

                {/* Revenue Streams Breakdown */}
                <Card className="bg-zinc-900 border-zinc-800 p-4 space-y-3">
                  <View className="flex-row justify-between items-center pb-2 border-b border-zinc-800">
                    <Text className="text-white font-bold text-sm">📈 Revenue Streams</Text>
                    <Text className="text-emerald-400 font-bold text-xs">
                      {fmtPoisha(pnl.revenue.total)}
                    </Text>
                  </View>

                  {pnl.revenue.breakdown?.length === 0 ? (
                    <Text className="text-zinc-500 text-xs py-2 text-center">
                      No revenue recorded in this {period} period.
                    </Text>
                  ) : (
                    pnl.revenue.breakdown?.map((item, idx) => {
                      const amount = item.amount || 0;
                      const pct = pnl.revenue.total > 0 ? (amount / pnl.revenue.total) * 100 : 0;
                      return (
                        <View key={idx} className="space-y-1">
                          <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center gap-1.5 flex-1 mr-2">
                              <Text className="text-zinc-500 text-[10px] font-mono">
                                {item.accountCode || item.code}
                              </Text>
                              <Text className="text-zinc-200 text-xs font-semibold" numberOfLines={1}>
                                {item.name}
                              </Text>
                            </View>
                            <Text className="text-white text-xs font-bold">
                              {fmtPoisha(amount)}
                            </Text>
                          </View>
                          <View className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <View
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </View>
                        </View>
                      );
                    })
                  )}
                </Card>

                {/* Expenses Breakdown */}
                <Card className="bg-zinc-900 border-zinc-800 p-4 space-y-3">
                  <View className="flex-row justify-between items-center pb-2 border-b border-zinc-800">
                    <Text className="text-white font-bold text-sm">📉 Operating Expenses</Text>
                    <Text className="text-red-400 font-bold text-xs">
                      {fmtPoisha(pnl.expenses.total)}
                    </Text>
                  </View>

                  {pnl.expenses.breakdown?.length === 0 ? (
                    <Text className="text-zinc-500 text-xs py-2 text-center">
                      No expenses logged in this {period} period.
                    </Text>
                  ) : (
                    pnl.expenses.breakdown?.map((item, idx) => {
                      const amount = item.amount || 0;
                      const pct = pnl.expenses.total > 0 ? (amount / pnl.expenses.total) * 100 : 0;
                      return (
                        <View key={idx} className="space-y-1">
                          <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center gap-1.5 flex-1 mr-2">
                              <Text className="text-zinc-500 text-[10px] font-mono">
                                {item.accountCode || item.code}
                              </Text>
                              <Text className="text-zinc-200 text-xs font-semibold" numberOfLines={1}>
                                {item.name}
                              </Text>
                            </View>
                            <Text className="text-red-300 text-xs font-bold">
                              {fmtPoisha(amount)}
                            </Text>
                          </View>
                          <View className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <View
                              className="bg-red-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </View>
                        </View>
                      );
                    })
                  )}
                </Card>
              </>
            ) : (
              <Card className="p-8 bg-zinc-900 border-zinc-800 items-center">
                <Text className="text-zinc-400 text-xs">Could not load P&L statement.</Text>
              </Card>
            )}
          </View>
        )}

        {/* TAB 2: CASH POSITION */}
        {activeTab === "cash" && (
          <View className="space-y-4">
            {cashLoading ? (
              <Skeleton height={200} borderRadius={16} />
            ) : cash ? (
              <>
                {/* Total Liquidity Banner */}
                <Card className="bg-gradient-to-r from-blue-950/80 to-zinc-900 border-blue-900/60 p-4">
                  <Text className="text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                    Total Liquid Reserves
                  </Text>
                  <Text className="text-white text-3xl font-black mt-1">
                    {fmtPoisha(cash.total)}
                  </Text>
                  <Text className="text-blue-400 text-xs mt-1">
                    As of {cash.asOf ? formatDate(cash.asOf) : "Today"}
                  </Text>
                </Card>

                {/* Account Balances Table */}
                <Card className="bg-zinc-900 border-zinc-800 p-4 space-y-3">
                  <Text className="text-white font-bold text-sm mb-1">
                    Vault, Bank & Mobile Wallets
                  </Text>

                  {cash.accounts?.length === 0 ? (
                    <Text className="text-zinc-500 text-xs py-2 text-center">
                      No liquid accounts found.
                    </Text>
                  ) : (
                    cash.accounts?.map((acc, idx) => {
                      const bal = acc.balance || 0;
                      const pct = cash.total > 0 ? (bal / cash.total) * 100 : 0;
                      return (
                        <View key={idx} className="space-y-1 py-1 border-b border-zinc-800/40">
                          <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center gap-2 flex-1 mr-2">
                              <Badge label={acc.code} variant="info" size="sm" />
                              <Text className="text-white text-xs font-semibold" numberOfLines={1}>
                                {acc.name}
                              </Text>
                            </View>
                            <Text className="text-emerald-400 text-xs font-bold">
                              {fmtPoisha(bal)}
                            </Text>
                          </View>
                          <View className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <View
                              className="bg-blue-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                            />
                          </View>
                        </View>
                      );
                    })
                  )}
                </Card>
              </>
            ) : (
              <Card className="p-8 bg-zinc-900 border-zinc-800 items-center">
                <Text className="text-zinc-400 text-xs">Could not load cash liquidity position.</Text>
              </Card>
            )}
          </View>
        )}

        {/* TAB 3: RECEIVABLES */}
        {activeTab === "receivables" && (
          <View className="space-y-4">
            {recLoading ? (
              <Skeleton height={200} borderRadius={16} />
            ) : receivables ? (
              <>
                {/* Total Outstanding Due */}
                <Card className="bg-gradient-to-r from-amber-950/80 to-zinc-900 border-amber-900/60 p-4">
                  <Text className="text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                    Total Customer Receivables Outstanding
                  </Text>
                  <Text className="text-amber-400 text-3xl font-black mt-1">
                    {fmtPoisha(receivables.totalOutstanding)}
                  </Text>
                  <Text className="text-zinc-400 text-xs mt-1">
                    Pending match booking dues as of {receivables.asOf ? formatDate(receivables.asOf) : "Today"}
                  </Text>
                </Card>

                {/* Outstanding Invoices List */}
                <Card className="bg-zinc-900 border-zinc-800 p-4 space-y-3">
                  <Text className="text-white font-bold text-sm mb-1">
                    Unpaid & Partial Reservations
                  </Text>

                  {receivables.bookings?.length === 0 ? (
                    <Card className="bg-zinc-950 border-zinc-800/80 p-6 items-center border-dashed">
                      <Text className="text-emerald-400 font-bold text-sm">
                        ✓ All Match Bookings Paid in Full
                      </Text>
                      <Text className="text-zinc-500 text-xs mt-1">
                        There are no outstanding customer receivables.
                      </Text>
                    </Card>
                  ) : (
                    receivables.bookings?.map((b, idx) => (
                      <View
                        key={idx}
                        className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl space-y-2 mb-2"
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1 mr-2">
                            <Text className="text-white font-bold text-sm" numberOfLines={1}>
                              {b.customerName}
                            </Text>
                            <Text className="text-zinc-500 text-[10px]">
                              Booking #{b.bookingId?.slice(-6) || idx + 1}
                            </Text>
                          </View>
                          <Badge label="DUE" variant="warning" size="sm" />
                        </View>

                        <View className="flex-row justify-between items-center bg-zinc-900/80 p-2 rounded-lg">
                          <View>
                            <Text className="text-zinc-500 text-[9px] uppercase">Contract</Text>
                            <Text className="text-zinc-300 text-xs font-bold">
                              {fmtPoisha(b.totalPrice)}
                            </Text>
                          </View>
                          <View>
                            <Text className="text-zinc-500 text-[9px] uppercase">Paid</Text>
                            <Text className="text-emerald-400 text-xs font-bold">
                              {fmtPoisha(b.paid)}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text className="text-zinc-500 text-[9px] uppercase">Outstanding</Text>
                            <Text className="text-amber-400 text-xs font-black">
                              {fmtPoisha(b.outstanding)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </Card>
              </>
            ) : (
              <Card className="p-8 bg-zinc-900 border-zinc-800 items-center">
                <Text className="text-zinc-400 text-xs">Could not load receivables report.</Text>
              </Card>
            )}
          </View>
        )}

        {/* TAB 4: PARTNER SHARES */}
        {activeTab === "shares" && (
          <View className="space-y-4">
            {sharesLoading ? (
              <Skeleton height={200} borderRadius={16} />
            ) : partnerShares ? (
              <>
                {/* Net Distributable Profit Banner */}
                <Card className="bg-gradient-to-r from-emerald-950/80 to-zinc-900 border-emerald-900/60 p-4">
                  <Text className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                    Distributable Net Profit ({period.toUpperCase()})
                  </Text>
                  <Text className="text-emerald-400 text-3xl font-black mt-1">
                    {fmtPoisha(partnerShares.netProfit)}
                  </Text>
                  <Text className="text-zinc-400 text-xs mt-1">
                    Divided proportionally according to verified basis points equity
                  </Text>
                </Card>

                {/* Partner Share Cards */}
                <Card className="bg-zinc-900 border-zinc-800 p-4 space-y-3">
                  <Text className="text-white font-bold text-sm mb-1">
                    Partner Distribution Roster
                  </Text>

                  {partnerShares.shares?.length === 0 ? (
                    <Text className="text-zinc-500 text-xs py-3 text-center">
                      No partner equity distributions recorded for this period.
                    </Text>
                  ) : (
                    partnerShares.shares?.map((s, idx) => (
                      <View
                        key={idx}
                        className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl space-y-2 mb-2"
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1 mr-2">
                            <Text className="text-white font-bold text-sm">
                              {s.fullName || s.name || "Partner"}
                            </Text>
                            <Text className="text-emerald-400 text-xs font-semibold">
                              {(s.effectivePct || 0).toFixed(2)}% Equity
                            </Text>
                          </View>
                          <Badge
                            label={s.outstanding > 0 ? "PAYABLE" : "SETTLED"}
                            variant={s.outstanding > 0 ? "warning" : "success"}
                            size="sm"
                          />
                        </View>

                        <View className="flex-row justify-between items-center bg-zinc-900/80 p-2.5 rounded-lg">
                          <View>
                            <Text className="text-zinc-500 text-[9px] uppercase font-bold">Gross Share</Text>
                            <Text className="text-white text-xs font-extrabold">
                              {fmtPoisha(s.grossShare)}
                            </Text>
                          </View>
                          <View>
                            <Text className="text-zinc-500 text-[9px] uppercase font-bold">Paid Out</Text>
                            <Text className="text-zinc-300 text-xs font-bold">
                              {fmtPoisha(s.paidOut)}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text className="text-zinc-500 text-[9px] uppercase font-bold">Net Owed</Text>
                            <Text className="text-amber-400 text-xs font-black">
                              {fmtPoisha(s.outstanding)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </Card>
              </>
            ) : (
              <Card className="p-8 bg-zinc-900 border-zinc-800 items-center">
                <Text className="text-zinc-400 text-xs">Could not load partner distributions.</Text>
              </Card>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
