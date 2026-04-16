-- Migration: Add progress_percentage, first_response_at, and completed_at columns
-- Run this in Supabase SQL Editor to update existing tables

-- Add columns to feedbacks table if they don't exist
ALTER TABLE public.feedbacks
ADD COLUMN IF NOT EXISTS progress_percentage integer 
  CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- Add columns to complaints table if they don't exist
ALTER TABLE public.complaints
ADD COLUMN IF NOT EXISTS first_response_at timestamptz,
ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- If you get "column already exists" errors, that's fine - it means the columns are already there
-- The IF NOT EXISTS clause prevents errors for duplicate additions
