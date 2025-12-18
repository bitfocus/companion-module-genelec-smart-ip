import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'

import { UpdateActions } from './actions.js'
import { UpdatePresets } from './presets.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdateVariableDefinitions, UpdateVariableValues } from './variables.js'
import { UpgradeScripts } from './upgrades.js'

import { GenelecSpeaker } from './api.js'
import { SystemState } from './types.js'

export interface ModuleSecrets {
	password: string
}
export class GenelecSmartIPInstance extends InstanceBase<ModuleConfig, ModuleSecrets> {
	config!: ModuleConfig
	secrets!: ModuleSecrets
	speaker!: GenelecSpeaker | null
	deviceStatesInterval: NodeJS.Timeout | null = null
	eventInterval: NodeJS.Timeout | null = null
	previousState: SystemState = {}
	public lastStatus: InstanceStatus = InstanceStatus.Disconnected

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig, _isFirstInit: boolean, secrets: ModuleSecrets): Promise<void> {
		this.config = config
		this.secrets = secrets
		this.updateStatus(InstanceStatus.Connecting)
		if (!this.config.bonjourHost && !this.config.customHost) {
			this.updateStatus(InstanceStatus.BadConfig)
			return
		}
		setImmediate(() => {
			void this.performLogin()
		})
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
		if (this.deviceStatesInterval) {
			clearInterval(this.deviceStatesInterval)
		}
		if (this.eventInterval) {
			clearInterval(this.eventInterval)
		}
	}

	async configUpdated(config: ModuleConfig, secrets: ModuleSecrets): Promise<void> {
		this.config = config
		this.secrets = secrets
		if (this.speaker) {
			this.speaker = null
		}
		await this.performLogin()
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

	async performLogin(): Promise<void> {
		if (!this.speaker) {
			const password = this.secrets?.password
			this.speaker = new GenelecSpeaker(this.config, password, this)
		}
		const deviceInfo = await this.speaker.getDeviceInfo()
		if (deviceInfo) {
			this.updateStatus(InstanceStatus.Ok)
			await this.speaker?.fetchInitialInfo()

			this.pollDeviceStates()
			this.pollEvents()
		} else {
			this.updateStatus(InstanceStatus.Disconnected)
		}
	}

	pollDeviceStates(): void {
		if (!this.speaker) return
		if (this.deviceStatesInterval) {
			clearInterval(this.deviceStatesInterval)
		}
		this.deviceStatesInterval = setInterval(() => {
			void this.speaker?.getDeviceStates()
			UpdateVariableValues(this)
		}, 10000)
	}

	pollEvents(): void {
		if (!this.speaker) return
		if (this.eventInterval) {
			clearInterval(this.eventInterval)
		}
		this.eventInterval = setInterval(() => {
			void this.speaker?.getEvents()
			UpdateVariableValues(this)
		}, 1000)
	}

	updateStatus(status: InstanceStatus, message?: string | null): void {
		this.lastStatus = status
		super.updateStatus(status, message)
	}
}

runEntrypoint(GenelecSmartIPInstance, UpgradeScripts)
