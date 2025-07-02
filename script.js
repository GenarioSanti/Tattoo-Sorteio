
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

  
  firebase.database().ref("usuarios").once("value", snapshot => {
    const dados = snapshot.val() || {};
    for (let key in dados) {
      const user = dados[key];
      if (user.cpf === cpf || user.telefone === telefone || user.instagram === instagram) {
        alert("Você já está cadastrado com essas informações.");
        return;
      }
    }

    dadosUsuario = { nome, telefone, instagram, cpf };

    document.getElementById("form-screen").classList.remove("active");
    document.getElementById("regras-screen").classList.add("active");
  });
  return;

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
  firebase.database().ref("usuarios").once("value", snapshot => {
    const dados = snapshot.val() || {};
    for (let i = 1; i <= 100; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;
      btn.className = "numero";
      btn.onclick = () => selecionarNumero(i, btn);
      if (Object.values(dados).some(user => user.numero === i)) {
        btn.disabled = true;
        btn.classList.add("selecionado");
      }
      container.appendChild(btn);
    }
  });
}
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
  firebase.database().ref("usuarios/" + dadosUsuario.cpf).set(dadosUsuario);

  const tela = document.getElementById("numero-screen");
  tela.innerHTML = `
    <h2>Parabéns!</h2>
    <p>Você está participando com o número <strong>${numeroEscolhido}</strong>.</p>
    <p>Boa sorte! 🍀</p>
  `;
}
