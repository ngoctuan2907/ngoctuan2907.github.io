-- Restore necessary SELECT privileges for authenticated users

GRANT SELECT
  ON user_profiles,
     businesses,
     reviews,
     orders
  TO authenticated;
