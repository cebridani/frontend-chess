/* eslint-disable */
import { createRouter, createWebHistory } from "vue-router";

// COMPONENTS
import Home from "./components/Home";
import Signin from "./components/User/signin.vue";
import Stadistics from "./components/Chess/Stadistics.vue";

const routes = [
  { path: "/", component: Home, name: "home", meta: { requiresAuth: true } },
  { path: "/signin", component: Signin, name: "signin" },
  { path: "/stadistics", component: Stadistics, name: "stadistics" , meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const token = localStorage.getItem("access_token");

  if (requiresAuth && (!token || token == 'undefined')) {
    next({ name: "signin" });
  } else {
    next();
  }
});

export default router;

