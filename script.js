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
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const form = document.getElementById('formulario');
const numerosDiv = document.getElementById('numeros');
const erroDiv = document.getElementById('mensagem-erro');
let dadosUsuario = {};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  erroDiv.innerText = "";

  dadosUsuario = {
    nome: document.getElementById('nome').value,
    telefone: document.getElementById('telefone').value,
    instagram: document.getElementById('instagram').value,
    rg: document.getElementById('rg').value
  };

  const participantesSnapshot = await db.ref("participantes").once("value");
  const participantes = participantesSnapshot.val() || {};
  const telefoneLimpo = dadosUsuario.telefone.replace(/\D/g, "");

  for (const id in participantes) {
    const p = participantes[id];
    if (p.telefone === dadosUsuario.telefone || 
        p.instagram.toLowerCase() === dadosUsuario.instagram.toLowerCase() || 
        p.rg === dadosUsuario.rg) {
      erroDiv.innerText = "❌ Você já está participando do sorteio. Dados duplicados não são permitidos.";
      return;
    }
  }

  form.style.display = 'none';
  numerosDiv.style.display = 'grid';

  const snapshot = await db.ref("numerosEscolhidos").once("value");
  const numerosUsados = snapshot.val() || {};

  for (let i = 1; i <= 100; i++) {
    const btn = document.createElement("div");
    btn.className = "numero";
    btn.innerText = i;
    if (numerosUsados[i]) {
      btn.classList.add("selecionado");
    } else {
      btn.addEventListener("click", () => escolherNumero(i, btn));
    }
    numerosDiv.appendChild(btn);
  }
});

function escolherNumero(numero, botao) {
  db.ref("numerosEscolhidos/" + numero).set(true);
  const id = dadosUsuario.telefone.replace(/\D/g, "");
  db.ref("participantes/" + id).set({
    ...dadosUsuario,
    numero
  });
  botao.classList.add("selecionado");
  botao.innerText = "✓ " + numero;
  alert("Cadastro finalizado! Número escolhido: " + numero);
}
