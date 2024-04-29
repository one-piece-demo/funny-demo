import { useState, useRef } from 'react';
import { Button, Space, message, Modal } from 'antd';
import { ContactsOutlined } from '@ant-design/icons';
import { isMobile } from '../../utils/utils';
import './index.less';

const CompatibleVideo = () => {
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [resVisible, setResVisible] = useState<boolean>(false);
  const [videoImgSrc, setVideoImgSrc] = useState<any>('');

  const videoRef = useRef<any>(null);
  const localMediaStream = useRef<any>(null);
  const videoDeviceArrayRef = useRef<any[]>([]);
  const currentIdRef = useRef<string>('');

  // 切换摄像头
  const changeDevice = () => {
    const currentId = currentIdRef.current;
    const videoDeviceArray = videoDeviceArrayRef.current;
    //切换摄像头设备
    let constraints = {
      video: { deviceId: { exact: currentId } },
      audio: false
    }
   
    videoDeviceArray.forEach(id => {
      if (id !== currentId) {
        constraints = {
          video: { deviceId: { exact: id } },
          audio: false
        }
        currentIdRef.current = id;
        openDevice(constraints);
      }
    })
  }

  // 打开摄像头
  const openDevice = (mediaConstraints: any) => {
    //开启摄像头
    if (navigator.mediaDevices === undefined) {
      // @ts-ignore
      navigator.mediaDevices = {};
    }
    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = function (constraints) {
        // @ts-ignore
        const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        if (!getUserMedia) {
          message.warning('该浏览器不支持getUserMedia，请使用其他浏览器')
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }
        return new Promise(function (resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
    }
    //如果发现有流存在，要先关闭，再去打开流
    if (localMediaStream.current) {
      localMediaStream.current.getTracks().forEach(track => {
        track.stop();
      });
    }

    setShowCamera(true); // 显示录制框
    console.log('mediaConstraints', mediaConstraints);
    //调用浏览器摄像头API
    navigator.mediaDevices.getUserMedia(mediaConstraints).then((stream) => {
      localMediaStream.current = stream;
      if ('srcObject' in videoRef.current) {
        videoRef.current.srcObject = stream
      } else {
        // @ts-ignore
        videoRef.current.src = winURL.createObjectURL(stream)
      }
    }).catch((err) => {
      message.error('打开摄像头失败');
      console.log(err);
      changeDevice();
    });
  }

  // 获取摄像头，兼容性处理
  const getUserMediaId = () => {
    const sUserAgent = navigator.userAgent.toLowerCase();
    const isAndroid = sUserAgent.includes('android');
    const isRedmi = sUserAgent.includes('redmi');
    const isXiaomi = sUserAgent.includes('xiaomi');
    const isVivo = sUserAgent.includes('vivo');
    console.log(sUserAgent, 'SUserAgent');

    if (!isMobile()) {
      // 非移动端 直接打开摄像头
      const mediaConstraints = { video: { facingMode: 'user' }, audio: false };//打开前置摄像头
      openDevice(mediaConstraints)
      return
    }

    if(!isAndroid) {
      //苹果手机可以直接打开后置摄像头，无需自动切换
      const mediaConstraints = { video: { facingMode: { exact: "environment" } }, audio: false };//打开后置摄像头
      openDevice(mediaConstraints)
      return
    }

    const videoDeviceArray: any[] = []; // 存储摄像头id
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop(); // 关闭摄像头
        });
      }
    })
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      message.warning("不支持 enumerateDevices");
      return;
    }
    // 获取可用的设备列表
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      //寻找摄像头id
      devices.forEach(device => {
        if (device.kind === 'videoinput') {
          videoDeviceArray.push(device.deviceId);
        }
      });
      if(!videoDeviceArray.length){
        message.warning("无可用摄像头")
        return;
      }
      if (videoDeviceArray.length > 0) {
        //部分安卓手机机型无法直接打开后置摄像头，需要自动切换至前置摄像头
        const currentId = ((videoDeviceArray.length === 2 && !(isRedmi || isXiaomi || isVivo)) ? videoDeviceArray[1] : videoDeviceArray[0])
        const constraints = {
          video: { deviceId: { exact: currentId } },
          audio: false
        }
        videoDeviceArrayRef.current = videoDeviceArray;
        currentIdRef.current = currentId;
        openDevice(constraints)
      }
    })
  }

  // 停止摄像头
  const stopCapture = () => {
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
      video.src = null;
    }
    setShowCamera(false);
  }

  // 停止录制
  const stopRecording = () => {
    setTimeout(() => {
      try {
        const video = videoRef.current;
        if (localMediaStream.current) {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d")
          //安卓手机调整角度，苹果手机因为镜像需要特殊处理
          const sUserAgent = navigator.userAgent.toLowerCase();
          const isAndroid = sUserAgent.includes('android');
          if (!ctx) {
            message.warning("canvas获取失败");
            return;
          }
          if (isMobile()) {
            if (!isAndroid) {
              ctx.rotate(90 * Math.PI / 180);
              ctx.drawImage(video, 0, -canvas.width, canvas.height, canvas.width);
            } else {
              ctx.scale(2, 2)
              ctx.rotate(-270 * Math.PI / 180);
              ctx.drawImage(video, 0, 0, canvas.height, -canvas.width);
            }
          } else {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          }
          const imgUrl = canvas.toDataURL("image/png", 1.0);
          console.log("imgUrl", imgUrl)
          setVideoImgSrc(imgUrl);
          // 停止摄像机
          stopCapture();
        }
      } catch (e) {
        console.log("停止异常，进入到catch",e)
      }
    }, 10)
  }

  const handleSubmit = () => {
    stopRecording();
    setResVisible(true);
  }

  const onCancel = () => {
    setResVisible(false);
  }

  return (
    <div className='compatible-video'>
      <h3>活体检测-摄像头移动端兼容-生成图片</h3>
      <div className="compatible-video-face">
        {showCamera ? <div className="record-video-box">
          <video 
            ref={videoRef}
            autoPlay 
            muted 
            playsInline
            x5-video-player-type="h5"
          >
          </video>
        </div> :
        <div className="compatible-video-img">
          <ContactsOutlined />
        </div>}
      </div>
      <div className="compatible-video-footer">
        <Space>
          <Button type="primary" onClick={() => getUserMediaId()}>开始录制</Button>
          <Button danger onClick={() => stopRecording()}>结束录制</Button>
        </Space>
      </div>
      <div className="compatible-video-submit">
        <Button type="primary" size="large" onClick={handleSubmit}>提交</Button>
      </div>
      <Modal title="录屏结果" open={resVisible} onCancel={onCancel} onOk={onCancel}>
        <div className="compatible-video-box" style={{width: 300, height: 300}}>
          <img src={videoImgSrc} alt="图片" />
        </div>
      </Modal>
    </div>
  );
};

export default CompatibleVideo;