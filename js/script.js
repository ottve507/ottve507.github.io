// Constants: valid grades
const BOULDER_GRADES = ["5","5+","6A","6A+","6B","6B+","6C","6C+","7A","7A+","7B","7B+","7C","7C+","8A","8A+","8B","8B+","8C","8C+","9A"];
const SPORT_GRADES   = ["5a","5b","5c","6a","6a+","6b","6b+","6c","6c+","7a","7a+","7b","7b+","7c","7c+","8a","8a+","8b","8b+","8c","8c+","9a","9a+","9b","9b+","9c"];
const REPO_OWNER = 'ottve507';    // replace with your GitHub username
const REPO_NAME  = 'ottve507.github.io';
const DATA_PATH  = 'data/users.json';
const GITHUB_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`;
const TOKEN       = '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';  // create a personal access token with repo scope

let fingerprint;
let fileSha;
let usersData = [];

// Initialize FingerprintJS and load data
FingerprintJS.load().then(fp => fp.get()).then(result => {
  fingerprint = result.visitorId;
  fetchData().then(() => initApp());
});

// Fetch existing users.json from GitHub
async function fetchData() {
  const res = await fetch(GITHUB_API);
  const json = await res.json();
  fileSha = json.sha;
  const content = atob(json.content);
  usersData = JSON.parse(content);
}

function initApp() {
  const user = usersData.find(u => u.id === fingerprint);
  if (user) renderData(user);
  else renderForm1();
}

// Form #1: Grades
function renderForm1() {
  const container = document.getElementById('app');
  container.innerHTML = `
    <form id="form1">
      <h2>Grades (Redpoint & Onsight)</h2>
      <label>Bouldering redpoint:</label>
      <select name="boulder_red">${BOULDER_GRADES.map(g=>`<option>${g}</option>`)}</select>
      <label>Lead redpoint:</label>
      <select name="lead_red">${SPORT_GRADES.map(g=>`<option>${g}</option>`)}</select>
      <label>Bouldering onsight:</label>
      <select name="boulder_on">${BOULDER_GRADES.map(g=>`<option>${g}</option>`)}</select>
      <label>Lead onsight:</label>
      <select name="lead_on">${SPORT_GRADES.map(g=>`<option>${g}</option>`)}</select>
      <button type="submit">Next</button>
    </form>
  `;
  document.getElementById('form1').onsubmit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    sessionStorage.setItem('grades', JSON.stringify(data));
    renderForm2();
  };
}

// Form #2 and #3
function renderForm2() {
  const container = document.getElementById('app');
  container.innerHTML = `
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
  const container = document.getElementById('app');
  container.innerHTML = `
    <form id="form3">
      <h2>Hang Duration (seconds)</h2>
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

// Combine and save
async function saveUserData() {
  const record = {
    id: fingerprint,
    grades: JSON.parse(sessionStorage.getItem('grades')),
    weight: JSON.parse(sessionStorage.getItem('weight')),
    duration: JSON.parse(sessionStorage.getItem('duration'))
  };
  usersData.push(record);
  const content = btoa(JSON.stringify(usersData, null, 2));
  await fetch(GITHUB_API, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Add/Update user '+fingerprint,
      content,
      sha: fileSha
    })
  });
  renderData(record);
}

// Render stored data with edit/delete
function renderData(user) {
  const container = document.getElementById('app');
  container.innerHTML = `
    <h2>Your Data</h2>
    <pre>${JSON.stringify(user, null, 2)}</pre>
    <button id="edit">Edit</button>
    <button id="delete">Delete</button>
  `;
  document.getElementById('edit').onclick = () => {
    usersData = usersData.filter(u=>u.id!==fingerprint);
    fileSha = fileSha; // reuse sha
    initApp();
  };
  document.getElementById('delete').onclick = async () => {
    usersData = usersData.filter(u=>u.id!==fingerprint);
    const content = btoa(JSON.stringify(usersData, null, 2));
    await fetch(GITHUB_API, {
      method: 'PUT', headers: {'Authorization':`token ${TOKEN}`,'Content-Type':'application/json'},
      body: JSON.stringify({ message:'Delete user '+fingerprint, content, sha: fileSha })
    });
    container.innerHTML = '<p>Data deleted. <a href="index.html">Start over</a></p>';
  };
}
