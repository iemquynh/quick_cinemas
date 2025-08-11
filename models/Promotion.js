import mongoose from 'mongoose';

const PromotionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  discount_type: {
    type: String,
    enum: ['percentage', 'fixed'], // 'percentage' = giảm theo %, 'fixed' = giảm số tiền cố định
    required: true,
  },
  discount_value: {
    type: Number,
    required: true,
  },

  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },

  max_usage: {
    type: Number,
    default: null, // null = không giới hạn
  },
  used_count: {
    type: Number,
    default: 0,
  },

  theater_admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  img_url: {
    type: String,
    required: true
  },  

  minimum_order_amount: {
    type: Number,
    default: 0, // Mặc định là không yêu cầu tối thiểu
  },

  maximum_discount_amount: {
    type: Number,
    default: null, // Không giới hạn nếu không có
  },

  theater_chain: String,
}, {
  timestamps: true
});

export default mongoose.models.Promotion || mongoose.model('Promotion', PromotionSchema);
