import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { ArticleContentType } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { articleId, type, order, text, mediaId, productId } = await request.json();

    if (!articleId || !type || order === undefined) {
      return NextResponse.json({ error: 'Article ID, type, and order are required' }, { status: 400 });
    }

    let data: any = {
      article: { connect: { id: articleId } },
      type,
      order,
    };

    if (type === ArticleContentType.TEXT) {
      if (!text) {
        return NextResponse.json({ error: 'Text content is required for TEXT type' }, { status: 400 });
      }
      data.text = text;
    } else if (type === ArticleContentType.IMAGE) {
      if (!mediaId) {
        return NextResponse.json({ error: 'Media ID is required for IMAGE type' }, { status: 400 });
      }
      data.media = { connect: { id: mediaId } };
    } else if (type === ArticleContentType.PRODUCT) {
      if (!productId) {
        return NextResponse.json({ error: 'Product ID is required for PRODUCT type' }, { status: 400 });
      }
      data.product = { connect: { id: productId } };
    }

    const newArticleContent = await prisma.articleContent.create({
      data,
    });

    return NextResponse.json(newArticleContent, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 