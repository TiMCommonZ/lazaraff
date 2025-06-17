import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: { 
        coverMedia: true,
        bannerMedia: true,
        contents: { 
          orderBy: { order: 'asc' }, // Order contents by their 'order' field
          include: { media: true, product: { include: { coverMedia: true } } }
        } 
      },
    });
    console.log("API GET Article details:", article);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const { title, slug, description, coverMediaId, bannerMediaId, contents } = await request.json();

    // Delete existing article contents first
    await prisma.articleContent.deleteMany({
      where: { articleId: id },
    });

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        coverMediaId,
        bannerMediaId,
        contents: {
          create: contents.map((contentBlock: any) => ({
            type: contentBlock.type,
            order: contentBlock.order,
            ...(contentBlock.type === 'TEXT' && { text: contentBlock.value }),
            ...(contentBlock.type === 'IMAGE' && contentBlock.value ? { media: { connect: { id: contentBlock.value } } } : {}),
            ...(contentBlock.type === 'PRODUCT' && contentBlock.value ? { 
              product: { connect: { id: contentBlock.value } },
              productTag: contentBlock.productTag || null
            } : {}),
          })),
        },
      },
    });
    return NextResponse.json(updatedArticle);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    await prisma.article.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Article deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 