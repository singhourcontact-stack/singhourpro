import { supabase } from '@/lib/supabase';

export interface PortfolioItem {
  id: string;
  professional_id: string;
  title: string;
  description?: string;
  category?: string;
  photo_url: string;
  created_at: string;
}

export async function uploadImageToStorage(userId: string, uri: string): Promise<string | null> {
  try {
    const filename = `portfolio-${userId}-${Date.now()}.jpg`;
    const path = `portfolio/${userId}/${filename}`;

    // Read file as base64 for React Native
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Convert blob to base64 string
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
    reader.readAsDataURL(blob);
    const base64Data = await base64Promise;
    
    // Remove data URL prefix to get just the base64 data
    const base64String = base64Data.split(',')[1];
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const { error } = await supabase.storage
      .from('portfolio')
      .upload(path, bytes, { contentType: 'image/jpeg', upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from('portfolio').getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.error('uploadImageToStorage error:', err);
    return null;
  }
}

export async function addPortfolioItems(params: {
  userId: string;
  items: Array<{ photo_url: string }>; 
  title: string;
  description?: string;
  category?: string;
}): Promise<{ success: boolean; error?: string } > {
  try {
    const rows = params.items.map(i => ({
      professional_id: params.userId,
      title: params.title,
      description: params.description ?? null,
      category: params.category ?? null,
      photo_url: i.photo_url,
    }));

    const { error } = await supabase.from('portfolio').insert(rows);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('addPortfolioItems error:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

export async function fetchPortfolio(userId: string): Promise<PortfolioItem[]> {
  const { data, error } = await supabase
    .from('portfolio')
    .select('*')
    .eq('professional_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('fetchPortfolio error:', error);
    return [];
  }
  return (data as PortfolioItem[]) || [];
}

export async function deletePortfolioItem(itemId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('portfolio').delete().eq('id', itemId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deletePortfolioItem error:', err);
    return false;
  }
}


