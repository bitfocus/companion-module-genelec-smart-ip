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

	self.setFeedbackDefinitions(feedbacks)
}
