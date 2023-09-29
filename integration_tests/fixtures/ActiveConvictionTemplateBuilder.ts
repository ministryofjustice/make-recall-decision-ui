import {
  deliusLicenceConditionFreedomOfMovement,
  DeliusLicenceConditionTemplateBuilder,
} from './DeliusLicenceConditionTemplateBuilder'

export class ActiveConvictionTemplateBuilder {
  private description: string

  private custodial: boolean

  private custodialStatusCode: string

  private licenceConditions: DeliusLicenceConditionTemplateBuilder[] = []

  withDescription(description: string) {
    this.description = description
    return this
  }

  withNonCustodial() {
    this.custodial = false
    return this
  }

  withCustodial() {
    this.custodial = true
    return this
  }

  withReleasedOnLicence() {
    this.custodialStatusCode = 'B'
    return this
  }

  withNotReleasedOnLicence() {
    this.custodialStatusCode = 'A'
    return this
  }

  withLicenceCondition(licenceCondition: DeliusLicenceConditionTemplateBuilder) {
    this.licenceConditions.push(licenceCondition)
    return this
  }

  build() {
    return {
      mainOffence: { description: this.description },
      sentence: { isCustodial: this.custodial, custodialStatusCode: this.custodialStatusCode },
      licenceConditions: this.licenceConditions.map(builder => builder.build()),
    }
  }
}

export function standardActiveConvictionTemplate() {
  return new ActiveConvictionTemplateBuilder()
    .withDescription('Burglary - 05714')
    .withCustodial()
    .withReleasedOnLicence()
    .withLicenceCondition(deliusLicenceConditionFreedomOfMovement())
}

export function basicActiveConvictionTemplate() {
  return new ActiveConvictionTemplateBuilder()
    .withDescription('Burglary - 05714')
    .withCustodial()
    .withReleasedOnLicence()
}
