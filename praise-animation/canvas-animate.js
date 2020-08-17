/**
 * >=min && <=max
 * @param min 
 * @param max 
 */
function getRandom(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function requestFrame(cb) {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  )(cb);
}

class Bubble {
  imgsList = [];
  renderList= [];
  context;
  width = 0;
  height = 0;
  scanning = false;
  scaleTime = 0.1; // 百分比

  constructor() {
    const canvas = document.getElementById('canvas');
    this.context = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.loadImages();
  }

  loadImages() {
    const images = [
      './imgs/bg1.png',
      './imgs/bg2.png',
      './imgs/bg3.png',
      './imgs/bg4.png',
      './imgs/bg5.png',
      './imgs/bg6.png',
    ];
    const promiseAll = [];

    images.forEach((src) => {
      const p = new Promise((resolve) => {
        const img = new Image;
        img.onerror = img.onload = resolve.bind(null, img);
        img.src = src;
      });
      promiseAll.push(p);
    });

    Promise.all(promiseAll).then(imgsList => {
      this.imgsList = imgsList.filter(d => {
        if (d && d.width > 0) return true;
        return false;
      })
      if (this.imgsList.length === 0) {
        console.error('imgsList load all error');
        return;
      }
    })
  }

  createRender() {
    if (!this.imgsList.length) return;

    const context = this.context;
    // 随机读取一个图片来渲染
    const image = this.imgsList[getRandom(0, this.imgsList.length - 1)];
    const basicScale = [0.6, 0.9, 1.2][getRandom(0, 2)];
    const offset = 20;
    const basicX = this.width / 3 + getRandom(-offset, offset);
    const angle = getRandom(2, 10);
    const fadeOutStage = getRandom(14, 18) / 100;
    const ratio = getRandom(10, 30)*((getRandom(0, 1) ? 1 : -1));

    // 正弦曲线 Math.sin  X轴方向偏移
    const getTranslateX = (diffTime) => {
      if (diffTime < this.scaleTime) {// 放大期间，不进行摇摆位移
          return basicX;
      } else {
          return basicX + ratio*Math.sin(angle*(diffTime - this.scaleTime));
      }
    };

    const getScale = (diffTime) => {
      if (diffTime < this.scaleTime) {
          return +((diffTime/ this.scaleTime).toFixed(2)) * basicScale;
      } else {
          return basicScale;
      }
    };

    const getTranslateY = (diffTime) => {
      return image.height / 2 + (this.height - image.height / 2) * (1-diffTime);
    };

    const getAlpha = (diffTime) => {
      let left = 1 - +diffTime;
      if (left > fadeOutStage) {
          return 1;
      } else {
          return 1 - +((fadeOutStage - left) / fadeOutStage).toFixed(2);
      }
    };

    // 一个canvas只有一个2d上下文，save()和restore()的使用场景也很广泛,例如 "变换"状态的用途
    return (diffTime) => {
       // 差值满了，即结束了 0 ---》 1
       if(diffTime>=1) return true;
       context.save();
       const scale = getScale(diffTime);
       // const rotate = getRotate();
       const translateX = getTranslateX(diffTime);
       const translateY = getTranslateY(diffTime);
       context.translate(translateX, translateY);
       console.log(scale);
       context.scale(scale, scale);
       // context.rotate(rotate * Math.PI / 180);
       context.globalAlpha = getAlpha(diffTime); // 透明度
       context.drawImage(
          image,
          -15,
          -15,
          30,
          30
       );
       context.restore();
    }
  }

  scan() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.fillRect(0, 0, 200, 400);

    let index = 0;
    let len = this.renderList.length;

    if (len > 0) {
      requestFrame(this.scan.bind(this));
      this.scanning = true;
    } else {
        this.scanning = false;
    }

    while (index < len) {
      const child = this.renderList[index];
      // 传入动画运行时间占比
      if (!child || !child.render || child.render.call(null, (Date.now() - child.timestamp) / child.duration)) {
        // 结束了，删除该动画
        this.renderList.splice(index, 1);
        len--;
      } else {
        // continue
        index++;
      }
    }
  }

  start() {
    const render = this.createRender();
    const duration = getRandom(1500, 3000);
    this.renderList.push({
      render,
      duration,
      timestamp: Date.now()
    });

    if (!this.scanning) {
      this.scanning = true;
      requestFrame(this.scan.bind(this));
    }
  }
}