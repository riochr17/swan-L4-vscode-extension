const vscode = require('vscode');

function activate(context) {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('swan');
  context.subscriptions.push(diagnosticCollection);

  // Run diagnostics on active editor or events
  if (vscode.window.activeTextEditor) {
    updateDiagnostics(vscode.window.activeTextEditor.document, diagnosticCollection);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) {
        updateDiagnostics(editor.document, diagnosticCollection);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      updateDiagnostics(event.document, diagnosticCollection);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument(doc => {
      diagnosticCollection.delete(doc.uri);
    })
  );
}

function updateDiagnostics(document, collection) {
  if (document.languageId !== 'swan') {
    return;
  }

  const diagnostics = [];
  const text = document.getText();
  const lines = text.split(/\r?\n/);
  const defined = new Set();
  let inMultilineString = false;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    
    // Strip comments
    const cleanLine = line.replace(/\/\/.*$/, "");
    
    if (inMultilineString) {
      const closeIndex = cleanLine.indexOf('```');
      let textToScan = cleanLine;
      if (closeIndex !== -1) {
        textToScan = cleanLine.substring(0, closeIndex);
        inMultilineString = false;
      }
      
      scanForReferences(textToScan, lineIndex, 0, defined, diagnostics);
      
      if (closeIndex !== -1) {
        const postText = cleanLine.substring(closeIndex + 3);
        processNormalLine(postText, lineIndex, closeIndex + 3, defined, diagnostics);
      }
      continue;
    }

    const openIndex = cleanLine.indexOf('```');
    if (openIndex !== -1) {
      const preText = cleanLine.substring(0, openIndex);
      processNormalLine(preText, lineIndex, 0, defined, diagnostics);
      
      inMultilineString = true;
      const closeIndex = cleanLine.indexOf('```', openIndex + 3);
      if (closeIndex !== -1) {
        const insideText = cleanLine.substring(openIndex + 3, closeIndex);
        scanForReferences(insideText, lineIndex, openIndex + 3, defined, diagnostics);
        inMultilineString = false;
        
        const postText = cleanLine.substring(closeIndex + 3);
        processNormalLine(postText, lineIndex, closeIndex + 3, defined, diagnostics);
      } else {
        const insideText = cleanLine.substring(openIndex + 3);
        scanForReferences(insideText, lineIndex, openIndex + 3, defined, diagnostics);
      }
      continue;
    }

    processNormalLine(cleanLine, lineIndex, 0, defined, diagnostics);
  }

  collection.set(document.uri, diagnostics);
}

function processNormalLine(cleanLine, lineIndex, startCharOffset, defined, diagnostics) {
  // Check if line defines a variable (e.g. $var SAY ...)
  const defMatch = cleanLine.match(/^\s*(?:\[[^\]]+\]\s*)?\$([a-zA-Z_][a-zA-Z0-9_]*)/);
  let scanText = cleanLine;
  let scanOffset = startCharOffset;

  if (defMatch) {
    const defLength = defMatch[0].length;
    scanText = cleanLine.substring(defLength);
    scanOffset += defLength;
  }

  // Scan the rest of the line for references
  scanForReferences(scanText, lineIndex, scanOffset, defined, diagnostics);

  // Add definition to defined set after scanning references on the same line
  if (defMatch) {
    defined.add(defMatch[1]);
  }
}

function scanForReferences(text, lineIndex, charOffset, defined, diagnostics) {
  // Look for variables of type {$var} or $var
  const regex = /\{?\$([a-zA-Z_][a-zA-Z0-9_]*)\}?/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const varName = match[1];
    if (!defined.has(varName)) {
      const matchIndex = match.index + charOffset;
      const range = new vscode.Range(
        new vscode.Position(lineIndex, matchIndex),
        new vscode.Position(lineIndex, matchIndex + match[0].length)
      );
      const diagnostic = new vscode.Diagnostic(
        range,
        `Variable '$${varName}' must be initialized before it is referenced.`,
        vscode.DiagnosticSeverity.Error
      );
      diagnostics.push(diagnostic);
    }
  }
}

module.exports = {
  activate
};
