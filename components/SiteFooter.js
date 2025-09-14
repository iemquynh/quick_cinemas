import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="bg-[#1f2a40] text-white pt-12 pb-8 border-t border-[#1a2a4f]">
  <div className="max-w-7xl mx-auto px-6 md:px-12">
    <div className="grid grid-cols-12 gap-8">

      {/* Logo + mô tả (chiếm 4 cột) */}
      <div className="col-span-12 md:col-span-4 flex flex-col items-center md:items-start space-y-4">
        <Image
          src="/logo/logo.png"
          alt="QUICK Cinemas"
          width={140}
          height={50}
          className="object-contain"
        />
        <p className="text-gray-400 max-w-sm text-center md:text-left leading-relaxed">
          Experience top-notch cinema with QUICK Cinemas – where emotions ignite!
        </p>
      </div>

      {/* Contact (3 cột) */}
      <div className="col-span-12 md:col-span-3 space-y-4">
        <h3 className="font-semibold text-lg border-b border-gray-600 pb-2">Contact</h3>
        <p className="flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer transition">
          <Phone size={20} />
          1900 123 456
        </p>
        <p className="flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer transition">
          <Mail size={20} />
          admin@moviebooking.com
        </p>
        <p className="flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer transition">
          <MapPin size={20} />
          123 Nguyen Hue, Q1, TP.HCM
        </p>
      </div>

      {/* About (2 cột) */}
      <div className="col-span-12 md:col-span-2 space-y-4">
        <h3 className="font-semibold text-lg border-b border-gray-600 pb-2">Abouts</h3>
        <ul className="space-y-2 text-gray-400">
          <li>
            <Link href="/abouts" className="hover:text-white transition">
              About
            </Link>
          </li>
          <li>
            <Link href="/abouts" className="hover:text-white transition">
              Terms & Conditions
            </Link>
          </li>
        </ul>
      </div>

      {/* Social Media (3 cột) */}
      <div className="col-span-12 md:col-span-3 space-y-4">
        <h3 className="font-semibold text-lg border-b border-gray-600 pb-2">Social Media</h3>
        <div className="flex space-x-6">
          <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-blue-600 transition">
            <Facebook size={26} />
          </a>
          <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-pink-500 transition">
            <Instagram size={26} />
          </a>
          <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-sky-400 transition">
            <Twitter size={26} />
          </a>
        </div>
      </div>
    </div>

    <div className="text-center text-xs text-gray-500 mt-10">
      © QUICK Cinemas 2025 – 2030. All rights reserved.
    </div>
  </div>
</footer>


  );
}
