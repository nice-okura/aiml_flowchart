const dropArea = document.getElementById("drop_area");

dropArea.addEventListener("dragover", function (e) {
  e.preventDefault();
  this.classList.add("dragover");
});

dropArea.addEventListener("dragleave", function (e) {
  this.classList.remove("dragover");
});

dropArea.addEventListener("drop", function (e) {
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

function encodeToUtf8(plantUmlCode) {
  const encoder = new TextEncoder();
  const utf8Encoded = encoder.encode(plantUmlCode);
  return utf8Encoded;
}

function stringUtf8ToHex(str) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  let hexString = "";
  encoded.forEach((byte) => {
    hexString += byte.toString(16).padStart(2, "0");
  });
  return hexString;
}

function convertAimlToPlantUml(aimlContent) {
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(aimlContent, "text/xml");

  var plantUml = "@startuml\n";
  plantUml += "title sample AIML flowchart\n";
  plantUml += "start\n";
  plantUml += "switch (発話内容)\n";

  // 条件を処理するための関数
  function processCondition(condition, depth) {
    var conditionOutput = "";
    var conditionName = condition.getAttribute("name");
    var indent = "  ".repeat(depth);

    conditionOutput += `${indent}switch (${conditionName})\n`;

    // 直下のliタグのみを処理する
    var lis = Array.from(condition.children).filter(
      (child) => child.tagName === "li"
    );
    for (var j = 0; j < lis.length; j++) {
      var value = lis[j].getAttribute("value") || "その他";
      var liText = "";
      
      lisChilenodes = lis[j].childNodes;
      Array.from(lisChilenodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          liText = node.nodeValue.trim();
        }
      });
      conditionOutput += `${indent}case (${value})\n`;
      if (liText != "") {
        conditionOutput += `${indent}  :${liText};\n`;
      }

      // ネストされたconditionタグをチェック
      var nestedCondition = lis[j].getElementsByTagName("condition")[0];
      if (nestedCondition) {
        conditionOutput += processCondition(nestedCondition, depth + 1); // 再帰呼び出し
      } //else if (liText) {
      //   conditionOutput += `${indent}  :${liText};\n`;
      // }




    }

    conditionOutput += `${indent}endswitch\n`;
    return conditionOutput;
  }

  var categories = xmlDoc.getElementsByTagName("category");
  for (var i = 0; i < categories.length; i++) {
    var patterns = categories[i].getElementsByTagName("pattern");
    var template = categories[i].getElementsByTagName("template")[0];

    let patternsText = [];
    for (var j = 0; j < patterns.length; j++) {
      patternsText.push(patterns[j].textContent);
    }
    plantUml += `case (${patternsText.join(" or ")})\n`;

    var condition = template.getElementsByTagName("condition")[0];
    if (condition) {
      plantUml += processCondition(condition, 1);
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

function download(filename, text) {
  // Blobオブジェクトを作成し、内容にテキストデータをセットする
  var blob = new Blob([text], { type: "text/plain" });

  // Blobオブジェクトを指すURLを作成する
  var url = window.URL.createObjectURL(blob);

  // a要素を作成する
  var downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = filename;

  // a要素をクリックしてダウンロードを実行する
  document.body.appendChild(downloadLink);
  downloadLink.click();

  // ダウンロード後は不要になったURLと要素をクリーンアップする
  document.body.removeChild(downloadLink);
  window.URL.revokeObjectURL(url);
}

function displayPlantUml(plantUmlCode) {
  // Deflate関数を使う場合
  // const encoded = encode64(deflate(plantUmlCode, 9));
  // const diagramUrl = `http://localhost:8080/plantuml/png/${encoded}`;

  // hexを使う場合
  // const encoded = stringUtf8ToHex(plantUmlCode);
  // const diagramUrl = `http://localhost:8080/plantuml/png/~h${encoded}`;
  // console.log(diagramUrl);
  // document.getElementById("umlImage").src = diagramUrl;

  // 外部ファイルに保存する場合
  download("flowchart.pu", plantUmlCode);
}
