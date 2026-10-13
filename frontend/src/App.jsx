import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Events from './pages/Events'
import Register from './pages/Register'
import Match from './pages/Match'
import CreateEvent from './pages/CreateEvent'
import MyEvents from './pages/MyEvents'
import Login from './pages/Login'
import ManageEvent from './pages/ManageEvent'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import ForgotPassword from './pages/ForgotPassword'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Platform account auth */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/settings" element={<Settings />} />

        {/* Event attendee flow (no platform account needed) */}
        <Route path="/login" element={<Login />} />
        <Route path="/events" element={<Events />} />
        <Route path="/register/:eventId" element={<Register />} />
        <Route path="/match" element={<Match />} />

        {/* Organizer flow */}
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/manage-event/:eventId" element={<ManageEvent />} />
      </Routes>
    </BrowserRouter>
  )
}
