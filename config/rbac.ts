export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: number; // Higher number = more privileges
}

export interface RBACConfig {
  permissions: Permission[];
  roles: Role[];
}

// Define permissions
export const PERMISSIONS: Permission[] = [
  // Dashboard permissions
  { id: 'dashboard.view', name: 'View Dashboard', description: 'Access dashboard', resource: 'dashboard', action: 'view' },
  
  // Inventory permissions
  { id: 'inventory.view', name: 'View Inventory', description: 'View inventory items', resource: 'inventory', action: 'view' },
  { id: 'inventory.create', name: 'Create Inventory', description: 'Create new inventory items', resource: 'inventory', action: 'create' },
  { id: 'inventory.edit', name: 'Edit Inventory', description: 'Edit existing inventory items', resource: 'inventory', action: 'edit' },
  { id: 'inventory.delete', name: 'Delete Inventory', description: 'Delete inventory items', resource: 'inventory', action: 'delete' },
  
  // Users permissions
  { id: 'users.view', name: 'View Users', description: 'View user list', resource: 'users', action: 'view' },
  { id: 'users.create', name: 'Create Users', description: 'Create new users', resource: 'users', action: 'create' },
  { id: 'users.edit', name: 'Edit Users', description: 'Edit user information', resource: 'users', action: 'edit' },
  { id: 'users.delete', name: 'Delete Users', description: 'Delete users', resource: 'users', action: 'delete' },
  { id: 'users.manage_roles', name: 'Manage User Roles', description: 'Assign and manage user roles', resource: 'users', action: 'manage_roles' },
  
  // Tournaments permissions
  { id: 'tournaments.view', name: 'View Tournaments', description: 'View tournament list', resource: 'tournaments', action: 'view' },
  { id: 'tournaments.create', name: 'Create Tournaments', description: 'Create new tournaments', resource: 'tournaments', action: 'create' },
  { id: 'tournaments.edit', name: 'Edit Tournaments', description: 'Edit tournament details', resource: 'tournaments', action: 'edit' },
  { id: 'tournaments.delete', name: 'Delete Tournaments', description: 'Delete tournaments', resource: 'tournaments', action: 'delete' },
  { id: 'tournaments.manage_participants', name: 'Manage Participants', description: 'Manage tournament participants', resource: 'tournaments', action: 'manage_participants' },
  
  // Newsletter permissions
  { id: 'newsletter.view', name: 'View Newsletter', description: 'View newsletter campaigns', resource: 'newsletter', action: 'view' },
  { id: 'newsletter.create', name: 'Create Newsletter', description: 'Create newsletter campaigns', resource: 'newsletter', action: 'create' },
  { id: 'newsletter.send', name: 'Send Newsletter', description: 'Send newsletter campaigns', resource: 'newsletter', action: 'send' },
  
  // Point of Sale permissions
  { id: 'pos.view', name: 'View POS', description: 'Access point of sale terminal', resource: 'pos', action: 'view' },
  { id: 'pos.create', name: 'Create Sales', description: 'Create new sales transactions', resource: 'pos', action: 'create' },
  { id: 'pos.refund', name: 'Process Refunds', description: 'Process refunds and returns', resource: 'pos', action: 'refund' },
  { id: 'pos.reports', name: 'View POS Reports', description: 'Access sales reports and analytics', resource: 'pos', action: 'reports' },
  { id: 'pos.void', name: 'Void Transactions', description: 'Void transactions', resource: 'pos', action: 'void' },
  
  // Customer permissions
  { id: 'customers.view', name: 'View Customers', description: 'View customer information', resource: 'customers', action: 'view' },
  { id: 'customers.create', name: 'Create Customers', description: 'Add new customers', resource: 'customers', action: 'create' },
  { id: 'customers.edit', name: 'Edit Customers', description: 'Edit customer information', resource: 'customers', action: 'edit' },
  { id: 'customers.delete', name: 'Delete Customers', description: 'Delete customer records', resource: 'customers', action: 'delete' },
  
  // Sales Management permissions
  { id: 'sales.view', name: 'View Sales', description: 'View sales transactions and history', resource: 'sales', action: 'view' },
  { id: 'sales.refund', name: 'Process Refunds', description: 'Process refunds and returns for sales', resource: 'sales', action: 'refund' },
  { id: 'sales.void', name: 'Void Sales', description: 'Void sales transactions', resource: 'sales', action: 'void' },
  { id: 'sales.export', name: 'Export Sales', description: 'Export sales data and reports', resource: 'sales', action: 'export' },
  
  // System permissions
  { id: 'system.settings', name: 'System Settings', description: 'Access system settings', resource: 'system', action: 'settings' },
  { id: 'system.logs', name: 'View Logs', description: 'Access system logs', resource: 'system', action: 'logs' },
];

// Define roles with their permissions
export const ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full system access',
    permissions: PERMISSIONS.map(p => p.id), // All permissions
    level: 100
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Administrative access',
    permissions: [
      'dashboard.view',
      'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete',
      'users.view', 'users.create', 'users.edit',
      'tournaments.view', 'tournaments.create', 'tournaments.edit', 'tournaments.delete', 'tournaments.manage_participants',
      'newsletter.view', 'newsletter.create', 'newsletter.send',
      'pos.view', 'pos.create', 'pos.refund', 'pos.reports', 'pos.void',
      'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
      'sales.view', 'sales.refund', 'sales.void', 'sales.export',
      'system.settings'
    ],
    level: 80
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Management access',
    permissions: [
      'dashboard.view',
      'inventory.view', 'inventory.create', 'inventory.edit',
      'users.view',
      'tournaments.view', 'tournaments.create', 'tournaments.edit', 'tournaments.manage_participants',
      'newsletter.view', 'newsletter.create', 'newsletter.send',
      'pos.view', 'pos.create', 'pos.refund', 'pos.reports',
      'customers.view', 'customers.create', 'customers.edit',
      'sales.view', 'sales.refund', 'sales.export'
    ],
    level: 60
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Content editing access',
    permissions: [
      'dashboard.view',
      'inventory.view', 'inventory.create', 'inventory.edit',
      'tournaments.view', 'tournaments.create', 'tournaments.edit',
      'newsletter.view', 'newsletter.create',
      'pos.view', 'pos.create',
      'customers.view', 'customers.create',
      'sales.view'
    ],
    level: 40
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [
      'dashboard.view',
      'inventory.view',
      'tournaments.view',
      'newsletter.view',
      'pos.view',
      'customers.view',
      'sales.view'
    ],
    level: 20
  }
];

export const RBAC_CONFIG: RBACConfig = {
  permissions: PERMISSIONS,
  roles: ROLES
};