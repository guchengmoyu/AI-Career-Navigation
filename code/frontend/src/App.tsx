import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Path from './pages/Path'
import Scenario from './pages/Scenario'
import Evaluation from './pages/Evaluation'
import Progress from './pages/Progress'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="path" element={<Path />} />
        <Route path="scenario" element={<Scenario />} />
        {/* 评估报告页。路径取自 10_UI设计文档 §2.2 的 `/evaluation/:id`
            （文档里场景列表与详情写作 `/scenarios`、`/scenarios/:id`，
             而现有前端仍是 `/scenario` 单数 —— 路由命名统一走另一件事，
             本次不动既有路由，只把新增页按文档命名。 */}
        <Route path="evaluation/:id" element={<Evaluation />} />
        <Route path="progress" element={<Progress />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
