-- Drop the existing pastry_ratings table which includes star ratings
DROP TABLE IF EXISTS pastry_ratings;

-- Ensure the pastry_feedback table exists (and create it if not)
-- This table will store only free-form feedback without ratings
CREATE TABLE IF NOT EXISTS pastry_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL, -- Store the user's name for displaying who submitted it
  feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for pastry_feedback table
ALTER TABLE pastry_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback
CREATE POLICY "Anyone can add feedback" ON pastry_feedback
  FOR INSERT WITH CHECK (true);

-- Allow users to read feedback
CREATE POLICY "Anyone can read feedback" ON pastry_feedback
  FOR SELECT USING (true);

-- Only admins can delete feedback
CREATE POLICY "Only admins can delete feedback" ON pastry_feedback
  FOR DELETE USING (auth.uid() IN (SELECT auth.uid() FROM users WHERE is_admin = true)); 