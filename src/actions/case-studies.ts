'use server';

import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

function getLocalCaseStudiesPath(): string {
  return path.resolve(process.cwd(), 'src/data/case-studies.json');
}

function getClientCaseStudiesPath(): string {
  return path.resolve(process.cwd(), '../QUMI-TECH/src/data/case-studies.json');
}

function readLocalCaseStudies() {
  try {
    const p = getLocalCaseStudiesPath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  } catch (e) {
    console.error("readLocalCaseStudies error:", e);
  }
  return [];
}

function writeLocalCaseStudies(items: any[]) {
  const content = JSON.stringify(items, null, 2);
  try {
    const p1 = getLocalCaseStudiesPath();
    fs.mkdirSync(path.dirname(p1), { recursive: true });
    fs.writeFileSync(p1, content, 'utf-8');
  } catch (e) {}

  try {
    const p2 = getClientCaseStudiesPath();
    if (fs.existsSync(path.dirname(p2))) {
      fs.writeFileSync(p2, content, 'utf-8');
    }
  } catch (e) {}
}

export async function fetchCaseStudies() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        writeLocalCaseStudies(data);
        return data;
      }
    } catch (e) {
      // Supabase table not created yet or RLS restricted
    }
  }

  return readLocalCaseStudies();
}

export async function createCaseStudy(item: any) {
  const newId = item.id || `cs-${Date.now()}`;
  const record = {
    id: newId,
    created_at: new Date().toISOString(),
    is_published: item.is_published ?? true,
    ...item,
  };

  if (supabase) {
    try {
      await supabase.from('case_studies').insert([record]);
    } catch (e) {
      console.warn("Supabase case_studies insert skipped (persisted to local sync):", e);
    }
  }

  const current = readLocalCaseStudies();
  current.unshift(record);
  writeLocalCaseStudies(current);

  return { success: true, item: record };
}

export async function updateCaseStudy(id: string | number, item: any) {
  if (supabase) {
    try {
      await supabase.from('case_studies').update(item).eq('id', id);
    } catch (e) {
      console.warn("Supabase case_studies update skipped (persisted to local sync):", e);
    }
  }

  const current = readLocalCaseStudies();
  const index = current.findIndex((c: any) => String(c.id) === String(id));
  if (index !== -1) {
    current[index] = { ...current[index], ...item };
    writeLocalCaseStudies(current);
  }

  return { success: true };
}

export async function deleteCaseStudy(id: string | number) {
  if (supabase) {
    try {
      await supabase.from('case_studies').delete().eq('id', id);
    } catch (e) {
      console.warn("Supabase case_studies delete skipped (persisted to local sync):", e);
    }
  }

  const current = readLocalCaseStudies();
  const filtered = current.filter((c: any) => String(c.id) !== String(id));
  writeLocalCaseStudies(filtered);

  return { success: true };
}

export async function uploadCaseStudyImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error("No file uploaded");
  if (!supabase) throw new Error("Supabase client unavailable");

  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `applications/case-studies/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
  const { error } = await supabase.storage.from('resumes').upload(fileName, file, {
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  const { data: pub } = supabase.storage.from('resumes').getPublicUrl(fileName);
  return { publicUrl: pub.publicUrl };
}
