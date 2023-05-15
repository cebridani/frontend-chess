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
                        <router-link to="/stadistics">
                        Stadistics
                        </router-link>
                    </li>
                    <li>
                        <router-link to="/signin" @click.prevent="logout">
                        Logout
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
      // Elimina almacenamiento local
      localStorage.removeItem("access_token");
      localStorage.removeItem("evaluation");
      localStorage.removeItem("fen");
      localStorage.removeItem("opening");
      localStorage.removeItem("pgn");
    };

    return { logout };
  },
};

</script>