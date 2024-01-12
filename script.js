document.getElementById('drop-zone').addEventListener('drop', function(event) {
    event.preventDefault();
    var file = event.dataTransfer.files[0];
    readAIMLFile(file);
});

document.getElementById('drop-zone').addEventListener('dragover', function(event) {
    event.preventDefault();
});

function readAIMLFile(file) {
    var reader = new FileReader();
    reader.onload = function(event) {
        var content = event.target.result;
        // ここでAIMLファイルの内容を解析し、フローチャートを作成
    };
    reader.readAsText(file);
}

function createFlowchartFromAIML(aimlContent) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(aimlContent, "text/xml");
    var categories = xmlDoc.getElementsByTagName("category");
    var container = document.getElementById("flowchart-container");
    var lastNodeId = null;

    for (var i = 0; i < categories.length; i++) {
        var pattern = categories[i].getElementsByTagName("pattern")[0].textContent;
        var template = categories[i].getElementsByTagName("template")[0].textContent;
        var patternId = "pattern-" + i;
        var templateId = "template-" + i;

        // ノードを作成
        createNode(container, patternId, pattern);
        createNode(container, templateId, template);

        // jsPlumbを使ってノードを接続
        jsPlumb.connect({
            source: patternId,
            target: templateId,
            connector: "Straight"
        });

        if (lastNodeId) {
            jsPlumb.connect({
                source: lastNodeId,
                target: patternId,
                connector: "Straight"
            });
        }

        lastNodeId = templateId;
    }
}

function createNode(container, id, text) {
    var node = document.createElement("div");
    node.id = id;
    node.className = "flowchart-box";
    node.textContent = text;
    container.appendChild(node);
}
