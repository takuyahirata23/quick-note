ALTER TABLE folders
ADD COLUMN user_id uuid REFERENCES users (id) ON DELETE CASCADE NOT NULL,
ADD COLUMN slug VARCHAR(50) NOT NULL;