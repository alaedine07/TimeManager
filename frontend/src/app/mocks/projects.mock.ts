// src/app/mocks/projects.mock.ts
import { Project } from '../models/project.model';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    name: 'Mobile App Redesign',
    description: 'Complete overhaul of the mobile application interface with modern design patterns and improved user experience.',
    category: 'Design',
    parentProjectId: undefined,
    tasks: [
      {
        id: 101,
        name: 'Create wireframes',
        description: 'Design wireframes for all main screens',
        completed: true,
        priority: 'high'
      },
      {
        id: 102,
        name: 'Design UI mockups',
        description: 'Create high-fidelity mockups in Figma',
        completed: true,
        priority: 'high'
      },
      {
        id: 103,
        name: 'User testing',
        description: 'Conduct user testing sessions with stakeholders',
        completed: false,
        priority: 'medium'
      },
      {
        id: 104,
        name: 'Finalize design system',
        description: 'Document color palette, typography, and components',
        completed: false,
        priority: 'medium'
      }
    ],
    subProjects: [
      {
        id: 11,
        name: 'Homepage Redesign',
        description: 'Redesign the main landing page with new layout',
        category: 'Design',
        parentProjectId: 1,
        tasks: [
          {
            id: 1101,
            name: 'Sketch initial layout',
            description: 'Create rough sketches of homepage layout',
            completed: true,
            priority: 'high'
          },
          {
            id: 1102,
            name: 'Create hero section',
            description: 'Design the hero banner section',
            completed: true,
            priority: 'high'
          },
          {
            id: 1103,
            name: 'Design features section',
            description: 'Design the features showcase area',
            completed: false,
            priority: 'medium'
          }
        ],
        subProjects: []
      },
      {
        id: 12,
        name: 'Dashboard UI',
        description: 'Create new dashboard interface',
        category: 'Design',
        parentProjectId: 1,
        tasks: [
          {
            id: 1201,
            name: 'Design widget components',
            description: 'Create reusable dashboard widgets',
            completed: true,
            priority: 'high'
          },
          {
            id: 1202,
            name: 'Create chart designs',
            description: 'Design data visualization charts',
            completed: false,
            priority: 'medium'
          }
        ],
        subProjects: []
      }
    ],
    totalTasks: 4,
    completedTasks: 2,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-10-15')
  },

  {
    id: 2,
    name: 'Backend API Development',
    description: 'Build scalable REST API endpoints with authentication, database optimization, and comprehensive documentation.',
    category: 'Development',
    parentProjectId: undefined,
    tasks: [
      {
        id: 201,
        name: 'Setup database schema',
        description: 'Create database schema and migrations',
        completed: true,
        priority: 'high'
      },
      {
        id: 202,
        name: 'Implement authentication',
        description: 'Add JWT authentication and authorization',
        completed: true,
        priority: 'high'
      },
      {
        id: 203,
        name: 'Create API documentation',
        description: 'Write comprehensive API docs with Swagger',
        completed: true,
        priority: 'medium'
      },
      {
        id: 204,
        name: 'Add rate limiting',
        description: 'Implement rate limiting for API endpoints',
        completed: false,
        priority: 'low'
      }
    ],
    subProjects: [
      {
        id: 21,
        name: 'User Service API',
        description: 'API endpoints for user management',
        category: 'Development',
        parentProjectId: 2,
        tasks: [
          {
            id: 2101,
            name: 'Create user endpoints',
            description: 'Build CRUD endpoints for users',
            completed: true,
            priority: 'high'
          },
          {
            id: 2102,
            name: 'Add email verification',
            description: 'Implement email verification flow',
            completed: true,
            priority: 'high'
          },
          {
            id: 2103,
            name: 'Create password reset flow',
            description: 'Implement secure password reset',
            completed: false,
            priority: 'high'
          }
        ],
        subProjects: []
      },
      {
        id: 22,
        name: 'Product Service API',
        description: 'API endpoints for product catalog',
        category: 'Development',
        parentProjectId: 2,
        tasks: [
          {
            id: 2201,
            name: 'Create product endpoints',
            description: 'Build CRUD endpoints for products',
            completed: true,
            priority: 'high'
          },
          {
            id: 2202,
            name: 'Add search functionality',
            description: 'Implement product search with filters',
            completed: false,
            priority: 'medium'
          },
          {
            id: 2203,
            name: 'Create inventory management',
            description: 'Build inventory tracking endpoints',
            completed: false,
            priority: 'medium'
          }
        ],
        subProjects: []
      },
      {
        id: 23,
        name: 'Payment Service API',
        description: 'Payment processing integration',
        category: 'Development',
        parentProjectId: 2,
        tasks: [
          {
            id: 2301,
            name: 'Integrate Stripe',
            description: 'Setup and integrate Stripe payment gateway',
            completed: false,
            priority: 'high'
          },
          {
            id: 2302,
            name: 'Create payment endpoints',
            description: 'Build payment processing endpoints',
            completed: false,
            priority: 'high'
          }
        ],
        subProjects: []
      }
    ],
    totalTasks: 4,
    completedTasks: 3,
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-10-20')
  },

  {
    id: 3,
    name: 'Marketing Campaign Q4',
    description: 'Strategic marketing initiatives for Q4 including social media, email outreach, and content creation.',
    category: 'Marketing',
    parentProjectId: undefined,
    tasks: [
      {
        id: 301,
        name: 'Create content calendar',
        description: 'Plan social media content for Q4',
        completed: true,
        priority: 'high'
      },
      {
        id: 302,
        name: 'Design email templates',
        description: 'Create email marketing templates',
        completed: true,
        priority: 'medium'
      },
      {
        id: 303,
        name: 'Launch social media campaign',
        description: 'Launch Q4 social media ads',
        completed: false,
        priority: 'high'
      },
      {
        id: 304,
        name: 'Create video content',
        description: 'Produce promotional videos',
        completed: false,
        priority: 'medium'
      },
      {
        id: 305,
        name: 'Analyze campaign metrics',
        description: 'Track and report campaign performance',
        completed: false,
        priority: 'low'
      }
    ],
    subProjects: [
      {
        id: 31,
        name: 'Social Media Campaign',
        description: 'Q4 social media marketing push',
        category: 'Marketing',
        parentProjectId: 3,
        tasks: [
          {
            id: 3101,
            name: 'Create Facebook ads',
            description: 'Design and launch Facebook advertisements',
            completed: true,
            priority: 'high'
          },
          {
            id: 3102,
            name: 'Create Instagram content',
            description: 'Produce Instagram posts and stories',
            completed: true,
            priority: 'medium'
          },
          {
            id: 3103,
            name: 'Launch LinkedIn campaign',
            description: 'B2B marketing on LinkedIn',
            completed: false,
            priority: 'medium'
          }
        ],
        subProjects: []
      },
      {
        id: 32,
        name: 'Email Marketing',
        description: 'Email marketing campaign for Q4',
        category: 'Marketing',
        parentProjectId: 3,
        tasks: [
          {
            id: 3201,
            name: 'Segment email lists',
            description: 'Create targeted email segments',
            completed: true,
            priority: 'high'
          },
          {
            id: 3202,
            name: 'Create email sequences',
            description: 'Write email copy and sequences',
            completed: false,
            priority: 'medium'
          }
        ],
        subProjects: []
      }
    ],
    totalTasks: 5,
    completedTasks: 2,
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-10-25')
  }
];
