import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import { Color } from './utils.js'
import type { GenelecSmartIPInstance } from './main.js'

export function UpdateFeedbacks(self: GenelecSmartIPInstance): void {
	const feedbacks: CompanionFeedbackDefinitions = {}

	feedbacks['power'] = {
		type: 'boolean',
		name: 'Power State',
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

			if (!requiredInputs || requiredInputs.length === 0) return false
			if (!currentInputs) return false

			return requiredInputs.length === currentInputs.length && requiredInputs.every((i) => currentInputs.includes(i))
		},
		defaultStyle: {
			bgcolor: Color.genelecGreen,
		},
	}

	feedbacks['profileSelected'] = {
		type: 'boolean',
		name: 'Profile Selected',
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
		name: 'Profile Startup',
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
		name: 'Clip LED',
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
			description: `Enabled if the speaker is currently muted`,
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

	createComparisonFeedback('volume', 'Volume', () => self.speaker?.state.audioVolume?.level)
	createComparisonFeedback('bassLevel', 'Bass Level', () => self.speaker?.state.events?.bsLevel)
	createComparisonFeedback('tweeterLevel', 'Tweeter Level', () => self.speaker?.state.events?.twLevel)
	createComparisonFeedback('inputLevel', 'Input Level', () => self.speaker?.state.events?.inLevel)

	self.setFeedbackDefinitions(feedbacks)
}
