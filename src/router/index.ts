import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from '../stores/authStore';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Add navigation guard
  Router.beforeEach((to) => {
    const authStore = useAuthStore();
    if (!to.meta.requiresAuth) {
      console.log('No auth required, skipping guard');
      return;
    }

    console.log('Navigation guard - Route:', to.path);
    console.log('Navigation guard - Auth required:', to.meta.requiresAuth);
    console.log('Navigation guard - User authenticated:', !!authStore.user);

    if (!authStore.user) {
      console.log('Navigation guard - Not authenticated, redirecting to auth page');
      return {
        path: '/auth',
        query: { redirect: to.fullPath },
      };
    }
  });

  return Router;
});
