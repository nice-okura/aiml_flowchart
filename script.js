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
  createStartNode();
}

function createStartNode() {
  var container = document.getElementById("flowchart-container");
  var startNode = createNode(container, "start-node", "Start", "");
  startNode.style.top = "50px";
  startNode.style.left = "50px";
}

function createFlowchartFromXAIML(xmlDoc) {
  var lastNodeId = "start-node";
  var container = document.getElementById("flowchart-container");

  jsPlumb.ready(function () {
    // var instance = jsPlumb.getInstance({
    //   // Basic connection style
    //   PaintStyle: {
    //     stroke: "#ff6666",
    //     strokeWidth: 2,
    //   },
    //   // Connector: [
    //   //   "Flowchart",
    //   //   { stub: [30, 30], gap: 10, alwaysRespectStubs: true },
    //   // ],
    //   Endpoint: ["Blank"],
    //   // Ensuring connectors are not detachable
    //   ConnectionsDetachable: false
    //   // ... other jsPlumb settings ...
    // });

    createStartNode();
    var categories = xmlDoc.getElementsByTagName("category");
    for (var i = 0; i < categories.length; i++) {
      var pattern =
        categories[i].getElementsByTagName("pattern")[0].textContent;
      var template = categories[i].getElementsByTagName("template");

      Array.from(template).forEach((tmpl, tmpl_i) => {
        var condition = tmpl.getElementsByTagName("condition");
        Array.from(condition).forEach((cond, cond_i) => {
          attr = cond.attributes[0];
          console.log(attr.name + "=" + attr.value);

          var li = cond.getElementsByTagName("li");
          Array.from(li).forEach((l, l_i) => {
            var nodeId = tmpl_i + "_" + cond_i + "_" + l_i;
            var node = createNode(container, nodeId, l.textContent);
            node.style.top = `${100 * (i + 2)}px`;
            node.style.left = "50px";
            var connection = jsPlumb.connect({
              source: lastNodeId
            })
            lastNodeId = nodeId;
          });
        });
      });

      // var nodeId = "node-" + i;



      // if (lastNodeId) {
      //   var connection = jsPlumb.connect({
      //     source: lastNodeId,
      //     target: nodeId,
      //     anchors: ["AutoDefault", "AutoDefault"],
      //     connector: "Straight",
      //     endpoints: ["Blank", "Blank"],
      //     overlays: [["Label", { label: pattern, location: 0.5 }]],
      //   });
      //   var connection = jsPlumb.connect({
      //     source: lastNodeId,
      //     target: "start-node",
      //     anchors: ["Bottom", "AutoDefault"],
      //     connector: "Bezier",
      //     endpoints: ["Blank", "Blank"],
      //     overlays: [["Label", { label: pattern, location: 0.5 }]],
      //   });
      // }

    }
    // jsPlumbにボックスとコネクターの再描画を行わせる
    jsPlumb.repaintEverything();
  });
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

  return node;
}
