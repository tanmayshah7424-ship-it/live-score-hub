DO $$
DECLARE
  target_email TEXT := 'tanmayshah7424@gmail.com';
  user_found UUID;
  role_found TEXT;
BEGIN
  -- 1. Check if user exists in Auth
  SELECT id INTO user_found FROM auth.users WHERE email = target_email;
  
  IF user_found IS NULL THEN
    RAISE EXCEPTION '❌ User % does NOT exist in auth.users. Please Go to /register and Sign Up first.', target_email;
  END IF;

  -- 2. Check if user has admin role
  SELECT role INTO role_found FROM public.user_roles WHERE user_id = user_found AND role = 'admin';
  
  IF role_found IS NULL THEN
     RAISE EXCEPTION '❌ User found, but ADMIN role is MISSING. Please run "setup_schema_and_admin.sql" again.';
  ELSE
     RAISE NOTICE '✅ SUCCESS! User % exists and has the ADMIN role.', target_email;
  END IF;
END $$;
