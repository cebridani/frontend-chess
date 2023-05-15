<script setup>
import { ref, onMounted } from 'vue';
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';
import axios from "axios";
const boardAPI = ref();
const currentFen = ref(boardAPI.value?.getFen());
const moves = ref([]);
const openingName = ref('');
const evaluation = ref('');
const fenInput = ref('fenInput');
const isInvalidFen = ref(false);
var lastMove;
const boardConfig = {
  cordinates: true,
}

async function handleMove(move) {
  lastMove = move;
  updateOpeningName();
  currentFen.value = move.after;
  localStorage.setItem("fen", move.after);
  localStorage.setItem("pgn", boardAPI.value?.getPgn());
  
  lastMove = move;
  parsePgn(boardAPI.value?.getPgn());
  savePgn();
  saveFen();
  getEvaluation();
  boardAPI.value?.hideMoves();
  updateOpeningName();
}

function parsePgn(pgn) {
    const splitPgn = pgn.split(" ");
    moves.value = [];
    for (let i = 0; i < splitPgn.length; i += 3) {
        const whiteMove = splitPgn[i + 1];
        const blackMove = splitPgn[i + 2] || ''; // en caso de que el número de movimientos no sea par
        moves.value.push({ white: whiteMove, black: blackMove });
    }
}

function undoLastMove() {

  boardAPI.value?.undoLastMove();
  currentFen.value = boardAPI.value?.getFen();
  localStorage.setItem('pgn', boardAPI.value?.getPgn())
  savePgn();
  saveFen();
  updateOpeningName();
  parsePgn(boardAPI.value?.getPgn());
}

async function updateOpeningName() {
  const newOpeningName = await boardAPI.value?.getOpeningName();
  if (newOpeningName) {
    openingName.value = newOpeningName;
    localStorage.setItem("opening", newOpeningName);
  } else {
    openingName.value = localStorage.getItem("opening");
  }
}

async function getEvaluation() {
  var fen = lastMove.after;
  try {
    const response = await axios.post('http://127.0.0.1:5000/api/chess/get_evaluation', fen, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    evaluation.value = response.data;
    localStorage.setItem("evaluation", response.data);
  } catch (error) {
    console.error('Error fetching get evaluation:', error);
    if (error.response && error.response.status === 500) {
      evaluation.value = "Checkmate";
      localStorage.setItem("evaluation", "Checkmate");
    }
  }
}

async function clearMoves() {
  boardAPI.value?.resetBoard();
  var after = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  try {
    const response = await axios.post('http://127.0.0.1:5000/api/chess/set_fen', {after}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    savePgn();
    saveFen();
    moves.value = [];
    currentFen.value = boardAPI.value?.getFen();
    evaluation.value = "0";
  } catch (error) {
    console.error('Error fetching best move:', error);
    return null;
  }
}
function setCustomFen() {
  try {
    if (boardAPI.value?.setPosition(fenInput.value.value)) {
      isInvalidFen.value = true;
    } else {
      isInvalidFen.value = false;
      openingName.value = "undefined"
    }
  } catch (error) {
    isInvalidFen.value = true;
  }

}
async function getBestMove(jwtToken) {
  try {
    const response = await axios.post('http://127.0.0.1:5000/api/chess/get_best_move', lastMove, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching best move:', error);
    return null;
  }
}

async function fetchPgn() {

  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get('http://127.0.0.1:5000/api/chess/get_pgn', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    try {
      console.log("PGN: ")
      console.log(response.data)
      console.log(localStorage.getItem('pgn'))
      parsePgn(response.data)
      if (boardAPI.value?.loadPgn(response.data)) {
        updateOpeningName();
      }
    } catch (error) {
    }
  } catch (error) {
    console.error('Error fetching PGN:', error);
    boardAPI.value?.loadPgn(localStorage.getItem('pgn'));
  }
}
async function get_list_best_moves() {
  try {
    const fen = boardAPI.value?.getFen();
    const token = localStorage.getItem('access_token');
    const response = await axios.post('http://127.0.0.1:5000/api/chess/top_moves', fen, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const topMoves = response.data; 

    const moveColors = ['red', 'blue', 'green']; // Define un color para cada movimiento

    const formattedMoves = topMoves.map((move, index) => ({
      orig: move.slice(0, 2), // Extrae la posición de origen del movimiento (por ejemplo, 'c3')
      dest: move.slice(2, 4), // Extrae la posición de destino del movimiento (por ejemplo, 'd5')
      brush: moveColors[index % moveColors.length],
    }));

    console.log([formattedMoves]);

    boardAPI.value.setShapes(formattedMoves);
  } catch (error) {
    console.error('Error fetching top moves:', error);
  }
}
async function saveFen() {
  try {
    const response = await axios.post('http://127.0.0.1:5000/api/chess/set_fen', lastMove);
    console.log("FEN guardado en el backend:", response.data);
  } catch (error) {
    console.error("Error al guardar el FEN en el backend:", error);
  }
}

async function savePgn() {
  try {
    const response = await axios.post('http://127.0.0.1:5000/api/chess/set_pgn', boardAPI.value?.getPgn());
    console.log("PGN guardado en el backend:", response.data);
    localStorage.setItem('pgn', boardAPI.value?.getPgn());
    saveFen();
  } catch (error) {
    console.error("Error al guardar el FEN en el backend:", error);
  }
}

async function handleMoveButtonClick() {
  const bestMove = await getBestMove(localStorage.getItem("access_token"));
  if (bestMove) {
    boardAPI.value?.move(bestMove);
  }
}

onMounted(() => {
  
  fetchPgn();
  evaluation.value = "0";

});

</script>

<template>
  <div id="app" class="container-fluid d-flex align-items-center justify-content-center" style="height: 100%;">
    <div class="row " style="width: 100%;">
      <div class="col-md-7 chessboard-container">
        <TheChessboard :board-config="boardConfig" ref="chessboardRef" @board-created="(api) => (boardAPI = api)"
          @move="handleMove" style="width: 600px;" />
      </div>
      <div class="col-md-5 info-container">
        <div class="opening">
          Opening: {{ openingName }}
        </div>
        <div class="opening">
          Evaluation: {{ evaluation }}
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
          <button @click="boardAPI?.toggleOrientation()" class="btn btn-secondary flex-fill me-2"
            style="color: #EDE6DB; background-color: #1A3C40;">
            Toggle orientation
          </button>
          <button @click="clearMoves" class="btn btn-secondary flex-fill me-2"
            style="color: #EDE6DB; background-color: #1A3C40;">
            Reset
          </button>
          <button @click="undoLastMove" class="btn btn-secondary flex-fill me-2"
            style="color: #EDE6DB; background-color: #1A3C40;">
            Undo
          </button>
          <button @click="boardAPI?.toggleMoves()" class="btn btn-secondary flex-fill me-2"
            style="color: #EDE6DB; background-color: #1A3C40;">
            Threats
          </button>
          <button @click="handleMoveButtonClick" class="btn btn-secondary flex-fill me-2"
            style="color: #EDE6DB; background-color: #1A3C40;">
            Move
          </button>
          <button @click="get_list_best_moves" class="btn btn-secondary flex-fill me-2"
            style="color: #EDE6DB; background-color: #1A3C40;">
            Best Moves
          </button>
        </div>
        <div class="fen-input input-group my-3">
          <button class="btn btn-outline-secondary" @click="setCustomFen" type="button"
            style="color: #EDE6DB; background-color: #1A3C40;">
            FEN
          </button>
          <input ref="fenInput" type="text" class="form-control" :placeholder="currentFen" style="user-select: text;" />
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

.info-container {
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

