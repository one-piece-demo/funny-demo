import { useState, useRef } from 'react';
import { Button, Space, message, Modal } from 'antd';
import { ContactsOutlined } from '@ant-design/icons';
import './index.less';

const RecordVideo = () => {
  const [numbers, setNumber] = useState<string>('1314');
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [resVisible, setResVisible] = useState<boolean>(false);
  const [videoSrc, setVideoSrc] = useState<any>('');

  const MediaStreamTrack = useRef<any>(null);
  const isAlreadyRecord = useRef<boolean>(false);
  const videoRef = useRef<any>(null);
  const mediaRecorder = useRef<any>(null);
  const recordedBlobs = useRef<any[]>([]);

  const onResetNumber = () => {
    setNumber(Math.floor(Math.random() * 9000 + 1000).toString());
  }

  const getCamera = () => {
    const constraints = {
      audio: true, // 是否开启音频
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
    setShowCamera(true) // 显示录制框
    //调用浏览器摄像头API
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        MediaStreamTrack.current =
        // @ts-ignore
          typeof stream.stop === 'function' ? stream : stream.getTracks()[0]
       
        isAlreadyRecord.current = false
        const winURL = window.URL || window.webkitURL
        if ('srcObject' in videoRef.current) {
          videoRef.current.srcObject = stream
        } else {
          // @ts-ignore
          videoRef.current.src = winURL.createObjectURL(stream)
        }
        videoRef.current.onloadedmetadata = () => {
          if (stream.active) {
            videoRef.current.play();
          }
        }
        const options = {
          videoBitsPerSecond: 2500000,
        }
        mediaRecorder.current = new MediaRecorder(stream, options)
        saveVideo(stream) // 开始录制
      }).catch((err) => {
        console.error(err)
        message.warning('摄像头开启失败，请检查摄像头是否授权或是否可用！')
      })
  }

   // 关闭摄像头
  const closeVideo = () => {
    recordedBlobs.current = [];
    isAlreadyRecord.current = false;
    if (MediaStreamTrack.current) {
      MediaStreamTrack.current.stop()
    }
  }

  // 保存录制视频
  const saveVideo = (stream?: any) => {
    if (isAlreadyRecord.current && mediaRecorder.current) {
      message.info('结束录制')
      //当录制的数据可用时
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedBlobs.current.push(e.data)
        }
      }
      mediaRecorder.current.stop() // 停止录制
      isAlreadyRecord.current = false
      const cstream = stream || videoRef.current.srcObject
      const tracks = cstream.getTracks()
      tracks.forEach(function (track) {
        track.stop()
      })
      videoRef.current.srcObject = null
      setShowCamera(false)
      closeVideo();
    } else {
      message.info('开始录制')
      isAlreadyRecord.current = true
      mediaRecorder.current?.start()
    }
  }

  //base64转为文件流
  const base64toFile = (dataurl, filename = 'file') => {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const suffix = mime.split('/')[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], `${filename}.${suffix}`, {
      type: mime,
    })
  }

  const resetVideo = () => {
    closeVideo()
    getCamera()
  }

  const uploadVideo = (fs) => {
    console.log(fs)
    message.success('上传成功');
    setResVisible(true);
  }

  const handleSubmit = () => {
    const blob = new Blob(recordedBlobs.current, { type: 'video/mp4' })
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onload = () => {
      const str = base64toFile(reader.result)
      const formData = new FormData()
      formData.append('file', str)
      setVideoSrc(reader.result)
      uploadVideo(formData)
    }
  }

  const onCancel = () => {
    setResVisible(false);
  }

  return (
    <div className="record-video">
      <h3>活体检测-录制视频</h3>
      <div className="record-video-content">
        <div className="record-video-number">
          {numbers.split('').map((n, i) => <span key={i}>{n}</span>)}
        </div>
        <div className="record-video-reflash">
          <Space>
            <p>请正确念出上方数字</p>
            <Button type="primary" size="small" onClick={onResetNumber}>刷新</Button>
          </Space>
        </div>
      </div>
      <div className="record-video-face">
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
        <div className="record-video-img">
          <ContactsOutlined />
        </div>}
      </div>
      <div className="record-video-footer">
        <Space>
          <Button type="primary" onClick={getCamera}>开始录制</Button>
          <Button danger onClick={() => saveVideo()}>结束录制</Button>
          <Button onClick={resetVideo}>重新录制</Button>
        </Space>
      </div>
      <div className="record-video-explain">
        <p>说明</p>
        <ul>
          <li>1.请使用前置摄像头</li>
          <li>2.保证光线充足、脸部完全入镜、脸部无遮挡物</li>
          <li>3.录制视频过程中请使用普通话读一遍上方验证数字</li>
          <li>4.如验证失败、数字失效，点击“刷新数字”后重新录制</li>
          <li>5.如录制不满意可点击“重新录制”直至录制满意</li>
        </ul>
      </div>
      <div className="record-video-submit">
        <Button type="primary" size="large" onClick={handleSubmit}>提交</Button>
      </div>
      <Modal title="录屏结果" open={resVisible} onCancel={onCancel} onOk={onCancel}>
        <div className="record-video-box" style={{width: 300, height: 300}}>
          <video 
            src={videoSrc}
            autoPlay 
            muted 
            playsInline
            x5-video-player-type="h5"
          >
          </video>
        </div>
      </Modal>
    </div>
  );
};

export default RecordVideo;