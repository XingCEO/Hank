"use client";

import Link from "next/link";
import { Instagram, Facebook, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary pt-20 pb-10 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link href="/" className="block">
              <h2 className="font-serif text-3xl tracking-widest text-white">
                AURORA<span className="text-primary">.</span>
              </h2>
            </Link>
            <p className="text-white/40 max-w-sm leading-relaxed">
              Crafting visual legacies for those who refuse to be forgotten. 
              We operate globally, based in Taipei.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs text-primary tracking-[0.2em] uppercase">Studio</h4>
            <nav className="flex flex-col space-y-3">
              <Link href="/portfolio" className="text-white/60 hover:text-white transition-colors">Portfolio</Link>
              <Link href="/services" className="text-white/60 hover:text-white transition-colors">Services</Link>
              <Link href="/booking" className="text-white/60 hover:text-white transition-colors">Booking</Link>
              <Link href="/team" className="text-white/60 hover:text-white transition-colors">The Team</Link>
            </nav>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs text-primary tracking-[0.2em] uppercase">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:bg-white hover:text-obsidian transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:bg-white hover:text-obsidian transition-all">
                <Facebook size={18} />
              </a>
              <a href="mailto:hello@aurora.com" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:bg-white hover:text-obsidian transition-all">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-white/20">
          <p>&copy; {new Date().getFullYear()} Aurora Atelier. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}