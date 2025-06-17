'use client';

import AdminLayout from '../../../components/AdminLayout';

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        <p className="text-lg text-gray-600 mb-8">Welcome to the admin panel. From here, you can manage your website's content.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md flex items-center justify-center text-center text-2xl font-semibold">
            Manage Media
          </div>
          <div className="bg-green-500 text-white p-6 rounded-lg shadow-md flex items-center justify-center text-center text-2xl font-semibold">
            Manage Slides
          </div>
          <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-md flex items-center justify-center text-center text-2xl font-semibold">
            Manage Products
          </div>
          <div className="bg-red-500 text-white p-6 rounded-lg shadow-md flex items-center justify-center text-center text-2xl font-semibold">
            Manage Articles
          </div>
          <div className="bg-purple-500 text-white p-6 rounded-lg shadow-md flex items-center justify-center text-center text-2xl font-semibold">
            Manage Users
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 