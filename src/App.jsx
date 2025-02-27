import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/NavBar'
import Towerpagefn from './views/Towerpage'

function App() {

  return (
    <>
    <div>
      <Navbar />
    </div>
    <div>
      <Towerpagefn />
    </div>
    </>
  )
}

export default App
