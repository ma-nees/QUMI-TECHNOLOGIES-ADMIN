'use server';

import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';
import { uploadToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

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
  let imageUrl = item.image_url;

  // If admin provided a data URI (e.g. pasted base64), upload to Cloudinary so clean URL is saved to DB
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('data:image/') && isCloudinaryConfigured()) {
    try {
      const cldRes = await uploadToCloudinary(imageUrl, { folder: 'qumi/case-studies' });
      imageUrl = cldRes.secure_url;
    } catch (e) {
      console.error("Auto-upload base64 to Cloudinary failed:", e);
    }
  }

  const record = {
    id: newId,
    created_at: new Date().toISOString(),
    is_published: item.is_published ?? true,
    ...item,
    image_url: imageUrl,
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
  const updatedItem = { ...item };

  // If updated image is a data URI, upload to Cloudinary
  if (
    updatedItem.image_url &&
    typeof updatedItem.image_url === 'string' &&
    updatedItem.image_url.startsWith('data:image/') &&
    isCloudinaryConfigured()
  ) {
    try {
      const cldRes = await uploadToCloudinary(updatedItem.image_url, { folder: 'qumi/case-studies' });
      updatedItem.image_url = cldRes.secure_url;
    } catch (e) {
      console.error("Auto-upload base64 to Cloudinary failed:", e);
    }
  }

  if (supabase) {
    try {
      await supabase.from('case_studies').update(updatedItem).eq('id', id);
    } catch (e) {
      console.warn("Supabase case_studies update skipped (persisted to local sync):", e);
    }
  }

  const current = readLocalCaseStudies();
  const index = current.findIndex((c: any) => String(c.id) === String(id));
  if (index !== -1) {
    current[index] = { ...current[index], ...updatedItem };
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

  if (!file.type.startsWith('image/')) {
    throw new Error("Invalid file type. Please select an image (PNG, JPG, WebP, SVG, GIF).");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 1. Upload to Cloudinary if configured
  if (isCloudinaryConfigured()) {
    try {
      const res = await uploadToCloudinary(buffer, {
        folder: 'qumi/case-studies',
      });
      return {
        publicUrl: res.secure_url,
        secure_url: res.secure_url,
        public_id: res.public_id,
        provider: 'cloudinary' as const,
      };
    } catch (cldErr: any) {
      console.error("Cloudinary upload failed:", cldErr);
      throw new Error(`Cloudinary upload failed: ${cldErr.message || 'Unknown error'}`);
    }
  }

  // 2. Fallback to Supabase storage if Cloudinary is not configured yet
  if (supabase) {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `applications/case-studies/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const { error } = await supabase.storage.from('resumes').upload(fileName, file, {
        contentType: file.type,
      });
      if (!error) {
        const { data: pub } = supabase.storage.from('resumes').getPublicUrl(fileName);
        return {
          publicUrl: pub.publicUrl,
          secure_url: pub.publicUrl,
          provider: 'supabase' as const,
        };
      }
    } catch (storageErr) {
      console.warn("Supabase storage fallback failed:", storageErr);
    }
  }

  throw new Error(
    "Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env.local file."
  );
}

export async function checkCloudinaryConfigured() {
  return isCloudinaryConfigured();
}
