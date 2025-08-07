// 'use client';
// import { useEffect, useState } from 'react';
// import Link from 'next/link';
// import { FaRegHandPointer } from 'react-icons/fa';
// import Header from '@/components/Header';

// const PLACEHOLDER_IMGS = [
//   'https://png.pngtree.com/png-clipart/20190516/original/pngtree-white-cinema-theatre-screen-with-red-curtains-and-chairs-png-image_3662495.jpg',
//   'https://kubetvip88.com/wp-content/uploads/2025/02/360_F_752317051_7aFHdD03877W4JH4Y3yjYhkr6q6hT1Gr.jpg',
//   'https://www.freeiconspng.com/uploads/movie-theatre-png-11.png',
//   'https://png.pngtree.com/thumb_back/fh260/background/20230519/pngtree-an-empty-movie-theater-with-lots-of-red-seats-image_2604057.jpg',
//   'https://static.vinwonders.com/production/2025/02/rap-chieu-phim-sai-gon-thumb.jpg',
//   'https://cdn.dealtoday.vn/img/s800x400/9641fe44941f436b92a624bc1eb3a679.jpg?sign=2ahfNEQTNzu0VhpR7sOE4Q',
//   'https://lh3.googleusercontent.com/proxy/40GOZ-RGQNeHhBnkHWBHvBI42aRBEgjBwF-vUz3teYzVkbuRCN65Pts-BBu0LDJjNm8-DP6b_gHI-beuOUp5evGY-HyZRxpZhGyn_CvmJ5JQDY44pnKrB55CgShEGYzPYWPtOh7gGWyY79rSOdPK6EjqYdqNqxnQqWj0DSegTGQsvuOsqwnSMkGSIpg7u1yanHhp1S2KfT6Hh3FFVFE',
// ];

// export default function CinemasPage() {
//   const [theaters, setTheaters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');

//   useEffect(() => {
//     fetch('/api/theaters')
//       .then(res => res.json())
//       .then(data => {
//         // Gán random placeholder cho các rạp không có ảnh
//         const withImg = data.map((theater, idx) => {
//           const hasImg = theater.image || theater.poster || theater.logo;
//           return {
//             ...theater,
//             _randomImg: hasImg ? null : PLACEHOLDER_IMGS[Math.floor(Math.random() * PLACEHOLDER_IMGS.length)]
//           };
//         });
//         setTheaters(withImg);
//         setLoading(false);
//       });
//   }, []);

//   // Lọc realtime theo tên hoặc địa chỉ
//   const filteredTheaters = theaters.filter(theater => {
//     const q = search.trim().toLowerCase();
//     if (!q) return true;
//     return (
//       (theater.name && theater.name.toLowerCase().includes(q)) ||
//       (theater.address && theater.address.toLowerCase().includes(q))
//     );
//   });

//   return (
//     <>
//       <Header />
//       <div className="min-h-screen bg-gray-900 py-8 mt-16">
//         <div className="container mx-auto px-4">
//           <h1 className="text-4xl font-bold text-white mb-8 text-center">
//             CINEMAS
//           </h1>
//           <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <input
//               type="text"
//               placeholder="Search by name or location"
//               className="w-full md:w-1/2 px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//             />

//             {/* <div className="flex gap-2">
//               <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm">Locate me</button>
//               <button className="bg-gray-700 text-white px-4 py-2 rounded font-semibold text-sm flex items-center gap-1">
//                 <span>Filter By</span>
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 017 17v-3.586a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z" /></svg>
//               </button>
//             </div> */}

//           </div>
//           {loading ? (
//             <div className="text-center text-white">Loading...</div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {filteredTheaters.length === 0 ? (
//                 <div className="col-span-full text-center text-gray-400">No cinemas found.</div>
//               ) : filteredTheaters.map((theater) => (
//                 <Link key={theater._id} href={`/cinemas/${theater._id}`} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex flex-col cursor-pointer group relative">
//                   <div className="relative w-full h-48 bg-gray-700">
//                     <img
//                       src={theater.image || theater.poster || theater.logo || theater._randomImg}
//                       alt={theater.name}
//                       className="w-full h-48 object-cover object-center"
//                       onError={e => { e.target.src = PLACEHOLDER_IMGS[Math.floor(Math.random() * PLACEHOLDER_IMGS.length)]; }}
//                     />
//                     <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//                       <FaRegHandPointer className="text-white text-2xl drop-shadow-lg" title="Xem chi tiết rạp" />
//                     </div>
//                   </div>
//                   <div className="p-4 flex-1 flex flex-col">
//                     <h2 className="text-2xl font-bold text-white mb-2 uppercase line-clamp-2">{theater.name}</h2>
//                     <div className="text-gray-400 text-sm mb-1 line-clamp-2">{theater.address}</div>
//                     <div className="text-gray-400 text-sm mb-1">Chuỗi rạp: <span className="font-semibold text-blue-400">{theater.theater_chain}</span></div>
//                     <div className="text-gray-400 text-sm mb-1">Số phòng: <span className="font-semibold">{theater.rooms}</span></div>
//                     <div className="text-gray-400 text-sm mb-1">Loại màn hình: <span className="font-semibold">{theater.screenTypes && theater.screenTypes.length > 0 ? theater.screenTypes.join(', ') : 'N/A'}</span></div>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// } 

