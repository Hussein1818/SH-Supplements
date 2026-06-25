"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav
      className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50 w-full select-none"
      dir="ltr"
    >
      {/* 1. Logo */}
      <div className="flex items-center">
        <Link
          href="/"
          className="font-bold text-xl text-[#0044CC] tracking-tight flex items-center gap-1"
        >
          SH-Supplements
          
        </Link>
      </div>

      {/* 2. right side of the navbar */}
      <div className="flex items-center gap-4 flex-1 justify-end max-w-xl md:max-w-2xl">
        {/* search bar */}
        <div className="relative w-full max-w-xs md:max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search supplements, brands..."
            className="pl-10 w-full bg-[#F4F4F5] border-none focus-visible:ring-1 focus-visible:ring-[#0044CC] h-9 text-sm"
          />
        </div>

        {/*Cart*/}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-700 hover:bg-gray-100 h-9 w-9 rounded-md"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute top-1 right-1 bg-[#0044CC] text-white rounded-full text-[10px] h-4 w-4 flex items-center justify-center font-bold">
            0
          </span>
        </Button>

        <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity shrink-0">
          <Image
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTIwIDUuNzVDMjAgNS43NSAyMCA1Ljc1IDIwIDUuNzVDMjAgNS43NSAyMCA1Ljc1IDIwIDUuNzVDMjAgNS43NSAyMCA1Ljc1IDIwIDUuNzVDMjAgNS43NSAyMCA1Ljc1IDIwIDUuNzVDMjAgNS43NSAyMCA1Ljc1IDIwIDUuNzVDMjAgNS43NSAyMCA1Ljc1IDIwIDUuNzVDMjAgNS43NSAyMCA1Ljc1IDIwIDUuNzVDMjAgNS43NSAyMCA1Ljc1IDIwIDUuNzVDMjAgNS43NSAyMCAAxMC4yNUwyMCwxMC4yNUwyMCwxMC4yNUwyMCwxMC4yNUwyMCwxMC4yNUwyMCwxMC4yNUwyMCwxMC4yNUwyMCwxMC4yNUwyMCwxMC4yNUwyMCwxMC4yNUwyMCwxMC4yNUwyMCwxMC4yNUwyMCwxMC4yNUwyMCwxMC4yNUwyMCwxMC4yNUwyMCwxMC4yNUwyMCwx MC8+PC9zdmc+"
            alt="User Profile"
            width={36}
            height={36}
            className="object-cover"
          />
        </div>
      </div>
    </nav>
  );
}
