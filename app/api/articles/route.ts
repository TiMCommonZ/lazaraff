import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      include: { coverMedia: true, bannerMedia: true }, // Include related media
      orderBy: { createdAt: 'desc' }, // Order by creation date for latest articles
    });
    return NextResponse.json(articles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, slug, description, coverMediaId, bannerMediaId, contents } = await request.json();

    if (!title || !slug || !coverMediaId || !bannerMediaId) {
      return NextResponse.json({ error: 'Title, Slug, Cover Media ID, and Banner Media ID are required' }, { status: 400 });
    }

    const newArticle = await prisma.article.create({
      data: {
        title,
        slug,
        description,
        coverMedia: {
          connect: { id: coverMediaId },
        },
        bannerMedia: {
          connect: { id: bannerMediaId },
        },
        contents: {
          create: contents.map((contentBlock: any) => ({
            type: contentBlock.type,
            order: contentBlock.order,
            ...(contentBlock.type === 'TEXT' && { text: contentBlock.value }),
            ...(contentBlock.type === 'IMAGE' && { media: { connect: { id: contentBlock.value } } }),
            ...(contentBlock.type === 'PRODUCT' && { 
              product: { connect: { id: contentBlock.value } },
              productTag: contentBlock.productTag || null
            }),
          })),
        },
      },
    });
    return NextResponse.json(newArticle, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 