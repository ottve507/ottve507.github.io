// --- Constants & Config ---
const BOULDER_GRADES = ["5","5+","6A","6A+","6B","6B+","6C","6C+","7A","7A+","7B","7B+","7C","7C+","8A","8A+","8B","8B+","8C","8C+","9A"];
const SPORT_GRADES   = ["5a","5b","5c","6a","6a+","6b","6b+","6c","6c+","7a","7a+","7b","7b+","7c","7c+","8a","8a+","8b","8b+","8c","8c+","9a","9a+","9b","9b+","9c"];
// URL of your deployed Google Apps Script Web App
const SHEET_API_URL  = 'https://script.google.com/macros/s/AKfycbzZFLSHIFK4Ejrp6jah6zzzWGPPzAgKGWgxgUPAdQJ6bkgNKwPFEFb92_FEs0m-vI6l/exec';  // e.g. https://script.google.com/macros/s/XXX/exec

let fingerprint;
let userRecord;

// --- Initialize Fingerprint and Data Fetch ---
FingerprintJS.load()
  .then(fp => fp.get())
  .then(result => {
    fingerprint = result.visitorId;
    fetchData();
  });

// Fetch all records from Sheets and find current user
async function fetchData() {
  const res = await fetch(`${SHEET_API_URL}?action=getAll&sheet=main_sheet`);
  const all = await res.json();         // expects [{ id, grades, weight, duration }, ...]
  userRecord = all.find(r => r.id === fingerprint);
  if (userRecord) renderData(userRecord);
  else renderForm1();
}

// --- Forms Rendering ---
function renderForm1() {
  document.getElementById('app').innerHTML = `
    <form id="form1">
      <h2>Grades</h2>
      <label>Bouldering redpoint:</label>
      <select name="boulder_red">${BOULDER_GRADES.map(g=>`<option>${g}</option>`).join('')}</select>
      <label>Lead redpoint:</label>
      <select name="lead_red">${SPORT_GRADES.map(g=>`<option>${g}</option>`).join('')}</select>
      <label>Bouldering onsight:</label>
      <select name="boulder_on">${BOULDER_GRADES.map(g=>`<option>${g}</option>`).join('')}</select>
      <label>Lead onsight:</label>
      <select name="lead_on">${SPORT_GRADES.map(g=>`<option>${g}</option>`).join('')}</select>
      <button type="submit">Next</button>
    </form>
  `;
  document.getElementById('form1').onsubmit = e => {
    e.preventDefault();
    sessionStorage.setItem('grades', JSON.stringify(Object.fromEntries(new FormData(e.target))));
    renderForm2();
  };
}

function renderForm2() {
  document.getElementById('app').innerHTML = `
    <form id="form2">
      <h2>Hangboard Weight (% added)</h2>
      <input type="number" name="weight_pct" min="0" required>
      <button type="submit">Next</button>
    </form>
  `;
  document.getElementById('form2').onsubmit = e => {
    e.preventDefault();
    sessionStorage.setItem('weight', JSON.stringify(Object.fromEntries(new FormData(e.target))));
    renderForm3();
  };
}

function renderForm3() {
  document.getElementById('app').innerHTML = `
    <form id="form3">
      <h2>Hang Duration (s)</h2>
      <input type="number" name="hang_sec" min="1" required>
      <button type="submit">Submit</button>
    </form>
  `;
  document.getElementById('form3').onsubmit = e => {
    e.preventDefault();
    sessionStorage.setItem('duration', JSON.stringify(Object.fromEntries(new FormData(e.target))));
    saveUserData();
  };
}

// --- CRUD Operations ---
async function saveUserData() {
  const record = {
    id: fingerprint,
    grades: JSON.parse(sessionStorage.getItem('grades')),
    weight: JSON.parse(sessionStorage.getItem('weight')),
    duration: JSON.parse(sessionStorage.getItem('duration'))
  };
  const action = userRecord ? 'update' : 'add';
  const res = await fetch(SHEET_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, sheet: 'main_sheet', record })
  });
  const updated = await res.json();  // expects the up-to-date record
  userRecord = updated;
  renderData(userRecord);
}

async function deleteUserData() {
  await fetch(SHEET_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', sheet: 'main_sheet', id: fingerprint })
  });
  userRecord = null;
  renderForm1();
}

// --- Display & Edit/Delete ---
function renderData(r) {
  document.getElementById('app').innerHTML = `
    <h2>Your Data</h2>
    <pre>${JSON.stringify(r, null,2)}</pre>
    <button id="edit">Edit</button>
    <button id="delete">Delete</button>
  `;
  document.getElementById('edit').onclick   = () => { userRecord = null; renderForm1(); };
  document.getElementById('delete').onclick = deleteUserData;
}
