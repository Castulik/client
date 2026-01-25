// 1. Musíme importovat tu tvoji komponentu (tvůj nákupní seznam)
import HomePage from './pages/HomePage'
import './App.css'

function App() {
  return (
    // 2. Tady ji vykreslíme
    <div className="app-container">
      <HomePage />
    </div>
  )
}

export default App