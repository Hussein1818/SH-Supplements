"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Home,
  Grid,
  Calculator,
  User,
  TrendingUp,
  ShoppingBag,
  Dumbbell,
  Settings,
  BadgeCheck,
} from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useCartStore } from "./store/cartStore";
import { useAuthStore } from "./store/authStore";

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Categories", href: "/categories", icon: Grid },
  { name: "BMI Tool", href: "/bmi", icon: Calculator },
  { name: "Verify", href: "/verify", icon: BadgeCheck },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Orders", href: "/orders", icon: ShoppingBag },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
] as const;

const HIDDEN_ROUTES = ["/login", "/register", "/checkout"] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const accessToken = useAuthStore((state) => state.accessToken);

  const cartItems = useCartStore((state) => state.items);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  }, [cartItems]); 
  if ((HIDDEN_ROUTES as readonly string[]).includes(pathname)) {
    return null;
  }

  return (
    <>
      <nav
        dir="ltr"
        className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-100/80 shadow-[0_1px_12px_rgba(0,68,204,0.06)]"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-[62px] gap-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-extrabold text-[#0044CC]"
          >
            <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#0044CC]">
              <Dumbbell className="h-4 w-4 text-white rotate-[-45deg]" />
            </span>
            <span className="hidden sm:inline">SH-Supplements</span>
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                placeholder="Search supplements..."
                className="pl-10 h-10 bg-[#F4F4F5] border-none rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold bg-[#0044CC] text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>

            {accessToken ? (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="hidden sm:flex"
              >
                <Link href="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                className="hidden sm:flex rounded-xl bg-[#0044CC]"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay & Menu */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="fixed top-0 right-0 h-full w-72 z-[60] bg-[#0044CC] text-white p-6 shadow-2xl">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X />
            </Button>
            <nav className="mt-12 space-y-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-xl"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
