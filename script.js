document.getElementById("drop_area").addEventListener("dragover", function (e) {
  e.preventDefault();
});

document.getElementById("drop_area").addEventListener("drop", function (e) {
  e.preventDefault();
  var files = e.dataTransfer.files;
  if (files.length > 0) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var aimlContent = e.target.result;
      var plantUmlCode = convertAimlToPlantUml(aimlContent);
      displayPlantUml(plantUmlCode);
      console.log(plantUmlCode);
    };
    reader.readAsText(files[0]);
  }
});

function encode64(data) {
  r = "";
  for (i = 0; i < data.length; i += 3) {
    if (i + 2 == data.length) {
      r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0);
    } else if (i + 1 == data.length) {
      r += append3bytes(data.charCodeAt(i), 0, 0);
    } else {
      r += append3bytes(
        data.charCodeAt(i),
        data.charCodeAt(i + 1),
        data.charCodeAt(i + 2)
      );
    }
  }
  return r;
}

function append3bytes(b1, b2, b3) {
  c1 = b1 >> 2;
  c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
  c4 = b3 & 0x3f;
  r = "";
  r += encode6bit(c1 & 0x3f);
  r += encode6bit(c2 & 0x3f);
  r += encode6bit(c3 & 0x3f);
  r += encode6bit(c4 & 0x3f);
  return r;
}

function encode6bit(b) {
  if (b < 10) {
    return String.fromCharCode(48 + b);
  }
  b -= 10;
  if (b < 26) {
    return String.fromCharCode(65 + b);
  }
  b -= 26;
  if (b < 26) {
    return String.fromCharCode(97 + b);
  }
  b -= 26;
  if (b == 0) {
    return "-";
  }
  if (b == 1) {
    return "_";
  }
  return "?";
}

function convertAimlToPlantUml(aimlContent) {
  // XMLパーサーを初期化
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(aimlContent, "text/xml");

  var plantUml = "@startuml flowchart\n";
  plantUml += "title sample AIML flowchart\n";
  plantUml += "start\n";
  plantUml += "switch (発話内容)\n";

  // 各categoryタグを解析
  var categories = xmlDoc.getElementsByTagName("category");
  for (var i = 0; i < categories.length; i++) {
    var pattern = categories[i].getElementsByTagName("pattern")[0].textContent;
    var template = categories[i].getElementsByTagName("template")[0];

    // 条件分岐のケースを追加
    if (pattern === "*") {
      plantUml += "case (*)\n";
    } else if (pattern === "#YES") {
      // 特殊なケースの処理
      plantUml += "case (#YES)\n";
    } else {
      plantUml += `case (${pattern})\n`;
    }

    // template内のテキストまたはconditionを解析
    if (template.getElementsByTagName("condition").length > 0) {
      var condition = template.getElementsByTagName("condition")[0];
      var conditionName = condition.getAttribute("name");
      plantUml += `  switch (${conditionName})\n`;
      var lis = condition.getElementsByTagName("li");
      for (var j = 0; j < lis.length; j++) {
        var value = lis[j].getAttribute("value") || "その他";
        var liText = Array.from(lis[j].childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.nodeValue.trim())
          .join("");
        plantUml += `  case (${value})\n    :${liText};\n`;
      }
      plantUml += "  endswitch\n";
    } else {
      // 単純なテンプレートのテキスト
      var textContent = template.textContent.trim();
      plantUml += `  :${textContent};\n`;
    }
  }

  plantUml += "endswitch\n";
  plantUml += "stop\n";
  plantUml += "@enduml";

  return plantUml;
}
function encodeToUtf8(plantUmlCode) {
  const encoder = new TextEncoder();
  const utf8Encoded = encoder.encode(plantUmlCode);
  return utf8Encoded;
}
function displayPlantUml(plantUmlCode) {
  // const s = encodeToUtf8(plantUmlCode);
  const encoded = encode64(deflate(plantUmlCode, 9));
  const diagramUrl = `http://localhost:8080/plantuml/png/${encoded}`;
  document.getElementById("umlImage").src = diagramUrl;
}
