"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  User as UserIcon,
  Search,
  Mail,
  Phone,
  Wallet,
  Target,
  ShieldCheck,
  Eye,
  MapPin,
  Activity,
  Calendar,
} from "lucide-react";
import { api } from "@/src/components/auth/axiosInstance";
import { PageHeader } from "@/src/components/admin/PageHeader";
import { DataTable, Column } from "@/src/components/admin/DataTable";
import { SearchBar } from "@/src/components/admin/SearchBar";
import { FormDialog } from "@/src/components/admin/FormDialog";
import { LoadingSkeleton } from "@/src/components/admin/LoadingSkeleton";
import { ErrorState } from "@/src/components/admin/ErrorState";
import { Button } from "@/src/components/ui/button";
import { formatPrice, normalizeImageUrl } from "@/src/lib/utils";

interface Address {
  id?: string;
  street: string;
  city: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
}

interface UserData {
  id: string | number;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  age?: number;
  weight?: number;
  height?: number;
  goal?: number;
  medicalConditions?: string | null;
  walletBalance?: number;
  addresses?: Address[];
  profileImageUrl?: string | null;
  ProfileImageUrl?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
}

const goalMap: Record<number, { label: string; color: string }> = {
  1: { label: "Muscle Gain", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  2: { label: "Fat Loss", color: "bg-orange-50 text-orange-700 border-orange-200" },
  3: { label: "Endurance", color: "bg-blue-50 text-blue-700 border-blue-200" },
  4: { label: "Maintenance", color: "bg-purple-50 text-purple-700 border-purple-200" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/User/all");
      const data = Array.isArray(res.data) ? res.data : res.data.users || res.data.data || [];
      setUsers(data);
    } catch (err: any) {
      console.error("Failed to load users:", err);
      if (err.response?.status === 404) {
        setError("GET /User/all endpoint was not found on the backend server.");
      } else {
        setError(
          err.response?.data?.Message ||
            err.response?.data?.message ||
            "Could not retrieve registered user profiles from server."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getUserName = (u: UserData) => {
    const full = `${u.firstName || ""} ${u.lastName || ""}`.trim();
    if (full) return full;
    if (u.username) return u.username;
    if (u.email) return u.email.split("@")[0];
    return `User #${u.id}`;
  };

  const getInitials = (u: UserData) => {
    if (u.firstName && u.lastName) {
      return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
    }
    const name = getUserName(u);
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarUrl = (u: UserData) => {
    return u.profileImageUrl || u.ProfileImageUrl || u.avatarUrl || null;
  };

  const filteredUsers = users.filter((u) => {
    const name = getUserName(u).toLowerCase();
    const email = (u.email || "").toLowerCase();
    const phone = (u.phoneNumber || "").toLowerCase();
    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery.toLowerCase()) ||
      String(u.id).includes(searchQuery);

    const role = (u.role || "Customer").toLowerCase();
    const matchesRole =
      roleFilter === "All" ||
      (roleFilter === "Admin" && role.includes("admin")) ||
      (roleFilter === "Customer" && !role.includes("admin"));

    return matchesSearch && matchesRole;
  });

  const columns: Column<UserData>[] = [
    {
      header: "User / Customer",
      accessorKey: "firstName",
      cell: (u) => {
        const avatar = getAvatarUrl(u);
        const name = getUserName(u);
        const initials = getInitials(u);
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center border border-stone-200 bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-extrabold text-sm shadow-sm">
              {avatar ? (
                <img
                  src={normalizeImageUrl(avatar)}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-stone-900 text-sm">{name}</span>
              <span className="text-xs text-stone-400 font-medium font-mono">
                {u.email || u.username || `ID: #${u.id}`}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Contact Phone",
      cell: (u) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
          <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          {u.phoneNumber || "—"}
        </div>
      ),
    },
    {
      header: "Wallet Balance",
      cell: (u) => (
        <span className="inline-flex items-center gap-1 font-extrabold text-stone-900 text-sm bg-stone-100 px-3 py-1 rounded-xl border border-stone-200">
          <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          {formatPrice(u.walletBalance || 0)}
        </span>
      ),
    },
    {
      header: "Fitness Goal",
      cell: (u) => {
        const goalInfo = u.goal && goalMap[u.goal] ? goalMap[u.goal] : null;
        return goalInfo ? (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${goalInfo.color}`}>
            <Target className="w-3.5 h-3.5 shrink-0" /> {goalInfo.label}
          </span>
        ) : (
          <span className="text-xs text-stone-400 font-medium">Unspecified</span>
        );
      },
    },
    {
      header: "Role",
      cell: (u) => {
        const isAdmin = u.role?.toLowerCase().includes("admin");
        return isAdmin ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Admin
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200">
            <UserIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Customer
          </span>
        );
      },
    },
    {
      header: "Actions",
      cell: (u) => (
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setSelectedUser(u)}
            title="View User Profile Details"
            className="rounded-lg text-stone-700 hover:text-emerald-600 gap-1 font-semibold"
          >
            <Eye className="w-3.5 h-3.5" /> Details
          </Button>
        </div>
      ),
      className: "text-right w-28",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Users & Customers"
        subtitle="View registered accounts, customer profiles, wallet balances, and fitness goals."
      />

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, email, phone, or ID..."
            className="max-w-md"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="All">All Roles</option>
            <option value="Customer">Customers Only</option>
            <option value="Admin">Admins Only</option>
          </select>

          <span className="text-xs font-semibold text-stone-500">
            Total: <strong className="text-stone-900">{filteredUsers.length}</strong>
          </span>
        </div>
      </div>

      {/* Content Table */}
      {isLoading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          keyExtractor={(item) => String(item.id)}
          emptyMessage={
            searchQuery || roleFilter !== "All"
              ? "No users match the selected search or filter criteria."
              : "No user accounts registered yet."
          }
        />
      )}

      {/* User Details Dialog */}
      <FormDialog
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={selectedUser ? `User Profile — ${getUserName(selectedUser)}` : "User Details"}
        description="Comprehensive overview of customer biometrics, wallet balance, and shipping addresses."
        maxWidth="lg"
      >
        {selectedUser && (
          <div className="space-y-6 pt-2">
            {/* Header info card */}
            <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 flex items-center justify-center border-2 border-white bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xl shadow-md">
                {getAvatarUrl(selectedUser) ? (
                  <img
                    src={normalizeImageUrl(getAvatarUrl(selectedUser)!)}
                    alt={getUserName(selectedUser)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getInitials(selectedUser)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-extrabold text-stone-900 text-lg truncate">
                    {getUserName(selectedUser)}
                  </h4>
                  {selectedUser.role?.toLowerCase().includes("admin") ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-700 uppercase">
                      Admin
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-700">
                      Customer
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 font-mono mt-0.5 truncate">
                  {selectedUser.email || selectedUser.username || "No email recorded"}
                </p>
                <p className="text-xs text-stone-600 font-semibold mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-stone-400" />{" "}
                  {selectedUser.phoneNumber || "No phone recorded"}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Wallet
                </span>
                <span className="text-lg font-black text-emerald-600">
                  {formatPrice(selectedUser.walletBalance || 0)}
                </span>
              </div>
            </div>

            {/* Biometrics & Goal Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col">
                <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
                  Age
                </span>
                <span className="text-base font-black text-stone-800 mt-1">
                  {selectedUser.age ? `${selectedUser.age} yrs` : "—"}
                </span>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col">
                <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
                  Weight
                </span>
                <span className="text-base font-black text-stone-800 mt-1">
                  {selectedUser.weight ? `${selectedUser.weight} kg` : "—"}
                </span>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col">
                <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
                  Height
                </span>
                <span className="text-base font-black text-stone-800 mt-1">
                  {selectedUser.height ? `${selectedUser.height} cm` : "—"}
                </span>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col">
                <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
                  Fitness Goal
                </span>
                <span className="text-sm font-black text-emerald-700 mt-1 truncate">
                  {selectedUser.goal && goalMap[selectedUser.goal]
                    ? goalMap[selectedUser.goal].label
                    : "Unspecified"}
                </span>
              </div>
            </div>

            {/* Medical Conditions */}
            {selectedUser.medicalConditions && (
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-amber-600" /> Medical Conditions & Dietary Notes
                </div>
                <p className="text-xs text-amber-900 font-medium leading-relaxed">
                  {selectedUser.medicalConditions}
                </p>
              </div>
            )}

            {/* Saved Addresses */}
            <div className="space-y-3">
              <h5 className="font-bold text-stone-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" /> Saved Shipping Addresses (
                {selectedUser.addresses?.length || 0})
              </h5>
              {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                  {selectedUser.addresses.map((addr, idx) => (
                    <div
                      key={addr.id || idx}
                      className="p-3 rounded-xl border border-stone-200 bg-white text-xs space-y-1 relative"
                    >
                      {addr.isDefault && (
                        <span className="absolute top-2.5 right-2.5 text-[9px] font-extrabold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                          Default
                        </span>
                      )}
                      <p className="font-bold text-stone-800 truncate pr-12">{addr.street}</p>
                      <p className="text-stone-500">
                        {addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.zipCode || ""}
                      </p>
                      <p className="text-stone-400 font-medium uppercase text-[10px]">
                        {addr.country || "Egypt"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center rounded-xl bg-stone-50 border border-dashed border-stone-200 text-stone-400 text-xs font-medium">
                  No saved shipping addresses found for this user account.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedUser(null)}
                className="rounded-xl font-bold px-6"
              >
                Close Details
              </Button>
            </div>
          </div>
        )}
      </FormDialog>
    </div>
  );
}
