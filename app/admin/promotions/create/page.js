'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/utils/auth';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export default function CreatePromotionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    maximum_discount_amount: '',
    minimum_order_amount: '',
    start_date: '',
    end_date: '',
    max_usage: '',
    img_url: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const showToast = (icon, title) => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = getAuthToken();

      const payload = {
        ...formData,
        discount_value: Number(formData.discount_value),
        minimum_order_amount: Number(formData.minimum_order_amount),
        max_usage: Number(formData.max_usage),
        maximum_discount_amount:
          formData.discount_type === 'percentage'
            ? Number(formData.maximum_discount_amount)
            : null,
      };

      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast('success', 'Promotion created successfully');
        setTimeout(() => {
          router.push('/admin/promotions');
        }, 2000);
      } else {
        const errorText = await res.text();
        console.error('Failed to create promotion:', errorText);
        showToast('error', `Failed: ${errorText}`);
      }
    } catch (error) {
      console.error('Unexpected error during promotion creation:', error);
      showToast('error', 'Something went wrong');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 shadow-lg rounded-lg mt-4">
      <h1 className="text-3xl font-bold text-gray-200 mb-8">Create Promotion</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Title</label>
          <input
            type="text"
            name="title"
            className="w-full p-3 border border-gray-300 rounded-md"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-md"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Discount Type */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Discount Type</label>
          <select
            name="discount_type"
            className="w-full p-3 border border-gray-300 rounded-md"
            value={formData.discount_type}
            onChange={handleChange}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (VND)</option>
          </select>
        </div>

        {/* Discount Value */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            {formData.discount_type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (VND)'}
          </label>
          <input
            type="number"
            name="discount_value"
            className="w-full p-3 border border-gray-300 rounded-md"
            value={formData.discount_value}
            onChange={handleChange}
            required
          />
        </div>

        {/* Maximum Discount Amount (only for percentage) */}
        {formData.discount_type === 'percentage' && (
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Maximum Discount Amount (VND)
            </label>
            <input
              type="number"
              name="maximum_discount_amount"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={formData.maximum_discount_amount}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Minimum Order Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Minimum Order Amount (VND)</label>
          <input
            type="number"
            name="minimum_order_amount"
            className="w-full p-3 border border-gray-300 rounded-md"
            value={formData.minimum_order_amount}
            onChange={handleChange}
            required
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">Start Date</label>
            <input
              type="date"
              name="start_date"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">End Date</label>
            <input
              type="date"
              name="end_date"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Max Usage */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Max Usage</label>
          <input
            type="number"
            name="max_usage"
            className="w-full p-3 border border-gray-300 rounded-md"
            value={formData.max_usage}
            onChange={handleChange}
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Banner Image URL</label>
          <input
            type="text"
            name="img_url"
            placeholder="https://example.com/banner.jpg"
            className="w-full p-3 border border-gray-300 rounded-md"
            value={formData.img_url}
            onChange={handleChange}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-blue-700"
        >
          Create Promotion
        </button>
      </form>
    </div>
  );
}
