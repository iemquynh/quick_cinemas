export default function SiteFooter({marginBottom = 50}) {
  return (
    <div className="bg-[#07162a] text-white pt-8 pb-4 border-t border-[#0a1a2f]" style={{ marginBottom }}>
      {/* Dòng kẻ trên cùng */}
      <div className="w-full border-t" style={{height: 1, marginBottom: 24, borderColor: '#d1d5db'}} />
      <div className="flex justify-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-16 text-sm ">
          <div>
            <ul className="space-y-1 ">
              <li><a href='#' className='transition-colors hover:text-[#d1d5db]'>Cookie Policy</a></li>
              <li><a href='#'className='transition-colors hover:text-[#d1d5db]'>Privacy and Legal</a></li>
              <li><a href='#' className='transition-colors hover:text-[#d1d5db]'>Corporate Responsibility</a></li>
              <li><a href='#' className='transition-colors hover:text-[#d1d5db]'>Modern Slavery Statement</a></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-1">
              <li><a href='#' className='transition-colors hover:text-[#d1d5db]'>Contact Us</a></li>
              <li><a href='#' className='transition-colors hover:text-[#d1d5db]'>Help</a></li>
              <li><a href='#' className='transition-colors hover:text-[#d1d5db]'>Accessibility</a></li>
              <li><a href='#' className='transition-colors hover:text-[#d1d5db]'>Allergens</a></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-1">
              <li><a href='#' className='transition-colors hover:text-[#d1d5db]'>About us</a></li>
              <li><a href='#' className='transition-colors hover:text-[#d1d5db]'>Careers</a></li>
              <li><a href='#' className='transition-colors hover:text-[#d1d5db]'>Corporate Events</a></li>
              <li><a href='#' className='transition-colors hover:text-[#d1d5db]'>ODEON Scene</a></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-1">
              <li><a href='#' className='transition-colors hover:text-[#d1d5db]'>iOS App</a></li>
              <li><a href='#' className='transition-colors hover:text-[#d1d5db]'>Android App</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-[#0a1a2f] mt-6 pt-4 text-center text-xs text-gray-300 mb-8 md:mb-2">
        © QUICK Cinemas Limited 2025 to 2030. All rights reserved
      </div>
    </div>
  );
} 