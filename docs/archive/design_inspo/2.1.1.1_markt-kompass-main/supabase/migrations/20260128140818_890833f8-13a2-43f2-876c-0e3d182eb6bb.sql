-- Storage Bucket für Review PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-pdfs', 'review-pdfs', true);

-- RLS Policy für den Bucket: Users können nur ihre eigenen PDFs hochladen
CREATE POLICY "Users can upload own review pdfs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'review-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users können ihre eigenen PDFs sehen
CREATE POLICY "Users can view own review pdfs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'review-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Public können PDFs ansehen (für iframe embedding)
CREATE POLICY "Public can view review pdfs"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'review-pdfs');

-- Users können ihre eigenen PDFs löschen
CREATE POLICY "Users can delete own review pdfs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'review-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);