import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

// Pages
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ProfilePage from '@/pages/ProfilePage';
import CoursesPage from '@/pages/CoursesPage';
import CourseEditorPage from '@/pages/CourseEditorPage';
import InstructorsPage from '@/pages/InstructorsPage';
import StudentsPage from '@/pages/StudentsPage';
import SubscriptionsPage from '@/pages/SubscriptionsPage';
import QuizzesPage from '@/pages/QuizzesPage';
import CertificatesPage from '@/pages/CertificatesPage';
import PaymentsPage from '@/pages/PaymentsPage';
import CommunityPage from '@/pages/CommunityPage';
import ReviewsPage from '@/pages/ReviewsPage';
import CmsPage from '@/pages/CmsPage';
import InquiriesPage from '@/pages/InquiriesPage';
import NotFoundPage from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      // Academics & Courses
      {
        path: 'courses',
        element: <CoursesPage />,
      },
      {
        path: 'courses/create',
        element: <CourseEditorPage mode="create" />,
      },
      {
        path: 'courses/edit/:id',
        element: <CourseEditorPage mode="edit" />,
      },
      {
        path: 'instructors',
        element: <InstructorsPage />,
      },
      {
        path: 'quizzes',
        element: <QuizzesPage />,
      },
      {
        path: 'certificates',
        element: <CertificatesPage />,
      },
      // Students & Subscriptions
      {
        path: 'students',
        element: <StudentsPage />,
      },
      {
        path: 'subscriptions',
        element: <SubscriptionsPage />,
      },
      {
        path: 'payments',
        element: <PaymentsPage />,
      },
      // Community & Engagement
      {
        path: 'community',
        element: <CommunityPage />,
      },
      {
        path: 'reviews',
        element: <ReviewsPage />,
      },
      // Content & System Settings
      {
        path: 'cms',
        element: <CmsPage />,
      },
      {
        path: 'inquiries',
        element: <InquiriesPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
