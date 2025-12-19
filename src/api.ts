import { GenelecSmartIPInstance } from './main.js'
import type { ModuleConfig } from './config.js'
import {
	AoIPIdentityResponse,
	AoIPNetworkResponse,
	AudioInputs,
	AudioDelay,
	AudioSensitivity,
	AudioVolume,
	DeviceInfoResponse,
	DevicePowerResponse,
	EventsResponse,
	GenericResponse,
	LEDResponse,
	NetworkConfig,
	NetworkZoneResponse,
	ProfileListResponse,
	ProfileItem,
	SystemState,
	DeviceISSResponse,
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
	private requestQueue: Promise<any> = Promise.resolve()

	public state: SystemState = {}

	constructor(config: ModuleConfig, password: string, self: GenelecSmartIPInstance) {
		this.config = config
		this.user = config.user
		this.password = password
		this.self = self
	}

	get isStandby(): boolean {
		return this.state.power?.state === 'STANDBY' || this.state.power?.state === 'ISS_SLEEP'
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
		apiPath?: boolean,
		bypassQueue?: boolean,
	): Promise<T | void> {
		if (bypassQueue) {
			return this._executeRequest<T>(type, endpoint, content, apiPath)
		}

		// Queue the request to prevent overloading the device web server
		this.requestQueue = this.requestQueue.then(async () => {
			const response = await this._executeRequest<T>(type, endpoint, content, apiPath)
			// Add a small delay between requests as requested by the user
			await new Promise((resolve) => setTimeout(resolve, 100))
			return response
		})

		return this.requestQueue
	}

	private async _executeRequest<T = GenericResponse>(
		type: string,
		endpoint: string,
		content?: Record<string, unknown>,
		apiPath?: boolean,
	): Promise<T | void> {
		const host = this.config.bonjourHost ?? this.config.customHost + ':9000'
		const publicEndpoint = apiPath !== undefined ? 'api/' : 'public/'
		const url = `http://${host}/${publicEndpoint}v1/${endpoint}`
		let response: Response
		try {
			response = await fetch(url, {
				method: type,
				headers: {
					'Content-Type': 'application/json',
					Authorization: this.generateBasicAuthHeader(),
				},
				body: JSON.stringify(content),
			})
		} catch (error: any) {
			const errorCode = error.cause?.code ?? 'Unknown error'
			if (errorCode === 'EHOSTDOWN' || errorCode === 'ECONNREFUSED' || errorCode === 'ETIMEDOUT') {
				console.log(url)
				this.self.updateStatus(InstanceStatus.ConnectionFailure, `${errorCode}`)
				if (this.self.lastStatus !== InstanceStatus.ConnectionFailure) {
					this.self.log('warn', `Unable to connect to device ${errorCode}`)
				}
			} else {
				this.self.log('debug', `Unable to connect to device: ${error.message} ${errorCode} ${url}`)
			}
			return
		}

		if (!response.ok) {
			if (response.status === 401) {
				this.self.updateStatus(InstanceStatus.BadConfig)
				this.self.log('error', 'Authentication failed: Invalid username or password')
				return
			} else if (response.status === 503) {
				this.self.log('debug', 'Device is in standby mode')
				return
			} else {
				this.self.log('debug', 'HTTP error!  status: ' + response.status)
			}
		}
		if (response.status === 200) {
			if (this.self.lastStatus !== InstanceStatus.Ok) {
				this.self.updateStatus(InstanceStatus.Ok)
			}
		}

		const contentLength = response.headers.get('Content-Length')
		if (contentLength && parseInt(contentLength) > 0) {
			const data = (await response.json()) as T
			return data
		}
		return
	}

	async getDeviceInfo(): Promise<DeviceInfoResponse | void> {
		const data = await this.sendRequest<DeviceInfoResponse>('GET', 'device/info')
		if (data) {
			this.state.deviceInfo = data
			this.self.updateVariableValues()
		}
		return data
	}

	async getPowerState(): Promise<DevicePowerResponse | void> {
		const data = await this.sendRequest<DevicePowerResponse>('GET', 'device/pwr')
		if (data) {
			this.state.power = data
		}
		this.self.updateVariableValues()
		this.self.checkFeedbacks('power')
		return data
	}

	async setPowerState(data: Partial<DevicePowerResponse>): Promise<void> {
		await this.sendRequest('PUT', 'device/pwr', data)
		setTimeout(() => {
			void this.getPowerState()
		}, 1000)
	}

	async bootDevice(): Promise<void> {
		await this.sendRequest<void>('PUT', 'device/boot', { boot: true }, true)
	}

	async getLEDState(): Promise<LEDResponse | void> {
		const data = await this.sendRequest<LEDResponse>('GET', 'device/led')
		if (data) {
			this.state.led = data
		}
		this.self.updateVariableValues()
		this.self.checkFeedbacks('blinkLed', 'clipLed', 'rj45Led')
		return data
	}

	async setLEDState(data: Partial<LEDResponse>): Promise<void> {
		await this.sendRequest('PUT', 'device/led', data)
		await this.getLEDState()
	}

	async getDeviceISS(): Promise<DeviceISSResponse | void> {
		const data = await this.sendRequest<DeviceISSResponse>('GET', 'device/iss', undefined, true)
		if (data) {
			this.state.deviceISS = data
			this.self.updateVariableValues()
		}
		return data
	}

	async setDeviceISS(data: Partial<DeviceISSResponse>): Promise<void> {
		const body = {
			ledDisable: data.ledDisable ?? this.state.deviceISS?.ledDisable,
			ledIntensity: data.ledIntensity ?? this.state.deviceISS?.ledIntensity,
			sleepDelay: data.sleepDelay ?? this.state.deviceISS?.sleepDelay,
			threshold: data.threshold ?? this.state.deviceISS?.threshold,
		}
		await this.sendRequest('PUT', 'device/iss', body, true)
		await this.getDeviceISS()
	}

	async getNetworkConfig(): Promise<NetworkConfig | void> {
		const data = await this.sendRequest<NetworkConfig>('GET', 'network/ipv4')
		if (data) {
			this.state.network = data
			this.self.updateVariableValues()
		}
		return data
	}

	async getEvents(): Promise<EventsResponse | void> {
		if (this.isStandby) return
		const data = await this.sendRequest<EventsResponse>('GET', 'events')
		if (data) {
			this.state.events = data
		}
		this.self.updateVariableValues()
		this.self.checkFeedbacks('bassLevel', 'tweeterLevel', 'inputLevel')
		return data
	}

	async getInputs(): Promise<AudioInputs | void> {
		const data = await this.sendRequest<AudioInputs>('GET', 'audio/inputs')
		if (data) {
			this.state.audioInputs = data
		}
		this.self.updateVariableValues()
		this.self.checkFeedbacks('inputsActive')
		return data
	}

	async setInputs(data: Partial<AudioInputs>): Promise<void> {
		await this.sendRequest('PUT', 'audio/inputs', data)
		await this.getInputs()
	}

	async getVolume(): Promise<AudioVolume | void> {
		const data = await this.sendRequest<AudioVolume>('GET', 'audio/volume')
		if (data) {
			this.state.audioVolume = data
		}
		this.self.updateVariableValues()
		this.self.checkFeedbacks('mute', 'volume')
		return data
	}

	async getAudioDelay(): Promise<AudioDelay | void> {
		const data = await this.sendRequest<AudioDelay>('GET', 'audio/delay', undefined, true)
		if (data) {
			this.state.audioDelay = data
			this.self.updateVariableValues()
		}
		return data
	}

	async getAudioSensitivity(): Promise<AudioSensitivity | void> {
		const data = await this.sendRequest<AudioSensitivity>('GET', 'audio/sensitivity', undefined, true)
		if (data) {
			this.state.audioSensitivity = data
			this.self.updateVariableValues()
		}
		return data
	}

	async setVolume(data: Partial<AudioVolume>): Promise<void> {
		if (this.isStandby) return
		//Don't wait to update variables, bypass queue would make them lag to user
		if (this.state.audioVolume && data.level !== undefined) {
			this.state.audioVolume.level = data.level
		}
		if (this.state.audioVolume && data.mute !== undefined) {
			this.state.audioVolume.mute = data.mute
		}
		this.self.updateVariableValues()
		await this.sendRequest('PUT', 'audio/volume', data)
		this.self.checkFeedbacks('mute', 'volume')
	}

	async getAoipInfo(): Promise<AoIPIdentityResponse | void> {
		const data = await this.sendRequest<AoIPIdentityResponse>('GET', 'aoip/dante/identity')
		if (data) {
			if (!data.locked) {
				data.locked = false
			}
			this.state.aoipInfo = data
			this.self.updateVariableValues()
		}
		return data
	}

	async getAoipNetworkConfig(): Promise<AoIPNetworkResponse | void> {
		const data = await this.sendRequest<AoIPNetworkResponse>('GET', 'aoip/ipv4')
		if (data) {
			this.state.aoipNetwork = data
			this.self.updateVariableValues()
		}
		return data
	}

	async getZoneConfig(): Promise<NetworkZoneResponse | void> {
		const data = await this.sendRequest<NetworkZoneResponse>('GET', 'network/zone')
		if (data) {
			this.state.zone = data
			this.self.updateVariableValues()
		}
		return data
	}

	async setZoneConfig(data: Partial<NetworkZoneResponse>): Promise<void> {
		await this.sendRequest('PUT', 'network/zone', data, true)
		await this.bootDevice()
	}

	async getProfileList(): Promise<ProfileListResponse | void> {
		const data = await this.sendRequest<ProfileListResponse>('GET', 'profile/list')
		if (data) {
			this.state.profiles = data
		}
		this.self.updateVariableValues()
		this.self.checkFeedbacks('profileSelected', 'profileStartup')
		return data
	}

	async setProfile(data: Partial<ProfileItem>): Promise<void> {
		await this.sendRequest('PUT', 'profile/restore', data)
		await this.getProfileList()
	}

	async fetchInitialInfo(): Promise<void> {
		await Promise.allSettled([
			this.getDeviceInfo(),
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
			this.getAudioSensitivity(),
			this.getAudioDelay(),
			this.getDeviceISS(),
		])
	}

	async getDeviceStates(): Promise<void> {
		await this.getPowerState()

		if (this.isStandby) return

		await Promise.allSettled([
			this.getLEDState(),
			this.getInputs(),
			this.getVolume(),
			this.getAoipInfo(),
			this.getAoipNetworkConfig(),
			this.getZoneConfig(),
			this.getProfileList(),
			this.getAudioSensitivity(),
			this.getAudioDelay(),
			this.getDeviceISS(),
		])
	}
}
