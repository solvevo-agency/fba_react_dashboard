/**
 * Realistic Mock Data for FBA Super Admin Dashboard
 * Strictly aligned with:
 * 1. The previous PHP backend (Courses, Modules, Instructors, Lessons, Resources, Quizzes, Tiers)
 * 2. The 24-table Prisma database schema
 * 3. The student frontend (jencjen-frontend)
 */

export interface MockLessonResource {
  id: number;
  title: string;
  file_path: string;
  file_type: string;
  file_size: string;
  note?: string;
  status: 1 | 0;
}

export interface MockLesson {
  id: number;
  lesson_uid: string;
  title: string;
  instructor_id?: number;
  instructor_name?: string;
  lesson_time: number; // in minutes
  description: string;
  transcript_text: string;
  thumbnail_image: string;
  video_path: string;
  video_length: number; // in minutes
  status: 1 | 0;
  resources: MockLessonResource[];
}

export interface MockModule {
  id: number;
  title: string;
  description: string;
  quiz_id?: number | null;
  quiz_title?: string;
  quiz_eligible: 'last' | 'any';
  status: 1 | 0;
  lessons: MockLesson[];
}

export interface MockPricingTier {
  id: number;
  tier_name: string;
  title?: string;
  subtitle?: string;
  starting_price: number;
  final_price: number;
  duration: 'lifetime' | '1 year' | '1 month' | '30 days';
  benefits: string[];
  stripe_price_id?: string;
  stripe_product_id?: string;
  status: 1 | 0;
}

export interface MockCourse {
  id: number;
  course_uid: string;
  title: string;
  slug: string;
  description: string;
  what_to_learn: string; // Multiline benefit items separated by line breaks
  banner_image: string;
  thumbnail?: string;
  price?: number;
  tier_name?: string;
  instructor_id: number;
  instructor_name: string;
  instructor_avatar: string;
  total_modules: number;
  total_lessons: number;
  total_video_length: number; // in minutes
  status: 'published' | 'draft';
  created_at: string;
  tiers: MockPricingTier[];
  modules: MockModule[];
}

export interface MockInstructor {
  id: number;
  name: string;
  designation: string;
  email: string;
  avatar: string;
  bio: string;
  instructor_type?: 'lead' | 'regular';
  courses_count: number;
  status: 1 | 0;
  created_at: string;
}

export interface MockQuizOption {
  id: number;
  text: string;
}

export interface MockQuizQuestion {
  id: number;
  question: string;
  options: MockQuizOption[];
  correct_option_index: number;
  explanation?: string;
}

export interface MockQuiz {
  id: number;
  title: string;
  instructions?: string;
  time_limit_minutes: number;
  passing_score: number;
  total_questions: number;
  questions?: MockQuizQuestion[];
  course_title?: string;
  module_title?: string;
  attempts_count?: number;
  avg_pass_rate?: number;
  status: 1 | 0;
  created_at?: string;
}

export interface MockStudent {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar: string | null;
  phone: string;
  bacb_id: string;
  enrolled_courses_count: number;
  primary_course: string;
  progress_percentage: number;
  status: 1 | 2 | 0; // 1: active, 2: banned, 0: unverified
  created_at: string;
  last_login_at: string;
}

export interface MockSubscription {
  id: number;
  student_name: string;
  student_email: string;
  course_title: string;
  tier_name: string;
  price: number;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  status_note: string;
  start_date: string;
  valid_until: string | null;
  stripe_customer_id: string;
}

export interface MockCertificate {
  id: number;
  cert_uid: string;
  applicant_name: string;
  applicant_bacb_id: string;
  course_id?: number;
  course_title: string;
  training_start?: string;
  training_end?: string;
  training_time?: number; // e.g. 40.0 hours
  trainer_name?: string;
  trainer_certification?: string;
  assist_trainer_name?: string;
  agency_name?: string;
  header_top?: string;
  header_middle?: string;
  header_bottom?: string;
  trainer_signature?: string | null;
  watermark?: string | null;
  footer?: string;
  issue_date: string;
  status: 'valid' | 'revoked';
}

