-- Grant admin role to tanmayshah7424@gmail.com
-- This script safely grants admin privileges to the specified user

DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find the user ID by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'tanmayshah7424@gmail.com';

  -- Check if user exists
  IF target_user_id IS NULL THEN
    RAISE NOTICE 'User with email tanmayshah7424@gmail.com not found. Please register the account first.';
  ELSE
    -- Check if admin role already exists
    IF EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = target_user_id AND role = 'admin'
    ) THEN
      RAISE NOTICE 'User already has admin role';
    ELSE
      -- Insert admin role
      INSERT INTO public.user_roles (user_id, role)
      VALUES (target_user_id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
      
      RAISE NOTICE 'Admin role granted successfully to tanmayshah7424@gmail.com';
    END IF;
  END IF;
END $$;
