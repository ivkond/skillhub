import ReactDOM from 'react-dom/client'
import { App } from './app/providers'
import { bootstrapThemeMode } from './shared/theme/theme-preference'
import './i18n/config'
import './index.css'

/**
 * Main React entry point.
 *
 * Runtime configuration is loaded earlier in `bootstrap.ts`; this file only mounts the configured
 * application tree.
 */
bootstrapThemeMode()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />,
)
