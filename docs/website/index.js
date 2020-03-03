// select page elements
const outputDiv = document.getElementById("output");
const runButton = document.getElementById("runBtn");
const demoSelector = document.getElementById("demoSelector");
const copyButton = document.getElementById("copyBtn");

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
}

// output handling
console.log = console.error = function(msg) {
  const p = document.createElement("p");
  p.textContent = msg;
  p.classList += " output";
  outputDiv.appendChild(p);
};

const clearOutput = function() {
  outputDiv.innerHTML = "";
};

// load CodeFlask text editor
const editor = new CodeFlask("#editor", {
  lineNumbers: true
});

// clear excess lines in output
clearOutput();

// demo logic
const demoKeys = Object.keys(demos);
function loadDemo(name) {
  editor.updateCode(demos[name]);
}

// append all demos to selector
demoKeys.forEach(demo => {
  const option = document.createElement("option");
  option.textContent = demo.capitalize();
  option.value = demo;
  demoSelector.appendChild(option);
});

let queryCode = getQueryVariable("code");
if (queryCode !== undefined) {
  editor.updateCode(decodeURI(queryCode));
  demoSelector.value = "custom";
} else {
  loadDemo(demoKeys[0]);
}

// copy URL function
copyButton.addEventListener("click", function() {
  let url = new URL(window.location.href);
  url.searchParams.set("code", encodeURI(editor.getCode()));
  navigator.clipboard.writeText(url);
});

// run function
const runCode = function() {
  const dragon = new Dragon.Dragon();

  // get code currently in editor
  let code = editor.getCode();

  // run code
  dragon.runBlock(code);
};

// change demo event listener
demoSelector.addEventListener("change", function() {
  loadDemo(demoSelector.value);
});

runButton.addEventListener("click", function() {
  clearOutput();
  runCode();
});