export interface MockPayment {
  id: string;
  invoice_id: string;
  student_name: string;
  student_email: string;
  course_title: string;
  amount: number;
  currency: string;
  payment_method: string;
  date: string;
  status: 'succeeded' | 'refunded' | 'failed';
}

export interface MockCommunityThread {
  id: number;
  title: string;
  author_name: string;
  author_role: string;
  course_title: string;
  replies_count: number;
  upvotes_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
}

export interface MockReview {
  id: number;
  student_name: string;
  student_avatar: string | null;
  course_title: string;
  rating: number;
  review_title: string;
  review_text: string;
  is_featured: boolean;
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
}

export interface MockInquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'responded' | 'archived';
  created_at: string;
}

// -------------------------------------------------------------------------------------
// Instructors (Prerequisite for Courses)
// -------------------------------------------------------------------------------------
export const MOCK_INSTRUCTORS: MockInstructor[] = [
  {
    id: 1,
    name: 'Dr. Jennifer Adams, BCBA-D',
    designation: 'Clinical Director & Lead BACB Instructor',
    email: 'jennifer.adams@fba.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&crop=faces,top&q=80',
    bio: 'Board Certified Behavior Analyst - Doctoral with 18+ years supervising pediatric clinics and authoring BACB task lists.',
    instructor_type: 'lead',
    courses_count: 1,
    status: 1,
    created_at: '2025-10-10',
  },
  {
    id: 2,
    name: 'Marcus Vance, MS, BCBA',
    designation: 'Senior Behavioral Consultant & Ethics Faculty',
    email: 'marcus.vance@fba.com',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&crop=faces,top&q=80',
    bio: 'Specialist in ethical guidelines, client dignity protocols, and community crisis intervention.',
    instructor_type: 'regular',
    courses_count: 1,
    status: 1,
    created_at: '2025-11-04',
  },
];

