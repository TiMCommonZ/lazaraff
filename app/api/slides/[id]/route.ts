import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const slide = await prisma.slide.findUnique({
      where: { id },
      include: { media: true },
    });
    if (!slide) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }
    return NextResponse.json(slide);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const { title, description, link, mediaId } = await request.json();
    const updatedSlide = await prisma.slide.update({
      where: { id },
      data: {
        title,
        description,
        link,
        mediaId,
      },
    });
    return NextResponse.json(updatedSlide);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    await prisma.slide.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Slide deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 