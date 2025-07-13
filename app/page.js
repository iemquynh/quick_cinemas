"use client";
import Header from '../components/Header'
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <div className="min-h-full">
        <Header />

        <main className="overflow-auto" style={{ marginTop: '4rem', maxHeight: 'calc(100vh - 4rem)' }}>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0.2) 0%, rgba(173,176,181,0.8) 100%)' }}>
            <div className="carousel w-full">
              <div id="slide1" className="carousel-item relative w-full">
                <img
                  src="https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp"
                  className="w-full" />
                <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                  <a href="#slide4" className="btn btn-circle">❮</a>
                  <a href="#slide2" className="btn btn-circle">❯</a>
                </div>
              </div>
              <div id="slide2" className="carousel-item relative w-full">
                <img
                  src="https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp"
                  className="w-full" />
                <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                  <a href="#slide1" className="btn btn-circle">❮</a>
                  <a href="#slide3" className="btn btn-circle">❯</a>
                </div>
              </div>
              <div id="slide3" className="carousel-item relative w-full">
                <img
                  src="https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp"
                  className="w-full" />
                <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                  <a href="#slide2" className="btn btn-circle">❮</a>
                  <a href="#slide4" className="btn btn-circle">❯</a>
                </div>
              </div>
              <div id="slide4" className="carousel-item relative w-full">
                <img
                  src="https://img.daisyui.com/images/stock/photo-1665553365602-b2fb8e5d1707.webp"
                  className="w-full" />
                <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                  <a href="#slide3" className="btn btn-circle">❮</a>
                  <a href="#slide1" className="btn btn-circle">❯</a>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full bg-[#0a1a2f] py-8">
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-3xl font-bold text-white tracking-widest text-center">TOP FILMS</h2>
              <div className="w-24 h-1 bg-[#4fd1ff] mt-2 rounded"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              {/* Film Card 1 */}
              <div className="relative w-48">
                <img
                  src="https://innovavietnam.vn/wp-content/uploads/poster-561x800.jpg"
                  alt="Final Destination: Bloodlines"
                  className="rounded-lg w-full aspect-[2/3] object-cover shadow-lg"
                />
                {/* Play icon */}
                <button className="absolute top-2 left-2 bg-blue-500 rounded-tr-lg rounded-bl-lg p-1">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="white"><polygon points="5,3 17,10 5,17"/></svg>
                </button>
                {/* Bookmark icon */}
                <button className="absolute top-2 right-2 bg-white/80 rounded p-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2"><path d="M6 4v16l6-5.333L18 20V4z"/></svg>
                </button>
                <div className="mt-3 text-white font-extrabold text-lg text-center tracking-wide leading-tight">
                  MẮT BIẾC
                </div>
              </div>
              {/* Film Card 2 */}
              <div className="relative w-48">
                <img
                  src="https://cdn2.tuoitre.vn/thumb_w/480/2022/12/3/nbnteaser-posterfb-16700503265491078250905.jpg"
                  alt="Mission: Impossible - The Final Reckoning"
                  className="rounded-lg w-full aspect-[2/3] object-cover shadow-lg"
                />
                <button className="absolute top-2 left-2 bg-blue-500 rounded-tr-lg rounded-bl-lg p-1">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="white"><polygon points="5,3 17,10 5,17"/></svg>
                </button>
                <button className="absolute top-2 right-2 bg-white/80 rounded p-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2"><path d="M6 4v16l6-5.333L18 20V4z"/></svg>
                </button>
                <div className="mt-3 text-white font-extrabold text-lg text-center tracking-wide leading-tight">
                  NHÀ BÀ NỮ
                </div>
              </div>
              {/* Film Card 3 */}
              <div className="relative w-48">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgU1PULkVO7OcB4tLhyhMfUT52IXOGYDVNDw&s"
                  alt="Thunderbolts"
                  className="rounded-lg w-full aspect-[2/3] object-cover shadow-lg"
                />
                <button className="absolute top-2 left-2 bg-blue-500 rounded-tr-lg rounded-bl-lg p-1">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="white"><polygon points="5,3 17,10 5,17"/></svg>
                </button>
                <button className="absolute top-2 right-2 bg-white/80 rounded p-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2"><path d="M6 4v16l6-5.333L18 20V4z"/></svg>
                </button>
                <div className="mt-3 text-white font-extrabold text-lg text-center tracking-wide leading-tight">
                  BỐ GIÀ
                </div>
              </div>
              {/* Film Card 4 */}
              <div className="relative w-48">
                <img
                  src="https://vntravel.org.vn/uploads/images/2024/02/20/poster-mai-scaled-1708403724.jpg"
                  alt="Lilo & Stitch"
                  className="rounded-lg w-full aspect-[2/3] object-cover shadow-lg"
                />
                <button className="absolute top-2 left-2 bg-blue-500 rounded-tr-lg rounded-bl-lg p-1">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="white"><polygon points="5,3 17,10 5,17"/></svg>
                </button>
                <button className="absolute top-2 right-2 bg-white/80 rounded p-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2"><path d="M6 4v16l6-5.333L18 20V4z"/></svg>
                </button>
                <div className="mt-3 text-white font-extrabold text-lg text-center tracking-wide leading-tight">
                  MAI
                </div>
              </div>
            </div>
          </div>

          <div className="w-full bg-[#0a1a2f] py-8">
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-3xl font-bold text-white tracking-widest text-center">BOOK TICKETS</h2>
              <div className="w-24 h-1 bg-[#4fd1ff] mt-2 rounded"></div>
            </div>

            <div className="carousel rounded-box w-full h-[320px] md:h-[400px] overflow-hidden bg-black">
              {/* {banners.map((banner, idx) => ( */}
                <div id='item1' className="carousel-item relative w-full">
                  {/* Overlay gradient từ phải sang trái */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to left, rgba(0,0,0,0) 60%, rgba(20,30,50,0.85) 100%)'
                    }}
                  />
                  {/* Ảnh căn phải */}
                  <div className="absolute inset-0 flex justify-end items-center">
                    <img
                      src="https://insieutoc.vn/wp-content/uploads/2021/02/poster-ngang.jpg"
                      alt="#"
                      className="h-full object-contain bg-black"
                      style={{ maxWidth: '100%' }}
                    />
                  </div>
                  {/* Nội dung chữ nổi responsive */}
                  <div
                    className={`
                      w-full
                      md:absolute md:top-0 md:left-0 md:h-full
                      flex flex-col justify-center
                      px-4 py-4
                      md:pl-8 md:pr-8 md:py-0 md:pl-16 md:pr-0
                      z-10
                      md:max-w-[40%]
                      bg-gradient-to-t from-black/80 via-black/40 to-transparent
                      md:bg-none
                      text-center md:text-left
                      items-center md:items-start
                      mt-0 md:mt-0
                    `}
                  >
                    <h2 className="text-white text-2xl md:text-3xl font-semibold mb-3">Lilo & Stitch</h2>
                    <p className="text-white/90 mb-4">Prepare for chaos, cuteness and a whole lot of cosmic mischief in the live-action reimagining of the Disney animated classic Lilo & Stitch.</p>
                    <a href="#" className="text-sky-300 font-medium hover:underline flex items-center gap-1 justify-center md:justify-start">
                      Book Tickets
                      <span className="inline-block">{'>'}</span>
                    </a>
                  </div>
                </div>
                <div id='item2' className="carousel-item relative w-full">
                  {/* Overlay gradient từ phải sang trái */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to left, rgba(0,0,0,0) 60%, rgba(20,30,50,0.85) 100%)'
                    }}
                  />
                  {/* Ảnh căn phải */}
                  <div className="absolute inset-0 flex justify-end items-center">
                    <img
                      src="https://insieutoc.vn/wp-content/uploads/2021/02/poster-ngang.jpg"
                      alt="#"
                      className="h-full object-contain bg-black"
                      style={{ maxWidth: '100%' }}
                    />
                  </div>
                  {/* Nội dung chữ nổi responsive */}
                  <div
                    className={`
                      w-full
                      md:absolute md:top-0 md:left-0 md:h-full
                      flex flex-col justify-center
                      px-4 py-4
                      md:pl-8 md:pr-8 md:py-0 md:pl-16 md:pr-0
                      z-10
                      md:max-w-[40%]
                      bg-gradient-to-t from-black/80 via-black/40 to-transparent
                      md:bg-none
                      text-center md:text-left
                      items-center md:items-start
                      mt-0 md:mt-0
                    `}
                  >
                    <h2 className="text-white text-2xl md:text-3xl font-semibold mb-3">Lilo & Stitch</h2>
                    <p className="text-white/90 mb-4">Prepare for chaos, cuteness and a whole lot of cosmic mischief in the live-action reimagining of the Disney animated classic Lilo & Stitch.</p>
                    <a href="#" className="text-sky-300 font-medium hover:underline flex items-center gap-1 justify-center md:justify-start">
                      Book Tickets
                      <span className="inline-block">{'>'}</span>
                    </a>
                  </div>
                </div>
              {/* ))} */}
            </div>
            <div className="flex w-full justify-center gap-2 py-2">
              <a href="#item1" className="btn btn-xs">1</a>
              <a href="#item2" className="btn btn-xs">2</a>
            </div>
          </div>

          <div className="w-full bg-[#0a1a2f] py-8">
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-3xl font-bold text-white tracking-widest text-center">OFFERS & COMPETITIONS</h2>
              <div className="w-24 h-1 bg-[#4fd1ff] mt-2 rounded"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {/* Card 1 */}
              <div className="relative bg-white w-80 rounded-lg shadow-md flex flex-col overflow-hidden" style={{clipPath: "polygon(0 0, 100% 0, 100% 92%, 95% 100%, 0 100%)"}}>
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_yZ6-5Mj46urINWq1YTKaH8rXaeOKcIhcgQ&s" alt="Stitch plush" className="w-full h-40 object-cover"/>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-2 text-[#0a1a2f]">Win a giant Stitch plush toy!*</h3>
                  <p className="text-gray-700 text-sm mb-2">
                    Get ready for chaos and cosmic mischief with the must-see release of Lilo & Stitch, and to celebrate, we're giving you the chance to win your very own cute and fluffy giant Stitch plush toy*
                  </p>
                  <p className="text-xs text-gray-500 mb-1">*Terms & Conditions apply</p>
                  <p className="text-xs text-gray-500 mb-2">Expires: 26/05/2025</p>
                  <a href="#" className="text-sky-600 font-medium hover:underline mt-auto flex items-center gap-1">
                    Find out more <span className="inline-block">{'>'}</span>
                  </a>
                </div>
              </div>
              {/* Card 2 */}
              <div className="relative bg-white w-80 rounded-lg shadow-md flex flex-col overflow-hidden" style={{clipPath: "polygon(0 0, 100% 0, 100% 92%, 95% 100%, 0 100%)"}}>
                <img src="https://upload.urbox.vn/strapi/cgv_001_086a1ce8f1.jpg" alt="Limitless Plus" className="w-full h-40 object-cover"/>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-2 text-[#0a1a2f]">20% off myLIMITLESS Plus | Exclusive to students</h3>
                  <p className="text-gray-700 text-sm mb-2">
                    We're offering a whopping 20% off myLIMITLESS Plus* for students when verified through Student Beans.<br/>
                    Cinema-lovers, you can now watch as many movies as you like, whenever you like, now for only £15.99/month – saving you £4/month.
                  </p>
                  <p className="text-xs text-gray-500 mb-1">*Terms & Conditions apply</p>
                  {/* Không có ngày hết hạn */}
                  <a href="#" className="text-sky-600 font-medium hover:underline mt-auto flex items-center gap-1">
                    Find out more <span className="inline-block">{'>'}</span>
                  </a>
                </div>
              </div>
              {/* Card 3 */}
              <div className="relative bg-white w-80 rounded-lg shadow-md flex flex-col overflow-hidden" style={{clipPath: "polygon(0 0, 100% 0, 100% 92%, 95% 100%, 0 100%)"}}>
                <img src="https://static.vivnpay.vn/202406181518/Flashsale-xem-phim-30k-1_1120266337870233600.jpg" alt="Mission Impossible" className="w-full h-40 object-cover"/>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-2 text-[#0a1a2f]">Win a trip to Norway*</h3>
                  <p className="text-gray-700 text-sm mb-2">
                    To celebrate the release of Mission: Impossible - The Final Reckoning, we're giving you the chance to win a trip to Norway*
                  </p>
                  <p className="text-xs text-gray-500 mb-1">*Terms & Conditions apply</p>
                  <p className="text-xs text-gray-500 mb-2">Expires: 26/05/2025</p>
                  <a href="#" className="text-sky-600 font-medium hover:underline mt-auto flex items-center gap-1">
                    Find out more <span className="inline-block">{'>'}</span>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-[#07162a] flex justify-center py-6" >
              <button
                className="relative bg-[#1780e8] text-white px-6 py-2 font-medium rounded-none"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 80%, 90% 100%, 0 100%)" }}
              >
                See more of our Offers &amp; Competitions
              </button>
            </div>

            <div className="bg-[#07162a] text-white pt-8 pb-4 border-t border-[#0a1a2f]" style={{marginBottom: 30}}>
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
          </div>

        </main>

        <Footer />
      </div>
    </>
  )
}
