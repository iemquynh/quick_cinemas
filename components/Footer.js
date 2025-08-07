import React from "react";

export default function Footer() {
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  const maxDateObj = new Date(today);
  maxDateObj.setMonth(maxDateObj.getMonth() + 3);
  const maxDate = maxDateObj.toISOString().split('T')[0];
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-white py-4 px-2 shadow z-10 border-t border-gray-200">
      <form className=" w-full max-w-5xl mx-auto 
        flex flex-row flex-wrap items-center justify-center 
        gap-x-4 gap-y-2
        px-2
        min-w-0
        overflow-x-auto">
        <span className="font-semibold text-base text-[#07162a] whitespace-nowrap col-span-2 md:col-span-1">Book a film</span>
        <select className="h-8 px-2 rounded bg-[#232a31] text-white font-medium text-sm focus:outline-none">
          <option>Categories</option>
          <option>Romantic</option>
          <option>Action</option>
          <option>Sad</option>
        </select>
        <div className="flex flex-row items-center h-8 bg-[#232a31] rounded overflow-hidden">
          <span className="px-2 text-white font-medium text-sm">Date</span>
          <input type="date" min={minDate} max={maxDate} className="h-8 px-1 bg-[#232a31] text-white border-0 focus:outline-none text-sm" />
        </div>
        <div className="flex flex-row items-center h-8 bg-[#232a31] rounded overflow-hidden">
          <span className="px-2 text-white font-medium text-sm">Time</span>
          <input type="time" className="h-8 px-2 rounded font-medium bg-[#232a31] text-white focus:outline-none text-sm" min="09:00" max="18:00" />
        </div>
        {/* <input type="time" className="h-8 px-2 rounded border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none text-sm" min="09:00" max="18:00" /> */}
        <button
          type="submit"
          className="h-8 px-5 bg-[#1780e8] text-white font-bold rounded-none text-sm"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 80%, 90% 100%, 0 100%)" }}
        >
          Search
        </button>
      </form>
    </footer>
  );
}