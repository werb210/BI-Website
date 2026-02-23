ALTER TABLE bi_applications
ADD COLUMN source TEXT DEFAULT 'direct',
ADD COLUMN lender_email TEXT,
ADD COLUMN referrer_code TEXT;
