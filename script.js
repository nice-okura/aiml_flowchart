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
});

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
  container.innerHTML = ""; // Clear previous content
  var lastNodeId = null;

  jsPlumb.ready(function () {
    var instance = jsPlumb.getInstance({
      // Basic connection style
      PaintStyle: {
        stroke: "#ff6666",
        strokeWidth: 2,                                                                       
      },
      Connector: [
        "Flowchart",
        { stub: [30, 30], gap: 10, cornerRadius: 5, alwaysRespectStubs: true },
      ],
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

      createNode(container, nodeId, pattern, template);

      if (lastNodeId) {
        jsPlumb.connect({
            source: lastNodeId,
            target: nodeId,
            anchors: ["Bottom", "Top"], // Connect from bottom of source to top of target
            connector: "Straight"
        });
    }

      lastNodeId = nodeId;
    }
    // Prevent any click events on connectors     
    instance.bind("click", function (connection, originalEvent) {
      originalEvent.preventDefault();
      // Optionally, you can add logic here if you want to do something when a connector is clicked.
    });
  });
}

function createNode(container, id, text, templateText) {
  var node = document.createElement("div");
  node.id = id;
  node.className = "flowchart-box";
  node.textContent = text.replace(/<think>.*<\/think>/g, ""); // Removes <think> tags

  // Set size based on text length
  var textSize = text.length;
  node.style.width = Math.min(Math.max(textSize * 8, 100), 300) + "px";
  node.style.height = "auto";

  // Set position to prevent overlap
  node.style.top = `${100 * (parseInt(id.split("-")[1]) + 1)}px`;
  node.style.left = "50px";

  // Mouseover events to show template text
  node.onmouseover = function () {
    this.textContent = templateText;
  };
  node.onmouseout = function () {
    this.textContent = text.replace(/<think>.*<\/think>/g, "");
  };

  container.appendChild(node);

      // Make the node draggable
      jsPlumb.draggable(node.id, {
        containment: 'parent'
    });
}
