"use client"
import Header from '@/components/Header';

export default function AboutPage() {
    return (
      <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12 mt-16 px-4 text-white">
        <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">About Us</h1>

        {/* Introduction */}
        <section className="mb-10 text-center">
            <p className="text-lg text-gray-400">
            Welcome to <span className="font-semibold text-blue-600">QuickCinema.vn</span> — your trusted platform to book movie tickets from top cinema chains across Vietnam. We bring the cinema to your fingertips.
            </p>
        </section>

        {/* Cinema Chains Section */}
        <section className="mb-8 pb-6 border-b border-gray-300">
            <h2 className="text-2xl font-semibold mb-4">Our Cinema Partners</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-stretch">
            <div className="bg-white shadow p-0 rounded flex flex-col items-center text-black h-full">
                <img src="https://top10vietnam.vn/wp-content/uploads/2020/01/CGV-cinema.jpg" alt="CGV" className="w-full h-32 object-cover rounded-t" />
                <div className="flex-1 flex flex-col justify-center p-4 w-full">
                    <p><strong>CGV Cinemas</strong><br />Premium viewing experience with modern facilities.</p>
                </div>
            </div>
            <div className="bg-white shadow p-0 rounded flex flex-col items-center text-black h-full">
                <img src="https://diadiemvietnam.vn/wp-content/uploads/2023/02/lotte-cinema-ninh-binh.jpg" alt="Lotte" className="w-full h-32 object-cover rounded-t" />
                <div className="flex-1 flex flex-col justify-center p-4 w-full">
                    <p><strong>Lotte Cinema</strong><br />Great service and clean, spacious theaters.</p>
                </div>
            </div>
            <div className="bg-white shadow p-0 rounded flex flex-col items-center text-black h-full">
                <img src="https://419.vn/wp-content/uploads/2021/01/133810419_3555788294458438_2114686608289236869_o-1024x440.jpg" alt="Beta" className="w-full h-32 object-cover rounded-t" />
                <div className="flex-1 flex flex-col justify-center p-4 w-full">
                    <p><strong>Beta Cineplex</strong><br />Affordable prices, perfect for students and families.</p>
                </div>
            </div>
            <div className="bg-white shadow p-0 rounded flex flex-col items-center text-black h-full">
                <img src="https://cdn.galaxycine.vn/media/2025/4/24/galaxy-thiso-phan-huy-ich_1745479260709.jpg" alt="Galaxy" className="w-full h-32 object-cover rounded-t" />
                <div className="flex-1 flex flex-col justify-center p-4 w-full">
                    <p><strong>Galaxy Cinema</strong><br />Convenient locations and comfortable seating.</p>
                </div>
            </div>
            <div className="bg-white shadow p-0 rounded flex flex-col items-center text-black h-full">
                <img src="https://statics.vincom.com.vn/vincom-ho/image2-1671509424.jpg" alt="BHD" className="w-full h-32 object-cover rounded-t" />
                <div className="flex-1 flex flex-col justify-center p-4 w-full">
                    <p><strong>BHD Star</strong><br />Known for fast service and quality movie screenings.</p>
                </div>
            </div>
            </div>
        </section>

        {/* Why Book Online? */}
        <section className="mb-8 pb-6 border-b border-gray-300">
          <h2 className="text-2xl font-semibold mb-6">Why Book Online?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow flex flex-col items-center p-6 text-center text-gray-700 h-full">
              <span className="text-4xl mb-3">💻</span>
              <h3 className="font-bold text-lg mb-2">Easy Booking</h3>
              <p>Book your tickets in just a few taps, anytime, anywhere.</p>
            </div>
            <div className="bg-white rounded-xl shadow flex flex-col items-center p-6 text-center text-gray-700 h-full">
              <span className="text-4xl mb-3">🔒</span>
              <h3 className="font-bold text-lg mb-2">Secure Payment</h3>
              <p>Multiple payment options with top-notch security.</p>
            </div>
            <div className="bg-white rounded-xl shadow flex flex-col items-center p-6 text-center text-gray-700 h-full">
              <span className="text-4xl mb-3">⏱️</span>
              <h3 className="font-bold text-lg mb-2">Save Time</h3>
              <p>Avoid queues and get your tickets instantly.</p>
            </div>
            <div className="bg-white rounded-xl shadow flex flex-col items-center p-6 text-center text-gray-700 h-full">
              <span className="text-4xl mb-3">💸</span>
              <h3 className="font-bold text-lg mb-2">Exclusive Deals</h3>
              <p>Enjoy special discounts and combo offers only online.</p>
            </div>
            <div className="bg-white rounded-xl shadow flex flex-col items-center p-6 text-center text-gray-700 h-full">
              <span className="text-4xl mb-3">🎟️</span>
              <h3 className="font-bold text-lg mb-2">Best Seats</h3>
              <p>Choose your favorite seats with live seat selection.</p>
            </div>
            <div className="bg-white rounded-xl shadow flex flex-col items-center p-6 text-center text-gray-700 h-full">
              <span className="text-4xl mb-3">📱</span>
              <h3 className="font-bold text-lg mb-2">Mobile Friendly</h3>
              <p>Book and manage tickets easily on your phone.</p>
            </div>
          </div>
        </section>


        {/* Contact Section */}
        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="mb-2">📞 Hotline: <strong>1900 1234</strong></p>
            <p className="mb-2">📧 Email: <a href="mailto:admin@moviebooking.vn" className="text-blue-600 underline">admin@moviebooking.vn</a></p>
            <p className="mb-2">🏢 Address: 123 Movie Lane, District 1, Ho Chi Minh City, Vietnam</p>
            <div className="mt-4">
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.357357258504!2d106.70175507502767!3d10.784195059009323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f2b44b62b79%3A0x67bbf5f18d3b496c!2zQ2h1bmcgVMOibSBDaMOtbmggQ2jDrSBQaMOybmcgVGjhuqFuaCBQaMO6YyBI4bqhYw!5e0!3m2!1sen!2s!4v1722317321302!5m2!1sen!2s"
                width="100%"
                height="250"
                className="rounded shadow"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mt-10">
            <h3 className="text-xl font-semibold mb-2">Ready for your next movie night?</h3>
            <p className="mb-4 text-gray-600">Book your ticket now and enjoy exclusive offers with our combos.</p>
            <a href="/films" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition">Browse Movies</a>
        </section>
        </div>
        </div>
      </>
    );
  }
  