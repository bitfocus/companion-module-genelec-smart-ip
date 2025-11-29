import { GenelecSmartIPInstance } from "./main.js";
import type { ModuleConfig } from './config.js'
import {} from './types.js'

export class GenelecSpeaker {
	private readonly config: ModuleConfig
	private readonly self: GenelecSmartIPInstance
	private readonly port: number
	constructor(config: ModuleConfig, self: GenelecSmartIPInstance) {
		this.config = config
		this.port = 9000
		this.self = self
	}

	async sendRequest (type: string, endpoint: string,
		content?: Record<string, unknown>,) : Promise<void> {
		
			const host = this.config.host ?? this.config.customHost
			const url = `http://${this.config.host}:${this.port}/${endpoint}`
			const response = await fetch(url, {
				method: type,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(content),
			})
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			const data = (await response.json())
			return data
	}

	async getSystemInfo(): Promise<void> {
		this.sendRequest('GET', 'device/info')
	}


}
