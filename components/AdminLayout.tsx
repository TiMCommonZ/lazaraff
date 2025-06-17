'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading admin panel...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-700 mb-6">You do not have administrative privileges to access this page.</p>
          <Link href="/login" className="text-blue-600 hover:underline">
            Go to Login Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-2xl font-bold">
            Admin Panel
          </Link>
          <ul className="flex space-x-6">
            <li>
              <Link href="/admin/media" className="hover:text-gray-300">Media</Link>
            </li>
            <li>
              <Link href="/admin/slides" className="hover:text-gray-300">Slides</Link>
            </li>
            <li>
              <Link href="/admin/products" className="hover:text-gray-300">Products</Link>
            </li>
            <li>
              <Link href="/admin/articles" className="hover:text-gray-300">Articles</Link>
            </li>
            <li>
              <Link href="/admin/users" className="hover:text-gray-300">Users</Link>
            </li>
            {user && (
              <li>
                <button onClick={logout} className="hover:text-gray-300">Logout ({user.email})</button>
              </li>
            )}
          </ul>
        </div>
      </nav>
      <main className="flex-grow container mx-auto p-8">
        {children}
      </main>
    </div>
  );
} 