"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaRegHandPointer } from 'react-icons/fa';
import Header from '@/components/Header';

const PLACEHOLDER_IMGS = [
  'https://png.pngtree.com/png-clipart/20190516/original/pngtree-white-cinema-theatre-screen-with-red-curtains-and-chairs-png-image_3662495.jpg',
  'https://kubetvip88.com/wp-content/uploads/2025/02/360_F_752317051_7aFHdD03877W4JH4Y3yjYhkr6q6hT1Gr.jpg',
  'https://www.freeiconspng.com/uploads/movie-theatre-png-11.png',
  'https://png.pngtree.com/thumb_back/fh260/background/20230519/pngtree-an-empty-movie-theater-with-lots-of-red-seats-image_2604057.jpg',
  'https://static.vinwonders.com/production/2025/02/rap-chieu-phim-sai-gon-thumb.jpg',
  'https://cdn.dealtoday.vn/img/s800x400/9641fe44941f436b92a624bc1eb3a679.jpg?sign=2ahfNEQTNzu0VhpR7sOE4Q',
  'https://lh3.googleusercontent.com/proxy/40GOZ-RGQNeHhBnkHWBHvBI42aRBEgjBwF-vUz3teYzVkbuRCN65Pts-BBu0LDJjNm8-DP6b_gHI-beuOUp5evGY-HyZRxpZhGyn_CvmJ5JQDY44pnKrB55CgShEGYzPYWPtOh7gGWyY79rSOdPK6EjqYdqNqxnQqWj0DSegTGQsvuOsqwnSMkGSIpg7u1yanHhp1S2KfT6Hh3FFVFE',
];

export default function CinemasPage() {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/theaters')
      .then(res => res.json())
      .then(data => {
        const withImg = data.map((theater) => {
          const hasImg = theater.image || theater.poster || theater.logo;
          return {
            ...theater,
            _randomImg: hasImg ? null : PLACEHOLDER_IMGS[Math.floor(Math.random() * PLACEHOLDER_IMGS.length)]
          };
        });
        setTheaters(withImg);
        setLoading(false);
      });
  }, []);

  const filteredTheaters = theaters.filter(theater => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (theater.name && theater.name.toLowerCase().includes(q)) ||
      (theater.address && theater.address.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-10 mt-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex justify-end">
            <input
              type="text"
              placeholder="Search by name or location"
              className="w-full md:w-1/3 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center text-white text-lg animate-pulse">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredTheaters.length === 0 ? (
                <div className="col-span-full text-center text-gray-400">No matching cinemas found.</div>
              ) : filteredTheaters.map((theater) => (
                <Link key={theater._id} href={`/cinemas/${theater._id}`} className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex flex-col cursor-pointer group relative">
                  <div className="relative w-full h-48 bg-gray-700">
                    <img
                      src={theater.image || theater.poster || theater.logo || theater._randomImg}
                      alt={theater.name}
                      className="w-full h-48 object-cover object-center"
                      onError={e => { e.target.src = PLACEHOLDER_IMGS[Math.floor(Math.random() * PLACEHOLDER_IMGS.length)]; }}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <FaRegHandPointer className="text-white text-2xl drop-shadow-lg" title="View cinema details" />
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h2 className="text-xl font-semibold text-white mb-1 uppercase line-clamp-2 group-hover:text-blue-400 transition-colors duration-200">{theater.name}</h2>
                    <div className="text-gray-400 text-sm mb-1 line-clamp-2">📍 {theater.address}</div>
                    <div className="text-gray-400 text-sm mb-1">🏢 Theater Chain: <span className="font-semibold text-blue-400">{theater.theater_chain}</span></div>
                    <div className="text-gray-400 text-sm mb-1">🎥 Rooms: <span className="font-semibold">{theater.rooms}</span></div>
                    <div className="text-gray-400 text-sm">🖥️ Screen Types: <span className="font-semibold">{theater.screenTypes && theater.screenTypes.length > 0 ? theater.screenTypes.join(', ') : 'N/A'}</span></div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
