import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const media = await prisma.media.findUnique({
      where: { id },
    });
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }
    return NextResponse.json(media);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { url, altText } = await request.json();
    const updatedMedia = await prisma.media.update({
      where: { id },
      data: {
        url,
        altText,
      },
    });
    return NextResponse.json(updatedMedia);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    // Before deleting Media, update related records to set mediaId to null
    await prisma.slide.updateMany({
      where: { mediaId: id },
      data: { mediaId: null },
    });

    await prisma.product.updateMany({
      where: { coverMediaId: id },
      data: { coverMediaId: null },
    });

    await prisma.article.updateMany({
      where: { OR: [{ coverMediaId: id }, { bannerMediaId: id }] },
      data: { coverMediaId: null, bannerMediaId: null },
    });

    await prisma.articleContent.updateMany({
      where: { mediaId: id },
      data: { mediaId: null },
    });

    await prisma.media.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Media deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 