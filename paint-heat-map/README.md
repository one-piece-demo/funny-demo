# paint-heat-map

> 静态图片流动效果

本文包含的新知识点主要包括：

* `mask-image` 遮罩元素
* `feTurbulence` 和 `feDisplacementMap` `svg`滤镜
* `filter` 属性
* `Canvas` 绘制方法
* `TimelineMax` 动画
* `input[type=file]` 本地图片资源加载

## `💡` feTurbulence 和 feDisplacementMap

* `feTurbulence`：滤镜利用 `Perlin` 噪声函数创建了一个图像，利用它可以实现人造纹理比如说云纹、大理石纹等模拟滤镜效果。
* `feDisplacementMap`：映射置换滤镜，该滤镜用来自图像中从 `in2` 到空间的像素值置换图像从 `in` 到空间的像素值。即它可以改变元素和图形的像素位置，通过遍历原图形的所有像素点，`feDisplacementMap` 重新映射替换一个新的位置，形成一个新的图形。该滤镜在业界的主流应用是对图形进行形变，扭曲，液化。

## `💡` mask-image

`mask-image` `CSS` 属性用于设置元素上遮罩层的图像。

**语法**：

```css
// 默认值，透明的黑色图像层，也就是没有遮罩层。
mask-image: none;
// <mask-source><mask>或CSS图像的url的值
mask-image: url(masks.svg#mask1);
// <image> 图片作为遮罩层
mask-image: linear-gradient(rgba(0, 0, 0, 1.0), transparent);
mask-image: image(url(mask.png), skyblue);
// 多个值
mask-image: image(url(mask.png), skyblue), linear-gradient(rgba(0, 0, 0, 1.0), transparent);
// 全局值
mask-image: inherit;
mask-image: initial;
mask-image: unset;
```
