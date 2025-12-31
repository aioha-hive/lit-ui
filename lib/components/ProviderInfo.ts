import { Providers } from '@aioha/aioha'
import KeychainIcon from '../logos/keychain.svg'
import PeakVaultIcon from '../logos/peakvault.svg'
import HiveAuthIcon from '../logos/hiveauth-light.svg'
import HiveAuthIconDark from '../logos/hiveauth-dark.svg'
import HiveSignerIcon from '../logos/hivesigner.svg'
import LedgerIcon from '../logos/ledger-light.svg'
import LedgerIconDark from '../logos/ledger-dark.svg'
import MetaMaskIcon from '../logos/metamask.svg'

export const ProviderInfo: {
  [provider in Providers]: {
    name: string
    icon: string
    iconDark?: string
    loginBadge?: string
    url?: string
    discovery?: boolean
  }
} = {
  [Providers.Keychain]: {
    name: 'Keychain',
    icon: KeychainIcon,
    loginBadge: 'Popular',
    url: 'https://hive-keychain.com'
  },
  [Providers.PeakVault]: {
    name: 'Peak Vault',
    icon: PeakVaultIcon,
    url: 'https://vault.peakd.com'
  },
  [Providers.HiveAuth]: {
    name: 'HiveAuth',
    icon: HiveAuthIcon,
    iconDark: HiveAuthIconDark
  },
  [Providers.HiveSigner]: {
    name: 'HiveSigner',
    icon: HiveSignerIcon
  },
  [Providers.Ledger]: {
    name: 'Ledger',
    icon: LedgerIcon,
    iconDark: LedgerIconDark,
    discovery: true
  },
  [Providers.MetaMaskSnap]: {
    name: 'MetaMask',
    loginBadge: 'Hive Snap',
    icon: MetaMaskIcon,
    url: 'https://snaps.metamask.io/snap/npm/hiveio/metamask-snap',
    discovery: true
  },
  [Providers.ViewOnly]: {
    name: 'View Only',
    icon: ''
  },
  [Providers.Custom]: {
    name: 'Other Wallet',
    icon: ''
  }
}
