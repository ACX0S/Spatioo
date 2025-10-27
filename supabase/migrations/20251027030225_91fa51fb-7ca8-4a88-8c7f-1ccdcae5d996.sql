-- Update notifications type constraint to include review_request and other notification types
ALTER TABLE public.notifications 
DROP CONSTRAINT notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'booking_created', 
  'booking_cancelled', 
  'booking_completed',
  'booking_accepted',
  'booking_rejected',
  'booking_confirmed',
  'review_request'
));