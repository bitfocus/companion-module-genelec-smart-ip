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
	SystemState,
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
	private authHeader: string | null = null

	public state: SystemState = {}

	constructor(config: ModuleConfig, password: string, self: GenelecSmartIPInstance) {
		this.config = config
		this.user = config.user
		this.password = password
		this.self = self
	}

	generateBasicAuthHeader(): string {
		if (this.authHeader) {
			return this.authHeader
		}
		if (!this.user || !this.password) {
			this.self.updateStatus(InstanceStatus.BadConfig)
			this.self.log('error', 'Username or password is missing in configuration')
		}
		const credentials = `${this.user}:${this.password}`
		this.authHeader = `Basic ${Buffer.from(credentials).toString('base64')}`
		return this.authHeader
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
		return data
	}

	async getSystemInfo(): Promise<DeviceInfoResponse | void> {
		const data = await this.sendRequest<DeviceInfoResponse>('GET', 'device/info')
		if (data) {
			this.state.deviceInfo = data
		}
		return data
	}

	async getPowerState(): Promise<DevicePowerResponse | void> {
		const data = await this.sendRequest<DevicePowerResponse>('GET', 'device/pwr')
		if (data) {
			this.state.power = data
		}
		return data
	}

	async getLEDState(): Promise<LEDResponse | void> {
		const data = await this.sendRequest<LEDResponse>('GET', 'device/led')
		if (data) {
			this.state.led = data
		}
		return data
	}

	async getNetworkConfig(): Promise<NetworkConfig | void> {
		const data = await this.sendRequest<NetworkConfig>('GET', 'network/ipv4')
		if (data) {
			this.state.network = data
		}
		return data
	}

	async getEvents(): Promise<EventsResponse | void> {
		const data = await this.sendRequest<EventsResponse>('GET', 'events')
		if (data) {
			this.state.events = data
		}
		return data
	}

	async getInputs(): Promise<AudioInputs | void> {
		const data = await this.sendRequest<AudioInputs>('GET', 'audio/inputs')
		if (data) {
			this.state.audioInputs = data
		}
		return data
	}

	async getVolume(): Promise<AudioVolume | void> {
		const data = await this.sendRequest<AudioVolume>('GET', 'audio/volume')
		if (data) {
			this.state.audioVolume = data
		}
		return data
	}

	async getAoipInfo(): Promise<AoIPIdentityResponse | void> {
		const data = await this.sendRequest<AoIPIdentityResponse>('GET', 'aoip/dante/identity')
		if (data) {
			if (!data.locked) {
				data.locked = false
			}
			this.state.aoipInfo = data
		}
		return data
	}

	async getAoipNetworkConfig(): Promise<AoIPNetworkResponse | void> {
		const data = await this.sendRequest<AoIPNetworkResponse>('GET', 'aoip/ipv4')
		if (data) {
			this.state.aoipNetwork = data
		}
		return data
	}

	async getZoneConfig(): Promise<NetworkZoneResponse | void> {
		const data = await this.sendRequest<NetworkZoneResponse>('GET', 'network/zone')
		if (data) {
			this.state.zone = data
		}
		return data
	}

	async getProfileList(): Promise<ProfileListResponse | void> {
		const data = await this.sendRequest<ProfileListResponse>('GET', 'profile/list')
		if (data) {
			this.state.profiles = data
		}
		return data
	}

	async fetchInitialInfo(): Promise<void> {
		await Promise.allSettled([
			this.getSystemInfo(),
			this.getPowerState(),
			this.getLEDState(),
			this.getNetworkConfig(),
			this.getEvents(),
			this.getInputs(),
			this.getVolume(),
			this.getAoipInfo(),
			this.getAoipNetworkConfig(),
			this.getZoneConfig(),
			this.getProfileList(),
		])
	}

	async getAllInfo(): Promise<void> {
		await Promise.allSettled([this.getSystemInfo(), this.getPowerState(), this.getLEDState(), this.getNetworkConfig()])
	}
}
