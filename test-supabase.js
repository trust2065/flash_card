import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://incjshfemocejgesvvaj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluY2pzaGZlbW9jZWpnZXN2dmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjI1OTUsImV4cCI6MjA5MDI5ODU5NX0.uCiTIn7w5aaHkhTfHp4HHt5H2oUQf2SugXAO_sOsC3U')

async function test() {
  const { data, error } = await supabase.from('flashcard_progress').select('*').limit(5)
  console.log('Select Result:', data, error)
  
  const { data: insertData, error: insertError } = await supabase.from('flashcard_progress').upsert({
    user_id: 'bamboo',
    char: '測試',
    bucket: 1,
    last_seen: new Date().toISOString()
  }, { onConflict: 'user_id,char' })
  console.log('Insert Result:', insertData, insertError)
}

test()
