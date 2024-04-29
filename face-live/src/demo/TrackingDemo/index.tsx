import { useState, useRef } from 'react';
import { Button, Space, message, Modal } from 'antd';
import { ContactsOutlined } from '@ant-design/icons';
import '../../assets/tracking/tracking-min.js';
import '../../assets/tracking/face-min.js';
import './index.less';

const TrackingDemo = () => {
  const reverse = true;
  const [showCamera, setShowCamera] = useState(false);
  const [resVisible, setResVisible] = useState<boolean>(false);

  const videoRef = useRef<any>(null);
  const timer = useRef(false);
  const localMediaStream = useRef<any>(null);
  const trackerTask = useRef<any>(null);
  const saveArray = useRef<any>({ x: 0, y: 0, width: 0, height: 0 });
  const imgList = useRef<any[]>([]);

  // 将canvas转化为图片
  const convertCanvasToImage = (canvas) => {
    const image = new Image()
    image.src = canvas.toDataURL('image/png')
    return image
  }

  const keepImg = () => {
    //先保存完整的截图
    const cut = document.getElementById('shortCut')
    // @ts-ignore
    const context = cut?.getContext('2d')
    //从完整截图里面，截取左侧100x100大小的图片，添加到canvas1里面
    const imgData = context.getImageData(0, 0, 100, 100)
    const canvas1 = document.getElementById('canvas1')
    // @ts-ignore
    const context1 = canvas1?.getContext('2d')
    context1.putImageData(imgData, 0, 0)
    //把canvas1里面的100x100大小的图片保存
    const imgSrc = convertCanvasToImage(canvas1).src
    imgList.current.push(imgSrc)
    timer.current = false
    //捕捉成功后停顿3秒，再捕捉下一张，捕捉5张后上传文件
    if (imgList.current.length === 5) {
      console.log(imgList.current)
      message.info('活体检测照片收集完成！');
      stopCheck();
    } else {
      setTimeout(() => {
        timer.current = true
        message.info(`活体检测照片收集 + ${imgList.current.length}！`);
        setPhotoInterval()
      }, 2000)
    }
  }

  const getPhoto = () => {
    const video = document.getElementById('video')
    const cut = document.getElementById('shortCut')
    // @ts-ignore
    const context2 = cut?.getContext('2d')
    context2.drawImage(video, 0, 0, 100, 100)
    keepImg()
  }

  const setPhotoInterval = () => {
    const countFun = () => {
      setTimeout(() => {
        if (timer.current && videoRef.current) {
          countFun()
          const csaveArray = saveArray.current
          if (reverse) {
            if (
              csaveArray.x < 100 &&
              csaveArray.y < 100 &&
              csaveArray.width > 50 &&
              csaveArray.height > 50
            ) {
              getPhoto()
            }
          } else {
            if (
              200 - csaveArray.x - csaveArray.width < 50 &&
              csaveArray.y < 50 &&
              csaveArray.width > 50 &&
              csaveArray.height > 50
            ) {
              getPhoto()
            }
          }
        }
      }, 1000)
    }
    countFun()
  }

  const trackingVideo = () => {
    const canvas = document.getElementById('canvas')
    // @ts-ignore
    const context = canvas?.getContext('2d')
    // @ts-ignore
    const tracker = new tracking.ObjectTracker('face')
    tracker.setInitialScale(4)
    tracker.setStepSize(2)
    tracker.setEdgesDensity(0.1)
    // @ts-ignore
    trackerTask.current = tracking.track('#video', tracker, { camera: true })
    tracker.on('track', function (event) {
      // @ts-ignore
      context.clearRect(0, 0, canvas?.width || 50, canvas?.height || 50)
      event.data.forEach(function (rect) {
        console.log(rect)
        if (reverse) {
          context.strokeRect(
            200 - rect.x - rect.width,
            rect.y,
            rect.width,
            rect.height
          )
        } else {
          context.strokeRect(rect.x, rect.y, rect.width, rect.height)
        }
        context.strokeStyle = '#e4393c'
        context.fillStyle = '#fff'
        saveArray.current.x = rect.x
        saveArray.current.y = rect.y
        saveArray.current.width = rect.width
        saveArray.current.height = rect.height
      })
    })
    timer.current = true
    setPhotoInterval();
  }

  const startCheck = () => {
    const constraints = {
      audio: false, // 是否开启音频
      video: {
        facingMode: 'user', // 使用前置摄像头
      },
    }
    if (navigator.mediaDevices === undefined) {
      // @ts-ignore
      navigator.mediaDevices = {}
    }
    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = function (c) {
        // 判断浏览器是否支持getUserMedia方法
        // @ts-ignore
        const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!getUserMedia) {
          message.warning('该浏览器不支持getUserMedia，请使用其他浏览器')
          return Promise.reject(
            new Error('getUserMedia is not implemented in this browser')
          )
        }
        // 否则，为老的navigator.getUserMedia方法包裹一个Promise
        return new Promise(function (resolve, reject) {
          getUserMedia.call(navigator, c, resolve, reject)
        })
      }
    }

    //如果发现有流存在，要先关闭，再去打开流
    if (localMediaStream.current) {
      localMediaStream.current.getTracks().forEach(track => {
        track.stop();
      });
    }

    imgList.current = []
    setShowCamera(true) // 显示录制框
    //调用浏览器摄像头API
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        localMediaStream.current = stream;
        if (videoRef.current && 'srcObject' in videoRef.current) {
          videoRef.current.srcObject = stream
        } else {
          // @ts-ignore
          videoRef.current.src = winURL.createObjectURL(stream)
        }
        trackingVideo();
      })
      .catch((err) => {
        console.error(err)
        message.warning('摄像头开启失败，请检查摄像头是否授权或是否可用！')
      })
  }

  const clearCanvas = () => {
    const c = document.getElementById('canvas')
    const c1 = document.getElementById('canvas1')
    // @ts-ignore
    const cxt = c?.getContext('2d')
    // @ts-ignore
    const cxt1 = c1?.getContext('2d')
    cxt.clearRect(0, 0, 200, 200)
    cxt1.clearRect(0, 0, 200, 200)
  }

  const closeVideo = () => {
    const video = videoRef.current;
    if (video.srcObject) {
      const stream = video.srcObject
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => {track.stop()})
      }
      video.srcObject = null;
    }
    if (video.src) {
      const stream1 = video.src
      const tracks1 = stream1.getTracks();
      if (tracks1) {
        tracks1.forEach(track => {track.stop()})
      }
      video.src = ''
    }
    
    localMediaStream.current = null
    setShowCamera(false);
  }

  const stopCheck = () => {
    try {
      if (!localMediaStream.current) return;
      timer.current = false
      trackerTask.current.stop()
      trackerTask.current = null;
      clearCanvas();
      closeVideo();
    } catch (e) {
      console.log("停止异常，进入到catch",e)
    }
  }

  const againCheck = () => {
    imgList.current = []
    timer.current = false
    startCheck()
  }

  const handleSubmit = () => {
    setResVisible(true);
  }

  const onCancel = () => {
    setResVisible(false);
  }

  return (
    <div className='tracking-video'>
      <h3>活体检测-人脸识别-Tracking</h3>
      <div className="tracking-video-face">
        {showCamera ? <div className="record-video-box">
          <video 
            ref={videoRef}
            autoPlay 
            muted 
            playsInline
            x5-video-player-type="h5"
            id="video"
          >
          </video>
          <canvas id="canvas" width="100" height="100"></canvas>
          <canvas
            id="shortCut"
            width="100"
            height="100"
            style={{opacity: 0}}
          ></canvas>
          <canvas
          id="canvas1"
          width="100"
          height="100"
          style={{opacity: 0}}
        ></canvas>
        </div> :
        <div className="tracking-video-img">
          <ContactsOutlined />
        </div>}
      </div>
      <div className="tracking-video-footer">
        <Space>
          <Button type="primary" onClick={() => startCheck()}>开始检测</Button>
          <Button danger onClick={() => stopCheck()}>结束检测</Button>
          <Button danger onClick={() => againCheck()}>重新检测</Button>
        </Space>
      </div>
      <div className="tracking-video-submit">
        <Button type="primary" size="large" onClick={handleSubmit}>提交</Button>
      </div>
      <Modal title="录屏结果" open={resVisible} onCancel={onCancel} onOk={onCancel}>
        <div>
          <Space direction='vertical'>
            {
              imgList.current.map((img, index) => (
                <img key={index} src={img} alt={`img-${index}`} />
              ))
            }
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default TrackingDemo;
