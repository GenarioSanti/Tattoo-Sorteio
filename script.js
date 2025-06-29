// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTmbYEko-qYaLpX_N4RrZzDy8w76G9pC4",
  authDomain: "sorteio-tattoo-gratis.firebaseapp.com",
  projectId: "sorteio-tattoo-gratis",
  storageBucket: "sorteio-tattoo-gratis.appspot.com",
  messagingSenderId: "278546007465",
  appId: "1:278546007465:web:de17398bc72da535fb70b8",
  measurementId: "G-X0BLWX5559",
  databaseURL: "https://sorteio-tattoo-gratis-default-rtdb.firebaseio.com"
};

// Inicialização do Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// CPF Validator
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf[10]);
}

// Coleta dados do formulário e exibe os números
function avancar() {
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const instagram = document.getElementById("instagram").value.trim();
  const cpf = document.getElementById("cpf").value.trim();

  if (!nome || !telefone || !instagram || !cpf) {
    alert("Preencha todos os campos corretamente.");
    return;
  }
  if (!validarCPF(cpf)) {
    alert("CPF inválido.");
    return;
  }

  // Verifica se CPF, telefone ou Instagram já existem
  database.ref("participantes").orderByChild("cpf").equalTo(cpf).once("value", function(snapshot) {
    if (snapshot.exists()) {
      alert("Este CPF já foi utilizado.");
    } else {
      database.ref("participantes").orderByChild("telefone").equalTo(telefone).once("value", function(snapTel) {
        if (snapTel.exists()) {
          alert("Este telefone já foi utilizado.");
        } else {
          database.ref("participantes").orderByChild("instagram").equalTo(instagram).once("value", function(snapInsta) {
            if (snapInsta.exists()) {
              alert("Este Instagram já foi utilizado.");
            } else {
              document.getElementById("formulario").style.display = "none";
              document.getElementById("mensagemFinal").style.display = "none";
              gerarNumeros(nome, telefone, instagram, cpf);
            }
          });
        }
      });
    }
  });
}

// Gera os botões de número de 1 a 100
function gerarNumeros(nome, telefone, instagram, cpf) {
  const container = document.getElementById("numerosContainer");
  container.innerHTML = "";
  for (let i = 1; i <= 100; i++) {
    const botao = document.createElement("button");
    botao.innerText = i;
    botao.classList.add("numero");
    botao.onclick = function () {
      selecionarNumero(i, nome, telefone, instagram, cpf);
    };
    database.ref("numeros/" + i).once("value", function(snapshot) {
      if (snapshot.exists()) botao.disabled = true;
    });
    container.appendChild(botao);
  }
  container.style.display = "flex";
}

// Salva a escolha no banco de dados
function selecionarNumero(numero, nome, telefone, instagram, cpf) {
  database.ref("numeros/" + numero).once("value", function(snapshot) {
    if (snapshot.exists()) {
      alert("Número já foi escolhido. Escolha outro.");
    } else {
      database.ref("numeros/" + numero).set({ nome, telefone, instagram, cpf });
      database.ref("participantes").push({ nome, telefone, instagram, cpf, numero });
      document.getElementById("numerosContainer").innerHTML =
        `<p>Cadastro finalizado com sucesso!</p><p>Número escolhido: <strong>${numero}</strong></p>`;
    }
  });
}

window.onload = function () {
  document.getElementById("btnAvancar").addEventListener("click", avancar);
};
