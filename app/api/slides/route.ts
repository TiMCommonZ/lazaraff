import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const slides = await prisma.slide.findMany({
      include: { media: true }, // Include media details for each slide
    });
    return NextResponse.json(slides);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, link, mediaId } = await request.json();
    if (!title || !mediaId) {
      return NextResponse.json({ error: 'Title and Media ID are required' }, { status: 400 });
    }

    const newSlide = await prisma.slide.create({
      data: {
        title,
        description,
        link,
        media: {
          connect: { id: mediaId }, // Connect to an existing Media entry
        },
      },
    });
    return NextResponse.json(newSlide, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 