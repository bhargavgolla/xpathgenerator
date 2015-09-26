var xmlTextArea = document.getElementById('xmltextarea');
var xmlPathArea = document.getElementById('xpath');

function getXpath(xmlText, tagData) {
  var parser = sax.parser(true);
  var path = [];

  parser.onclosetag = function(tag) {
    if (parser.position > tagData.nodeEnd + 1) {
      return;
    }

    if (tag == path[path.length - 1]) {
      path.pop();
    }
  };

  parser.onopentag = function(tag) {
    if (parser.position > tagData.nodeEnd + 1) {
      return;
    }

    path.push(tag.name);
  };

  parser.write(xmlText).end();
  return path;
}

function getTextAtCursor(completeText, selStart) {
  var textLen = completeText.length;
  var nodeStart = nodeEnd = selStart;
  var isNode = true;
  var ret = {};

  --nodeStart;

  while (nodeStart >= 0) {
    if (completeText[nodeStart] == '<') {
      ++nodeStart;
      break;
    } else if (completeText[nodeStart] == '>') {
      ++nodeStart;
      isNode = false;
      break;
    }

    --nodeStart;
  }

  if (nodeStart < 0) {
    ++nodeStart;
  }

  while (nodeEnd < textLen) {
    if (completeText[nodeEnd] == '<' || completeText[nodeEnd] == '>') {
      break;
    }

    ++nodeEnd;
  }

  if (isNode && completeText[nodeStart] == '/') {
    ++nodeStart;
  }

  if (!isNode) {
    // We are given text, so we can return the nodeBeginning before
    ret = getTextAtCursor(completeText, nodeStart - 2);
    ret.isNode = isNode;
  } else {
    ret.nodeStart = nodeStart;
    ret.nodeEnd = nodeEnd;
    ret.isNode = isNode;
  }

  return ret;
}

xmlTextArea.addEventListener('click', function() {
  if (this.value.length == 0) {
    return;
  }

  var selectedNodeData = getTextAtCursor(this.value, this.selectionStart);
  var path = getXpath(this.value, selectedNodeData);

  if (path.length == 0) {
    xmlPathArea.innerText = 'Invalid Location';
    return;
  }

  path = '/' + path.join('/');

  if (!selectedNodeData.isNode) {
    path += '/text()';
  }

  xmlPathArea.innerText = path;
});