// -------------------------------------------------------------------------------------
// Quizzes (Prerequisite for Modules)
// -------------------------------------------------------------------------------------
export const MOCK_QUIZZES: MockQuiz[] = [
  {
    id: 1,
    title: 'Module 1 Quiz: Measurement & Data Collection',
    instructions: 'Answer all multiple-choice questions. Score at least 80% to pass and unlock the subsequent module.',
    time_limit_minutes: 20,
    passing_score: 80,
    total_questions: 3,
    status: 1,
    created_at: '2025-10-15',
    questions: [
      {
        id: 101,
        question: 'Which measurement procedure records whether a behavior occurred at any time during an interval?',
        options: [
          { id: 1, text: 'Partial Interval Recording' },
          { id: 2, text: 'Whole Interval Recording' },
          { id: 3, text: 'Momentary Time Sampling' },
          { id: 4, text: 'Permanent Product Recording' },
        ],
        correct_option_index: 0,
        explanation: 'Partial interval recording scores an interval as positive if the behavior happens at any point during that time window.',
      },
      {
        id: 102,
        question: 'What is the elapsed time between the presentation of an antecedent stimulus and the initiation of a response called?',
        options: [
          { id: 1, text: 'Duration' },
          { id: 2, text: 'Latency' },
          { id: 3, text: 'Interresponse Time (IRT)' },
          { id: 4, text: 'Frequency' },
        ],
        correct_option_index: 1,
        explanation: 'Latency measures the temporal delay between a prompt or stimulus and the start of the student response.',
      },
      {
        id: 103,
        question: 'Discontinuous measurement procedures are best utilized when:',
        options: [
          { id: 1, text: 'The behavior has a clear beginning and end' },
          { id: 2, text: 'Continuous observation is difficult or behaviors occur at high rates' },
          { id: 3, text: 'Measuring total duration of a single tantrum episode' },
          { id: 4, text: 'Counting discrete trial trials one-by-one' },
        ],
        correct_option_index: 1,
        explanation: 'Discontinuous measurement samples time intervals when continuous recording is not feasible in a busy clinical setting.',
      },
    ],
  },
  {
    id: 2,
    title: 'Module 2 Quiz: Assessment & Preference Testing',
    instructions: 'Demonstrate competency in conducting MSWO, paired-choice, and naturalistic preference assessments.',
    time_limit_minutes: 25,
    passing_score: 80,
    total_questions: 2,
    status: 1,
    created_at: '2025-11-01',
    questions: [
      {
        id: 201,
        question: 'In a Multiple Stimulus Without Replacement (MSWO) preference assessment, what happens after the learner selects an item?',
        options: [
          { id: 1, text: 'The selected item is returned to the array for the next trial' },
          { id: 2, text: 'The selected item is removed from the array before the remaining items are rotated' },
          { id: 3, text: 'The assessment terminates immediately' },
          { id: 4, text: 'A completely new set of items is introduced' },
        ],
        correct_option_index: 1,
        explanation: 'In MSWO, chosen items are not replaced, creating a hierarchy of relative preference from first chosen to last.',
      },
      {
        id: 202,
        question: 'Which assessment directly observes behavior in the natural environment without manipulating variables?',
        options: [
          { id: 1, text: 'Functional Analysis (FA)' },
          { id: 2, text: 'Descriptive Functional Assessment (ABC data)' },
          { id: 3, text: 'Indirect Assessment (interviews)' },
          { id: 4, text: 'Analogue Trial Assessment' },
        ],
        correct_option_index: 1,
        explanation: 'Descriptive assessment involves direct observation of antecedents, behaviors, and consequences without experimental manipulation.',
      },
    ],
  },
  {
    id: 3,
    title: 'Ethics Final Quiz: Professional & Ethical Standards',
    instructions: 'Required comprehensive ethical compliance quiz covering dual relationships, dignity, and BACB guidelines.',
    time_limit_minutes: 30,
    passing_score: 85,
    total_questions: 2,
    status: 1,
    created_at: '2025-11-20',
    questions: [
      {
        id: 301,
        question: 'Under the BACB Ethics Code, accepting substantial personal gifts or invitations from clients violates the prohibition against:',
        options: [
          { id: 1, text: 'Scope of practice limitations' },
          { id: 2, text: 'Multiple or dual relationships' },
          { id: 3, text: 'Mandated reporting protocols' },
          { id: 4, text: 'Data storage security' },
        ],
        correct_option_index: 1,
        explanation: 'Multiple relationships can impair professional objectivity and compromise therapeutic boundaries.',
      },
      {
        id: 302,
        question: 'If an RBT suspects physical abuse or neglect of a client, what is their ethical and legal responsibility?',
        options: [
          { id: 1, text: 'Confront the parents immediately' },
          { id: 2, text: 'Wait two weeks to collect corroborating ABC data' },
          { id: 3, text: 'Follow mandated reporting laws immediately and notify their supervising BCBA' },
          { id: 4, text: 'Post a warning in the company community chat' },
        ],
        correct_option_index: 2,
        explanation: 'Behavior technicians are mandated reporters and must immediately notify appropriate authorities and their supervisor.',
      },
    ],
  },
];

