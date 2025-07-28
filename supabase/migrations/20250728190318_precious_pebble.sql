/*
  # Add rejection reasons column to farms table

  1. Changes
    - Add `rejection_reasons` column to farms table to store AI verification rejection reasons
    - Column is nullable and stores array of text reasons

  2. Security
    - No changes to RLS policies needed
*/

-- Add rejection_reasons column to farms table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farms' AND column_name = 'rejection_reasons'
  ) THEN
    ALTER TABLE farms ADD COLUMN rejection_reasons text[];
  END IF;
END $$;