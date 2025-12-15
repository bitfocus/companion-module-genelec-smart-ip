import { GenelecSmartIPInstance } from './main.js'
import type { ModuleConfig } from './config.js'
import { GenericResponse } from './types.js'
import { InstanceStatus } from '@companion-module/base'

export interface ModuleSecrets {
	password: string
}

export class GenelecSpeaker {
	private readonly config: ModuleConfig
	private readonly user: string
	private readonly password: string
	private readonly self: GenelecSmartIPInstance

	constructor(config: ModuleConfig, password: string, self: GenelecSmartIPInstance) {
		this.config = config
		this.user = config.user
		this.password = password
		this.self = self
	}

	generateBasicAuthHeader(): string {
		if (!this.user || !this.password) {
			this.self.updateStatus(InstanceStatus.BadConfig)
			this.self.log('error', 'Username or password is missing in configuration')
		}
		const credentials = `${this.user}:${this.password}`
		return `Basic ${Buffer.from(credentials).toString('base64')}`
	}

	async sendRequest(
		type: string,
		endpoint: string,
		content?: Record<string, unknown>,
	): Promise<GenericResponse | void> {
		const host = this.config.bonjourHost ?? this.config.customHost + ':9000'
		const url = `http://${host}/public/v1/${endpoint}`
		const response = await fetch(url, {
			method: type,
			headers: {
				'Content-Type': 'application/json',
				Authorization: this.generateBasicAuthHeader(),
			},
			body: JSON.stringify(content),
		})
		console.log(`Request to ${url} returned status ${response.status}`)
		if (!response.ok) {
			if (response.status === 401) {
				this.self.updateStatus(InstanceStatus.BadConfig)
				this.self.log('error', 'Authentication failed: Invalid username or password')
				return
			}
			throw new Error(`HTTP error!  status: ${response.status}`)
		}
		const data = await response.json()
		return data as GenericResponse
	}

	async getSystemInfo(): Promise<void> {
		await this.sendRequest('GET', 'device/info')
	}
}
