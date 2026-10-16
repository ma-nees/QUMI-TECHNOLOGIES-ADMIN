import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getLocalCaseStudiesPath(): string {
  return path.resolve(process.cwd(), 'src/data/case-studies.json');
}

function getClientCaseStudiesPath(): string {
  return path.resolve(process.cwd(), '../QUMI-TECH/src/data/case-studies.json');
}

function readLocalCaseStudies(): any[] {
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
  } catch (e) {
    console.error("writeLocal error p1:", e);
  }

  try {
    const p2 = getClientCaseStudiesPath();
    if (fs.existsSync(path.dirname(p2))) {
      fs.writeFileSync(p2, content, 'utf-8');
    }
  } catch (e) {
    console.error("writeLocal error p2:", e);
  }
}

// GET: Read local case studies
export async function GET() {
  const items = readLocalCaseStudies();
  return NextResponse.json(items);
}

// POST: Add new item to local json
export async function POST(req: NextRequest) {
  try {
    const item = await req.json();
    const current = readLocalCaseStudies();
    // Prepend if not exists, or replace if exists
    const idx = current.findIndex((c: any) => String(c.id) === String(item.id));
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...item };
    } else {
      current.unshift(item);
    }
    writeLocalCaseStudies(current);
    return NextResponse.json({ success: true, count: current.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// PATCH: Update item in local json
export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    const current = readLocalCaseStudies();
    const idx = current.findIndex((c: any) => String(c.id) === String(id));
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      writeLocalCaseStudies(current);
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// PUT: Bulk sync array of case studies to local json
export async function PUT(req: NextRequest) {
  try {
    const items = await req.json();
    if (Array.isArray(items)) {
      writeLocalCaseStudies(items);
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// DELETE: Remove item by id
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const current = readLocalCaseStudies();
    const filtered = current.filter((c: any) => String(c.id) !== String(id));
    writeLocalCaseStudies(filtered);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
