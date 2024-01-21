document.addEventListener("DOMContentLoaded", function () {
  loadXAIMLFile("sample.aiml");
});

function loadXAIMLFile(filePath) {
  fetch(filePath)
    .then((response) => response.text())
    .then((data) => {
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(data, "text/xml");
      createFlowchartFromXAIML(xmlDoc);
    })
    .catch((error) => console.error("Error loading xAIML file:", error));
}

function createFlowchartFromXAIML(xmlDoc) {
  var instance = jsPlumb.getInstance({
    // jsPlumb configuration
  });

  var container = document.getElementById("flowchart-container");
  createNode(container, "start", "Start", 50, 50);

  var categories = xmlDoc.getElementsByTagName("category");
  Array.from(categories).forEach((category, index) => {
    var patternText = category.getElementsByTagName("pattern")[0].textContent;
    var template = category.getElementsByTagName("template")[0];
    var templateText = template.textContent;
    var nodeId = "node-" + index;

    var topPosition = 150 + index * 100;
    var node = createNode(container, nodeId, templateText, topPosition, 100);

    instance.connect({
      source: index === 0 ? "start" : "node-" + (index - 1),
      target: nodeId,
      overlays: [
        [
          "Label",
          { label: patternText, location: 0.5, cssClass: "connector-label" },
        ],
      ],
    });

    var conditions = template.getElementsByTagName("condition");
    if (conditions.length > 0) {
      // Handle conditions logic here
    }
  });

  jsPlumb.repaintEverything();
}

function createNode(container, id, text, top, left) {
  var node = document.createElement("div");
  node.id = id;
  node.className = "flowchart-box";
  node.style.top = top + "px";
  node.style.left = left + "px";
  node.innerHTML = text;
  container.appendChild(node);
  // ドラッグ可能に設定し、ドラッグイベントをハンドリング
  jsPlumb.draggable(node.id, { containment: "parent" });

}
