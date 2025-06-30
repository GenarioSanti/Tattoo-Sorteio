
const firebaseConfig = {
  apiKey: "AIzaSyDedaUYgNzWIwZJx8q47zTrxfYaBZoiyZA",
  authDomain: "sorteio-tattoo-896cc.firebaseapp.com",
  projectId: "sorteio-tattoo-896cc",
  storageBucket: "sorteio-tattoo-896cc.firebasestorage.app",
  messagingSenderId: "614182873504",
  appId: "1:614182873504:web:72152debf3cab346a55cc5"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

const form = document.getElementById("cadastro-form");
const formContainer = document.getElementById("form-container");
const numeroContainer = document.getElementById("numero-container");
const confirmacaoContainer = document.getElementById("confirmacao-container");
const numerosDiv = document.getElementById("numeros");
const numeroEscolhidoDiv = document.getElementById("numero-escolhido");

form.addEventListener("submit", async function(e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const instagram = document.getElementById("instagram").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const fotoFile = document.getElementById("foto").files[0];

  if (!nome || !telefone || !instagram || !cpf || !fotoFile) {
    alert("Preencha todos os campos e envie a foto do print.");
    return;
  }

  const storageRef = storage.ref(`comprovantes/${telefone}_${Date.now()}.jpg`);
  const uploadTask = await storageRef.put(fotoFile);
  const imageUrl = await uploadTask.ref.getDownloadURL();

  const participante = { nome, telefone, instagram, cpf, comprovante: imageUrl };

  const check = async (field, value) => {
    const snap = await db.ref("participantes").orderByChild(field).equalTo(value).once("value");
    return snap.exists();
  };

  if (await check("telefone", telefone) || await check("instagram", instagram) || await check("cpf", cpf)) {
    alert("Telefone, Instagram ou CPF já usados.");
    return;
  }

  formContainer.classList.add("hidden");
  numeroContainer.classList.remove("hidden");
  carregarNumeros(participante);
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
