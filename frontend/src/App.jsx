import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Events from './pages/Events'
import Register from './pages/Register'
import Match from './pages/Match'
import CreateEvent from './pages/CreateEvent'
import MyEvents from './pages/MyEvents'
import Login from './pages/Login'
import ManageEvent from './pages/ManageEvent'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/events" element={<Events />} />
        <Route path="/register/:eventId" element={<Register />} />
        <Route path="/match" element={<Match />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/manage-event/:eventId" element={<ManageEvent />} />
      </Routes>
    </BrowserRouter>
  )
}