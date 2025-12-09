# Hologram Book - Database Setup

## Supabase Database Configuration

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from Settings > API

### 2. Configure Environment Variables
Update the `.env` file in the hologram-book directory:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create the Comments Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create comments table
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  comment TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read comments
CREATE POLICY "Allow public read access"
  ON comments FOR SELECT
  TO public
  USING (true);

-- Create policy to allow anyone to insert comments
CREATE POLICY "Allow public insert access"
  ON comments FOR INSERT
  TO public
  WITH CHECK (true);

-- Enable real-time for the comments table
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
```

### 4. Alternative: Using Existing Rating System Table

If you want to use the existing feedback table from the rating system:

```sql
-- Add missing columns if needed
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS name TEXT;

-- Create a view that maps feedback to comments structure
CREATE OR REPLACE VIEW comments AS
SELECT 
  id,
  name,
  title as tagline,
  feedback as comment,
  rating,
  timestamp as created_at
FROM feedback;
```

### 5. Test the Connection

After configuration:
1. Restart your development server: `npm start`
2. The hologram book will automatically fetch data from Supabase
3. New comments added via the rating system will appear in real-time

### Data Structure

The component expects data in this format:

```javascript
{
  id: number,
  name: string,          // Guest name
  tagline: string,       // Guest title/role
  comment: string,       // Feedback message
  rating: number,        // 1-5 stars
  created_at: timestamp  // When comment was created
}
```

### Real-time Updates

The hologram book automatically subscribes to database changes and updates in real-time when:
- New comments are added
- Existing comments are updated
- Comments are deleted

No page refresh needed!

## Troubleshooting

**Issue: "Failed to fetch comments"**
- Check your Supabase URL and anon key in `.env`
- Verify the table name is `comments`
- Ensure RLS policies allow public read access

**Issue: "No entries yet"**
- Add sample data to test:
```sql
INSERT INTO comments (name, tagline, comment, rating)
VALUES 
  ('John Doe', 'Event Guest', 'Amazing holographic experience!', 5),
  ('Jane Smith', 'Developer', 'Beautiful animations and smooth UI', 5);
```

**Issue: Real-time updates not working**
- Verify real-time is enabled in Supabase dashboard
- Check that the table is added to the `supabase_realtime` publication
