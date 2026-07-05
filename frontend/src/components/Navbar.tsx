"use client";

import { useState, useEffect, useRef } from "react";
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
  Zap,
  Settings,
  BadgeCheck,
  Leaf,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useCartStore } from "./store/cartStore";
import { useAuthStore } from "./store/authStore";
import { cn } from "@/src/lib/utils";

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Categories", href: "/categories", icon: Grid },
  { name: "Products", href: "/products", icon: ShoppingBag },
  { name: "Verify", href: "/verify", icon: BadgeCheck },
  { name: "Flash Deals", href: "/flash-sales", icon: Zap },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "BMI Tool", href: "/bmi", icon: Calculator },
  { name: "Settings", href: "/settings", icon: Settings },
] as const;

const HIDDEN_ROUTES = ["/login", "/register", "/checkout"] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const accessToken = useAuthStore((state) => state.accessToken);
  const cartItems = useCartStore((state) => state.items);
  const [cartCount, setCartCount] = useState(0);
  const [prevCount, setPrevCount] = useState(0);
  const [badgeAnimate, setBadgeAnimate] = useState(false);

  // Cart count sync
  useEffect(() => {
    const count = cartItems.reduce((t, i) => t + i.quantity, 0);
    if (count !== prevCount) {
      setCartCount(count);
      setPrevCount(count);
      if (count > 0) {
        setBadgeAnimate(true);
        const t = setTimeout(() => setBadgeAnimate(false), 400);
        return () => clearTimeout(t);
      }
    }
  }, [cartItems, prevCount]);

  // Scroll detection
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Trap scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isSidebarOpen]);

  if ((HIDDEN_ROUTES as readonly string[]).includes(pathname)) return null;

  return (
    <>
      {/* ── Navigation Bar ─────────────────────────────────────────────── */}
      <nav
        dir="ltr"
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          "sticky top-0 z-40 w-full",
          "transition-all duration-300",
          isScrolled
            ? "glass border-b border-stone-200/60 shadow-[0_1px_16px_rgba(0,0,0,0.06)]"
            : "bg-white/95 backdrop-blur-sm border-b border-stone-100"
        )}
      >
        <div className="container-xl flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group flex-shrink-0"
            aria-label="SH Supplements home"
          >
            <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-600 shadow-sm group-hover:bg-emerald-700 transition-colors duration-200">
              <Leaf className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-bold text-stone-900 text-sm tracking-tight">
                SH<span className="text-emerald-600">Supplements</span>
              </span>
              <span className="text-[10px] text-stone-400 font-medium tracking-widest uppercase">
                Premium Nutrition
              </span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <div className="relative w-full group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 group-focus-within:text-emerald-600 transition-colors"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Search supplements..."
                aria-label="Search supplements"
                className={cn(
                  "w-full h-9 pl-9 pr-4",
                  "text-sm text-stone-800 placeholder:text-stone-400",
                  "bg-stone-100 rounded-xl border border-transparent",
                  "transition-all duration-200",
                  "focus:outline-none focus:bg-white focus:border-stone-200 focus:ring-2 focus:ring-emerald-500/20",
                  "hover:bg-stone-50"
                )}
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/cart" aria-label={`Cart, ${cartCount} items`}>
                <ShoppingCart className="h-4.5 w-4.5" aria-hidden="true" />
                {cartCount > 0 && (
                  <span
                    key={cartCount}
                    className={cn(
                      "absolute -top-0.5 -right-0.5",
                      "flex items-center justify-center",
                      "h-4.5 w-4.5 min-w-[18px] px-1",
                      "rounded-full text-[10px] font-bold",
                      "bg-orange-500 text-white",
                      badgeAnimate && "animate-badge-pop"
                    )}
                    aria-live="polite"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* Auth */}
            {accessToken ? (
              <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
                <Link href="/profile" aria-label="Your profile">
                  <User className="h-4.5 w-4.5" aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="primary"
                size="sm"
                className="hidden sm:flex"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            )}

            {/* Menu */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
              aria-expanded={isSidebarOpen}
              aria-controls="main-sidebar"
            >
              <Menu className="h-4.5 w-4.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Sidebar Overlay ─────────────────────────────────────────────── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
          style={{
            animation: "fade-in 0.2s ease both",
          }}
        />
      )}

      {/* ── Sidebar Panel ───────────────────────────────────────────────── */}
      <aside
        id="main-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        dir="ltr"
        className={cn(
          "fixed top-0 right-0 h-full w-72 z-[60]",
          "bg-stone-900 text-white",
          "flex flex-col",
          "shadow-2xl",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Leaf className="h-3.5 w-3.5 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-sm">
              SH<span className="text-emerald-400">Supplements</span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search supplements..."
              aria-label="Search supplements"
              className="w-full h-9 pl-9 pr-4 text-sm bg-white/10 text-white placeholder:text-stone-400 rounded-xl border border-white/10 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3" aria-label="Sidebar navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5",
                  "text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-stone-300 hover:bg-white/8 hover:text-white"
                )}
                onClick={() => setIsSidebarOpen(false)}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon
                  className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-white" : "text-stone-400")}
                  aria-hidden="true"
                />
                {item.name}
                {item.name === "Cart" && cartCount > 0 && (
                  <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-5 border-t border-white/10">
          {accessToken ? (
            <Link
              href="/profile"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/8 transition-colors group"
              onClick={() => setIsSidebarOpen(false)}
            >
              <div className="h-8 w-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">My Account</p>
                <p className="text-xs text-stone-400">View profile</p>
              </div>
            </Link>
          ) : (
            <div className="space-y-2">
              <Button asChild variant="primary" className="w-full" size="sm">
                <Link href="/login" onClick={() => setIsSidebarOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full text-stone-300 hover:text-white hover:bg-white/10" size="sm">
                <Link href="/register" onClick={() => setIsSidebarOpen(false)}>
                  Create account
                </Link>
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
