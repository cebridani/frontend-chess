<template>
  <div id="app">
    <app-header></app-header>
    <main class="main-content w-100 d-flex align-items-center justify-content-center">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import appHeader from './components/Header';
import Chessboard from './components/Chess/ChessBoard.vue';
import Stadistics from './components/Chess/Stadistics.vue';

export default {
  components:{
    Chessboard,
    Stadistics,
    appHeader
  }
}
</script>

<style>
  @import './assets/style.css';
</style>
