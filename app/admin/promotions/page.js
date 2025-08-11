'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/utils/auth';

export default function PromotionListPage() {
    const [promotions, setPromotions] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const router = useRouter();

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const token = getAuthToken();
            const res = await fetch('/api/promotions', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const err = await res.json();
                console.error('Failed to fetch promotions:', err);
                return;
            }

            const data = await res.json();
            setPromotions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching promotions:', error);
            setPromotions([]);
        }
    };

    const handleEditClick = (promo) => {
        setEditingId(promo._id);
        setFormData({
            ...promo,
            min_total_price: promo.minimum_order_amount || 0,
            max_discount_amount: promo.maximum_discount_amount || 0,
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleUpdate = async () => {
        const token = getAuthToken();
        const body = { ...formData };
        delete body.theater_chain;

        const res = await fetch(`/api/promotions/${editingId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            setEditingId(null);
            await fetchPromotions();
        } else {
            alert('Failed to update promotion');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = confirm('Are you sure you want to delete this promotion?');
        if (!confirmed) return;

        const token = getAuthToken();
        const res = await fetch(`/api/promotions/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (res.ok) {
            await fetchPromotions();
        } else {
            alert('Failed to delete promotion');
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Promotion List</h1>
                <button
                    onClick={() => router.push('/admin/promotions/create')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Add Promotion
                </button>
            </div>

            <div className="space-y-8 text-gray-800">
                {promotions.map((promo) => (
                    <div key={promo._id} className="relative w-full h-[330px] md:h-[300px] rounded-xl overflow-hidden shadow text-white">
                        {editingId === promo._id ? (
                            <div className="overflow-y-auto max-h-[300px] p-4 bg-[#1a1a1a] rounded">
                            <div className="mb-2">
                              <label className="block text-sm font-medium text-white">Title</label>
                              <input
                                className="w-full p-2 border rounded text-white"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                              />
                            </div>
                    
                            <div className="mb-2">
                              <label className="block text-sm font-medium text-white">Description</label>
                              <textarea
                                className="w-full p-2 border rounded text-white"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                              />
                            </div>
                    
                            <div className="flex gap-4 mb-2">
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-white">Discount Type</label>
                                <select
                                  className="w-full p-2 border rounded text-white"
                                  name="discount_type"
                                  value={formData.discount_type}
                                  onChange={handleChange}
                                >
                                  <option value="percentage">Percentage (%)</option>
                                  <option value="fixed">Fixed Amount</option>
                                </select>
                              </div>
                    
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-white">Discount Value</label>
                                <input
                                  type="number"
                                  className="w-full p-2 border rounded text-white"
                                  name="discount_value"
                                  value={formData.discount_value}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                    
                            <div className="mb-2">
                              <label className="block text-sm font-medium text-white">Start Date</label>
                              <input
                                type="date"
                                className="w-full p-2 border rounded text-white"
                                name="start_date"
                                value={formData.start_date?.slice(0, 10)}
                                onChange={handleChange}
                              />
                            </div>
                    
                            <div className="mb-2">
                              <label className="block text-sm font-medium text-white">End Date</label>
                              <input
                                type="date"
                                className="w-full p-2 border rounded text-white"
                                name="end_date"
                                value={formData.end_date?.slice(0, 10)}
                                onChange={handleChange}
                              />
                            </div>
                    
                            <div className="mb-2">
                              <label className="block text-sm font-medium text-white">Max Usage</label>
                              <input
                                type="number"
                                className="w-full p-2 border rounded text-white"
                                name="max_usage"
                                value={formData.max_usage}
                                onChange={handleChange}
                              />
                            </div>
                    
                            <div className="mb-2">
                              <label className="block text-sm font-medium text-white">Minimum Order Amount</label>
                              <input
                                type="number"
                                className="w-full p-2 border rounded text-white"
                                name="minimum_order_amount"
                                value={formData.minimum_order_amount}
                                onChange={handleChange}
                              />
                            </div>
                    
                            <div className="mb-2">
                              <label className="block text-sm font-medium text-white">Maximum Discount Amount</label>
                              <input
                                type="number"
                                className="w-full p-2 border rounded text-white"
                                name="maximum_discount_amount"
                                value={formData.maximum_discount_amount}
                                onChange={handleChange}
                              />
                            </div>
                    
                            <div className="mb-2">
                              <label className="block text-sm font-medium text-white">Image URL</label>
                              <input
                                type="text"
                                className="w-full p-2 border rounded text-white"
                                name="img_url"
                                value={formData.img_url || ''}
                                onChange={handleChange}
                              />
                            </div>
                    
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={handleUpdate}
                                className="bg-green-600 text-white px-4 py-1 rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                className="bg-gray-400 text-white px-4 py-1 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${promo.img_url})`,
                                }}
                            >
                                {/* overlay màu tối */}
                                <div className="w-full h-full bg-black bg-opacity-50 flex flex-col justify-between p-6">
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-bold mb-2">{promo.title}</h2>
                                        <p className="text-sm text-gray-200 mb-3">{promo.description}</p>
                                        <div className="text-sm space-y-1 text-gray-100">
                                            <p>
                                                <span className="font-medium">Discount:</span>{' '}
                                                {promo.discount_type === 'percentage'
                                                    ? `${promo.discount_value}%`
                                                    : `₫${promo.discount_value?.toLocaleString()}`}
                                            </p>
                                            <p>
                                                <span className="font-medium">Valid:</span>{' '}
                                                {promo.start_date?.slice(0, 10)} → {promo.end_date?.slice(0, 10)}
                                            </p>
                                            <p>
                                                <span className="font-medium">Max Uses:</span> {promo.max_usage}
                                            </p>
                                            <p><span className="font-semibold">Used Count:</span> {promo.used_count}</p>
                                            <p>
                                                <span className="font-medium">Min Total Price:</span>{' '}
                                                ₫{promo.minimum_order_amount?.toLocaleString()}
                                            </p>
                                            <p>
                                                <span className="font-medium">Max Discount:</span>{' '}
                                                ₫{promo.maximum_discount_amount?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={() => handleEditClick(promo)}
                                            className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(promo._id)}
                                            className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
