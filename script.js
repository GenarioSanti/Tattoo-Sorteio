
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child } from "firebase/database";

// Configuração real do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCTmbYEko-qYaLpX_N4RrZzDy8w76G9pC4",
  authDomain: "sorteio-tattoo-gratis.firebaseapp.com",
  databaseURL: "https://sorteio-tattoo-gratis-default-rtdb.firebaseio.com",
  projectId: "sorteio-tattoo-gratis",
  storageBucket: "sorteio-tattoo-gratis.firebasestorage.app",
  messagingSenderId: "278546007465",
  appId: "1:278546007465:web:de17398bc72da535fb70b8",
  measurementId: "G-X0BLWX5559"
};

// Inicialização
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Exemplo de função que envia os dados
window.enviarDados = function(nome, telefone, instagram, cpf, numeroEscolhido) {
  const dados = {
    nome,
    telefone,
    instagram,
    cpf,
    numeroEscolhido
  };

  // Verificação de duplicidade (exceto nome)
  const dbRef = ref(db);
  get(child(dbRef, "participantes")).then((snapshot) => {
    if (snapshot.exists()) {
      const participantes = snapshot.val();
      for (let key in participantes) {
        const p = participantes[key];
        if (p.cpf === cpf || p.instagram === instagram || p.telefone === telefone) {
          alert("Dados já cadastrados anteriormente!");
          return;
        }
      }
    }

    // Gravação dos dados
    set(ref(db, "participantes/" + cpf), dados)
      .then(() => {
        alert("Cadastro realizado com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao salvar no Firebase:", error);
      });
  });
};
