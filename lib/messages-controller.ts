import type { ReactiveController, ReactiveControllerHost } from 'lit'
import { ContextConsumer } from '@lit/context'
import { MessagesCtx, defaultMessages, type Messages } from './i18n.js'

type Host = ReactiveControllerHost & HTMLElement

export class MessagesController implements ReactiveController {
  value: Messages = defaultMessages
  private host: Host
  private unsubscribe?: () => void

  constructor(host: Host) {
    this.host = host
    host.addController(this)
    new ContextConsumer<typeof MessagesCtx, Host>(host, {
      context: MessagesCtx,
      subscribe: true,
      callback: (value) => {
        this.unsubscribe?.()
        this.value = value
        this.unsubscribe = value.subscribe(() => host.requestUpdate())
        host.requestUpdate()
      }
    })
  }

  hostConnected() {
    if (!this.unsubscribe) {
      this.unsubscribe = this.value.subscribe(() => this.host.requestUpdate())
    }
  }

  hostDisconnected() {
    this.unsubscribe?.()
    this.unsubscribe = undefined
  }

  t(...args: Parameters<Messages['t']>): string {
    return this.value.t(...args)
  }
}
