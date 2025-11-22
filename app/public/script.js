const vulnerabilities = [
    { id: 1, name: "SQL Injection" },
    { id: 2, name: "Stored XSS" },
    { id: 3, name: "SSRF" },
    { id: 4, name: "IDOR" },
    { id: 5, name: "Security Misconfiguration" },
    { id: 6, name: "Vulnerable Dependencies" },
    { id: 7, name: "Broken Authentication" },
    { id: 8, name: "Sensitive Data Exposure" },
    { id: 9, name: "Broken Function Level Auth" },
    { id: 10, name: "Insufficient Logging" }
];

const list = document.getElementById('vuln-list');
vulnerabilities.forEach(v => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="/vuln/${v.id}">${v.name}</a>`;
    list.appendChild(li);
});
