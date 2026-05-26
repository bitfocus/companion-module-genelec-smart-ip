import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import { Color } from './utils.js'
import type { GenelecSmartIPInstance } from './main.js'

export function UpdateFeedbacks(self: GenelecSmartIPInstance): void {
	const feedbacks: CompanionFeedbackDefinitions = {}
	const isMulticastMode = self.config.mode === 'multicast'

	function createComparisonFeedback(feedbackId: string, name: string, getCurrentValue: () => number | undefined): void {
		feedbacks[feedbackId] = {
			type: 'boolean',
			name: name,
			options: [
				{
					type: 'dropdown',
					id: 'comparison',
					label: 'Comparison',
					default: 'equal',
					choices: [
						{ id: 'equal', label: 'Equal to' },
						{ id: 'greater', label: 'Greater than' },
						{ id: 'less', label: 'Less than' },
					],
				},
				{
					type: 'textinput',
					id: 'value',
					label: 'Value',
					default: '0',
				},
			],
			description: `Enabled if ${name.toLowerCase()} matches the selected comparison`,
			callback: async (feedback) => {
				const comparison = feedback.options.comparison
				const value = feedback.options.value
				const currentValue = getCurrentValue()
				if (comparison === 'equal') {
					return currentValue === Number(value)
				} else if (comparison === 'greater') {
					return currentValue !== undefined && currentValue > Number(value)
				} else if (comparison === 'less') {
					return currentValue !== undefined && currentValue < Number(value)
				}
				return false
			},
			defaultStyle: {
				bgcolor: Color.red,
			},
		}
	}

	if (!isMulticastMode) {
		feedbacks['power'] = {
			type: 'boolean',
			name: 'Active Power State',
			options: [],
			description: `Enabled if the speaker is currently in the active power state`,
			callback: async () => {
				return self.speaker?.state.power?.state === 'ACTIVE'
			},
			defaultStyle: {
				bgcolor: Color.genelecGreen,
			},
		}

		feedbacks['mute'] = {
			type: 'boolean',
			name: 'Mute State',
			options: [],
			description: `Enabled if the speaker is currently muted`,
			callback: async () => {
				return self.speaker?.state.audioVolume?.mute === true
			},
			defaultStyle: {
				bgcolor: Color.red,
			},
		}

		feedbacks['inputsActive'] = {
			type: 'boolean',
			name: 'Inputs Active',
			description: 'Enabled if all of the selected inputs are active',
			options: [
				{
					type: 'multidropdown',
					id: 'inputs',
					label: 'Inputs',
					default: ['AoIP01', 'AoIP02'],
					choices: [
						{ id: 'A', label: 'Analog' },
						{ id: 'AoIP01', label: 'AoIP 01' },
						{ id: 'AoIP02', label: 'AoIP 02' },
					],
				},
			],
			callback: async (feedback) => {
				const requiredInputs = feedback.options.inputs as string[]
				const currentInputs = self.speaker?.state.audioInputs?.input

				if (!currentInputs) return false

				return requiredInputs.length === currentInputs.length && requiredInputs.every((i) => currentInputs.includes(i))
			},
			defaultStyle: {
				bgcolor: Color.genelecGreen,
			},
		}

		feedbacks['profileSelected'] = {
			type: 'boolean',
			name: 'Current Profile',
			description: 'Enabled if the selected profile is currently active',
			options: [
				{
					type: 'dropdown',
					id: 'profile',
					label: 'Profile',
					default: 0,
					choices: [
						{ id: 0, label: 'Default Profile' },
						{ id: 1, label: 'Profile 1' },
						{ id: 2, label: 'Profile 2' },
						{ id: 3, label: 'Profile 3' },
						{ id: 4, label: 'Profile 4' },
						{ id: 5, label: 'Profile 5' },
					],
				},
			],
			callback: async (feedback) => {
				return self.speaker?.state.profiles?.selected === feedback.options.profile
			},
			defaultStyle: {
				bgcolor: Color.genelecGreen,
			},
		}

		feedbacks['profileStartup'] = {
			type: 'boolean',
			name: 'Selected Startup Profile',
			description: 'Enabled if the selected profile is set as the startup profile',
			options: [
				{
					type: 'dropdown',
					id: 'profile',
					label: 'Profile',
					default: 0,
					choices: [
						{ id: 0, label: 'Default Profile' },
						{ id: 1, label: 'Profile 1' },
						{ id: 2, label: 'Profile 2' },
						{ id: 3, label: 'Profile 3' },
						{ id: 4, label: 'Profile 4' },
						{ id: 5, label: 'Profile 5' },
					],
				},
			],
			callback: async (feedback) => {
				return self.speaker?.state.profiles?.startup === feedback.options.profile
			},
			defaultStyle: {
				bgcolor: Color.genelecGreen,
			},
		}

		feedbacks['clipLed'] = {
			type: 'boolean',
			name: 'Clip LED Enabled',
			options: [],
			description: `Enabled if the clip LED is currently on`,
			callback: async () => {
				return self.speaker?.state.led?.hideClip === false
			},
			defaultStyle: {
				bgcolor: Color.genelecGreen,
			},
		}

		feedbacks['rj45Led'] = {
			type: 'boolean',
			name: 'RJ45 LED',
			options: [],
			description: `Enabled if the RJ45 LED is currently on`,
			callback: async () => {
				return self.speaker?.state.led?.rj45Leds === true
			},
			defaultStyle: {
				bgcolor: Color.genelecGreen,
			},
		}

		createComparisonFeedback('volume', 'Volume', () => self.speaker?.state.audioVolume?.level)
		createComparisonFeedback('bassLevel', 'Bass Level', () => self.speaker?.state.events?.bsLevel)
		createComparisonFeedback('tweeterLevel', 'Tweeter Level', () => self.speaker?.state.events?.twLevel)
		createComparisonFeedback('inputLevel', 'Input Level', () => self.speaker?.state.events?.inLevel)
		createComparisonFeedback('sleepDelay', 'Sleep Delay', () => self.speaker?.state.deviceISS?.sleepDelay)
		createComparisonFeedback('sleepThreshold', 'Sleep Threshold', () => self.speaker?.state.deviceISS?.threshold)
		createComparisonFeedback(
			'sleepLedIntensity',
			'Sleep LED Intensity',
			() => self.speaker?.state.deviceISS?.ledIntensity,
		)
	}

	if (isMulticastMode) {
		// Zone Multicast Feedbacks
		feedbacks['zoneMute'] = {
			type: 'boolean',
			name: 'Zone Mute State',
			options: [],
			description: `Enabled if the multicast zone was last sent a mute command`,
			callback: async () => {
				return self.multicastState.mute === true
			},
			defaultStyle: {
				bgcolor: Color.red,
			},
		}

		createComparisonFeedback('zoneVolume', 'Zone Volume', () => self.multicastState.level)

		feedbacks['zoneProfile'] = {
			type: 'boolean',
			name: 'Zone Current Profile',
			description: 'Enabled if the selected profile matches the last multicast profile command',
			options: [
				{
					type: 'dropdown',
					id: 'profile',
					label: 'Profile',
					default: 0,
					choices: [
						{ id: 0, label: 'Default Profile' },
						{ id: 1, label: 'Profile 1' },
						{ id: 2, label: 'Profile 2' },
						{ id: 3, label: 'Profile 3' },
						{ id: 4, label: 'Profile 4' },
						{ id: 5, label: 'Profile 5' },
					],
				},
			],
			callback: async (feedback) => {
				return self.multicastState.profile === feedback.options.profile
			},
			defaultStyle: {
				bgcolor: Color.genelecGreen,
			},
		}

		feedbacks['zonePower'] = {
			type: 'boolean',
			name: 'Zone Power State',
			options: [],
			description: `Enabled if the multicast zone was last sent a wake command`,
			callback: async () => {
				return self.multicastState.power === 'BOOT'
			},
			defaultStyle: {
				bgcolor: Color.genelecGreen,
			},
		}
	}
	self.setFeedbackDefinitions(feedbacks)
}
