import { Config } from '@remotion/cli/config'

/**
 * Config do Remotion (aplica só ao projeto de marketing — isolado do app).
 */
Config.setVideoImageFormat('jpeg')
Config.setEntryPoint('./src/index.js')
Config.setOverwriteOutput(true)

// As fontes (Google Fonts) são baixadas pelo Chromium. Neste ambiente o tráfego
// HTTPS passa por um proxy com CA própria que o Chromium não conhece — por isso
// ignoramos o erro de certificado. Em rede normal isso é inofensivo.
Config.setChromiumIgnoreCertificateErrors(true)

// Usa o Chromium já instalado no ambiente (evita novo download).
// Em outra máquina, comente a linha abaixo para o Remotion baixar o próprio.
if (process.env.REMOTION_CHROMIUM) {
  Config.setBrowserExecutable(process.env.REMOTION_CHROMIUM)
}
