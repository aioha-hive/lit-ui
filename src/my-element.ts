import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { Aioha } from '@aioha/aioha'
import './homepage.js'
import '../lib'

@customElement('my-element')
export class MyElement extends LitElement {
  @state()
  aioha: Aioha = new Aioha()

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this
  }

  connectedCallback(): void {
    super.connectedCallback()
    this.aioha.setup({
      hivesigner: {
        app: 'ipfsuploader.app',
        callbackURL: window.location.origin + '/hivesigner',
        scope: ['login', 'vote']
      },
      hiveauth: {
        name: 'Aioha Lit'
      }
    })
    this.aioha.registerViewOnly()
  }

  render() {
    return html`
      <div class="dark min-h-screen min-w-full dark:bg-gray-800">
        <aioha-provider .aioha=${this.aioha}>
          ${window.location.pathname === '/hivesigner'
            ? html`<hivesigner-cb></hivesigner-cb>`
            : window.location.pathname === '/hivesigner-ocl'
            ? html`<hivesigner-ocl .onSuccess="${() => (window.location.pathname = '/')}"></hivesigner-ocl>`
            : html`<home-page></home-page>`}
        </aioha-provider>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
