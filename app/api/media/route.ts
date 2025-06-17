import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import path from 'path'; // Import path module
import { writeFile, mkdir } from 'fs/promises'; // Import file system functions

const prisma = new PrismaClient();

export async function GET() {
  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' }, // Order by creation date
    });
    return NextResponse.json(media);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const altText = formData.get('altText') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Generate a unique filename
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadsDir, filename);
    const publicUrl = `/uploads/${filename}`;

    // Convert file to buffer and write to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const newMedia = await prisma.media.create({
      data: {
        url: publicUrl,
        altText,
      },
    });
    return NextResponse.json(newMedia, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload media' }, { status: 500 });
  }
} 