# Aioha Lit UI

Opinionated Lit modal UI for Hive logins through Aioha, styled using [Tailwind CSS](https://tailwindcss.com). This provides a quick and easy way to bootstrap a Lit web app with ready to use Aioha-powered modal component.

## Installation

```sh
pnpm i @aioha/lit-ui @aioha/aioha
```

## CDN Import

```html
<script type="module">
  import { initModal } from 'https://unpkg.com/@aioha/lit-ui@latest/dist/bundle.min.js'
</script>
```

## Usage

1. Initialize Aioha and setup the provider at the root of your application. This is usually done at the entrypoint file (i.e. `index.ts` or `my-element.ts`).

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { Aioha } from '@aioha/aioha'
import '@aioha/lit-ui'

@customElement('my-element')
export class MyElement extends LitElement {
  aioha: Aioha = new Aioha()

  connectedCallback() {
    super.connectedCallback()

    // See options: https://aioha.dev/docs/core/usage#instantiation
    this.aioha.setup()
  }

  render() {
    return html`
      <aioha-provider .aioha=${this.aioha}>
        <the-rest-of-your-app></the-rest-of-your-app>
      </aioha-provider>
    `
  }
}
```

2. Use the modal component and consume the [Lit context](https://aioha.dev/docs/framework/lit#usage) anywhere within `<aioha-provider>`.

```ts
import { UserCtx } from '@aioha/providers/lit'
import { KeyTypes } from '@aioha/aioha'
import type { LoginResult } from '@aioha/aioha/build/types.js'
import { consume } from '@lit/context'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '@aioha/lit-ui'

@customElement('home-page')
export class Homepage extends LitElement {
  @consume({ context: UserCtx, subscribe: true })
  @state()
  private _user?: string

  @state()
  private _aiohaModalDisplayed: boolean

  constructor() {
    super()
    this._aiohaModalDisplayed = false
  }

  private _handleButtonClick() {
    this._aiohaModalDisplayed = true
  }

  render() {
    return html`
      <button type="button" @click="${this._handleButtonClick}">
        ${this._user ?? 'Connect Wallet'}
      </button>
      <aioha-modal
        ?displayed="${this._aiohaModalDisplayed}"
        .loginOptions="${{ msg: 'Hello World', keyType: KeyTypes.Posting }}"
        arrangement="grid"
        .onClose="${() => {
          this._aiohaModalDisplayed = false
        }}"
        .onLogin="${(result: LoginResult) => {
          console.log(result)
        }}"
      >
      </aioha-modal>
    `
  }
}
```

## `<aioha-modal>` component

|Property|Description|Default|
|-|-|-|
|`displayed`|Boolean of whether the modal is displayed.|*false*|
|`lightMode`|Display the modal in light mode.|*false*|
|`loginTitle`|Login title to be displayed.|Connect Wallet|
|`loginHelpUrl`|Help URL to be linked under provider selection view, if any.|*undefined*|
|`loginOptions`|Aioha login options. See available configuration [here](https://aioha.dev/docs/core/usage#login).||
|`discOptions`|Account discovery options for supported providers. Details [here](https://aioha.dev/docs/core/usage#discover-accounts).||
|`arrangement`|Display view preference of provider selection. Valid values: `list` and `grid`.|list|
|`onLogin`|Callback function to be called upon successful login, if any. Parameter contains login result as defined [here](https://aioha.dev/docs/core/usage#login).|
|`onClose`|Function to be called to close the modal.||
|`imageServer`|Image server URL for user avatar.|https://images.hive.blog|
|`explorerUrl`|Hive block explorer URL.|https://hivehub.dev|
|`forceShowProviders`|List of `Providers` to force show as login option, which must be registered already. Clicking on unavailable providers displayed will open the URL of the provider landing page.|*[]*|

ℹ️ Note: `hiveauth.cbWait` in `loginOptions` will be overriden as `AiohaModal` will handle the presentation of HiveAuth QR codes.

When `displayed` is specified to a reactive state, use the `onClose` method to set that reactive state to `false` to properly close the modal.

All properties are optional except `loginOptions`.

## Universal Web Component

The Lit modal UI can be used as a universal web component on vanilla HTML/JS or any other web framework. The full example usage may be found in [`examples/index.html`](https://github.com/aioha-hive/lit-ui/blob/main/examples/index.html).

```html
<html>
  <body>
    <button id="connectButton" type="button">Connect Wallet</button>
    <div id="loginModal"></div>
  <body>
  <script type="module">
    import { initAioha, KeyTypes } from '@aioha/aioha'
    import { initModal } from '@aioha/lit-ui'

    // Initialize Aioha
    const aioha = initAioha()

    // Initialize modal UI in a div
    const modal = initModal(aioha, document.getElementById('loginModal'), {
      loginOptions: {
        // see available config here: https://aioha.dev/docs/core/usage#login
      }
    })

    // Show modal on button click
    document.getElementById('connectButton').addEventListener('click', () => (modal.displayed = true))
  </script>
</html>
```