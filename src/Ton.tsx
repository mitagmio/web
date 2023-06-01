import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react'
import { Header, TxForm, TonProofDemo, Footer } from 'components/Ton'
import { TonProofApi } from './TonProofApi'

function Ton() {
  return (
    <TonConnectUIProvider
      manifestUrl="https://fck.foundation/tonconnect-manifest.json"
      getConnectParameters={() => TonProofApi.connectWalletRequest}
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
