-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  total_scans INTEGER DEFAULT 0,
  co2_saved DECIMAL(10,2) DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scan_results table
CREATE TABLE IF NOT EXISTS scan_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  material TEXT NOT NULL,
  confidence DECIMAL(5,2) NOT NULL,
  instructions TEXT NOT NULL,
  bin_color TEXT NOT NULL,
  recyclable BOOLEAN NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to increment values
CREATE OR REPLACE FUNCTION increment(row_id UUID, column_name TEXT, amount INTEGER DEFAULT 1)
RETURNS INTEGER AS $$
BEGIN
  EXECUTE format('UPDATE users SET %I = %I + $1 WHERE id = $2', column_name, column_name)
  USING amount, row_id;
  RETURN amount;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for scan_results table
CREATE POLICY "Users can view own scan results" ON scan_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan results" ON scan_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for achievements table
CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default achievements
INSERT INTO achievements (user_id, name, description, unlocked) VALUES
  ('00000000-0000-0000-0000-000000000000', 'First Scan', 'Completed your first waste scan', false),
  ('00000000-0000-0000-0000-000000000000', 'Eco Warrior', 'Scanned 10 items correctly', false),
  ('00000000-0000-0000-0000-000000000000', 'Green Thumb', 'Saved 5kg of CO2', false),
  ('00000000-0000-0000-0000-000000000000', 'Recycling Master', 'Scan 100 items', false),
  ('00000000-0000-0000-0000-000000000000', 'Planet Protector', 'Save 50kg of CO2', false); 