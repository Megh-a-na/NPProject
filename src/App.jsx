import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/NavBar'
import SimpleDropdown from './components/Localitydropdown'
import EntryBox from './components/Towerentry'

function App() {

  return (
    <>
    <div>
      <Navbar />
    </div>
    <div 
      style={{
        position: 'fixed',           // fixed relative to the viewport
        top: '10vh',                 // start 10% from the top of the viewport
        left: '50%',                 // center horizontally
        transform: 'translateX(-50%)', // adjust for true centering
        width: '90vw',               // container width is 90% of viewport width
        maxWidth: '600px',           // limit maximum width
        display: 'flex',
        flexDirection: 'column',     // stack elements vertically
        alignItems: 'center',
        gap: '2px'                  // fixed gap between elements (50px)
      }}
    >
      <SimpleDropdown />
      <EntryBox />
    </div>
    </>
  )
}

export default App
