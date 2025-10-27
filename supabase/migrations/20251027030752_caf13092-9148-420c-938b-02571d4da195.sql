-- Expand notifications.type constraint to cover all used notification types
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'booking_created',
  'booking_cancelled',
  'booking_completed',
  'booking_accepted',
  'booking_rejected',
  'booking_confirmed',
  'arrival_request',
  'departure_confirmation',
  'review_request',
  'new_review',
  'booking_expired'
));