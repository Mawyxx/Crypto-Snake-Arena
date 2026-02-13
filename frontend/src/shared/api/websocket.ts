/**
 * WebSocket клиент. Подключение к игровому серверу.
 * Single Responsibility: только соединение и передача бинарных данных.
 */

export type MessageHandler = (data: ArrayBuffer) => void

const WS_OPEN = 1

export class GameWebSocket {
  private ws: WebSocket | null = null
  private onMessage: MessageHandler | null = null

  connect(url: string, _initData: string): void {
    this.ws = new WebSocket(url)
    this.ws.binaryType = 'arraybuffer'

    this.ws.onmessage = (e) => {
      if (e.data instanceof ArrayBuffer && this.onMessage) {
        this.onMessage(e.data)
      }
    }

    this.ws.onerror = () => {
      console.warn('[GameWebSocket] connection error')
    }

    this.ws.onclose = () => {
      this.ws = null
    }
  }

  setMessageHandler(handler: MessageHandler): void {
    this.onMessage = handler
  }

  send(data: ArrayBuffer): void {
    if (this.ws?.readyState === WS_OPEN) {
      this.ws.send(data)
    }
  }

  close(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}
