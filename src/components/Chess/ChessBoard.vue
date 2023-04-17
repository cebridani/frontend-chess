<script setup>
import { ref, onMounted } from 'vue';
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';
import axios from "axios";

const boardAPI = ref();
const currentFen = ref(boardAPI.value?.getFen());
const moves = ref([]);
const openingName = ref('');
const fenInput = ref('fenInput');
const isInvalidFen = ref(false);

const boardConfig = {
  cordinates: true,
}

const shapes = [
        {
          orig: 'e2',
          dest: 'e4',
        brush: 'red'
        },
        {
          orig: 'e7',
          dest: 'e5',
          brush: 'blue'
        }
      ];

function handleCheckmate(isMated) {
  if (isMated === 'w') {
    alert('White wins!');
  } else {
    alert('Black wins!');
  }
}

async function handleMove(move) {
  console.log(move);
  currentFen.value = move.after;

  const isWhiteMove = move.color === 'w';
  let bestMove;

  if (move.color === 'w') {
    moves.value.push({ white: move.san, black: '' });
    bestMove = await getBestMove(currentFen.value, localStorage.getItem("access_token"));
    boardAPI.value?.move(bestMove);
  } else {
    const lastMoveIndex = moves.value.length - 1;

    if (lastMoveIndex >= 0 && moves.value[lastMoveIndex].white !== '') {
      moves.value[lastMoveIndex].black = move.san;
    } else {
      moves.value.push({ white: '', black: move.san });
    }
  }

  if (bestMove) {
    boardAPI.value?.move(bestMove);
  }

  saveFen(boardAPI.value?.getFen());
  boardAPI.value?.setShapes(shapes);
  updateOpeningName();
}

function undoLastMove() {
  boardAPI.value?.undoLastMove();

  const lastMoveIndex = moves.value.length - 1;
  if (lastMoveIndex >= 0) {
    const lastMove = moves.value[lastMoveIndex];

    if (lastMove.black === '') {
      // Si el último movimiento fue de las blancas, elimina el objeto del historial
      moves.value.pop();
    } else {
      // Si el último movimiento fue de las negras, borra la propiedad 'black' del último objeto en el historial
      moves.value[lastMoveIndex].black = '';
    }
  }

}

async function updateOpeningName() {
  if(!(openingName.value == "undefined")){
    const newOpeningName = await boardAPI.value?.getOpeningName();
    if (newOpeningName) {
      openingName.value = newOpeningName;
    }else{
      openingName.value = ""
    }
  }
}

async function clearMoves(){
  boardAPI.value?.resetBoard();
  try{
    const response = await axios.post('http://192.168.49.2:30353/api/chess/set_fen', { "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
    moves.value = [];
  } catch (error) {
    console.error('Error fetching best move:', error);
    return null;
  }
}

function setCustomFen(){
  try{
    if(boardAPI.value?.setPosition(fenInput.value.value)){
    isInvalidFen.value = true;
  }else{
    isInvalidFen.value = false;
    openingName.value = "undefined"
  }
  }catch(error){
    isInvalidFen.value = true;
  }
  
}

async function getBestMove(fen, jwtToken) {
  try{
    const response = await axios.post('http://192.168.49.2:30353/api/chess/get_best_move', { fen }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        }
      });
    console.log(response.data.best_move);
    return response.data.best_move;
  } catch (error) {
    console.error('Error fetching best move:', error);
    return null;
  }
}

async function fetchFen() {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get('http://192.168.49.2:30353/api/chess/get_fen', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    try{
    if(boardAPI.value?.setPosition(response.data.fen)){
    isInvalidFen.value = true;
    if(boardAPI.value?.getTurnColor() == 'black'){
      const bestMove = await getBestMove(currentFen.value, localStorage.getItem("access_token"));
      if (bestMove) {
        boardAPI.value?.move(bestMove);
      }
    }
  }else{
    isInvalidFen.value = false;
    openingName.value = "undefined"
  }
  }catch(error){
    isInvalidFen.value = true;
  }
  } catch (error) {
    console.error('Error fetching FEN:', error);
  }
}

async function get_list_best_moves(fen){
  try{
    const response = await axios.post('http://192.168.49.2:30353/api/chess/top_moves', { fen }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`
        }
      });

    console.log("esta es la lista de los mejores movimientos");
    console.log(response.data)

  } catch (error) {
    console.error('Error fetching best move:', error);
    return null;
  }
}

async function saveFen(fen) {
  try {
    const response = await axios.post('http://192.168.49.2:30353/api/chess/set_fen', { "fen": fen });
    console.log("FEN guardado en el backend:", response.data);
  } catch (error) {
    console.error("Error al guardar el FEN en el backend:", error);
  }
}

onMounted(() => {
  fetchFen();
});

</script>

<template>
   <div id="app" class="container-fluid d-flex align-items-center justify-content-center" style="height: 100%;">
    <div class="row " style="width: 100%;">
      <div class="col-md-7 chessboard-container">
        <TheChessboard
          :board-config="boardConfig"
          ref="chessboardRef"
          @board-created="(api) => (boardAPI = api)"
          @checkmate="handleCheckmate"
          @move="handleMove"
          style="width: 600px;"
        />
      </div>
      <div class="col-md-5 info-container">
          <div class="top-moves">
            <!-- Lista de los tres mejores movimientos -->
          </div>
          <div class="opening">
            Opening: {{ openingName }}
          </div>
          <div class="move-history flex-grow-1">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">White</th>
                  <th scope="col">Black</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(move, index) in moves" :key="index">
                  <th scope="row">{{ index + 1 }}</th>
                  <td>{{ move.white }}</td>
                  <td>{{ move.black }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="move-controls d-flex my-3 w-100 mt-auto">
            <button @click="boardAPI?.toggleOrientation()"
                    class="btn btn-secondary flex-fill me-2"
                    style="color: #EDE6DB; background-color: #1A3C40;">
              Toggle orientation
            </button>
            <button @click="clearMoves"
                    class="btn btn-secondary flex-fill me-2"
                    style="color: #EDE6DB; background-color: #1A3C40;">
              Reset
            </button>
            <button @click="undoLastMove"
                    class="btn btn-secondary flex-fill me-2"
                    style="color: #EDE6DB; background-color: #1A3C40;">
              Undo
            </button>
            <button @click="boardAPI?.toggleMoves()"
                    class="btn btn-secondary flex-fill"
                    style="color: #EDE6DB; background-color: #1A3C40;">
              Threats
            </button>
          </div>
          <div class="fen-input input-group my-3">
            <button class="btn btn-outline-secondary" 
                    @click="setCustomFen"
                    type="button"
                    style="color: #EDE6DB; background-color: #1A3C40;">
              FEN
            </button>
            <input
              ref="fenInput"
              type="text"
              class="form-control"
              :placeholder="currentFen"
              style="user-select: text;"
            />
        </div>
        <div class="input_alert" v-if="isInvalidFen">
          Invalid FEN
        </div>
      </div>
    </div>
  </div>
</template>

<style>
  .move-history {
    flex-grow: 1;
    overflow-y: auto;
  }

  .fen-input,
  .move-controls {
    margin-top: auto;
  }

  .move-history {
    overflow-y: auto;
  }

  .info-container{
    display: flex;
    flex-direction: column;
    max-height: 600px;
  }

  thead {
    position: sticky;
    top: 0;
    background-color: white;
  }

</style>
