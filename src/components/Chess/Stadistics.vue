<template>
  <div id="app" class="container-fluid d-flex align-items-center justify-content-center" style="height: 100%;">
    <div class="row" style="width: 100%;">
      <div class="col-md-7 chessboard-container text-end">
        <TheChessboard ref="chessboardRef" @board-created="(api) => (boardAPI = api)"
          :id="'my-board'"
          :position="fen"
          :board-config="boardConfig"
          style="width: 600px;"/>
      </div>
      <div class="col-md-5 info-container text-start">
        <div class="opening">
          Opening: {{ openingName }}
        </div>
        <div class="evaluation">
          Evaluation: {{ evaluation }}
        </div>
        <div class="material">
          Material difference: {{ materialDifference }}
        </div>
        <div class="piece">
          Piece evaluation: {{ pieceEvaluation }}
        </div>
        <div class="error" style="color: red;">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

  
  <script>
  import { TheChessboard } from 'vue3-chessboard';
  import 'vue3-chessboard/style.css';
  import { onMounted, ref } from 'vue';
  import axios from "axios";
  
  export default {
    name: 'Stadistics',
    components: {
        TheChessboard,
    },
    setup() {
      const fen = ref("start");
      const boardAPI = ref();
      const json = ref(null);
      const openingName = ref('');
      const evaluation = ref('');
      const error = ref('');
      const materialDifference = ref('');
      const pieceEvaluation = ref('');
      const boardConfig = {
        draggable: {
        enabled: false,
      },
      movable: {
        free: false,
        dests: {},
      },
      events: {
        select(key) {
          showDialogForPosition(json, key);
          console.log(key);
        },
      },
        coordinates: true,
    };

    function showDialogForPosition(json, position) {
      try{
        if (json.value[position]) { // Verifica si la posición existe en el JSON
            const value = json.value[position].Value; // Obtiene el valor de la posición
            console.log(value);
            pieceEvaluation.value = ` ${position} : ${value}`
        } else {
          pieceEvaluation.value = ` ${position}`; // Muestra un diálogo si la posición no existe
        }
      }catch(error){
        console.error('Error stadistics not fetched yet:', error);
      }
        
    }

    async function getPosition(){
      let fen = localStorage.getItem('fen');
      try {
        const response = await axios.post('http://192.168.49.2:30353/api/chess/get_stadistics', fen, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        console.log(response.data);
        json.value = response.data;
        error.value = "";
        if(response.data == "No se encontró la tabla del tablero en la entrada proporcionada."){
          error.value = "Piece evaluation disabled during ckeckmate"
        }
      } catch (error) {
        console.error('Error fetching get stadistics:', error);
      }
    }

    function setStadistics(){
      openingName.value = localStorage.getItem('opening')
      evaluation.value = localStorage.getItem('evaluation')
      materialDifference.value = boardAPI.value?.getMaterialCount().materialDiff;
    }

    onMounted(() => {

      boardAPI.value?.loadPgn(localStorage.getItem("pgn"));
      getPosition();
      setStadistics();

    });

      return {
        fen,
        boardConfig,
        boardAPI,
        json,
        getPosition,
        pieceEvaluation,
        materialDifference, 
        evaluation,
        openingName,
        error,
      };
    },
  };
</script>
  
