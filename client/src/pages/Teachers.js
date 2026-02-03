import React from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import ManageTeachers from '../components/Admin/ManageTeachers';

export default function TeachersPage() {
  return (
    <DashboardLayout>
      <ManageTeachers />
    </DashboardLayout>
  );
}
