import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';

export default function SiteFooter() {
  return (
    <>
      <div className="w-full border-t" style={{ height: 1, borderColor: '#d1d5db' }} />
      <footer className="bg-gray-800 text-white pt-10 pb-6 border-t border-[#0a1a2f]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="  grid md:grid-cols-4 gap-10 text-sm">
            {/* Logo và mô tả */}
            <div className="space-y-3">
              
              <Image src="/logo/logo.png" alt="QUICK Cinemas" width={120} height={40}  className="mx-auto"/>
              <p className="text-gray-400 mx-auto">
                Experience top-notch cinema with QUICK Cinemas – where emotions ignite!
              </p>
            </div>

            {/* Liên hệ */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold mb-2">Contact</h3>
              <p className="flex items-center gap-2 text-gray-400"><Phone size={16} /> 1900 123 456</p>
              <p className="flex items-center gap-2 text-gray-400"><Mail size={16} /> admin@moviebooking.com</p>
              <p className="flex items-center gap-2 text-gray-400"><MapPin size={16} /> 123 Nguyen Hue, Q1, TP.HCM</p>
            </div>

            {/* Thông tin */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold mb-2">Abouts</h3>
              <ul className="space-y-1 text-gray-400">
                <li><a href="/about" className="hover:text-gray-300">About</a></li>
                <li><a href="/about" className="hover:text-gray-300">Terms & Conditions</a></li>
              </ul>
            </div>

            {/* Ứng dụng & Mạng xã hội */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold mb-2">Social Media</h3>
              <div className="flex space-x-4 mt-2">
                <a href="#"><Facebook size={20} className="hover:text-gray-300" /></a>
                <a href="#"><Instagram size={20} className="hover:text-gray-300" /></a>
                <a href="#"><Twitter size={20} className="hover:text-gray-300" /></a>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 mt-8">
            © QUICK Cinemas 2025 – 2030. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
