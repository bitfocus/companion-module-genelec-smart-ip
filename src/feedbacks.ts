import { combineRgb } from '@companion-module/base'
import type { GenelecSmartIPInstance } from './main.js'

export function UpdateFeedbacks(self: GenelecSmartIPInstance): void {
	const feedbacks = {}
	self.setFeedbackDefinitions(feedbacks)
}
