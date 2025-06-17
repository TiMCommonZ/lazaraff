import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
  userEmail: string;
  userRole: string;
}

export async function GET() {
  try {
    const token = (await cookies()).get('token')?.value;
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
      return NextResponse.json({ message: 'Unauthorized: No token' }, { status: 401 });
    }

    let decoded: JwtPayload;
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      decoded = { 
        userId: payload.userId as string,
        userEmail: payload.userEmail as string,
        userRole: payload.userRole as string,
      };
    } catch (error) {
      console.error('JWT Verification Error in /api/auth/me:', error);
      // Clear invalid token cookie
      (await cookies()).delete('token');
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true }, // Only return necessary user info
    });

    if (!user) {
      // Clear token if user not found (e.g., user was deleted)
      (await cookies()).delete('token');
      return NextResponse.json({ message: 'Unauthorized: User not found' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 