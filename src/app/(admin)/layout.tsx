import { Suspense } from "react";

// TODO: Layout del panel de administración con AdminSidebar
// import AdminSidebar from "@/features/admin/components/AdminSidebar";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense>{children}</Suspense>;
}
