/* eslint-disable unused-imports/no-unused-vars */
import * as vscode from 'vscode'

export function activateFunnyBrowser(context: vscode.ExtensionContext) {
  const provider = new FunnyBrowserProvider(context)

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('funnyBrowserWebview', provider)
  )
}

class FunnyBrowserProvider implements vscode.WebviewViewProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    }

    webviewView.webview.html = this.getWebviewContent(webviewView.webview)

    webviewView.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'log':
            console.log(message.text)
            break
          default:
            break
        }
      },
      undefined,
      this.context.subscriptions
    )
  }

  private getWebviewContent(webview: vscode.Webview): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Browser</title>
          <style>
              body, html {
                  margin: 0;
                  padding: 0;
                  height: 100vh;
                  display: flex;
                  flex-direction: column;
                  background-color: var(--vscode-editor-background);
                  color: var(--vscode-editor-foreground);
                  font-size: 12px;
              }
              #controls {
                  display: flex;
                  padding: 5px;
                  background-color: var(--vscode-editor-background);
              }
              #urlBar {
                  flex-grow: 1;
                  margin: 0 5px;
                  padding: 2px;
                  background-color: var(--vscode-input-background);
                  color: var(--vscode-input-foreground);
                  border: 1px solid var(--vscode-input-border);
              }
              button {
                  padding: 2px 5px;
                  background-color: var(--vscode-button-background);
                  color: var(--vscode-button-foreground);
                  border: none;
                  cursor: pointer;
              }
              button:hover {
                  background-color: var(--vscode-button-hoverBackground);
              }
              iframe {
                  flex-grow: 1;
                  border: none;
              }
          </style>
      </head>
      <body>
          <div id="controls">
              <button id="backBtn">←</button>
              <button id="forwardBtn">→</button>
              <button id="refreshBtn">↻</button>
              <input type="text" id="urlBar" value="https://www.bilibili.com">
              <button id="goBtn">Go</button>
          </div>
          <iframe
            id="content"
            src="https://www.bilibili.com"
            frameborder="0"
            allowfullscreen
            allow="accelerometer; autoplay; camera; clipboard-write; encrypted-media; fullscreen; geolocation; gyroscope; microphone; midi; payment; picture-in-picture; usb; vr; xr-spatial-tracking"
            sandbox="allow-downloads allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation allow-top-navigation-by-user-activation"
          ></iframe>
          <script>
              const vscode = acquireVsCodeApi();
              const urlBar = document.getElementById('urlBar');
              const content = document.getElementById('content');
              const backBtn = document.getElementById('backBtn');
              const forwardBtn = document.getElementById('forwardBtn');
              const refreshBtn = document.getElementById('refreshBtn');
              const goBtn = document.getElementById('goBtn');

              function navigate() {
                  let url = urlBar.value;
                  if (!url.startsWith('http://') && !url.startsWith('https://')) {
                      url = 'https://' + url;
                  }
                  content.src = url;
                  vscode.postMessage({ command: 'log', text: 'Navigating to: ' + url });
              }

              goBtn.addEventListener('click', navigate);
              urlBar.addEventListener('keypress', (e) => {
                  if (e.key === 'Enter') {
                      navigate();
                  }
              });

              backBtn.addEventListener('click', () => {
                  content.contentWindow.history.back();
                  vscode.postMessage({ command: 'log', text: 'Going back' });
              });

              forwardBtn.addEventListener('click', () => {
                  content.contentWindow.history.forward();
                  vscode.postMessage({ command: 'log', text: 'Going forward' });
              });

              refreshBtn.addEventListener('click', () => {
                  content.contentWindow.location.reload();
                  vscode.postMessage({ command: 'log', text: 'Refreshing page' });
              });

              content.addEventListener('load', () => {
                  try {
                      urlBar.value = content.contentWindow.location.href;
                      vscode.postMessage({ command: 'log', text: 'Loaded: ' + content.contentWindow.location.href });
                  } catch (e) {
                      vscode.postMessage({
                          command: 'log',
                          text: 'Unable to access page URL due to security restrictions.'
                      });
                  }
              });
          </script>
      </body>
      </html>
    `
  }
}
