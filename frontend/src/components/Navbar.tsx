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
  Dumbbell,
  Settings,
  BadgeCheck,
} from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useCartStore } from "./store/cartStore";
import { useAuthStore } from "./store/authStore";
import { cn } from "@/src/lib/utils";

// ─── Navigation Items ────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Read Zustand stores (called unconditionally to satisfy Rules of Hooks)
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const accessToken = useAuthStore((state) => state.accessToken);

  // ── Hydration guard: render nothing until client has mounted ─────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Lock body scroll while sidebar is open ───────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen, mounted]);

  // ── Auto-close sidebar on route change ───────────────────────────────────
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // ── Keyboard shortcuts: Escape → close sidebar, Ctrl+K → focus search ───
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSidebarOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // ── Hide on auth/checkout routes and before hydration ────────────────────
  if (!mounted || (HIDDEN_ROUTES as readonly string[]).includes(pathname)) {
    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          TOP NAVBAR
      ═══════════════════════════════════════════════════════════════════ */}
      <nav
        dir="ltr"
        aria-label="Main navigation"
        className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-100/80 shadow-[0_1px_12px_rgba(0,68,204,0.06)] select-none"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-[62px] gap-3">
          {/* ── Left: Brand ───────────────────────────────────────────── */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              aria-label="SH-Supplements home"
              className="group flex items-center gap-2 font-extrabold text-[1.1rem] text-[#0044CC] tracking-tight transition-opacity hover:opacity-80"
            >
              <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#0044CC] shadow-md shadow-blue-300/40 group-hover:shadow-blue-400/60 transition-shadow duration-300">
                <Dumbbell className="h-4 w-4 text-white rotate-[-45deg]" />
              </span>
              {/* `xs` breakpoint doesn't exist in Tailwind — use `sm` */}
              <span className="hidden sm:inline">SH-Supplements</span>
            </Link>
          </div>

          {/* ── Center: Search bar (desktop only) ─────────────────────── */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <div className="relative w-full group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-[#0044CC]"
                aria-hidden="true"
              />
              <Input
                ref={searchInputRef}
                type="search"
                id="navbar-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search supplements, brands…"
                aria-label="Search supplements"
                className="
                  pl-10 pr-12 w-full h-10 text-sm
                  bg-[#F4F4F5] border border-transparent rounded-xl
                  placeholder:text-gray-400
                  transition-all duration-200
                  focus-visible:ring-2 focus-visible:ring-[#0044CC]/40
                  focus-visible:border-[#0044CC]/30
                  focus-visible:bg-white
                "
              />
            </div>
          </div>

          {/* ── Right: Actions ────────────────────────────────────────── */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              aria-label={`Cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
              className="relative h-10 w-10 rounded-full text-gray-600 hover:bg-blue-50 hover:text-[#0044CC] transition-colors"
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="
          absolute -top-0.5 -right-0.5
          flex items-center justify-center
          h-[18px] min-w-[18px] px-1
          rounded-full text-[10px] font-bold
          bg-[#0044CC] text-white ring-2 ring-white
          animate-[badge-pop_0.25s_ease-out]
        "
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* Profile / Sign-in */}
            {accessToken ? (
              <Button
                variant="ghost"
                size="icon"
                asChild
                aria-label="Your profile"
                className="hidden sm:flex h-10 w-10 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-[#0044CC] transition-colors"
              >
                <Link href="/profile">
                  <User className="h-5 w-5 text-gray-600" />
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                aria-label="Sign in"
                className="hidden sm:flex rounded-xl bg-[#0044CC] text-white hover:bg-blue-700 font-semibold px-4 shadow-sm shadow-blue-300/40 hover:shadow-blue-400/50 transition-all duration-200"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            )}

            {/* Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation menu"
              aria-expanded={isSidebarOpen}
              aria-controls="sidebar-drawer"
              onClick={() => setIsSidebarOpen(true)}
              className="h-10 w-10 rounded-full text-gray-700 hover:bg-blue-50 hover:text-[#0044CC] transition-colors"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════
          BACKDROP OVERLAY
          Always in DOM — toggled via opacity + pointer-events (no flicker)
      ═══════════════════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        onClick={() => setIsSidebarOpen(false)}
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          SIDEBAR DRAWER  —  slides in from the RIGHT
          Hardware-accelerated: translate-x-full ↔ translate-x-0
      ═══════════════════════════════════════════════════════════════════ */}
      <aside
        id="sidebar-drawer"
        dir="ltr"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation drawer"
        className={cn(
          "fixed top-0 right-0 h-full w-72 z-[60]",
          "bg-[#0044CC] text-white flex flex-col",
          "shadow-[-8px_0_40px_rgba(0,0,0,0.25)]",
          "will-change-transform transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Decorative gradient accent */}
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-full h-48 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"
        />

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="relative flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/10">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
              {/* bg-white/10 instead of bg-white/15 (safer Tailwind step) */}
              <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/10">
                <Dumbbell className="h-4 w-4 text-white rotate-[-45deg]" />
              </span>
              SH-Supplements
            </div>
            <p className="text-[11px] text-blue-200/70 font-medium pl-10 tracking-widest uppercase">
              Elite Performance
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Close navigation menu"
            onClick={() => setIsSidebarOpen(false)}
            className="h-9 w-9 rounded-full text-blue-200 hover:bg-white/10 hover:text-white transition-colors -mr-1"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* ── Navigation Links ──────────────────────────────────────── */}
        <nav
          aria-label="Sidebar navigation"
          className="relative flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-0.5"
        >
          {NAV_ITEMS.map(({ name, href, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={name}
                href={href}
                onClick={() => setIsSidebarOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium",
                  "transition-all duration-200 ease-out overflow-hidden",
                  "text-blue-100 hover:bg-white/10 hover:text-white",
                  isActive && "bg-white/[0.12] text-white font-semibold",
                )}
              >
                {/* Orange left border for active item */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-0 top-2 bottom-2 w-[4px] rounded-r-md bg-[#FF6600]",
                    "transition-all duration-200",
                    isActive
                      ? "opacity-100 scale-y-100"
                      : "opacity-0 scale-y-0",
                  )}
                />

                <Icon
                  className={cn(
                    "h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-white" : "text-blue-300",
                  )}
                />

                <span className="truncate">{name}</span>

                {/* Inline cart count badge */}
                {name === "Cart" && cartCount > 0 && (
                  <span className="ml-auto flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-bold bg-[#FF6600] text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <div className="relative px-6 py-5 border-t border-white/10 flex items-center justify-between">
          <p className="text-[10px] text-blue-200/50 tracking-wide">
            © 2026 SH-Supplements
          </p>
          <span className="text-[10px] text-blue-200/40 font-mono">v1.0</span>
        </div>
      </aside>
    </>
  );
}
