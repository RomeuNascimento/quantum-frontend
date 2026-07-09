// Redimensiona e comprime uma imagem no próprio aparelho para um data URL JPEG
// pequeno. A foto do produto é guardada no banco, então evitamos subir arquivos
// de vários MB — reduz para no máx. `maxDim` px e recomprime.

export function comprimirImagem(file, { maxDim = 900, quality = 0.72 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith('image/')) {
      reject(new Error('Escolha uma imagem (foto).'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Não consegui ler a imagem.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Imagem inválida.'))
      img.onload = () => {
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          if (width >= height) { height = Math.round(height * maxDim / width); width = maxDim }
          else { width = Math.round(width * maxDim / height); height = maxDim }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
