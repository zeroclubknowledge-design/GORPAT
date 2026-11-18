/* Supabase project for Gorpat Trading Limited.
 * The anon key is a PUBLIC key by design: it is meant to be in website code.
 * What it can do is limited by the Row Level Security rules in supabase/schema.sql.
 * Never put the service_role key or the database password in this file. */
window.GT_CONFIG = {
  supabaseUrl: 'https://zzvcsophxyjmycvzfiof.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6dmNzb3BoeHlqbXljdnpmaW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwMjQzMTMsImV4cCI6MjExMDYwMDMxM30.Y2yHRKHf5rHAU9GUBIyKH9BzkgA6veYa2-QXsmBXUCA',
  // Optional background video for the admin sign-in screen, e.g. 'assets/video/signin.mp4'.
  // Keep the file in this repo (the page's security policy only allows same-site media).
  signinVideo: '',
};
