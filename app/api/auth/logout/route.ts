import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Delete the authentication token cookie
    (await cookies()).delete('token');

    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error during logout:', error);
    return NextResponse.json({ message: 'Internal Server Error during logout' }, { status: 500 });
  }
} 