import { createApp } from 'vue'
import Toaster from "@meforma/vue-toaster";
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import axios from "axios";

// Configurar interceptor de Axios
axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");
      // Verificar si el token existe antes de agregarlo al encabezado
      if (token && token != 'undefined') {
        config.headers.Authorization = "Bearer " + token;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );  

import App from './App.vue';
import Store from './Store';
import Router from './routes';

const app = createApp(App);

app.use(Antd);
app.use(Toaster);
app.use(Router);
app.use(Store);
app.mount('#app')
