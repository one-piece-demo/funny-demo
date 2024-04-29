import { Tabs } from 'antd';
import RecordVideo from './demo/RecordVideo';
import CompatibleVideo from './demo/CompatibleVideo';
import TrackingDemo from './demo/TrackingDemo';
import './App.css';

function App() {
  const tabs = [
    { key: 'record-video', label: 'Record Video', children: <RecordVideo /> },
    { key: 'compatible-video', label: 'Compatible Video', children: <CompatibleVideo /> },
    { key: 'tracking-demo', label: 'Tracking Demo', children: <TrackingDemo /> },
  ]

  return (
    <div className='app'>
      <Tabs tabPosition='left' defaultActiveKey="record-video" items={tabs} />
    </div>
  )
}

export default App
