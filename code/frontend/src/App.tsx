import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Path from './pages/Path'
import Scenario from './pages/Scenario'
import Progress from './pages/Progress'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="path" element={<Path />} />
        <Route path="scenario" element={<Scenario />} />
        <Route path="progress" element={<Progress />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
