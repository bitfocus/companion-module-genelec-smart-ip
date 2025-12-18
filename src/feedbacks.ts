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
