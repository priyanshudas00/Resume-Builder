/*
  # Create resumes table

  1. New Tables
    - `resumes`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `data` (jsonb)

  2. Security
    - Enable RLS on `resumes` table
    - Add policies for authenticated users to:
      - Read their own resumes
      - Create new resumes
      - Update their own resumes
      - Delete their own resumes
*/

CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  data jsonb NOT NULL
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own resumes
CREATE POLICY "Users can read own resumes"
  ON resumes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to create new resumes
CREATE POLICY "Users can create resumes"
  ON resumes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own resumes
CREATE POLICY "Users can update own resumes"
  ON resumes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own resumes
CREATE POLICY "Users can delete own resumes"
  ON resumes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);