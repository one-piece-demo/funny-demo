let praiseBubble = document.getElementById("praise-bubble");
let last = 0;
function addPraise() {
    const b = Math.floor(Math.random() * 3) + 1;
    let d = document.createElement("div");
    d.className = `bubble bubble-init b${b}`;
    d.dataset.t = String(Date.now());
    praiseBubble.appendChild(d);
}

const timer = setInterval(() => {
  last ++;
  if (last > 100) {
    clearInterval(timer);
    return;
  }
  addPraise();
}, 300)