import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mpefzgmlmpvvyiutcdcb.supabase.co';
const supabaseKey = 'sb_publishable_KNSxISmV3s-RTtBGGfyyLA_61TSuWwd';

export const supabase = createClient(supabaseUrl, supabaseKey);