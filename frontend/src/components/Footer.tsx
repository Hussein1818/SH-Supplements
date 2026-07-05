"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { usePathname } from "next/navigation";
export const Footer = () => {
  const pathname = usePathname();

  const hiddenRoutes = ["/login", "/register", "/forgot-password"];

  const isHidden = hiddenRoutes.some((route) => pathname?.startsWith(route));

  if (isHidden) {
    return null;
  }

  return (
    <footer className="w-full bg-gray-900 text-gray-300 mt-auto pt-16 pb-8 border-t border-gray-800 rounded-t-3xl">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand & About */}
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-white tracking-tight">
              SH<span className="text-[#FF6600]">Supplements</span>
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Fuel your ambition with clinical precision. The premium
              destination for high-performance nutrition and supplements.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-[#FF6600] hover:text-white transition-all"
              ></a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-[#FF6600] hover:text-white transition-all"
              ></a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-[#FF6600] hover:text-white transition-all"
              ></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-5 uppercase text-sm tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <Link
                  href="/products"
                  className="hover:text-[#FF6600] transition-colors"
                >
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="hover:text-[#FF6600] transition-colors"
                >
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/flash-sales"
                  className="hover:text-[#FF6600] transition-colors"
                >
                  Flash Sales
                </Link>
              </li>
              <li></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-5 uppercase text-sm tracking-wider">
              Support
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <li>Contact Us</li>
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-white font-bold mb-5 uppercase text-sm tracking-wider">
              Newsletter
            </h4>
            <p className="text-sm text-gray-400">
              Subscribe to get special offers, free giveaways, and updates.
            </p>
            <div className="flex mt-2 shadow-sm">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-800 text-white px-4 py-3 rounded-l-xl w-full text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6600] border border-gray-700 border-r-0"
              />
              <Button className="bg-[#FF6600] hover:bg-[#E05500] text-white rounded-r-xl rounded-l-none px-5 h-auto font-bold">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-medium">
          <p>
            © {new Date().getFullYear()} SH Supplements. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="hover:text-gray-300 cursor-pointer">
              Privacy Policy
            </span>
            <span>|</span>
            <span className="hover:text-gray-300 cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
