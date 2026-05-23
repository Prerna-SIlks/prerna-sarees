import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1A0A0A] text-[#F5E6C8] border-t border-[#C9A84C]/30 mt-auto pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Top Logo Section */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <span className="font-serif font-bold text-3xl text-[#C9A84C] tracking-[0.15em] uppercase mb-2">Prerna Silks</span>
          <span className="font-serif italic text-[#F5E6C8]/70 text-sm tracking-widest">Weaving Elegance Since Generations</span>
          <div className="h-px w-24 bg-[#C9A84C]/50 mt-6" />
        </div>

        {/* 4 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* About */}
          <div className="space-y-6">
            <h4 className="font-sans font-medium tracking-[0.2em] uppercase text-xs text-[#C9A84C]">About Us</h4>
            <p className="text-[#F5E6C8]/70 text-sm leading-relaxed">
              Authentic, premium sarees straight from the heart of Hubli, Karnataka. Crafted with tradition, draped in elegance.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#C9A84C]/30 flex items-center justify-center hover:bg-[#C9A84C] hover:text-[#1A0A0A] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#C9A84C]/30 flex items-center justify-center hover:bg-[#C9A84C] hover:text-[#1A0A0A] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                <span className="sr-only">Facebook</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#C9A84C]/30 flex items-center justify-center hover:bg-[#C9A84C] hover:text-[#1A0A0A] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.1A1.5 1.5 0 0 1 4 6h16a1.5 1.5 0 0 1 1.5 1.1 16 16 0 0 1 0 9.8A1.5 1.5 0 0 1 20 18H4a1.5 1.5 0 0 1-1.5-1.1 16 16 0 0 1 0-9.8z"/><polygon points="9 15 16 11.5 9 8 9 15"/></svg>
                <span className="sr-only">YouTube</span>
              </a>
              <a href="https://wa.me/918660087544" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#C9A84C]/30 flex items-center justify-center hover:bg-[#C9A84C] hover:text-[#1A0A0A] transition-colors">
                <Phone className="h-4 w-4" />
                <span className="sr-only">WhatsApp</span>
              </a>
            </div>
          </div>
          
          {/* Shop */}
          <div>
            <h4 className="font-sans font-medium tracking-[0.2em] uppercase text-xs text-[#C9A84C] mb-6">Shop</h4>
            <ul className="space-y-4 text-sm text-[#F5E6C8]/70">
              <li><Link href="/products?category=silk-sarees" className="hover:text-[#C9A84C] hover:translate-x-1 inline-block transition-transform">Silk Sarees</Link></li>
              <li><Link href="/products?category=banarasi-sarees" className="hover:text-[#C9A84C] hover:translate-x-1 inline-block transition-transform">Banarasi Sarees</Link></li>
              <li><Link href="/products?category=cotton-sarees" className="hover:text-[#C9A84C] hover:translate-x-1 inline-block transition-transform">Cotton Sarees</Link></li>
              <li><Link href="/products?category=bridal-sarees" className="hover:text-[#C9A84C] hover:translate-x-1 inline-block transition-transform">Bridal Collection</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-sans font-medium tracking-[0.2em] uppercase text-xs text-[#C9A84C] mb-6">Customer Care</h4>
            <ul className="space-y-4 text-sm text-[#F5E6C8]/70">
              <li><Link href="/contact" className="hover:text-[#C9A84C] hover:translate-x-1 inline-block transition-transform">Contact Us</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-[#C9A84C] hover:translate-x-1 inline-block transition-transform">Shipping Policy</Link></li>
              <li><Link href="/returns" className="hover:text-[#C9A84C] hover:translate-x-1 inline-block transition-transform">Returns & Exchanges</Link></li>
              <li><Link href="/faq" className="hover:text-[#C9A84C] hover:translate-x-1 inline-block transition-transform">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="font-sans font-medium tracking-[0.2em] uppercase text-xs text-[#C9A84C] mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-[#F5E6C8]/70 mb-8">
              <li><Link href="/terms" className="hover:text-[#C9A84C] hover:translate-x-1 inline-block transition-transform">Terms & Conditions</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-[#C9A84C] hover:translate-x-1 inline-block transition-transform">Privacy Policy</Link></li>
            </ul>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-[#F5E6C8]/70 text-sm">
                <Mail className="h-4 w-4 text-[#C9A84C]" />
                <a href="mailto:prernasilks@gmail.com" className="hover:text-[#C9A84C] transition-colors">prernasilks@gmail.com</a>
              </div>
              <div className="flex items-start gap-3 text-[#F5E6C8]/70 text-sm">
                <MapPin className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                <a 
                  href="https://maps.google.com/?q=Javali+Sal+Hubli+Karnataka+580020" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[#6B1D1D] font-medium hover:underline cursor-pointer transition-colors"
                >
                  Javali Sal, Hubli, Karnataka - 580020
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#C9A84C]/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <p className="text-xs text-[#F5E6C8]/50 tracking-widest uppercase">
            &copy; 2025 Prerna Silks, Hubli. All rights reserved.
          </p>

          {/* Payment Methods */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#F5E6C8]/50 tracking-widest uppercase mr-2">We Accept:</span>
            <div className="flex gap-2">
              <div className="px-2 py-1 bg-white rounded-sm text-[#1A0A0A] text-[10px] font-bold">VISA</div>
              <div className="px-2 py-1 bg-white rounded-sm text-[#1A0A0A] text-[10px] font-bold">MASTER</div>
              <div className="px-2 py-1 bg-white rounded-sm text-[#1A0A0A] text-[10px] font-bold">UPI</div>
              <div className="px-2 py-1 bg-white rounded-sm text-[#1A0A0A] text-[10px] font-bold">RAZORPAY</div>
              <div className="px-2 py-1 bg-white rounded-sm text-[#1A0A0A] text-[10px] font-bold">COD</div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
