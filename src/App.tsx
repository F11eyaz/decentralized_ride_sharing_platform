import { AppRouter } from './router'
import '../index.css';
import { GPSProvider } from './context/GPSContext';


function App() {

  return (
    <>
      <GPSProvider>
        <AppRouter/>
      </GPSProvider>
    </>
  )
}

export default App
