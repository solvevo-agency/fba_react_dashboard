import {
  LayoutDashboard,
  GraduationCap,
  UserCheck,
  FileQuestion,
  Award,
  Users,
  Layers,
  CreditCard,
  MessageSquare,
  Star,
  Globe,
  Mail,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  exact?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigationSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: 'Academic Engine',
    items: [
      {
        id: 'courses',
        label: 'Courses',
        path: '/dashboard/courses',
        icon: GraduationCap,
      },
      {
        id: 'instructors',
        label: 'Instructors',
        path: '/dashboard/instructors',
        icon: UserCheck,
      },
      {
        id: 'quizzes',
        label: 'Quizzes',
        path: '/dashboard/quizzes',
        icon: FileQuestion,
      },
      {
        id: 'certificates',
        label: 'BACB Certificates',
        path: '/dashboard/certificates',
        icon: Award,
      },
    ],
  },
  {
    title: 'Students & Revenue',
    items: [
      {
        id: 'students',
        label: 'Students & Users',
        path: '/dashboard/students',
        icon: Users,
      },
      {
        id: 'subscriptions',
        label: 'Subscriptions & Access',
        path: '/dashboard/subscriptions',
        icon: Layers,
      },
      {
        id: 'payments',
        label: 'Payments & Revenue',
        path: '/dashboard/payments',
        icon: CreditCard,
      },
    ],
  },
  {
    title: 'Engagement',
    items: [
      {
        id: 'community',
        label: 'Community Forum',
        path: '/dashboard/community',
        icon: MessageSquare,
      },
      {
        id: 'reviews',
        label: 'Reviews & Ratings',
        path: '/dashboard/reviews',
        icon: Star,
      },
    ],
  },
  {
    title: 'Platform & Content',
    items: [
      {
        id: 'cms',
        label: 'Website CMS',
        path: '/dashboard/cms',
        icon: Globe,
      },
      {
        id: 'inquiries',
        label: 'Contacts & Newsletter',
        path: '/dashboard/inquiries',
        icon: Mail,
      },
    ],
  },
];

// Flat list for easy lookup in Navbar, breadcrumbs, etc.
export const navigationItems: NavItem[] = navigationSections.flatMap(
  (section) => section.items
);
