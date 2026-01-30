import { createClient } from '@supabase/supabase-js'

// Zde použij ty stejné údaje, co máš v Pythonu, ALE:
// Klíč musí být ten "anon" (public), NE service_role!
// Service_role patří jen na backend (Python), do Reactu patří anon.

const supabaseUrl = 'https://jkmcddesnvjemymfsure.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprbWNkZGVzbnZqZW15bWZzdXJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUwNzM1MCwiZXhwIjoyMDg1MDgzMzUwfQ.u4ZkhnefptvuqNNYCuAy45JwAE8R6CQNc985fmrFk-M' 

export const supabase = createClient(supabaseUrl, supabaseKey)