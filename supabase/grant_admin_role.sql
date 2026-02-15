-- Grant admin role to a user by email
-- Usage: Replace 'your_email@example.com' with the user's email address

DO $$
DECLARE
  target_email TEXT := 'tanmayshah7424@gmail.com'; -- <<< REPLACE THIS
  target_user_id UUID;
BEGIN
  -- Find the user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'User with email % not found', target_email;
  ELSE
    -- Check if role already exists
    IF EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = target_user_id AND role = 'admin'
    ) THEN
      RAISE NOTICE 'User % is already an admin', target_email;
    ELSE
      -- Insert admin role
      INSERT INTO public.user_roles (user_id, role)
      VALUES (target_user_id, 'admin');
      RAISE NOTICE 'Granted admin role to %', target_email;
    END IF;
  END IF;
END $$;
