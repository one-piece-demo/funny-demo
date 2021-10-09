/**
 * 模拟延迟
 */
function Deferred() {
  if (typeof (Promise) != 'undefined' && Promise.defer) {
    return Promise.defer();
  } else if (this && this instanceof Deferred) {
    this.resolve = null;
    this.reject = null;
    const _this = this;
    this.promise = new Promise((resolve, reject) => {
      _this.resolve = resolve;
      _this.reject = reject;
    });
    Object.freeze(this);
  } else {
    throw new Error();
  }
}

/**
 * 分步文案
 *
 * @param {*} str
 * @param {*} color
 * @returns
 */
function stepWord(str, color) {
  const step = str; // 文案
  const deferred = new Deferred();
  const len = step.length;
  let site = 0;
  const content = document.body;
  content.appendChild(document.createElement('div'));
  const child = content.children[content.children.length - 1];
  if (color) {
    child.style.color = color;
  }
  // 延迟执行
  const timer = setInterval(() => {
    child.innerHTML = step.slice(0, site + 1);
    if (site == len) {
      clearInterval(timer);
      deferred.resolve();
    } else {
      site++;
    }
  }, 100)
  return deferred.promise;
}

/**
 * 换行
 *
 * @returns
 */
function stepSpace() {
  const content = document.body;
  content.appendChild(document.createElement('br'));
  return Promise.resolve();
}

function stepDown() {
  const content = document.body;
  content.appendChild(document.createElement('hr'));
  return Promise.resolve();
}

/**
 * 倒计时，替换 dom 元素的内容，并让文字颜色逐渐加深
 *
 * @returns
 */
function stepTime() {
  const deferred = new Deferred();
  const time = document.getElementsByClassName('time')[0];
  time.style.opacity = 1;
  const number = time.children[3];
  const list = ['二', '三', '四', '五'];
  let site = 0;
  const timer = setInterval(() => {
    if (site == list.length) {
      document.getElementsByClassName('heart')[0].style.opacity = 1;
      clearInterval(timer);
      time.style.opacity = 0;
      deferred.resolve();
    } else {
      number.innerHTML = list[site];
      number.style.color = `rgba(233, 62, 59, ${(site + 2) * 0.2})`;
      site++;
    }
  }, 1000)
  return deferred.promise;
}

/**
 * 彩虹雨
 *
 * @returns
 */
function stepColorFulRain() {
  const deferred = new Deferred();
  view.style.background = '#0E2744';
  view.style.overflow = 'auto';
  function Rain() {
    this.rain = document.createElement('div');
    this.rain.className = 'rain';
    this.rain.style.top = Math.random() * window.innerHeight * 0.9 + 0.1 * window.innerHeight + 'px';
    this.rain.style.left = Math.random() * window.innerWidth * 0.9 + 0.1 * window.innerWidth + 'px';
    this.rain.style.background = `radial-gradient(rgba(255, 255, 255, 0.1), rgba(${Math.random() * 155 + 100}, ${Math.random() * 155 + 100}, ${Math.random() * 155 + 100}, 0.5))`;
    this.rain.style.animation = 'rain 6s linear'
    document.body.appendChild(this.rain);
    const timer2 = setTimeout(() => {
      clearTimeout(timer2);
      document.body.removeChild(this.rain);
    }, 6000)
  }
  let starTimer = setInterval(() => {
    new Rain();
  }, 300)
  setTimeout(() => {
    deferred.resolve();
  }, 2000)
  return deferred.promise;
}

stepWord('致 9.15', 'rgb(228, 231, 12)')
    .then(() => stepWord('开始倒计时', '#c1e8fa'))
    .then(() => stepWord('start the countdown', '#db61ac'))
    .then(() => stepSpace())
    .then(() => stepWord('🌟🌟🌟🌟🌟🌟'))
    .then(() => stepSpace())
    .then(() => stepTime())
    .then(() => stepWord('心跳加速，藏獒开始进化', '#c1e8fa'))
    .then(() => stepWord('The heart rate quickens and the Tibetan mastiff begins to evolve.', '#db61ac'))
    .then(() => stepSpace())
    .then(() => stepWord('🐶🐶🐶🐶🐶🐶'))
    .then(() => stepSpace())
    .then(() => stepDown())
    .then(() => stepWord('致 9.21', 'rgb(228, 231, 12)'))
    .then(() => stepWord('但愿人长久，千里共婵娟', '#c1e8fa'))
    .then(() => stepWord('you are my fairy forever', 'red'))
    .then(() => stepSpace())
    .then(() => stepWord('🌛🌛🌛🌛🌛🌛'))
    .then(() => stepSpace())
    // .then(() => stepMoon())
    .then(() => stepWord('大崽崽', '#c1e8fa'))
    .then(() => stepWord('big zaizai', '#db61ac'))
    .then(() => stepSpace())
    .then(() => stepWord('☀️☀️☀️☀️☀️☀️'))
    .then(() => stepSpace())
    // .then(() => stepRemove())
    .then(() => stepWord('但盼风雨来，能留你在此', '#c1e8fa'))
    .then(() => stepWord("Don't leave me!", '#db61ac'))
    .then(() => stepSpace())
    .then(() => stepWord('🌧️🌧️🌧️🌧️🌧️🌧️'))
    .then(() => stepSpace())
    // .then(() => stepRain())
    .then(() => stepWord('留你在此，赏彩色的雨', '#c1e8fa'))
    .then(() => stepWord("I'll create more surprises for you", 'red'))
    .then(() => stepSpace())
    .then(() => stepWord('🌈🌈🌈🌈🌈🌈'))
    .then(() => stepColorFulRain())
    .then(() => stepHanzi())
