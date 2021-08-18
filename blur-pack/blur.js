/**
 * canvas 微信虚图 模拟
 * @author NARUTOne
 * @date 2017/09/07
 */

var W = window.innerWidth;
var H = window.innerHeight;
var R = 150;

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

canvas.width = W;
canvas.height = H;

var img = new Image();
img.src = './onepiece.jpg';
img.onload = function() {
	initCanvas();
}

var clippingRegin = {x: W/2, y: H/2, r: R};

// 初始canvas

function initCanvas() {
	document.getElementById('blur-box').style.width = W + 'px';
	document.getElementById('blur-box').style.height = H + 'px';

	var x = Math.floor(Math.random() * (W - 100) + R);
	var y = Math.floor(Math.random() * (H - 100) + R);
	clippingRegin = {x: x, y: y, r: R};
	draw(img, clippingRegin);
}

function setClippingRegion(clippingRegin) {
	context.beginPath();
	context.arc(clippingRegin.x, clippingRegin.y, clippingRegin.r, 0, Math.PI * 2, false);

	context.clip();
}

function draw(img, clippingRegin) {
	context.clearRect(0, 0, canvas.width, canvas.height);

	context.save();
	setClippingRegion(clippingRegin);
	context.drawImage(img, 0, 0, W, H);
	context.restore();

}


// 按钮

function show() {
	var R = Math.sqrt(Math.pow(W, 2) + Math.pow(H, 2)); // 勾股定理
	
	// clippingRegin.r = R;
	// draw(img, clippingRegin);

	// 动画
	
	var times = setInterval(function() {
		if(clippingRegin.r < R) {
			clippingRegin.r += 50;

			draw(img, clippingRegin);
		}
		else {
			clearInterval(times);
		}
	}, 50)
}

function reset() {
	initCanvas()
}