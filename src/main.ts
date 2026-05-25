import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig, type ModuleSecrets } from './config.js'

import { UpdateActions } from './actions.js'
import { UpdatePresets } from './presets.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdateVariableDefinitions, UpdateVariableValues } from './variables.js'
import { UpgradeScripts } from './upgrades.js'

import { GenelecSpeaker } from './api.js'
import { GenelecMulticast } from './multicast.js'
import { MulticastState, SystemState } from './types.js'

export class GenelecSmartIPInstance extends InstanceBase<ModuleConfig, ModuleSecrets> {
	config!: ModuleConfig
	secrets!: ModuleSecrets
	speaker!: GenelecSpeaker | null
	multicast: GenelecMulticast | null = null
	multicastState: MulticastState = {}
	deviceStatesInterval: NodeJS.Timeout | null = null
	eventInterval: NodeJS.Timeout | null = null
	reconnectInterval: NodeJS.Timeout | null = null
	previousState: SystemState = {}
	public lastStatus: InstanceStatus = InstanceStatus.Disconnected

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig, _isFirstInit: boolean, secrets: ModuleSecrets): Promise<void> {
		this.config = config
		this.secrets = secrets
		this.updateStatus(InstanceStatus.Connecting)

		if (this.config.mode === 'multicast') {
			// Multicast mode: multicast only, no unicast speaker
			if (!this.config.multicastIp || !this.config.multicastPort) {
				this.updateStatus(InstanceStatus.BadConfig, 'Multicast IP and Port required for multicast mode')
				return
			}
			this.initMulticast()
			this.multicastState = {
				level: -130,
				mute: false,
				profile: 0,
				power: 'BOOT',
			}
			this.updateStatus(InstanceStatus.Ok)
		} else {
			// Individual mode: unicast speaker + optional multicast
			if (!this.config.bonjourHost && !this.config.customHost) {
				this.updateStatus(InstanceStatus.BadConfig)
				return
			}
			setImmediate(() => {
				void this.performLogin()
			})
		}

		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
		this.updatePresets()
	}

	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
		if (this.speaker) {
			this.speaker = null
		}
		if (this.multicast) {
			this.multicast.destroy()
			this.multicast = null
		}
		if (this.deviceStatesInterval) {
			clearInterval(this.deviceStatesInterval)
		}
		if (this.eventInterval) {
			clearInterval(this.eventInterval)
		}
		if (this.reconnectInterval) {
			clearInterval(this.reconnectInterval)
		}
	}

	async configUpdated(config: ModuleConfig, secrets: ModuleSecrets): Promise<void> {
		this.config = config
		this.secrets = secrets
		if (this.speaker) {
			this.speaker = null
		}
		if (this.multicast) {
			this.multicast.destroy()
			this.multicast = null
		}
		await this.init(config, false, secrets)
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	updateVariableValues(): void {
		UpdateVariableValues(this)
	}

	syncMulticastStateFromSpeaker(): void {
		if (!this.speaker) {
			this.multicastState = { level: -130, mute: false, profile: 0, power: 'BOOT' }
			return
		}

		const state = this.speaker.state
		this.multicastState = {
			level: state.audioVolume?.level ?? -130,
			mute: state.audioVolume?.mute ?? false,
			profile: state.profiles?.selected ?? 0,
			power: state.power?.state === 'STANDBY' ? 'STANDBY' : 'BOOT',
		}
		this.log('debug', `Synced multicast state from speaker: ${JSON.stringify(this.multicastState)}`)
		this.updateVariableValues()
		this.checkFeedbacks('zoneMute', 'zoneProfile', 'zonePower')
	}

	initMulticast(): void {
		if (this.multicast) {
			this.multicast.destroy()
		}

		const multicastIp = this.config.multicastIp
		const multicastPort = this.config.multicastPort

		if (multicastIp && multicastPort) {
			this.multicast = new GenelecMulticast(multicastIp, multicastPort, this)
			this.log('debug', `Multicast initialized: ${multicastIp}:${multicastPort}`)
		} else {
			this.log('debug', 'Multicast not configured, skipping multicast init')
		}
	}

	async performLogin(): Promise<void> {
		if (!this.speaker) {
			this.speaker = new GenelecSpeaker(this.config, this.secrets, this)
		}
		const deviceInfo = await this.speaker.getDeviceInfo()
		if (deviceInfo) {
			if (this.reconnectInterval) {
				clearInterval(this.reconnectInterval)
				this.reconnectInterval = null
			}
			this.updateStatus(InstanceStatus.Ok)
			await this.speaker?.fetchInitialInfo()
			this.pollDeviceStates()
			this.pollEvents()
		} else {
			this.stopPolling()
			this.reconnectPoll()
		}
	}

	stopPolling(): void {
		if (this.deviceStatesInterval) {
			clearInterval(this.deviceStatesInterval)
			this.deviceStatesInterval = null
		}
		if (this.eventInterval) {
			clearInterval(this.eventInterval)
			this.eventInterval = null
		}
	}

	reconnectPoll(): void {
		if (this.reconnectInterval) return
		this.log('info', 'Starting reconnection poll...')
		this.reconnectInterval = setInterval(() => {
			void this.performLogin()
		}, 10000)
	}

	pollDeviceStates(): void {
		if (!this.speaker) return
		if (this.deviceStatesInterval) {
			clearInterval(this.deviceStatesInterval)
		}
		this.deviceStatesInterval = setInterval(() => {
			void this.speaker?.getDeviceStates()
			this.updateVariableValues()
		}, 5000)
	}

	pollEvents(): void {
		if (!this.speaker) return
		if (this.eventInterval) {
			clearInterval(this.eventInterval)
		}
		this.eventInterval = setInterval(() => {
			void this.speaker?.getEvents()
			this.updateVariableValues()
		}, 1000)
	}

	updateStatus(status: InstanceStatus, message?: string | null): void {
		this.lastStatus = status
		super.updateStatus(status, message)
	}
}

runEntrypoint(GenelecSmartIPInstance, UpgradeScripts)
