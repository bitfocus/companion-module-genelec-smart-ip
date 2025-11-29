import type { GenelecSmartIPInstance } from './main.js'

export function UpdateVariableDefinitions(self: GenelecSmartIPInstance): void {
	const variables = []
	self.setVariableDefinitions(variables)
}
