/*
  # Create farms and farm_photos tables

  1. New Tables
    - `farms`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `land_size` (numeric)
      - `coordinates` (jsonb)
      - `boundary_data` (jsonb)
      - `crop_types` (text array)
      - `farming_practices` (text array)
      - `planting_date` (date)
      - `verification_status` (text, default 'pending')
      - `carbon_credits` (numeric, nullable)
      - `confidence_score` (numeric, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `farm_photos`
      - `id` (uuid, primary key)
      - `farm_id` (uuid, references farms)
      - `photo_url` (text)
      - `photo_type` (text)
      - `uploaded_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create farms table
CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  land_size numeric NOT NULL,
  coordinates jsonb,
  boundary_data jsonb,
  crop_types text[] DEFAULT '{}',
  farming_practices text[] DEFAULT '{}',
  planting_date date NOT NULL,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  carbon_credits numeric,
  confidence_score numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create farm_photos table
CREATE TABLE IF NOT EXISTS farm_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
  photo_url text NOT NULL,
  photo_type text NOT NULL CHECK (photo_type IN ('soil', 'crops', 'trees', 'general')),
  uploaded_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for farms table
CREATE POLICY "Users can view their own farms"
  ON farms
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own farms"
  ON farms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farms"
  ON farms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farms"
  ON farms
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for farm_photos table
CREATE POLICY "Users can view photos of their own farms"
  ON farm_photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_photos.farm_id 
      AND farms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert photos for their own farms"
  ON farm_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_photos.farm_id 
      AND farms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update photos of their own farms"
  ON farm_photos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_photos.farm_id 
      AND farms.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_photos.farm_id 
      AND farms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos of their own farms"
  ON farm_photos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_photos.farm_id 
      AND farms.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS farms_user_id_idx ON farms(user_id);
CREATE INDEX IF NOT EXISTS farms_verification_status_idx ON farms(verification_status);
CREATE INDEX IF NOT EXISTS farms_created_at_idx ON farms(created_at);
CREATE INDEX IF NOT EXISTS farm_photos_farm_id_idx ON farm_photos(farm_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for farms table
DROP TRIGGER IF EXISTS update_farms_updated_at ON farms;
CREATE TRIGGER update_farms_updated_at
  BEFORE UPDATE ON farms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();