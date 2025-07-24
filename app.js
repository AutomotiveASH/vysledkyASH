
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyChH10c46K7zv9Ol2mvGmnJsVunYJ0U0HY",
  authDomain: "costsheet-7dce8.firebaseapp.com",
  databaseURL: "https://costsheet-7dce8-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "costsheet-7dce8",
  storageBucket: "costsheet-7dce8.firebasestorage.app",
  messagingSenderId: "234554011525",
  appId: "1:234554011525:web:1470e1cf81f7c393aa1eec"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const loginSection = document.getElementById("login-section");
const mainSection = document.getElementById("main-section");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");

const warehouseSelect = document.getElementById("warehouse");
const monthInput = document.getElementById("month");
const revenueInput = document.getElementById("revenue");
const fixedInput = document.getElementById("fixed");
const variableInput = document.getElementById("variable");
const otherInput = document.getElementById("other");
const saveBtn = document.getElementById("save");
const monthlyResult = document.getElementById("monthly-result");
const yearlyResult = document.getElementById("yearly-result");

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.style.display = "none";
    mainSection.style.display = "block";
  } else {
    loginSection.style.display = "block";
    mainSection.style.display = "none";
  }
});

loginBtn.onclick = async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      alert("Chyba přihlášení: " + err.message);
    }
  }
};

logoutBtn.onclick = () => signOut(auth);

saveBtn.onclick = async () => {
  const warehouse = warehouseSelect.value;
  const month = monthInput.value;
  const revenue = parseFloat(revenueInput.value) || 0;
  const fixed = parseFloat(fixedInput.value) || 0;
  const variable = parseFloat(variableInput.value) || 0;
  const other = parseFloat(otherInput.value) || 0;
  const total = revenue - fixed - variable - other;

  await set(ref(db, `costs/${warehouse}/${month}`), {
    revenue, fixed, variable, other, total
  });

  monthlyResult.textContent = `Výsledek za měsíc: ${total} Kč`;
  monthlyResult.className = total >= 0 ? "positive" : "negative";

  const year = month.split("-")[0];
  const snapshot = await get(child(ref(db), `costs/${warehouse}`));
  let yearSum = 0;
  if (snapshot.exists()) {
    Object.entries(snapshot.val()).forEach(([m, data]) => {
      if (m.startsWith(year)) yearSum += data.total || 0;
    });
  }
  yearlyResult.textContent = `Součet za rok: ${yearSum} Kč`;
};
