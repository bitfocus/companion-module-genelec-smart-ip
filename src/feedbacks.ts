import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import { combineRgb } from '@companion-module/base'
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
			bgcolor: combineRgb(0, 200, 0),
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
			bgcolor: combineRgb(200, 0, 0),
		},
	}

	feedbacks['inputActive'] = {
		type: 'boolean',
		name: 'Input Active',
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
		description: `Enabled if the speaker is currently muted`,
		callback: async (feedback) => {
			const inputs = feedback.options.inputs

			return self.speaker?.state.audioInputs?.input === inputs
		},
		defaultStyle: {
			bgcolor: combineRgb(200, 0, 0),
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

			return requiredInputs.every((i) => currentInputs.includes(i))
		},
		defaultStyle: {
			bgcolor: combineRgb(0, 200, 0),
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
				bgcolor: combineRgb(200, 0, 0),
			},
		}
	}

	createComparisonFeedback('volume', 'Volume', () => self.speaker?.state.audioVolume?.level)
	createComparisonFeedback('bassLevel', 'Bass Level', () => self.speaker?.state.events?.bsLevel)
	createComparisonFeedback('tweeterLevel', 'Tweeter Level', () => self.speaker?.state.events?.twLevel)
	createComparisonFeedback('inputLevel', 'Input Level', () => self.speaker?.state.events?.inLevel)

	self.setFeedbackDefinitions(feedbacks)
}
