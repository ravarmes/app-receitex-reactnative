const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const sizes = {
  'mdpi': 48,
  'hdpi': 72,
  'xhdpi': 96,
  'xxhdpi': 144,
  'xxxhdpi': 192
};

const iconPath = path.join(__dirname, 'assets', 'icon.png');
const androidResPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

async function generate() {
  console.log('Lendo imagem base...');
  try {
    const image = await Jimp.read(iconPath);
    
    for (const [density, size] of Object.entries(sizes)) {
      const mipmapFolder = path.join(androidResPath, `mipmap-${density}`);
      
      // Criar diretório se não existir
      if (!fs.existsSync(mipmapFolder)) {
        fs.mkdirSync(mipmapFolder, { recursive: true });
      }
      
      const launcherPath = path.join(mipmapFolder, 'ic_launcher.png');
      const launcherRoundPath = path.join(mipmapFolder, 'ic_launcher_round.png');
      
      console.log(`Gerando para ${density} (${size}x${size})...`);
      
      // Copiar a imagem reescalada
      const resized = image.clone().resize(size, size);
      
      await resized.writeAsync(launcherPath);
      await resized.writeAsync(launcherRoundPath); // Reutilizando a imagem quadrada como base "round" de emergência. O Android tratará o round nos aparelhos que suportam se tiver máscara, senão exibirá com borda arredondada ou quadrado direto.
    }
    
    console.log('Ícones criados com sucesso!');
  } catch(e) {
    console.error('Erro ao processar imagem', e);
  }
}

generate();
