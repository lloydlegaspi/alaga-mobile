-- Add a singleton settings record for app-level preferences used by alaga-mobile.

CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  display_name TEXT NOT NULL DEFAULT 'User',
  text_size TEXT NOT NULL DEFAULT 'Standard' CHECK (text_size IN ('Standard', 'Large')),
  reminder_sound TEXT NOT NULL DEFAULT 'On' CHECK (reminder_sound IN ('On', 'Off')),
  high_contrast BOOLEAN NOT NULL DEFAULT FALSE,
  language TEXT NOT NULL DEFAULT 'English' CHECK (language IN ('English', 'Filipino')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_settings TO anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'user_settings_read_all'
  ) THEN
    CREATE POLICY user_settings_read_all ON user_settings
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'user_settings_insert_all'
  ) THEN
    CREATE POLICY user_settings_insert_all ON user_settings
      FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'user_settings_update_all'
  ) THEN
    CREATE POLICY user_settings_update_all ON user_settings
      FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'user_settings_delete_all'
  ) THEN
    CREATE POLICY user_settings_delete_all ON user_settings
      FOR DELETE
      USING (true);
  END IF;
END $$;

INSERT INTO user_settings (id, display_name, text_size, reminder_sound, high_contrast, language)
VALUES ('default', 'User', 'Standard', 'On', FALSE, 'English')
ON CONFLICT (id) DO NOTHING;