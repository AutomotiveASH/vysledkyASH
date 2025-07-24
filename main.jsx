
const { useState, useEffect } = React;
const { initializeApp } = firebase;
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } = firebase.auth;
const { getDatabase, ref, set, get, child } = firebase.database;
const { jsPDF } = window.jspdf;
const { autoTable } = window.jspdf;
const { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } = Recharts;

const firebaseConfig = {
  apiKey: "AIzaSyChH10c46K7zv9Ol2mvGmnJsVunYJ0U0HY",
  authDomain: "costsheet-7dce8.firebaseapp.com",
  databaseURL: "https://costsheet-7dce8-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "costsheet-7dce8",
  storageBucket: "costsheet-7dce8.appspot.com",
  messagingSenderId: "234554011525",
  appId: "1:234554011525:web:1470e1cf81f7c393aa1eec"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 💡 Sem vlož celý React kód z canvasu – CostSheetApp a další komponenty


function CostSheetApp() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2025-07");
  const [warehouse, setWarehouse] = useState("Praha");
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          alert("Účet vytvořen. Přihlášen jako nový uživatel.");
        } catch (createErr) {
          alert("Chyba při vytváření účtu: " + createErr.message);
        }
      } else {
        alert("Chyba přihlášení: " + err.message);
      }
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '400px', margin: '5rem auto', padding: '2rem', background: 'white', borderRadius: '1rem', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <h2>Přihlášení</h2>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ display: 'block', marginBottom: '1rem', width: '100%' }} />
        <input type="password" placeholder="Heslo" value={password} onChange={e => setPassword(e.target.value)} style={{ display: 'block', marginBottom: '1rem', width: '100%' }} />
        <button onClick={handleLogin}>Přihlásit / Registrovat</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1>📋 Cost Sheet Panel</h1>
        <button onClick={() => signOut(auth)}>Odhlásit se</button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setTab("dashboard")}>📊 Dashboard</button>
        <button onClick={() => setTab("vykaz")}>📄 Výkaz</button>
      </div>

      {tab === "dashboard" && <DashboardPanel />}
      {tab === "vykaz" && (
        <div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', marginBottom: '1rem' }}>
            <label>Sklad:</label>
            <select value={warehouse} onChange={e => setWarehouse(e.target.value)} style={{ marginRight: '1rem' }}>
              <option value="Praha">Praha</option>
              <option value="Plzeň">Plzeň</option>
              <option value="Phoenix">Phoenix</option>
            </select>

            <label>Měsíc:</label>
            <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
          </div>

          <CostSheetPanel warehouse={warehouse} month={selectedMonth} />
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<CostSheetApp />);
