
const firebaseConfig = {
  apiKey: "AIzaSyCTmbYEko-qYaLpX_N4RrZzDy8w76G9pC4",
  authDomain: "sorteio-tattoo-gratis.firebaseapp.com",
  databaseURL: "https://sorteio-tattoo-gratis-default-rtdb.firebaseio.com",
  projectId: "sorteio-tattoo-gratis",
  storageBucket: "sorteio-tattoo-gratis.appspot.com",
  messagingSenderId: "278546007465",
  appId: "1:278546007465:web:de17398bc72da535fb70b8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const form = document.getElementById("cadastro-form");
const formContainer = document.getElementById("form-container");
const numeroContainer = document.getElementById("numero-container");
const confirmacaoContainer = document.getElementById("confirmacao-container");
const numerosDiv = document.getElementById("numeros");
const numeroEscolhidoDiv = document.getElementById("numero-escolhido");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const instagram = document.getElementById("instagram").value.trim();
  const cpf = document.getElementById("cpf").value.trim();

  if (!validarCPF(cpf)) {
    alert("CPF inválido.");
    return;
  }

  db.ref("participantes").orderByChild("telefone").equalTo(telefone).once("value", snapshot => {
    if (snapshot.exists()) return alert("Esse telefone já foi usado.");

    db.ref("participantes").orderByChild("instagram").equalTo(instagram).once("value", snap => {
      if (snap.exists()) return alert("Esse Instagram já foi usado.");

      db.ref("participantes").orderByChild("cpf").equalTo(cpf).once("value", snap2 => {
        if (snap2.exists()) return alert("Esse CPF já foi usado.");

        formContainer.classList.add("hidden");
        numeroContainer.classList.remove("hidden");
        carregarNumeros({ nome, telefone, instagram, cpf });
      });
    });
  });
});

function carregarNumeros(dados) {
  numerosDiv.innerHTML = "";
  db.ref("participantes").once("value", snapshot => {
    let ocupados = {};
    snapshot.forEach(child => ocupados[child.val().numero] = true);

    for (let i = 1; i <= 100; i++) {
      const btn = document.createElement("div");
      btn.classList.add("numero");
      btn.textContent = i;
      if (ocupados[i]) {
        btn.classList.add("ocupado");
      } else {
        btn.addEventListener("click", () => {
          const novoRef = db.ref("participantes").push();
          novoRef.set({ ...dados, numero: i });
          numeroContainer.classList.add("hidden");
          confirmacaoContainer.classList.remove("hidden");
          numeroEscolhidoDiv.textContent = i;
        });
      }
      numerosDiv.appendChild(btn);
    }
  });
}

function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || /^(\d)+$/.test(cpf)) return false;
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
