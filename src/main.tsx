import { StrictMode } from 'react'
import { render } from 'react-dom'
import App from './App'
import './assets/index.scss'
import './patch-local-storage-for-github-pages'

window.global = window

render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root') as HTMLElement
)
