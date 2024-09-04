import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://torpvyrsbrlsvxdiechv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvcnB2eXJzYnJsc3Z4ZGllY2h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDUxMzk3MiwiZXhwIjoyMDQwMDg5OTcyfQ.L2iidcWEOwzo14QB3_mnY2PX2ZfWV6h-Qzb1ZDD09HM';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;