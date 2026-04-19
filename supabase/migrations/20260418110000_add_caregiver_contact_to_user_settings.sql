-- Add caregiver contact fields used by the Settings screen.

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS caregiver_name TEXT;

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS caregiver_phone TEXT;
