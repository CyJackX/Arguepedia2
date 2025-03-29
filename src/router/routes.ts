import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'about',
        component: () => import('pages/AboutPage.vue'),
      },
      {
        path: 'search',
        component: () => import('pages/SearchResults.vue'),
      },
      {
        path: 'statement/:id',
        component: () => import('pages/StatementPage.vue'),
      },
      {
        path: 'auth',
        component: () => import('pages/AuthPage.vue'),
      },
      {
        path: 'profile/:username',
        name: 'Profile',
        component: () => import('pages/ProfilePage.vue'),
      },
      {
        path: 'user',
        name: 'UserSettings',
        component: () => import('pages/UserSettingsPage.vue'),
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('pages/AuthCallback.vue'),
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
