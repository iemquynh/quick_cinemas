"use client"
import Header from '@/components/Header';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12 mt-16 px-4 text-white">
        <div className="max-w-6xl mx-auto">

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-extrabold text-center mb-10 
              bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
              bg-clip-text text-transparent"
          >
            About Us
          </motion.h1>

          {/* Introduction */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Welcome to <span className="font-semibold text-blue-400">QuickCinema.vn</span> —
              your trusted platform to book movie tickets from top cinema chains across Vietnam.
              We bring the cinema to your fingertips.
            </p>
          </motion.section>

          {/* Cinema Partners */}
          <section className="mb-14 pb-10 border-b border-gray-600">
            <h2 className="text-3xl font-semibold mb-6 text-center">Our Cinema Partners</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                {
                  name: "CGV Cinemas",
                  desc: "Premium viewing experience with modern facilities.",
                  img: "https://top10vietnam.vn/wp-content/uploads/2020/01/CGV-cinema.jpg"
                },
                {
                  name: "Lotte Cinema",
                  desc: "Great service and clean, spacious theaters.",
                  img: "https://diadiemvietnam.vn/wp-content/uploads/2023/02/lotte-cinema-ninh-binh.jpg"
                },
                {
                  name: "Beta Cineplex",
                  desc: "Affordable prices, perfect for students and families.",
                  img: "https://419.vn/wp-content/uploads/2021/01/133810419_3555788294458438_2114686608289236869_o-1024x440.jpg"
                },
                {
                  name: "Galaxy Cinema",
                  desc: "Convenient locations and comfortable seating.",
                  img: "https://cdn.galaxycine.vn/media/2025/4/24/galaxy-thiso-phan-huy-ich_1745479260709.jpg"
                },
                {
                  name: "BHD Star",
                  desc: "Known for fast service and quality movie screenings.",
                  img: "https://statics.vincom.com.vn/vincom-ho/image2-1671509424.jpg"
                }
              ].map((partner, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer flex flex-col"
                >
                  <img src={partner.img} alt={partner.name} className="h-40 w-full object-cover" />
                  <div className="flex-1 p-5 text-gray-800">
                    <p><strong>{partner.name}</strong><br />{partner.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Why Book Online */}
          <section className="mb-14 pb-10 border-b border-gray-600">
            <h2 className="text-3xl font-semibold mb-8 text-center">Why Book Online?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { icon: "💻", title: "Easy Booking", desc: "Book your tickets in just a few taps, anytime, anywhere." },
                { icon: "🔒", title: "Secure Payment", desc: "Multiple payment options with top-notch security." },
                { icon: "⏱️", title: "Save Time", desc: "Avoid queues and get your tickets instantly." },
                { icon: "💸", title: "Exclusive Deals", desc: "Enjoy special discounts and combo offers only online." },
                { icon: "🎟️", title: "Best Seats", desc: "Choose your favorite seats with live seat selection." },
                { icon: "📱", title: "Mobile Friendly", desc: "Book and manage tickets easily on your phone." }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 flex flex-col items-center text-center text-gray-700"
                >
                  <span className="text-5xl mb-3">{item.icon}</span>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="mb-14">
            <h2 className="text-3xl font-semibold mb-6 text-center">Contact Us</h2>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              <p className="mb-2">📞 Hotline: <strong>1900 1234</strong></p>
              <p className="mb-2">📧 Email: <a href="mailto:admin@moviebooking.vn" className="text-blue-400 underline">admin@moviebooking.vn</a></p>
              <p className="mb-4">🏢 Address: 123 Movie Lane, District 1, Ho Chi Minh City, Vietnam</p>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.357357258504!2d106.70175507502767!3d10.784195059009323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f2b44b62b79%3A0x67bbf5f18d3b496c!2zQ2h1bmcgVMOibSBDaMOtbmggQ2jDrSBQaMOybmcgVGjhuqFuaCBQaMO6YyBI4bqhYw!5e0!3m2!1sen!2s!4v1722317321302!5m2!1sen!2s"
                width="100%"
                height="250"
                className="rounded-xl shadow-md"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
          </section>

          {/* CTA */}
          <motion.section
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <h3 className="text-2xl font-semibold mb-3">Ready for your next movie night?</h3>
            <p className="mb-6 text-gray-400">Book your ticket now and enjoy exclusive offers with our combos.</p>
            <a
              href="/films"
              className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition"
            >
              🎬 Browse Movies
            </a>
          </motion.section>

        </div>
      </div>
    </>
  )
}
