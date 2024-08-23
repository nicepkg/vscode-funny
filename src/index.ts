import * as vscode from 'vscode'

import { activateFunnyBrowser } from './explorerWebview'
import { activateFightAnimation } from './fightAnimation'
import { initializeLocalization } from './i18n'

export const activate = async (context: vscode.ExtensionContext) => {
  try {
    console.log('"VSCode Funny" is now active!')

    await initializeLocalization()

    await activateFightAnimation(context)

    // Activate the Funny Browser WebView
    activateFunnyBrowser(context)
  } catch (err) {
    console.warn('Failed to activate extension', err)
  }
}
