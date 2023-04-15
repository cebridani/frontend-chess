<template>
    <div class="signin_container p_top">

        <Form @submit="onSubmit" :validation-schema="formSchema">

            <h1 v-text="!type ? 'Sign in':'Sign up'"></h1>

            <div class="form-group">

                <Field name="name" v-slot="{field, errors, errorMessage}">
                    <input
                    type="text"
                    id="name"
                    class="form-control"
                    placeholder="Enter your name"
                    v-bind="field"
                    :class="{'is-invalid': errors.length !== 0}"
                    v-if="type"
                    />
                    <div
                    class="input_alert"
                    v-if="errors.length !== 0"
                    >
                    {{ errorMessage }}
                    </div>
                </Field>

                <Field name="username" v-slot="{field, errors, errorMessage}">
                    <input
                    type="text"
                    id="username"
                    class="form-control"
                    placeholder="Enter your username"
                    v-bind="field"
                    :class="{'is-invalid': errors.length !== 0}"
                    v-if="type"
                    />
                    <div
                    class="input_alert"
                    v-if="errors.length !== 0"
                    >
                    {{ errorMessage }}
                    </div>
                </Field>

                <Field name="email" v-slot="{field, errors, errorMessage }">
                    <input
                        type="text"
                        id="email"
                        class="form-control"
                        placeholder="Enter your email"
                        v-bind="field"
                        :class="{'is-invalid': errors.length !== 0}"
                    />
                    <div
                        class="input_alert"
                        v-if="errors.length !== 0"
                    >
                        {{ errorMessage }}
                    </div>
                </Field>
            </div>


             <div class="form-group">
                <Field name="password" v-slot="{field, errors, errorMessage }">
                    <input
                        type="password"
                        id="password"
                        class="form-control"
                        placeholder="Enter your password"
                        v-bind="field"
                        :class="{'is-invalid': errors.length !== 0}"
                    />
                    <div
                        class="input_alert"
                        v-if="errors.length !== 0"
                    >
                        {{ errorMessage }}
                    </div>
                </Field>
            </div>

            <button
                type="submit"
                class="btn mb-3 btn-block"
                v-text="!type ? 'Sign in':'Sign up'"
            >
            </button>

            <hr/>
            <div class="form_swap" @click="type = !type">
                <span v-if="type">
                    I want to <b>Sign in</b>
                </span>
                <span v-else>
                    I want to <b>Sign up</b>
                </span>
            </div>


        </Form>


    </div>
</template>

<script>
import { Field, Form } from "vee-validate";
import * as yup from "yup";
import { useRouter } from "vue-router";
import { ref, computed } from "vue";
import axios from "axios";

export default {
  components: {
    Field,
    Form,
  },

  setup() {
    const router = useRouter();

    const type = ref(false);

    const onSubmit = async (values, { resetForm }) => {
  if (!type.value) {
    // sign in
    await signIn(values);
    
  } else {
    // sign up
    const requestData = {
      name: values.name,
      username: values.username,
      email: values.email,
      password: values.password,
    };

    try {
      const response = await axios.post("http://192.168.49.2:30353/api/auth/login", requestData);

      // Si la respuesta es exitosa, redirige al usuario a la página de inicio de sesión
      if (response.status === 201) {
        router.push({ name: "home" });
      }
    } catch (error) {
      console.log("Error al registrar usuario:", error);
    }

  }
  resetForm();
};

    const formSchema = computed(() => {
      const emailValidation = yup
        .string()
        .required("The email is required")
        .email("Not a valid email");
      const passwordValidation = yup.string().required("The password is required");
      const nameValidation = yup.string().required("A name is required");
      const usernameValidation = yup.string().required("A username is required");

      return type.value
        ? { email: emailValidation, password: passwordValidation, name: nameValidation, username:usernameValidation }
        : { email: emailValidation, password: passwordValidation };
    });

    const signIn = async (values) => {
      const requestData = {
        usernameOrEmail: values.email,
        password: values.password,
      };

      try {
        const response = await axios.post("http://192.168.49.2:30353/api/auth/signup", requestData);

        if (response.status === 200) {
          localStorage.setItem("access_token", response.data.accessToken);
          console.log(response.data.access_token);
          router.push({ name: "home" });
        } else {
          console.log("No se pudo iniciar sesión, respuesta no es 200");
        }
      } catch (error) {
        console.log("Error al iniciar sesión:", error);
      }
    };

    return {
      type,
      onSubmit,
      formSchema,
    };
  },
};
</script>
