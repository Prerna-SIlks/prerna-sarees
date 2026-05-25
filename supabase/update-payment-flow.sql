-- Add the missing payment_method column first
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add the new columns for UPI manual verification
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utr_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Backfill the payment_method for old orders
UPDATE public.orders SET payment_method = 'cod' WHERE payment_status = 'cod';
UPDATE public.orders SET payment_method = 'razorpay' WHERE payment_method IS NULL;

-- Update legacy COD orders to have the new 'confirmed' status instead of 'pending'
UPDATE public.orders SET status = 'confirmed' WHERE payment_status = 'cod' AND status = 'pending';
