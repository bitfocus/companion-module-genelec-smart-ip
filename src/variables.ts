import type { CompanionVariableDefinition } from '@companion-module/base'
import type { GenelecSmartIPInstance } from './main.js'

export function UpdateVariableDefinitions(self: GenelecSmartIPInstance): void {
	const variables: CompanionVariableDefinition[] = []
	self.setVariableDefinitions(variables)
}
