import { Tabs } from 'antd';
import RecordVideo from './demo/RecordVideo';
import './App.css'

function App() {
  const tabs = [
    { key: 'record-video', label: 'Record Video', children: <RecordVideo /> },
  ]

  return (
    <div>
      <Tabs tabPosition='left' defaultActiveKey="record-video" items={tabs} />
    </div>
  )
}

export default App
