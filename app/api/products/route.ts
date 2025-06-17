import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { coverMedia: true }, // Include cover media details for each product
    });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const {
      title,
      normalPrice,
      specialPrice,
      mainRating,
      qualityRating,
      performanceRating,
      valueRating,
      qualityRatingLabel,
      performanceRatingLabel,
      valueRatingLabel,
      description,
      productLink,
      comparePriceLink,
      coverMediaId,
    } = await request.json();

    if (!title || !normalPrice || !productLink || !comparePriceLink || !coverMediaId) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        title,
        normalPrice,
        specialPrice: specialPrice || null,
        mainRating: mainRating || 0,
        qualityRating: qualityRating || 0,
        performanceRating: performanceRating || 0,
        valueRating: valueRating || 0,
        qualityRatingLabel: qualityRatingLabel || 'คุณภาพ',
        performanceRatingLabel: performanceRatingLabel || 'ประสิทธิภาพ',
        valueRatingLabel: valueRatingLabel || 'ความคุ้มค่า',
        description,
        productLink,
        comparePriceLink,
        coverMedia: {
          connect: { id: coverMediaId },
        },
      },
    });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 