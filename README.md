<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1RharBe85_L9NfuFs24e0QLzPTdtyXwiA

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure Supabase schema:
   - Run `supabase/schema.sql` in the Supabase SQL editor
   - (Optional) Run `supabase/seed.sql` to seed squads
   - Promote an admin by setting `profiles.role = 'Master'` for the chosen user
3. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
4. Set the Supabase env vars in `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Run the app:
   `npm run dev`
