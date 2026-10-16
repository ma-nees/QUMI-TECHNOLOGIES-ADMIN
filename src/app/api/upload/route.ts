import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    provider: 'cloudinary',
    configured: isCloudinaryConfigured(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Handle multipart/form-data upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const folder = (formData.get('folder') as string) || 'qumi/case-studies';

      if (!file) {
        return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
      }

      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'File must be an image (PNG, JPG, WebP, etc.)' }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadToCloudinary(buffer, { folder });

      return NextResponse.json({
        success: true,
        url: result.secure_url,
        publicUrl: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        provider: 'cloudinary',
      });
    }

    // Handle JSON payload (e.g. { image: "data:image/... or url", folder?: string })
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { image, folder = 'qumi/case-studies' } = body;

      if (!image) {
        return NextResponse.json({ error: 'Missing image string or base64 in request body' }, { status: 400 });
      }

      const result = await uploadToCloudinary(image, { folder });

      return NextResponse.json({
        success: true,
        url: result.secure_url,
        publicUrl: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        provider: 'cloudinary',
      });
    }

    return NextResponse.json({ error: 'Unsupported Content-Type. Use multipart/form-data or application/json' }, { status: 415 });
  } catch (error: any) {
    console.error('Cloudinary API upload error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Image upload failed',
      },
      { status: 500 }
    );
  }
}
