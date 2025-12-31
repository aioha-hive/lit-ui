import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { hivesignerCb } from '@aioha/aioha/build/lib/hivesigner-cb.js'
import { styles } from '../styles.js'

@customElement('hivesigner-cb')
export class HiveSignerCb extends LitElement {
  @property({ type: Boolean })
  lightMode = false

  firstUpdated() {
    hivesignerCb()
  }

  render() {
    return html`
      <div class="${!this.lightMode ? 'dark' : ''}">
        <p class="ml-2 text-black dark:text-white">Redirecting back to Aioha app...</p>
      </div>
    `
  }

  static styles = styles
}
