/**
 * WebSocket клиент. Подключение к игровому серверу.
 * Single Responsibility: только соединение и передача бинарных данных.
 */

export type MessageHandler = (data: ArrayBuffer) => void

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
  }

  setMessageHandler(handler: MessageHandler): void {
    this.onMessage = handler
  }

  send(data: ArrayBuffer): void {
    this.ws?.send(data)
  }

  close(): void {
    this.ws?.close()
    this.ws = null
  }
}
