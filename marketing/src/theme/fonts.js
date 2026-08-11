/**
 * Carrega as MESMAS fontes do app (Playfair Display, Work Sans, JetBrains Mono)
 * via @remotion/google-fonts, para fidelidade total com o produto.
 *
 * `waitForFonts()` é usado no delayRender do Root para garantir que o texto
 * já está com a fonte certa no primeiro frame renderizado.
 */
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay'
import { loadFont as loadWorkSans } from '@remotion/google-fonts/WorkSans'
import { loadFont as loadJetBrains } from '@remotion/google-fonts/JetBrainsMono'

const playfair = loadPlayfair('normal', { weights: ['500', '600', '700'] })
const work = loadWorkSans('normal', { weights: ['400', '500', '600', '700'] })
const jetbrains = loadJetBrains('normal', { weights: ['400', '500', '700'] })

// Nomes reais das famílias carregadas (usar em fontFamily)
export const family = {
  serif: playfair.fontFamily, // "Playfair Display"
  sans: work.fontFamily, // "Work Sans"
  mono: jetbrains.fontFamily, // "JetBrains Mono"
}

export const waitForFonts = () =>
  Promise.all([playfair.waitUntilDone(), work.waitUntilDone(), jetbrains.waitUntilDone()])
