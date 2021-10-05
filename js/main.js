var img, width, height;
var maxSize = { width: 1024, height: 2048 };

function setup() {
  let file = createFileInput(handleFile);
  file.parent('file');

  let maxWidth = select('#width_number');
  maxWidth.input(() => { maxSize.width = maxWidth.value(); });

  let maxHeight = select('#height_number');
  maxHeight.input(() => { maxSize.height = maxHeight.value(); });

  let canvas = createCanvas(0, 0);
  canvas.parent('canvas');
}

function draw() {
  if (!img) return;
  image(img, 0, 0);
}

function handleFile(file) {
  // 画像を読み込み
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      // ソーベルフィルタをかける
      sobelFilter(img);
      // 画像のサイズを取得
      if (img.width <= maxSize.width && img.height <= maxSize.height) {
        width = img.width;
        height = img.height;
      } else {
        // 画像をリサイズ
        if (img.width > maxSize.width) {
          width = maxSize.width;
          height = img.height * (maxSize.width / img.width);
          img.resize(width, height);
        }
        if (img.height > maxSize.height) {
          height = maxSize.height;
          width = img.width * (maxSize.height / img.height);
          img.resize(width, height);
        }
      }
      // キャンバスをリサイズ
      resizeCanvas(width, height);
    });
  }
}

// Sobel
var xKernel = [
  [1, 0, -1],
  [2, 0, -2],
  [1, 0, -1]
];
var yKernel = [
  [1, 2, 1],
  [0, 0, 0],
  [-1, -2, -1]
];

function sobelFilter(img) {
  img.loadPixels();
  var gradients = new Uint32Array(img.width * img.height);

  // compute the gradient in gradients array
  for (let x = 1; x < img.width - 1; x++) {
    for (let y = 1; y < img.height - 1; y++) {
      const i = x + y * img.width;
      let xGradient = 0;
      let yGradient = 0;
      for (let xk = -1; xk <= 1; xk++) {
        for (let yk = -1; yk <= 1; yk++) {
          let pixelValue = img.pixels[4 * ((x + xk) + (y + yk) * img.width)];
          xGradient += pixelValue * xKernel[yk + 1][xk + 1];
          yGradient += pixelValue * yKernel[yk + 1][xk + 1];
        }
      }
      gradients[i] = Math.sqrt(
        Math.pow(xGradient, 2) + Math.pow(yGradient, 2)
      );
    }
  }

  // copy gradients array to image pixels;
  for (let x = 0; x < img.width; x++) {
    for (let y = 0; y < img.height; y++) {
      const i = x + y * img.width;
      img.pixels[4 * i] = 255 - gradients[i];
      img.pixels[4 * i + 1] = 255 - gradients[i];
      img.pixels[4 * i + 2] = 255 - gradients[i];
    }
  }

  img.updatePixels();
}