import { GenelecSmartIPInstance } from './main.js'
import type { ModuleConfig } from './config.js'
import {
	AoIPIdentityResponse,
	AoIPNetworkResponse,
	AudioInputs,
	AudioVolume,
	DeviceInfoResponse,
	DevicePowerResponse,
	EventsResponse,
	GenericResponse,
	LEDResponse,
	NetworkConfig,
	NetworkZoneResponse,
	ProfileListResponse,
} from './types.js'
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

	async sendRequest<T = GenericResponse>(
		type: string,
		endpoint: string,
		content?: Record<string, unknown>,
	): Promise<T | void> {
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
		if (response.status === 200) {
			this.self.updateStatus(InstanceStatus.Ok)
		}
		const data = (await response.json()) as T
		console.log(data)
		return data
	}

	async getSystemInfo(): Promise<DeviceInfoResponse | void> {
		return this.sendRequest<DeviceInfoResponse>('GET', 'device/info')
	}

	async getPowerState(): Promise<DevicePowerResponse | void> {
		return this.sendRequest<DevicePowerResponse>('GET', 'device/pwr')
	}

	async getLEDState(): Promise<LEDResponse | void> {
		return this.sendRequest<LEDResponse>('GET', 'device/led')
	}

	async getNetworkConfig(): Promise<NetworkConfig | void> {
		return this.sendRequest<NetworkConfig>('GET', 'network/ipv4')
	}

	async getEvents(): Promise<EventsResponse | void> {
		return this.sendRequest<EventsResponse>('GET', 'events')
	}

	async getInputs(): Promise<AudioInputs | void> {
		return this.sendRequest<AudioInputs>('GET', 'audio/inputs')
	}

	async getVolume(): Promise<AudioVolume | void> {
		return this.sendRequest<AudioVolume>('GET', 'audio/volume')
	}

	async getAoipInfo(): Promise<AoIPIdentityResponse | void> {
		return this.sendRequest<AoIPIdentityResponse>('GET', 'aoip/dante/identity')
	}

	async getAoipNetworkConfig(): Promise<AoIPNetworkResponse | void> {
		return this.sendRequest<AoIPNetworkResponse>('GET', 'aoip/ipv4')
	}

	async getZoneConfig(): Promise<NetworkZoneResponse | void> {
		return this.sendRequest<NetworkZoneResponse>('GET', 'network/zone')
	}

	async getProfileList(): Promise<ProfileListResponse | void> {
		return this.sendRequest<ProfileListResponse>('GET', 'profile/list')
	}

	async fetchInitialInfo(): Promise<void> {
		await this.getSystemInfo()
		await this.getPowerState()
		await this.getLEDState()
		await this.getNetworkConfig()
		await this.getEvents()
		await this.getInputs()
		await this.getVolume()
		await this.getAoipInfo()
		await this.getAoipNetworkConfig()
		await this.getZoneConfig()
		await this.getProfileList()
	}
}
