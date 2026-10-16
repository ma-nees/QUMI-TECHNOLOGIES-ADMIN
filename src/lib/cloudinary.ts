import { v2 as cloudinary } from 'cloudinary';

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (cloudinaryUrl) {
    cloudinary.config({
      cloudinary_url: cloudinaryUrl,
      secure: true,
    });
  } else if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }
}

// Initial config
configureCloudinary();

/**
 * Check if Cloudinary credentials are fully configured
 */
export function isCloudinaryConfigured(): boolean {
  configureCloudinary();
  if (process.env.CLOUDINARY_URL) return true;
  return Boolean(
    (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format?: string;
  width?: number;
  height?: number;
}

export interface UploadOptions {
  folder?: string;
  tags?: string[];
  public_id?: string;
}

/**
 * Uploads a Buffer, Uint8Array, or base64 data URI to Cloudinary
 */
export async function uploadToCloudinary(
  fileData: Buffer | Uint8Array | string,
  options?: UploadOptions
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local'
    );
  }

  const folder = options?.folder || 'qumi/case-studies';

  // If string (e.g. data URI: "data:image/png;base64,...")
  if (typeof fileData === 'string') {
    const result = await cloudinary.uploader.upload(fileData, {
      folder,
      resource_type: 'image',
      public_id: options?.public_id,
      tags: options?.tags || ['qumi', 'case-study'],
    });

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    };
  }

  // If Buffer or Uint8Array, upload via upload_stream
  const buffer = Buffer.isBuffer(fileData) ? fileData : Buffer.from(fileData);

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: options?.public_id,
        tags: options?.tags || ['qumi', 'case-study'],
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Failed to upload image to Cloudinary'));
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export { cloudinary };
