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
  const { error, count } = await getSupabase()
    .from('contact_submissions')
    .delete({ count: 'exact' })
    .eq('id', id);
    
  if (error) throw new Error(error.message);
  if (count === 0) throw new Error("Deletion blocked by Supabase RLS. Please add a DELETE policy in your Supabase dashboard.");
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
  const { created_at, ...cleanData } = settingsData || {};
  const { error } = await getSupabase()
    .from('company_settings')
    .upsert({ id: 1, ...cleanData });
    
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
  const { error, count } = await getSupabase()
    .from('jobs')
    .delete({ count: 'exact' })
    .eq('id', id);
    
  if (error) throw new Error(error.message);
  if (count === 0) throw new Error("Deletion blocked by Supabase RLS. Please add a DELETE policy in your Supabase dashboard.");
  return { success: true };
}

export function getResumeUrl(path: string) {
  if (!path) return null;
  const { data } = getSupabase().storage.from('resumes').getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteApplication(id: string | number) {
  const { error, count } = await getSupabase()
    .from('job_applications')
    .delete({ count: 'exact' })
    .eq('id', id);
    
  if (error) throw new Error(error.message);
  if (count === 0) throw new Error("Deletion blocked by Supabase RLS. Please add a DELETE policy in your Supabase dashboard.");
  return { success: true };
}

function isUuid(id: any): boolean {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/* ---------------------------- Project Case Studies (Authenticated Client Actions) ---------------------------- */
export async function fetchCaseStudies() {
  try {
    const { data, error } = await getSupabase()
      .from('case_studies')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      // Sync to local JSON in background
      try {
        fetch('/api/case-studies', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).catch(() => {});
      } catch {}
      return data;
    }

    if (error) {
      console.warn("fetchCaseStudies Supabase warning, trying local fallback:", error.message);
    }
  } catch (err: any) {
    console.warn("fetchCaseStudies catch, fallback to local:", err.message);
  }

  // Fallback to local JSON sync
  try {
    const res = await fetch('/api/case-studies');
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

export async function createCaseStudy(item: any) {
  const { id, ...dataToInsert } = item;

  // Let Supabase generate a clean UUID if id is missing or not a valid UUID
  const payload: any = {
    ...dataToInsert,
    ...(isUuid(id) ? { id } : {}),
  };

  const { data, error } = await getSupabase()
    .from('case_studies')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("createCaseStudy Supabase error:", error);
    // Also save to local sync so work is preserved
    const fallbackItem = { ...payload, id: id || `cs-${Date.now()}`, created_at: new Date().toISOString() };
    try {
      await fetch('/api/case-studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fallbackItem),
      });
    } catch {}

    throw new Error(
      `Supabase DB Error: ${error.message}${
        error.code === '42501'
          ? ' (Permission denied. Please run GRANT ALL ON public.case_studies TO authenticated, anon; in Supabase SQL editor)'
          : ''
      }`
    );
  }

  // Sync to local JSON
  try {
    await fetch('/api/case-studies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {}

  return { success: true, item: data };
}

export async function updateCaseStudy(id: string | number, item: any) {
  const { id: _, ...payload } = item;

  const { data, error } = await getSupabase()
    .from('case_studies')
    .update(payload)
    .eq('id', id)
    .select();

  if (error) {
    console.error("updateCaseStudy Supabase error:", error);
    try {
      await fetch('/api/case-studies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...payload }),
      });
    } catch {}
    throw new Error(`Supabase DB Error: ${error.message}`);
  }

  try {
    await fetch('/api/case-studies', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...payload }),
    });
  } catch {}

  return { success: true, item: data?.[0] };
}

export async function deleteCaseStudy(id: string | number) {
  // If not a valid UUID (e.g. mock/local item), delete only from local JSON
  if (!isUuid(id)) {
    try {
      await fetch(`/api/case-studies?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch {}
    return { success: true };
  }

  const { error, count } = await getSupabase()
    .from('case_studies')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) {
    console.error("deleteCaseStudy Supabase error:", error);
    throw new Error(`Supabase DB Error: ${error.message}`);
  }

  if (count === 0) {
    throw new Error(
      "Deletion blocked by Supabase Row Level Security (RLS). Please run the SQL query to grant DELETE policy on public.case_studies."
    );
  }

  try {
    await fetch(`/api/case-studies?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch {}

  return { success: true };
}

/* ---------------------------- Image Upload Actions (Server Actions) ---------------------------- */
export {
  uploadCaseStudyImage,
  uploadCaseStudyImage as uploadImage,
  checkCloudinaryConfigured,
} from './case-studies';



