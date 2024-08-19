import * as vscode from 'vscode'

import { activateFightAnimation } from './fightAnimation'
import { initializeLocalization } from './i18n'

export const activate = async (context: vscode.ExtensionContext) => {
  try {
    console.log('"VSCode Funny" is now active!')

    await initializeLocalization()

    // Add this line to activate the fight animation feature
    activateFightAnimation(context)

    // await renderWebview(context)
  } catch (err) {
    console.warn('Failed to activate extension', err)
  }
}