// -------------------------------------------------------------------------------------
// Exactly Two Real Courses (Clean Status: Published & Draft)
// -------------------------------------------------------------------------------------
export const MOCK_COURSES: MockCourse[] = [
  {
    id: 1,
    course_uid: 'CRS-RBT-2026',
    title: '40-Hour Registered Behavior Technician (RBT) 2.0 Training',
    slug: '40-hour-rbt-training-2',
    instructor_id: 1,
    instructor_name: 'Dr. Jennifer Adams, BCBA-D',
    instructor_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    description:
      'Comprehensive 40-hour curriculum conforming to the Behavior Analyst Certification Board (BACB) 2nd edition task list. Covers Measurement, Assessment, Skill Acquisition, Behavior Reduction, Documentation, and Professional Conduct.',
    what_to_learn:
      'Master continuous and discontinuous behavioral measurement techniques\nConduct structured preference assessments and functional interviews\nImplement Discrete Trial Training (DTT) and natural environment teaching\nExecute antecedent intervention strategies and Differential Reinforcement (DRO/DRA)\nMaintain professional boundaries and client dignity compliance under BACB standards',
    banner_image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    total_modules: 2,
    total_lessons: 4,
    total_video_length: 2400,
    status: 'published',
    created_at: '2026-01-15',
    tiers: [
      {
        id: 1,
        tier_name: 'Lifetime Pass',
        title: 'Full 40-Hour Certification Access',
        subtitle: 'One-time payment with unlimited lifetime retakes & certificate',
        starting_price: 199.0,
        final_price: 149.0,
        duration: 'lifetime',
        benefits: [
          'Full 40 Hours of video lectures with HTTP 206 instant streaming',
          'Automated BACB Certificate with verification QR code upon passing',
          'Downloadable task list flashcards, worksheets, and study PDF guides',
          'Unlimited retakes on all module assessments with instant scoring',
        ],
        stripe_price_id: 'price_1RBT_lifetime_149',
        status: 1,
      },
      {
        id: 2,
        tier_name: 'Monthly Pass',
        title: 'Flexible Monthly Access',
        subtitle: 'Self-paced access billed monthly until graduation',
        starting_price: 49.0,
        final_price: 39.0,
        duration: '1 month',
        benefits: [
          'Full 40 Hours access to video curriculum & assessments',
          'Cancel anytime from student billing portal',
          'Certificate issued upon 100% course completion',
        ],
        stripe_price_id: 'price_1RBT_monthly_39',
        status: 1,
      },
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Measurement & Data Collection',
        description:
          'Learn to prepare for data collection, implement continuous and discontinuous measurement procedures, and enter objective session data.',
        quiz_id: 1,
        quiz_title: 'Module 1 Assessment: Measurement & Data Collection',
        quiz_eligible: 'last',
        status: 1,
        lessons: [
          {
            id: 101,
            lesson_uid: 'LES-M1-01',
            title: 'Lesson 1.1: Foundations of Continuous Measurement (Frequency, Duration & Latency)',
            instructor_id: 1,
            instructor_name: 'Dr. Jennifer Adams, BCBA-D',
            lesson_time: 45,
            description:
              'Detailed clinical exploration of continuous measurement protocols. Learn when to use frequency counts vs duration timing.',
            transcript_text:
              'Welcome to Lesson 1.1. In Applied Behavior Analysis, continuous measurement refers to measuring every occurrence of a target behavior during an observation period. The three fundamental dimensions of continuous measurement are frequency, duration, and latency. Frequency is simply the count of times a behavior occurs...',
            thumbnail_image:
              'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&auto=format&fit=crop&q=80',
            video_path: '/videos/rbt/mod1_lesson1.mp4',
            video_length: 45,
            status: 1,
            resources: [
              {
                id: 1001,
                title: 'BACB Measurement Data Collection Worksheet (PDF)',
                file_path: '/resources/measurement_worksheet_m1.pdf',
                file_type: 'application/pdf',
                file_size: '1.2 MB',
                note: 'Print this template to practice continuous recording during the video scenario.',
                status: 1,
              },
            ],
          },
          {
            id: 102,
            lesson_uid: 'LES-M1-02',
            title: 'Lesson 1.2: Discontinuous Measurement (Partial, Whole Interval & Momentary Time Sampling)',
            instructor_id: 1,
            instructor_name: 'Dr. Jennifer Adams, BCBA-D',
            lesson_time: 50,
            description:
              'Master time sampling procedures and understand the common overestimation and underestimation biases in interval recording.',
            transcript_text:
              'In this lesson we cover discontinuous measurement procedures. Unlike continuous recording, discontinuous methods divide observation sessions into brief intervals. In partial interval recording, we score the behavior if it occurs at any moment within the interval...',
            thumbnail_image:
              'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=400&auto=format&fit=crop&q=80',
            video_path: '/videos/rbt/mod1_lesson2.mp4',
            video_length: 50,
            status: 1,
            resources: [
              {
                id: 1002,
                title: 'Interval Recording Comparison Chart (PDF)',
                file_path: '/resources/interval_comparison_chart.pdf',
                file_type: 'application/pdf',
                file_size: '850 KB',
                note: 'Quick reference sheet showing when to choose whole vs partial interval methods.',
                status: 1,
              },
            ],
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Assessment & Preference Testing',
        description:
          'Conduct stimulus preference assessments, assist with individualized functional assessments, and describe behavior in observable terms.',
        quiz_id: 2,
        quiz_title: 'Module 2 Assessment: Assessment & Preference Testing',
        quiz_eligible: 'last',
        status: 1,
        lessons: [
          {
            id: 201,
            lesson_uid: 'LES-M2-01',
            title: 'Lesson 2.1: Free Operant & Trial-Based Preference Assessments',
            instructor_id: 1,
            instructor_name: 'Dr. Jennifer Adams, BCBA-D',
            lesson_time: 40,
            description:
              'Step-by-step procedures for Single Stimulus, Paired Stimulus, and Multiple Stimulus Without Replacement (MSWO) protocols.',
            transcript_text:
              'Identifying high-value reinforcers is critical for skill acquisition programs. In this lesson, we demonstrate how to set up an MSWO preference array, record student selection, and calculate preference rankings...',
            thumbnail_image:
              'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop&q=80',
            video_path: '/videos/rbt/mod2_lesson1.mp4',
            video_length: 40,
            status: 1,
            resources: [
              {
                id: 2001,
                title: 'MSWO Preference Scoring Sheet (PDF)',
                file_path: '/resources/mswo_scoring_sheet.pdf',
                file_type: 'application/pdf',
                file_size: '620 KB',
                note: 'Use this standardized sheet to calculate preference percentages.',
                status: 1,
              },
            ],
          },
          {
            id: 202,
            lesson_uid: 'LES-M2-02',
            title: 'Lesson 2.2: Assisting with Functional Behavior Assessments (FBA)',
            instructor_id: 1,
            instructor_name: 'Dr. Jennifer Adams, BCBA-D',
            lesson_time: 55,
            description:
              'Role of the technician in ABC data collection, descriptive observations, and setting events tracking.',
            transcript_text:
              'As an RBT, your role in functional behavior assessments is to collect objective ABC data under the supervision of your BCBA. ABC data documents the Antecedent, the Behavior, and the Consequence...',
            thumbnail_image:
              'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&auto=format&fit=crop&q=80',
            video_path: '/videos/rbt/mod2_lesson2.mp4',
            video_length: 55,
            status: 1,
            resources: [
              {
                id: 2002,
                title: 'Antecedent-Behavior-Consequence (ABC) Data Form (PDF)',
                file_path: '/resources/abc_data_form.pdf',
                file_type: 'application/pdf',
                file_size: '940 KB',
                note: 'Standard ABC log sheet used across clinical and school environments.',
                status: 1,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    course_uid: 'CRS-ETH-101',
    title: 'Applied Behavior Analysis (ABA) Ethics & Professional Conduct',
    slug: 'aba-ethics-professional-conduct',
    instructor_id: 2,
    instructor_name: 'Marcus Vance, MS, BCBA',
    instructor_avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    description:
      'Rigorous exploration of the BACB Ethics Code for Behavior Analysts and RBT Ethics Code 2.0. Focuses on client dignity, dual relationships, mandatory reporting, and ethical crisis escalation.',
    what_to_learn:
      'Identify dual relationship conflicts and maintain professional therapy boundaries\nApply mandatory reporting guidelines in compliance with state and federal laws\nUphold client dignity, informed consent, and least restrictive intervention standards\nCommunicate ethically with caregivers, supervisors, and interdisciplinary team members',
    banner_image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
    total_modules: 1,
    total_lessons: 2,
    total_video_length: 620,
    status: 'draft',
    created_at: '2026-02-01',
    tiers: [
      {
        id: 3,
        tier_name: 'Annual Pass',
        title: 'Full Ethics & Professionalism Access',
        subtitle: '1-Year access for continuing education & BACB renewals',
        starting_price: 119.0,
        final_price: 89.0,
        duration: '1 year',
        benefits: [
          'Full video scenario lectures on real-world clinical dilemmas',
          'Certificate of ethics completion for CEU compliance',
          'Downloadable ethics decision-making tree PDF',
        ],
        stripe_price_id: 'price_1ETH_annual_89',
        status: 1,
      },
    ],
    modules: [
      {
        id: 3,
        title: 'Module 1: Ethical Responsibilities & Boundaries of Competence',
        description:
          'Understanding Section 1 of the RBT Ethics Code: conforming to legal and ethical codes, avoiding conflicts of interest, and managing dual relationships.',
        quiz_id: 3,
        quiz_title: 'Ethics Final Exam: Compliance & Professional Standards',
        quiz_eligible: 'last',
        status: 1,
        lessons: [
          {
            id: 301,
            lesson_uid: 'LES-ETH-01',
            title: 'Lesson 1.1: Navigating Multiple Relationships & Gift-Giving Dilemmas',
            instructor_id: 2,
            instructor_name: 'Marcus Vance, MS, BCBA',
            lesson_time: 35,
            description:
              'Examine clinical cases where accepting gifts compromises clinical judgment and learn boundary-setting conversation scripts.',
            transcript_text:
              'In clinical practice, families often express gratitude through gifts or social invitations. The BACB Ethics Code clearly prohibits accepting gifts with monetary value exceeding $10 to protect professional boundaries...',
            thumbnail_image:
              'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&auto=format&fit=crop&q=80',
            video_path: '/videos/ethics/lesson1_boundaries.mp4',
            video_length: 35,
            status: 1,
            resources: [
              {
                id: 3001,
                title: 'Caregiver Boundary Explanation Letter (PDF)',
                file_path: '/resources/caregiver_boundary_letter.pdf',
                file_type: 'application/pdf',
                file_size: '500 KB',
                note: 'Sample polite letter explaining gift-giving policies to clients.',
                status: 1,
              },
            ],
          },
          {
            id: 302,
            lesson_uid: 'LES-ETH-02',
            title: 'Lesson 1.2: Client Dignity & Protecting Vulnerable Individuals',
            instructor_id: 2,
            instructor_name: 'Marcus Vance, MS, BCBA',
            lesson_time: 40,
            description:
              'Ensuring age-appropriate materials, personal privacy during behavioral interventions, and promoting self-advocacy.',
            transcript_text:
              'Client dignity is a core mandate of applied behavior analysis. Every client deserves respect, privacy, and voice in their intervention plan...',
            thumbnail_image:
              'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop&q=80',
            video_path: '/videos/ethics/lesson2_dignity.mp4',
            video_length: 40,
            status: 1,
            resources: [],
          },
        ],
      },
    ],
  },
];

// -------------------------------------------------------------------------------------
// Students, Subscriptions, Payments, Community, Reviews, Inquiries
// -------------------------------------------------------------------------------------
export const MOCK_STUDENTS: MockStudent[] = [
  {
    id: 101,
    first_name: 'Emily',
    last_name: 'Blunt',
    email: 'emily.blunt@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    phone: '+1 (555) 234-8901',
    bacb_id: 'RBT-2026-901',
    enrolled_courses_count: 1,
    primary_course: '40-Hour Registered Behavior Technician (RBT) 2.0 Training',
    progress_percentage: 92,
    status: 1,
    created_at: '2026-01-20',
    last_login_at: '2 hours ago',
  },
  {
    id: 102,
    first_name: 'David',
    last_name: 'Miller',
    email: 'david.miller@example.com',
    avatar: null,
    phone: '+1 (555) 789-1234',
    bacb_id: 'RBT-2026-842',
    enrolled_courses_count: 1,
    primary_course: '40-Hour Registered Behavior Technician (RBT) 2.0 Training',
    progress_percentage: 100,
    status: 1,
    created_at: '2026-01-14',
    last_login_at: '1 day ago',
  },
];

export const MOCK_SUBSCRIPTIONS: MockSubscription[] = [
  {
    id: 501,
    student_name: 'Emily Blunt',
    student_email: 'emily.blunt@example.com',
    course_title: '40-Hour Registered Behavior Technician (RBT) 2.0 Training',
    tier_name: 'Lifetime Pass',
    price: 149.0,
    status: 'active',
    status_note: 'paid',
    start_date: '2026-01-20',
    valid_until: null,
    stripe_customer_id: 'cus_Q98xLmN289aB1',
  },
  {
    id: 502,
    student_name: 'David Miller',
    student_email: 'david.miller@example.com',
    course_title: '40-Hour Registered Behavior Technician (RBT) 2.0 Training',
    tier_name: 'Lifetime Pass',
    price: 149.0,
    status: 'active',
    status_note: 'graduated',
    start_date: '2026-01-14',
    valid_until: null,
    stripe_customer_id: 'cus_D55xJ9044bC7',
  },
];

export const MOCK_CERTIFICATES: MockCertificate[] = [
  {
    id: 1,
    cert_uid: 'FBA-RBT-2026-0842',
    applicant_name: 'David Miller',
    applicant_bacb_id: 'RBT-2026-842',
    course_id: 1,
    course_title: '40-Hour Registered Behavior Technician (RBT) 2.0 Training',
    training_start: '2026-01-14',
    training_end: '2026-02-28',
    training_time: 40.0,
    trainer_name: 'Dr. Jennifer Adams, BCBA-D',
    trainer_certification: 'BCBA-D #1-12-11894',
    assist_trainer_name: 'Marcus Vance, MS, BCBA',
    agency_name: 'Future Behavior Analysis (FBA) Educational Institute',
    header_top: 'Future Behavior Analysis (FBA) Educational Institute',
    header_middle: 'Registered Behavior Technician (RBT) 40-Hour Training Program',
    header_bottom: 'Certificate of Professional Competency & Task List 2.0 Completion',
    trainer_signature: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
    watermark: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80',
    footer: 'This training program is based on the Registered Behavior Technician (RBT) 2.0 Task List and is designed to meet the 40-hour training requirement for the RBT credential. This program is offered independently of the BACB.',
    issue_date: '2026-02-28',
    status: 'valid',
  },
  {
    id: 2,
    cert_uid: 'FBA-ETH-2026-0914',
    applicant_name: 'Emily Blunt',
    applicant_bacb_id: 'RBT-2026-901',
    course_id: 2,
    course_title: 'Applied Behavior Analysis (ABA) Ethics & Professional Conduct',
    training_start: '2026-02-01',
    training_end: '2026-03-05',
    training_time: 15.0,
    trainer_name: 'Marcus Vance, MS, BCBA',
    trainer_certification: 'BCBA #1-18-30491',
    assist_trainer_name: 'Dr. Jennifer Adams, BCBA-D',
    agency_name: 'Future Behavior Analysis (FBA) Educational Institute',
    header_top: 'Future Behavior Analysis (FBA) Educational Institute',
    header_middle: 'Applied Behavior Analysis (ABA) Ethics & Professional Conduct',
    header_bottom: 'Certificate of Continuing Education Completion',
    trainer_signature: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
    watermark: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80',
    footer: 'This continuing education program meets BACB ethics standards for certified behavior technicians and analysts.',
    issue_date: '2026-03-05',
    status: 'valid',
  },
];

export const MOCK_PAYMENTS: MockPayment[] = [
  {
    id: 'tx_stripe_89123',
    invoice_id: 'INV-2026-0091',
    student_name: 'Emily Blunt',
    student_email: 'emily.blunt@example.com',
    course_title: '40-Hour Registered Behavior Technician (RBT) 2.0 Training',
    amount: 149.0,
    currency: 'USD',
    payment_method: 'Stripe',
    date: '2026-03-08 10:14 AM',
    status: 'succeeded',
  },
  {
    id: 'tx_stripe_89120',
    invoice_id: 'INV-2026-0090',
    student_name: 'David Miller',
    student_email: 'david.miller@example.com',
    course_title: '40-Hour Registered Behavior Technician (RBT) 2.0 Training',
    amount: 149.0,
    currency: 'USD',
    payment_method: 'Stripe',
    date: '2026-01-14 09:30 AM',
    status: 'succeeded',
  },
];

export const MOCK_COMMUNITY_THREADS: MockCommunityThread[] = [
  {
    id: 1,
    title: 'Clarification regarding Differential Reinforcement of Other Behavior (DRO) vs DRA',
    author_name: 'Emily Blunt',
    author_role: 'Student',
    course_title: '40-Hour Registered Behavior Technician (RBT) 2.0 Training',
    replies_count: 8,
    upvotes_count: 24,
    is_pinned: true,
    is_locked: false,
    created_at: '2026-03-04',
  },
];

export const MOCK_REVIEWS: MockReview[] = [
  {
    id: 1,
    student_name: 'Emily Blunt',
    student_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    course_title: '40-Hour Registered Behavior Technician (RBT) 2.0 Training',
    rating: 5,
    review_title: 'The best RBT training curriculum available online!',
    review_text: 'Dr. Jennifer explains each task list item with clear real-world clinical examples. Passed my exam easily!',
    is_featured: true,
    status: 'approved',
    created_at: '2026-03-02',
  },
  {
    id: 2,
    student_name: 'David Miller',
    student_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    course_title: '40-Hour Registered Behavior Technician (RBT) 2.0 Training',
    rating: 4,
    review_title: 'Comprehensive task list preparation and easy quizzes',
    review_text: 'The lesson explanations and interval recording worksheets were extremely helpful. Quizzes reinforce the concepts well.',
    is_featured: false,
    status: 'approved',
    created_at: '2026-02-28',
  },
  {
    id: 3,
    student_name: 'Sarah Jenkins',
    student_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    course_title: 'Applied Behavior Analysis (ABA) Ethics & Professional Conduct',
    rating: 5,
    review_title: 'Essential ethics guidance for everyday clinical dilemmas',
    review_text: 'Marcus Vance breaks down dual relationships, gift-giving, and mandatory reporting with utmost clarity. Highly recommend!',
    is_featured: false,
    status: 'approved',
    created_at: '2026-03-05',
  },
];

export const MOCK_INQUIRIES: MockInquiry[] = [
  {
    id: 1,
    name: 'Robert Vance',
    email: 'robert.vance@vancerefrigeration.com',
    phone: '+1 (555) 765-4321',
    subject: 'Corporate Team Enrollment (20+ RBT Trainees)',
    message: 'Hello, we want to enroll our incoming clinic cohort of 25 technicians. Do you support enterprise invoicing?',
    status: 'new',
    created_at: '2026-03-08',
  },
  {
    id: 2,
    name: 'Alicia Keys',
    email: 'alicia.keys@behaviorhealth.org',
    phone: '+1 (555) 345-6789',
    subject: 'BACB 40-Hour RBT Certificate Verification Inquiry',
    message: 'Greetings, I would like to verify if your 40-hour course fulfills the BACB 2.0 Task List requirements for the Florida clinical board.',
    status: 'responded',
    created_at: '2026-03-06',
  },
  {
    id: 3,
    name: 'Michael Scott',
    email: 'm.scott@dundermifflin.com',
    phone: '+1 (555) 901-2345',
    subject: 'Group Subscription Discount for Clinic Staff',
    message: 'Hi team, do you offer bulk pricing discounts if our clinic purchases 10 Lifetime access passes at once?',
    status: 'new',
    created_at: '2026-03-04',
  },
];
