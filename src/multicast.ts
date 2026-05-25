import * as dgram from 'dgram'
import type { GenelecSmartIPInstance } from './main.js'
import type { MulticastMessage } from './types.js'

export class GenelecMulticast {
	private socket: dgram.Socket | null = null
	private readonly multicastIp: string
	private readonly multicastPort: number
	private readonly self: GenelecSmartIPInstance

	constructor(multicastIp: string, multicastPort: number, self: GenelecSmartIPInstance) {
		this.multicastIp = multicastIp
		this.multicastPort = multicastPort
		this.self = self
		this.createSocket()
	}

	private createSocket(): void {
		try {
			this.socket = dgram.createSocket({ type: 'udp4', reuseAddr: true })

			this.socket.on('error', (err) => {
				this.self.log('error', `Multicast socket error: ${err.message}`)
				this.socket?.close()
				this.socket = null
			})

			this.socket.bind(() => {
				this.self.log('debug', `Multicast socket bound, sending to ${this.multicastIp}:${this.multicastPort}`)
			})

			this.socket.on('message', (message) => {
				this.self.log('debug', `Multicast message received: ${message}`)
			})

			this.socket.on('close', () => {
				this.self.log('debug', 'Multicast socket closed')
			})
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error)
			this.self.log('error', `Failed to create multicast socket: ${message}`)
		}
	}

	private send(message: MulticastMessage): void {
		if (!this.socket) {
			this.self.log('warn', 'Multicast socket not available, attempting to recreate')
			this.createSocket()
			if (!this.socket) return
		}

		const buffer = Buffer.from(JSON.stringify(message))
		this.socket.send(buffer, 0, buffer.length, this.multicastPort, this.multicastIp, (err) => {
			if (err) {
				this.self.log('error', `Multicast send error: ${err.message}`)
			}
		})
	}

	sendVolume(level: number): void {
		this.send({
			mcast: {
				ver: 1,
				level: level,
			},
		})
	}

	sendMute(mute: boolean): void {
		this.send({
			mcast: {
				ver: 1,
				mute: mute,
			},
		})
	}

	sendProfile(profile: number): void {
		this.send({
			mcast: {
				ver: 1,
				profile: profile,
			},
		})
	}

	sendPower(state: 'BOOT' | 'STANDBY'): void {
		this.send({
			mcast: {
				ver: 1,
				state: state,
			},
		})
	}

	destroy(): void {
		if (this.socket) {
			try {
				this.socket.close()
			} catch {
				// Socket may already be closed
			}
			this.socket = null
		}
	}
}
