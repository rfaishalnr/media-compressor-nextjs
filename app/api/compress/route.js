import sharp from 'sharp';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const level = formData.get('level') || 'normal';

    if (!file) {
      return NextResponse.json({ error: 'Gambar tidak ditemukan' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type; // Membaca tipe asli: image/jpeg atau image/png
    
    // Konfigurasi kualitas berdasarkan level
    let quality = 80;
    if (level === 'low') quality = 90;
    if (level === 'normal') quality = 80;
    if (level === 'high') quality = 60;

    let sharpInstance = sharp(buffer);
    
    // Terapkan kompresi sesuai format aslinya
    if (mimeType === 'image/png') {
      // PNG dikompresi dengan mengurangi kedalaman warna (palette)
      sharpInstance = sharpInstance.png({ quality: quality, palette: true, effort: 7 });
    } else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      // JPG menggunakan mozjpeg untuk kompresi maksimal tanpa merusak visual
      sharpInstance = sharpInstance.jpeg({ quality: quality, mozjpeg: true });
    } else {
      // Fallback universal
      sharpInstance = sharpInstance.webp({ quality: quality, effort: 6 });
    }

    const compressedBuffer = await sharpInstance.toBuffer();

    return new NextResponse(compressedBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType, // Kembalikan dengan header format yang sama
      },
    });

  } catch (error) {
    console.error('Error saat kompresi:', error);
    return NextResponse.json({ error: 'Gagal mengompres gambar' }, { status: 500 });
  }
}