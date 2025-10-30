'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/admin/layout/AdminLayout';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't show admin layout on login page
  if (pathname === '/admin' || pathname === '/admin/') {
    return <>{children}</>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
