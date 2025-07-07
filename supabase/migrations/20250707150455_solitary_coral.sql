/*
  # Add Content Moderation System

  1. New Tables
    - `moderation_reports` - Store user reports for content
    - `moderation_actions` - Track moderation actions taken
  
  2. Security
    - Enable RLS
    - Only admins can view moderation data
*/

-- Create moderation reports table
CREATE TABLE IF NOT EXISTS moderation_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_email text,
  content_type text NOT NULL CHECK (content_type IN ('article', 'comment')),
  content_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'misinformation', 'harassment', 'other')),
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create moderation actions table
CREATE TABLE IF NOT EXISTS moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES moderation_reports(id) ON DELETE CASCADE,
  moderator_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action_type text NOT NULL CHECK (action_type IN ('approve', 'hide', 'delete', 'edit', 'warn')),
  reason text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for moderation_reports
CREATE POLICY "Anyone can submit reports"
  ON moderation_reports
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all reports"
  ON moderation_reports
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update reports"
  ON moderation_reports
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for moderation_actions
CREATE POLICY "Admins can manage moderation actions"
  ON moderation_actions
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON moderation_reports(status);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_content_type ON moderation_reports(content_type);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_created_at ON moderation_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_report_id ON moderation_actions(report_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_moderator_id ON moderation_actions(moderator_id);

-- Add trigger for updated_at
CREATE TRIGGER set_moderation_reports_updated_at
  BEFORE UPDATE ON moderation_reports
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();