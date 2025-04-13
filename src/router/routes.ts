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
        children: [
          {
            path: 'opposing',
            name: 'opposing',
            component: () => import('../components/ArgumentTab.vue'),
            props: (route) => ({
              key: 'opposing',
              statementId: Number(route.params.id),
              argument_type: 'OPPOSES',
            }),
          },
          {
            path: 'comments',
            name: 'comments',
            component: () => import('../components/CommentTab.vue'),
            props: (route) => ({ parent_id: Number(route.params.id), parent_type: 'statement' }),
          },
          {
            path: 'supporting',
            name: 'supporting',
            component: () => import('../components/ArgumentTab.vue'),
            props: (route) => ({
              key: 'supporting',
              statementId: Number(route.params.id),
              argument_type: 'SUPPORTS',
            }),
          },
          { path: '', redirect: { name: 'comments' } },
        ],
      },
      {
        path: 'argument/:id',
        component: () => import('pages/ArgumentPage.vue'),
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
