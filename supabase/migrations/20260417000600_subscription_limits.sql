-- Add subscription enforcement limits to institutions
ALTER TABLE public.institutions 
ADD COLUMN IF NOT EXISTS max_seats INT DEFAULT 50,
ADD COLUMN IF NOT EXISTS max_storage_mb INT DEFAULT 1024,
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));

-- Trigger to prevent inserting more users than allowed
CREATE OR REPLACE FUNCTION check_institution_seat_limit()
RETURNS TRIGGER AS $$
DECLARE
    seat_count INT;
    seat_limit INT;
BEGIN
    SELECT COUNT(id) INTO seat_count FROM public.institution_users WHERE institution_id = NEW.institution_id AND status = 'active';
    SELECT max_seats INTO seat_limit FROM public.institutions WHERE id = NEW.institution_id;
    
    IF seat_count >= seat_limit THEN
        RAISE EXCEPTION 'Institution seat limit of % exceeded. Please upgrade your subscription tier.', seat_limit;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS restrict_seats ON public.institution_users;
CREATE TRIGGER restrict_seats
BEFORE INSERT ON public.institution_users
FOR EACH ROW EXECUTE FUNCTION check_institution_seat_limit();
