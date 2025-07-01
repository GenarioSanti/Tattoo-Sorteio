
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";


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


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const database = {}; // simulação local do Firebase (em uso real seria substituído)
let checks = { check1: false, check2: false };
let dadosUsuario = {};
let numeroEscolhido = null;

function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g,'');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf.charAt(10));
}

function irParaRegras() {
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const instagram = document.getElementById("instagram").value.trim();
  const cpf = document.getElementById("cpf").value.trim();

  if (!nome || !telefone || !instagram || !cpf) {
    alert("Preencha todos os campos.");
    return;
  }

  if (!validarCPF(cpf)) {
    alert("CPF inválido.");
    return;
  }

  
// Verifica duplicidade com o Firestore
const participantesRef = collection(db, "participantes");

const q = query(participantesRef,
  where("cpf", "==", cpf),
  where("telefone", "==", telefone),
  where("instagram", "==", instagram.toLowerCase())
);
const querySnapshot = await getDocs(participantesRef);

for (const docSnap of querySnapshot.docs) {
  const dados = docSnap.data();
  if (dados.cpf === cpf || dados.telefone === telefone || dados.instagram.toLowerCase() === instagram.toLowerCase()) {
    alert("Você já está participando com essas informações.");
    return;
  }
}

// Se passou na validação, salva os dados
await addDoc(participantesRef, {{
  nome,
  telefone,
  instagram: instagram.toLowerCase(),
  cpf,
  numero
}});

  for (let key in database) {
    const dados = database[key];
    if (dados.cpf === cpf || dados.telefone === telefone || dados.instagram === instagram) {
      alert("Você já está cadastrado com essas informações.");
      return;
    }
  }

  dadosUsuario = { nome, telefone, instagram, cpf };

  document.getElementById("form-screen").classList.remove("active");
  document.getElementById("regras-screen").classList.add("active");
}

function seguir(url, checkId) {
  window.open(url, "_blank");
  const span = document.getElementById(checkId);
  span.innerText = "⏳";
  setTimeout(() => {
    span.innerText = "✅";
    checks[checkId] = true;
    verificarChecks();
  }, 10000);
}

function verificarChecks() {
  if (checks.check1 && checks.check2) {
    document.getElementById("continuarBtn").disabled = false;
  }
}

function irParaNumeros() {
  document.getElementById("regras-screen").classList.remove("active");
  document.getElementById("numero-screen").classList.add("active");
  carregarNumeros();
}

function carregarNumeros() {
  const container = document.getElementById("numeros");
  container.innerHTML = "";
  for (let i = 1; i <= 100; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    btn.className = "numero";
    btn.onclick = () => selecionarNumero(i, btn);
    if (Object.values(database).some(user => user.numero === i)) {
      btn.disabled = true;
      btn.classList.add("selecionado");
    }
    container.appendChild(btn);
  }
}

function selecionarNumero(numero, botao) {
  if (numeroEscolhido !== null) return; // só um número
  numeroEscolhido = numero;
  botao.disabled = true;
  botao.classList.add("selecionado");

  const finalizarBtn = document.createElement("button");
  finalizarBtn.innerText = "Finalizar Participação";
  finalizarBtn.onclick = finalizarCadastro;
  finalizarBtn.className = "finalizar";
  document.getElementById("numero-screen").appendChild(finalizarBtn);
}

function finalizarCadastro() {
  dadosUsuario.numero = numeroEscolhido;
  database[dadosUsuario.cpf] = dadosUsuario; // salvar simulado

  const tela = document.getElementById("numero-screen");
  tela.innerHTML = `
    <h2>Parabéns!</h2>
    <p>Você está participando com o número <strong>${numeroEscolhido}</strong>.</p>
    <p>Boa sorte! 🍀</p>
  `;
}
