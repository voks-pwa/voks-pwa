import { supabase } from '@/lib/supabase';

const AVATAR_MAX_WIDTH = 400;
const AVATAR_MAX_HEIGHT = 400;
const AVATAR_QUALITY = 0.8;

function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > AVATAR_MAX_WIDTH || height > AVATAR_MAX_HEIGHT) {
        const ratio = Math.min(AVATAR_MAX_WIDTH / width, AVATAR_MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/jpeg', AVATAR_QUALITY);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const resized = await resizeImage(file);
  const path = `${userId}/avatar.jpg`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, resized, { contentType: 'image/jpeg', upsert: true });
  if (uploadError) {
    if (uploadError.message?.includes('bucket')) {
      const { error: bucketError } = await supabase.storage.createBucket('avatars', { public: true });
      if (bucketError) throw bucketError;
      const { error: retryError } = await supabase.storage
        .from('avatars')
        .upload(path, resized, { contentType: 'image/jpeg', upsert: true });
      if (retryError) throw retryError;
    } else {
      throw uploadError;
    }
  }
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteOldAvatar(url: string | null) {
  if (!url) return;
  try {
    const parsed = new URL(url);
    const pathMatch = parsed.pathname.match(/\/avatars\/(.+)$/);
    if (pathMatch) {
      await supabase.storage.from('avatars').remove([pathMatch[1]]);
    }
  } catch {
    // external URL, skip deletion
  }
}

export function getAvatarSrc(profileAvatar: string | null, userMetadata: Record<string, unknown> | undefined) {
  if (profileAvatar) {
    if (/^https?:\/\//i.test(profileAvatar)) return profileAvatar;
    const { data } = supabase.storage.from('avatars').getPublicUrl(profileAvatar);
    return data.publicUrl;
  }
  const meta = userMetadata as Record<string, string | undefined> | undefined;
  return meta?.avatar_url ?? meta?.picture ?? 'https://placehold.co/200';
}
