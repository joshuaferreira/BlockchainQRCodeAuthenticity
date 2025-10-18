export const ROUTES = {
  HOME: '/',
  CONSUMER: '/verify',
  MANUFACTURER_REGISTER: '/manufacturer/register',
  MANUFACTURER_DASHBOARD: '/manufacturer/dashboard',
  MANUFACTURER_PRODUCTS: '/manufacturer/products',
  RETAILER: '/retailer',
  RETAILER_DASHBOARD: '/retailer/dashboard',
  ADMIN: '/admin',
  ABOUT: '/about',
  HELP: '/help'
};

export const ROUTE_LABELS = {
  [ROUTES.HOME]: 'Home',
  [ROUTES.CONSUMER]: 'Verify Product',
  [ROUTES.MANUFACTURER_REGISTER]: 'Register Product',
  [ROUTES.MANUFACTURER_DASHBOARD]: 'Dashboard',
  [ROUTES.MANUFACTURER_PRODUCTS]: 'Products',
  [ROUTES.RETAILER]: 'Record Sale',
  [ROUTES.RETAILER_DASHBOARD]: 'Retailer Dashboard',
  [ROUTES.ADMIN]: 'Admin',
  [ROUTES.ABOUT]: 'About',
  [ROUTES.HELP]: 'Help'
};

export const ROLE_ROUTES = {
  OWNER: [
    ROUTES.MANUFACTURER_REGISTER,
    ROUTES.MANUFACTURER_DASHBOARD,
    ROUTES.MANUFACTURER_PRODUCTS,
    ROUTES.ADMIN
  ],
  MANUFACTURER: [
    ROUTES.MANUFACTURER_REGISTER,
    ROUTES.MANUFACTURER_DASHBOARD,
    ROUTES.MANUFACTURER_PRODUCTS
  ],
  RETAILER: [
    ROUTES.RETAILER,
    ROUTES.RETAILER_DASHBOARD
  ],
  CONSUMER: [
    ROUTES.CONSUMER
  ]
};