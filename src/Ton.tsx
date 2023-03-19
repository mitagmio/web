import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react'
import { Header } from './components/Header/Header'
import { TxForm } from './components/TxForm/TxForm'
import { Footer } from './components/Footer/Footer'
import { TonProofDemoApi } from './TonProofDemoApi'
import { TonProofDemo } from './components/TonProofDemo/TonProofDemo'

function Ton() {
  return (
    <TonConnectUIProvider
      manifestUrl="https://fck.foundation/tonconnect-manifest.json"
      getConnectParameters={() => TonProofDemoApi.connectWalletRequest}
      uiPreferences={{ theme: THEME.DARK }}
    >
      <div className="app">
        <Header />
        <TxForm />
        <TonProofDemo />
        <Footer />
      </div>
    </TonConnectUIProvider>
  )
}

export default Ton
