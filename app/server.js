const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Vulnerability 1: SQL Injection
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // VULNERABLE QUERY CONSTRUCTION (Simulated)
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  console.log("Executing Query: " + query);

  // Simulation of SQLi logic for demo purposes
  // In a real app, this would be a real DB query that gets tricked
  if (username.includes("' OR '1'='1") || username.includes("' OR 1=1")) {
      res.json({ success: true, message: "Login Successful! (Bypassed via SQLi)", user: { id: 1, username: 'admin' } });
  } else if (username === 'admin' && password === 'password123') {
      res.json({ success: true, message: "Login Successful!", user: { id: 1, username: 'admin' } });
  } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Vulnerability 2: Stored XSS
let comments = []; // In-memory storage

app.post('/api/comments', (req, res) => {
    const { comment } = req.body;
    // VULNERABLE: No sanitization
    comments.push(comment);
    res.json({ success: true, message: "Comment posted!" });
});

app.get('/api/comments', (req, res) => {
    res.json(comments);
});

// Vulnerability 3 & 5: Config
app.get('/api/config', (req, res) => {
    res.json({
        ssrfFunctionUrl: process.env.SSRF_FUNCTION_URL || '',
        vulnerableBucketUrl: process.env.VULNERABLE_BUCKET_URL || ''
    });
});

// Vulnerability 4: IDOR
const users = [
    { id: 1, username: 'admin', email: 'admin@example.com', secret: 'Admin Secret' },
    { id: 2, username: 'alice', email: 'alice@example.com', secret: 'Alice Secret' },
    { id: 3, username: 'bob', email: 'bob@example.com', secret: 'Bob Secret' }
];

app.get('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

// Vuln 6: Vulnerable Dependency
const serialize = require('serialize-javascript');
app.get('/api/serialize', (req, res) => {
    // Demonstrating usage of vulnerable library
    const data = { foo: "bar", xss: "</script><script>alert('Deserialization XSS')</script>" };
    const serialized = serialize(data); 
    res.send(serialized);
});

// Vuln 7: Broken Authentication (Weak Password & No Rate Limit)
app.post('/api/login-weak', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '123456') {
        res.json({ success: true, message: "Admin access granted!" });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Vuln 9: Broken Function Level Auth
app.delete('/api/admin/user/:id', (req, res) => {
    // VULNERABLE: No check if user is admin
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users.splice(index, 1);
        res.json({ success: true, message: `User ${id} deleted!` });
    } else {
        res.status(404).json({ success: false, message: "User not found" });
    }
});

// Vuln 10: Insufficient Logging
app.post('/api/sensitive-action', (req, res) => {
    // VULNERABLE: Critical action performed without logging
    // In a real app, we should log: who, what, when, source IP, etc.
    res.json({ success: true, message: "Critical action performed. No logs generated." });
});

app.get('/vuln/:id', (req, res) => {
    const id = req.params.id;
    if (id === '1') {
        res.sendFile(path.join(__dirname, 'public', 'sqli.html'));
    } else if (id === '2') {
        res.sendFile(path.join(__dirname, 'public', 'xss.html'));
    } else if (id === '3') {
        res.sendFile(path.join(__dirname, 'public', 'ssrf.html'));
    } else if (id === '4') {
        res.sendFile(path.join(__dirname, 'public', 'idor.html'));
    } else if (id === '5') {
        res.sendFile(path.join(__dirname, 'public', 'misconfig.html'));
    } else if (id === '6') {
        res.sendFile(path.join(__dirname, 'public', 'dependencies.html'));
    } else if (id === '7') {
        res.sendFile(path.join(__dirname, 'public', 'broken-auth.html'));
    } else if (id === '8') {
        res.sendFile(path.join(__dirname, 'public', 'sensitive.html'));
    } else if (id === '9') {
        res.sendFile(path.join(__dirname, 'public', 'broken-function-auth.html'));
    } else if (id === '10') {
        res.sendFile(path.join(__dirname, 'public', 'logging.html'));
    } else {
        res.send(`Vulnerability ${id} not implemented yet.`);
    }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
