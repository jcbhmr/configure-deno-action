fetch("http://localhost:8378/dist/index.js").then((r) => r.text().then(eval));
