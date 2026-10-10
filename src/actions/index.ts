import { supabase } from '@/lib/supabase';

// We use the client-side supabase instance because it automatically attaches the admin's JWT session token!
const getSupabase = () => {
  if (!supabase) throw new Error("Supabase client not initialized");
  return supabase;
};

export async function fetchContactMessages() {
  const { data, error } = await getSupabase()
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteContactMessage(id: string | number) {
  const { error } = await getSupabase()
    .from('contact_submissions')
    .delete()
    .eq('id', id);
    
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function fetchJobs() {
  const { data, error } = await getSupabase()
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw new Error(error.message);
  return data;
}

export async function createJob(jobData: any) {
  const { error } = await getSupabase()
    .from('jobs')
    .insert([jobData]);
    
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function updateJob(id: string | number, jobData: any) {
  const { error } = await getSupabase()
    .from('jobs')
    .update(jobData)
    .eq('id', id);
    
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function fetchSettings() {
  const { data, error } = await getSupabase()
    .from('company_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  
  if (error) {
    console.error("fetchSettings error:", error);
    return null;
  }
  return data;
}

export async function saveSettings(settingsData: any) {
  const { error } = await getSupabase()
    .from('company_settings')
    .upsert({ id: 1, ...settingsData });
    
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function fetchApplications() {
  const { data, error } = await getSupabase()
    .from('job_applications')
    .select('*, jobs(title)')
    .order('created_at', { ascending: false });
    
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteJob(id: string | number) {
  const { error } = await getSupabase()
    .from('jobs')
    .delete()
    .eq('id', id);
    
  if (error) throw new Error(error.message);
  return { success: true };
}

export function getResumeUrl(path: string) {
  if (!path) return null;
  const { data } = getSupabase().storage.from('resumes').getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteApplication(id: string | number) {
  const { error } = await getSupabase()
    .from('job_applications')
    .delete()
    .eq('id', id);
    
  if (error) throw new Error(error.message);
  return { success: true };
}

