import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

let animationDecoration: vscode.TextEditorDecorationType | undefined
let currentFrame = 1
const TOTAL_FRAMES = 100
let isAnimating = false
let inactivityTimer: NodeJS.Timeout | undefined
let comboCount = 0

// 预加载所有图片
const frameCache: { [key: number]: string } = {}

export async function activateFightAnimation(context: vscode.ExtensionContext) {
  const enableFightAnimation = vscode.workspace
    .getConfiguration('vscode-funny')
    .get('enableFightAnimation') as boolean

  if (!enableFightAnimation) return

  // 预加载图片
  await preloadFrames(context.extensionPath)

  vscode.workspace.onDidChangeTextDocument(event => {
    if (event.contentChanges.length > 0) {
      updateAnimation(event.document.uri)
      resetInactivityTimer()
      incrementComboCount()
    }
  })
}

async function preloadFrames(extensionPath: string) {
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const frameUrl = getFrameUrl(i, extensionPath)
    frameCache[i] = frameUrl
  }
}

function updateAnimation(uri: vscode.Uri) {
  const editor = vscode.window.activeTextEditor
  if (!editor || editor.document.uri !== uri) return

  isAnimating = true
  showNextFrame(editor)
}

async function showNextFrame(editor: vscode.TextEditor) {
  if (!isAnimating) return

  const animationSize = vscode.workspace
    .getConfiguration('vscode-funny')
    .get('fightAnimationSize') as number

  const frameUrl = frameCache[currentFrame]

  if (frameUrl) {
    if (animationDecoration) {
      animationDecoration.dispose()
    }

    const baseCss = `
      position: absolute; /* Changed from absolute to fixed */
      left: -0.5rem;
      top: 2rem;
      z-index: 1;
      pointer-events: none;
      border-radius: 0.5rem;
      filter: contrast(1.2) brightness(1.5);
  `
    animationDecoration = vscode.window.createTextEditorDecorationType({
      after: {
        contentText: comboCount > 0 ? `${comboCount}x` : '',
        margin: '0 0 0 1em',
        width: `${animationSize}px`,
        height: `${animationSize / 2}px`,
        textDecoration: `
        none;
        ${baseCss}
        font-size: 1rem;
        font-weight: bold;
        padding: 0.5rem;
        color: white;
        display: inline-block;
        background-image: url(${frameUrl});
        background-size: 100% 100%, cover;
        background-position: center, bottom;
        background-repeat: no-repeat;
      `
      },
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
    })

    const lastLine = editor.document.lineAt(editor.document.lineCount - 1)
    const range = new vscode.Range(lastLine.range.end, lastLine.range.end)

    editor.setDecorations(animationDecoration, [{ range }])

    currentFrame = ((currentFrame + 2) % TOTAL_FRAMES) + 1
  }
}

function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer)
  inactivityTimer = setTimeout(() => {
    stopAnimation()
    resetComboCount()
  }, 3000) // 3秒后停止动画并重置连击计数
}

function stopAnimation() {
  isAnimating = false
  if (animationDecoration) {
    animationDecoration.dispose()
    animationDecoration = undefined
  }
}

function incrementComboCount() {
  comboCount++
  showNextFrame(vscode.window.activeTextEditor!)
}

function resetComboCount() {
  comboCount = 0
  showNextFrame(vscode.window.activeTextEditor!)
}

function getFrameUrl(frameNumber: number, extensionPath: string): string {
  const paddedFrameNumber = frameNumber.toString().padStart(3, '0')
  const imagePath = path.join(
    extensionPath,
    'res',
    'frames',
    `frame${paddedFrameNumber}.png`
  )

  try {
    const imageBuffer = fs.readFileSync(imagePath)
    const base64Image = imageBuffer.toString('base64')
    return `data:image/png;base64,${base64Image}`
  } catch (error) {
    console.error(`Error reading image file: ${imagePath}`, error)
    return ''
  }
}
