// Seu firebaseConfig deve ser colado aqui!
const firebaseConfig = {
  apiKey: "AIzaSyCTmbYEko-qYaLpX_N4RrZzDy8w76G9pC4",
  authDomain: "sorteio-tattoo-gratis.firebaseapp.com",
  projectId: "sorteio-tattoo-gratis",
  storageBucket: "sorteio-tattoo-gratis.appspot.com",
  messagingSenderId: "278546007465",
  appId: "1:278546007465:web:de17398bc72da535fb70b8",
  measurementId: "G-X0BLWX5559",
  databaseURL: "https://sorteio-tattoo-gratis-default-rtdb.firebaseio.com",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const form = document.getElementById("form");
const etapa1 = document.getElementById("etapa1");
const etapa2 = document.getElementById("etapa2");
const numerosContainer = document.getElementById("numerosContainer");

function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, "");
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

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const nome = form.nome.value.trim();
  const telefone = form.telefone.value.trim();
  const instagram = form.instagram.value.trim();
  const cpf = form.cpf.value.trim();

  if (!validarCPF(cpf)) {
    alert("CPF inválido.");
    return;
  }

  db.ref("participantes").once("value", (snapshot) => {
    const dados = snapshot.val();
    for (let i in dados) {
      const p = dados[i];
      if (p.telefone === telefone || p.instagram === instagram || p.cpf === cpf) {
        alert("Você já participou do sorteio.");
        return;
      }
    }

    etapa1.style.display = "none";
    etapa2.style.display = "block";
    gerarNumeros({ nome, telefone, instagram, cpf });
  });
});

function gerarNumeros(participante) {
  numerosContainer.innerHTML = "";
  db.ref("participantes").once("value", (snapshot) => {
    const ocupados = new Set();
    snapshot.forEach((child) => {
      ocupados.add(child.val().numero);
    });

    for (let i = 1; i <= 100; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.disabled = ocupados.has(i);
      if (ocupados.has(i)) btn.classList.add("inativo");

      btn.addEventListener("click", () => {
        btn.disabled = true;
        btn.classList.add("inativo");
        db.ref("participantes").push({
          ...participante,
          numero: i,
        });
        numerosContainer.innerHTML =
          `<p>Cadastro finalizado com sucesso!</p><p>Número escolhido: ${i}</p>`;
      });

      numerosContainer.appendChild(btn);
    }
  });
}
