import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { GenelecSpeaker } from './api.js'
export interface ModuleSecrets {
	password: string
}
export class GenelecSmartIPInstance extends InstanceBase<ModuleConfig, ModuleSecrets> {
	config!: ModuleConfig
	secrets!: ModuleSecrets
	speaker!: GenelecSpeaker | null

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig, _isFirstInit: boolean, secrets: ModuleSecrets): Promise<void> {
		this.config = config
		this.secrets = secrets
		this.updateStatus(InstanceStatus.Connecting)

		await this.performLogin()
		await this.speaker?.fetchInitialInfo()
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
	}

	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
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

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	async performLogin(): Promise<void> {
		if (!this.speaker) {
			const password = this.secrets?.password
			this.speaker = new GenelecSpeaker(this.config, password, this)
		}
		await this.speaker.sendRequest('GET', 'device/info')
	}
}

runEntrypoint(GenelecSmartIPInstance, UpgradeScripts)
