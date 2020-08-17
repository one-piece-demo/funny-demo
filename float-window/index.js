/*
 * @File: index.js
 * @Project: float-window
 * @File Created: Monday, 25th November 2019 10:37:20 am
 * @Author: NARUTOne (wznaruto326@163.com/wznarutone326@gamil.com)
 * -----
 * @Last Modified: Monday, 25th November 2019 10:38:16 am
 * @Modified By: NARUTOne (wznaruto326@163.com/wznarutone326@gamil.com>)
 * -----
 * @Copyright <<projectCreationYear>> - 2019 ***, ***
 * @fighting: code is far away from bug with the animal protecting
 *  ┏┓      ┏┓
 *  ┏┛┻━━━┛┻┓
 *  |           |
 *  |     ━    |
 *  |  ┳┛ ┗┳ |
 *  |          |
 *  |     ┻   |
 *  |           |
 *  ┗━┓     ┏━┛
 *     |      | 神兽保佑 🚀🚀🚀
 *     |      | 代码无BUG！！！
 *     |      ┗━━━┓
 *     |            ┣┓
 *     |            ┏┛
 *     ┗┓┓ ┏━┳┓┏┛
 *      |┫┫   |┫┫
 *      ┗┻┛   ┗┻┛
 *
 */

// ! bug 

const moveBox = document.querySelector(".move");
const smallImg = document.querySelector(".move .small-img");
const magnifyImg = document.querySelector(".move .magnify-img");
var initX = 0; // 记录小采宝的x坐标
var initY = 0; // 记录小采宝的y坐标
let isMove = false; // 是否是拖动
let isBig = false; // 是否是变大的盒子
    
smallImg.onmousedown = magnifyImg.onmousedown = function(evt) {
    // 拖动div盒子
    const clientX = evt.clientX;
    const clientY = evt.clientY;
    const pageX = moveBox.offsetLeft;
    const pageY = moveBox.offsetTop;
    const x = clientX - pageX;
    const y = clientY - pageY;

    isMove = false;

    document.onmousemove = function(e) {
        const boxWidth = moveBox.offsetWidth;
        const boxHeight = moveBox.offsetHeight;
        let _x = e.clientX - x;
        let _y = e.clientY - y;
        if (_x < 0) {
            _x = 0;
        }
        if (_x > window.screen.width - boxWidth) {
            _x = window.screen.width - boxWidth;
        }
        if (_y < 0) {
            _y = 0;
        }
        if (_y > document.documentElement.clientHeight - boxHeight) {
            _y = document.documentElement.clientHeight - boxHeight;
        }

        if (isBig) {
            initX = _x;
            initY = _y;
        }

        moveBox.style.left = _x + "px";
        moveBox.style.top = _y + "px";

        isMove = true;
    };
}


document.onmouseup = function() {
    if (isMove) {
        initX = moveBox.offsetLeft;
        initY = moveBox.offsetTop;
    }
    document.onmousemove = null;
};

function moveBoxClick(e) {
    const target = document.querySelector(".move");
    const smallImg = document.querySelector(".small-img");
    const magnifyImg = document.querySelector(".magnify-img");
    // 点击move盒子
    if (!isMove) {
        if (isBig) {
          smallImg.style.display = "block";
          magnifyImg.style.display = "none";
          target.style.width = "32px";
          target.style.left = initX + 'px';
          target.style.top = initY + 'px';
        } else {
          smallImg.style.display = "none";
          magnifyImg.style.display = "block";
          target.style.width = "130px";
        }
        isBig = !isBig;

        setTimeout(() => {
          autoPotion();
        }, 100)
    }
}

// 点击时，判断采宝是否超出显示屏
function autoPotion () {
    let x = moveBox.offsetLeft;
    let y = moveBox.offsetTop;

    if (x < 0) {
        x = 0;
    } else if (x > document.documentElement.clientWidth - moveBox.offsetWidth) {
        x = document.documentElement.clientWidth - moveBox.offsetWidth;
    }

    if (y < 0) {
        y = 0;
    } else if (y > document.documentElement.clientHeight - moveBox.offsetHeight) {
        y = document.documentElement.clientHeight - moveBox.offsetHeight;
    }

    moveBox.style.left = x + "px";
    moveBox.style.top = y + "px";
}
