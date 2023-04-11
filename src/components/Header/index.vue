<template>
    <header>
        <div class="container header_container">
            <div class="logo">
                <router-link to="/">
                    Chess Engine
                </router-link>
            </div>
            <div>
                <ul>
                    <li>
                        <router-link to="/signin">
                            Sign in
                        </router-link>
                    </li>
                    <li>
                        <router-link to="/signin" @click.prevent="logout">
                        Logout
                        </router-link>
                    </li>
                    <li>
                        <router-link to="/user/dashboard">
                            Dashboard
                        </router-link>
                    </li>
                </ul>
            </div>
        </div>
    </header>
</template>

<script>

export default {
  setup() {

    const logout = () => {
      // Elimina el token del almacenamiento local
      localStorage.removeItem("access_token");
    };

    return { logout };
  },
};

</script>