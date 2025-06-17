import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    await prisma.$connect();
    const mediaCount = await prisma.media.count();
    return NextResponse.json({ message: 'Database connected successfully!', mediaCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 