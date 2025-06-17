import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { ArticleContentType } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const articleContent = await prisma.articleContent.findUnique({
      where: { id },
      include: { media: true, product: true },
    });
    if (!articleContent) {
      return NextResponse.json({ error: 'Article Content not found' }, { status: 404 });
    }
    return NextResponse.json(articleContent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { type, order, text, mediaId, productId } = await request.json();

    let data: any = {
      type,
      order,
    };

    if (type === ArticleContentType.TEXT) {
      if (!text) {
        return NextResponse.json({ error: 'Text content is required for TEXT type' }, { status: 400 });
      }
      data.text = text;
      data.mediaId = null; // Clear media and product for text type
      data.productId = null;
    } else if (type === ArticleContentType.IMAGE) {
      if (!mediaId) {
        return NextResponse.json({ error: 'Media ID is required for IMAGE type' }, { status: 400 });
      }
      data.mediaId = mediaId;
      data.text = null; // Clear text and product for image type
      data.productId = null;
    } else if (type === ArticleContentType.PRODUCT) {
      if (!productId) {
        return NextResponse.json({ error: 'Product ID is required for PRODUCT type' }, { status: 400 });
      }
      data.productId = productId;
      data.text = null; // Clear text and media for product type
      data.mediaId = null;
    }

    const updatedArticleContent = await prisma.articleContent.update({
      where: { id },
      data,
    });
    return NextResponse.json(updatedArticleContent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.articleContent.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Article Content deleted successfully' }, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 