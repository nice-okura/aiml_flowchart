document.addEventListener("DOMContentLoaded", function () {
  var dropZone = document.getElementById("drop-zone");
  dropZone.addEventListener("drop", function (event) {
    event.preventDefault();
    var file = event.dataTransfer.files[0];
    readAIMLFile(file);
  });

  dropZone.addEventListener("dragover", function (event) {
    event.preventDefault();
  });

  createStartNode();
});

function createStartNode() {
  var container = document.getElementById("flowchart-container");
  var startNode = createNode(container, "start-node", "Start", "");
  startNode.style.top = "50px";
  startNode.style.left = "50px";
}

function readAIMLFile(file) {
  var reader = new FileReader();
  reader.onload = function (event) {
    var content = event.target.result;
    createFlowchartFromAIML(content);
  };
  reader.readAsText(file);
}

function createFlowchartFromAIML(aimlContent) {
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(aimlContent, "text/xml");
  var container = document.getElementById("flowchart-container");

  // 既存のノードのみをクリア
  Array.from(container.getElementsByClassName("flowchart-box")).forEach(
    (node) => {
      if (node.id !== "start-node") {
        container.removeChild(node);
      }
    }
  );
  var lastNodeId = "start-node";

  jsPlumb.ready(function () {
    var instance = jsPlumb.getInstance({
      // Basic connection style
      PaintStyle: {
        stroke: "#ff6666",
        strokeWidth: 2,
      },
      // Connector: [
      //   "Flowchart",
      //   { stub: [30, 30], gap: 10, alwaysRespectStubs: true },
      // ],
      // Ensuring connectors are not detachable
      ConnectionsDetachable: false,
      // ... other jsPlumb settings ...
    });

    var categories = xmlDoc.getElementsByTagName("category");
    for (var i = 0; i < categories.length; i++) {
      var pattern =
        categories[i].getElementsByTagName("pattern")[0].textContent;
      var template =
        categories[i].getElementsByTagName("template")[0].textContent;
      var nodeId = "node-" + i;

      var node = createNode(container, nodeId, template, "");
      node.style.top = `${100 * (i + 2)}px`;
      node.style.left = "50px";

      if (lastNodeId) {
        var connection = jsPlumb.connect({
          source: lastNodeId,
          target: nodeId,
          anchors: ["Bottom", "Top"],
          connector: "Straight",
          overlays: [["Label", { label: pattern, location: 0.5 }]],
        });
      }

      lastNodeId = nodeId;
    }
    // jsPlumbにボックスとコネクターの再描画を行わせる
    jsPlumb.repaintEverything();
  });
}

function createNode(container, id, text, templateText) {
  var node = document.createElement("div");
  node.id = id;
  node.className = "flowchart-box";
  node.textContent = text;

  var textSize = text.length;
  node.style.width = Math.min(Math.max(textSize * 8, 100), 300) + "px";
  node.style.height = "auto";

  container.appendChild(node);

  jsPlumb.draggable(node.id, { containment: "parent" });

  return node;
}
