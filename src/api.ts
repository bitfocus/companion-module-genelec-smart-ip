import PQueue from 'p-queue'
import { GenelecSmartIPInstance } from './main.js'
import type { ModuleConfig, ModuleSecrets } from './config.js'
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

interface RequestOptions {
	apiPath?: boolean
	highPriority?: boolean
}

export class GenelecSpeaker {
	private readonly config: ModuleConfig
	private readonly user: string
	private readonly password: string
	private readonly self: GenelecSmartIPInstance
	private authHeader: string | null = null
	private queue = new PQueue({ concurrency: 1 })
	private pendingVolumeUpdate = false

	public state: SystemState = {}

	constructor(config: ModuleConfig, secrets: ModuleSecrets, self: GenelecSmartIPInstance) {
		this.config = config
		this.user = config.user
		this.password = secrets.password
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
		options?: RequestOptions,
	): Promise<T | void> {
		// Commands (PUT/POST/DELETE) and explicitly flagged reads jump ahead of background polls
		const priority = options?.highPriority || type !== 'GET' ? 1 : 0
		return this.queue.add(
			async () => {
				const response = await this._executeRequest<T>(type, endpoint, content, options?.apiPath)
				// Throttle between poll requests only — commands don't need the delay
				if (priority === 0) {
					await new Promise((resolve) => setTimeout(resolve, 100))
				}
				return response
			},
			{ priority },
		)
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
		} catch (error: unknown) {
			const errorCode =
				(error instanceof Error ? (error.cause as { code?: string } | undefined)?.code : undefined) ?? 'Unknown error'
			if (errorCode === 'EHOSTDOWN' || errorCode === 'ECONNREFUSED' || errorCode === 'ETIMEDOUT') {
				this.self.log('debug', url)
				this.self.updateStatus(InstanceStatus.ConnectionFailure, `${errorCode}`)
				if (this.self.lastStatus !== InstanceStatus.ConnectionFailure) {
					this.self.log('warn', `Unable to connect to device ${errorCode}`)
				}
			} else {
				const message = error instanceof Error ? error.message : String(error)
				this.self.log('debug', `Unable to connect to device: ${message} ${errorCode} ${url}`)
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
		if (contentLength && parseInt(contentLength, 10) > 0) {
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

	async getPowerState(highPriority = false): Promise<DevicePowerResponse | void> {
		const wasStandby = this.isStandby
		const data = await this.sendRequest<DevicePowerResponse>('GET', 'device/pwr', undefined, { highPriority })
		if (data) {
			this.state.power = data
			if (wasStandby && !this.isStandby) {
				this.self.log('info', 'Device transitioned from standby to active, re-fetching initial info')
				void this.fetchInitialInfo()
			}
		}

		this.self.updateVariableValues()
		this.self.checkFeedbacks('power')
		return data
	}

	async setPowerState(data: Partial<DevicePowerResponse>): Promise<void> {
		await this.sendRequest('PUT', 'device/pwr', data)
		setTimeout(() => {
			void this.getPowerState(true)
		}, 1000)
	}

	async bootDevice(): Promise<void> {
		await this.sendRequest<void>('PUT', 'device/boot', { boot: true }, { apiPath: true })
	}

	async getLEDState(highPriority = false): Promise<LEDResponse | void> {
		const data = await this.sendRequest<LEDResponse>('GET', 'device/led', undefined, { highPriority })
		if (data) {
			this.state.led = data
		}
		this.self.updateVariableValues()
		this.self.checkFeedbacks('blinkLed', 'clipLed', 'rj45Led')
		return data
	}

	async setLEDState(data: Partial<LEDResponse>): Promise<void> {
		await this.sendRequest('PUT', 'device/led', data)
		await this.getLEDState(true)
	}

	async getDeviceISS(highPriority = false): Promise<DeviceISSResponse | void> {
		const data = await this.sendRequest<DeviceISSResponse>('GET', 'device/iss', undefined, {
			apiPath: true,
			highPriority,
		})
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
		await this.sendRequest('PUT', 'device/iss', body, { apiPath: true })
		await this.getDeviceISS(true)
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

	async getInputs(highPriority = false): Promise<AudioInputs | void> {
		const data = await this.sendRequest<AudioInputs>('GET', 'audio/inputs', undefined, { highPriority })
		if (data) {
			this.state.audioInputs = data
		}
		this.self.updateVariableValues()
		this.self.checkFeedbacks('inputsActive')
		return data
	}

	async setInputs(data: Partial<AudioInputs>): Promise<void> {
		await this.sendRequest('PUT', 'audio/inputs', data)
		await this.getInputs(true)
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
		const data = await this.sendRequest<AudioDelay>('GET', 'audio/delay', undefined, { apiPath: true })
		if (data) {
			this.state.audioDelay = data
			this.self.updateVariableValues()
		}
		return data
	}

	async getAudioSensitivity(): Promise<AudioSensitivity | void> {
		const data = await this.sendRequest<AudioSensitivity>('GET', 'audio/sensitivity', undefined, { apiPath: true })
		if (data) {
			this.state.audioSensitivity = data
			this.self.updateVariableValues()
		}
		return data
	}

	async setVolume(data: Partial<AudioVolume>): Promise<void> {
		if (this.isStandby) return
		if (this.state.audioVolume && data.level !== undefined) {
			this.state.audioVolume.level = data.level
		}
		if (this.state.audioVolume && data.mute !== undefined) {
			this.state.audioVolume.mute = data.mute
		}
		this.self.updateVariableValues()
		this.self.checkFeedbacks('mute', 'volume')

		if (data.level !== undefined) {
			// Coalesce rapid level changes: if a volume request is already queued, the
			// optimistic state update above is enough — the pending request reads the
			// latest level from state at execution time, so no extra request is needed.
			if (this.pendingVolumeUpdate) return
			this.pendingVolumeUpdate = true
			await this.queue.add(
				async () => {
					await this._executeRequest('PUT', 'audio/volume', { level: this.state.audioVolume?.level })
					this.pendingVolumeUpdate = false
				},
				{ priority: 1 },
			)
		} else {
			await this.sendRequest('PUT', 'audio/volume', data)
		}
	}

	async getAoipInfo(): Promise<AoIPIdentityResponse | void> {
		const data = await this.sendRequest<AoIPIdentityResponse>('GET', 'aoip/dante/identity')
		if (data) {
			data.locked ??= false
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
		await this.sendRequest('PUT', 'network/zone', data, { apiPath: true })
		await this.bootDevice()
	}

	async getProfileList(highPriority = false): Promise<ProfileListResponse | void> {
		const data = await this.sendRequest<ProfileListResponse>('GET', 'profile/list', undefined, { highPriority })
		if (data) {
			this.state.profiles = data
		}
		this.self.updateVariableValues()
		this.self.checkFeedbacks('profileSelected', 'profileStartup')
		return data
	}

	async setProfile(data: Partial<ProfileItem>): Promise<void> {
		await this.sendRequest('PUT', 'profile/restore', data)
		await this.getProfileList(true)
	}

	async fetchInitialInfo(): Promise<void> {
		this.self.log('debug', 'Fetching initial info')
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
