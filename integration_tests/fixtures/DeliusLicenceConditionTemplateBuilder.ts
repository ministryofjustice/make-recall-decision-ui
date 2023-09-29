export class DeliusLicenceConditionTemplateBuilder {
  private description: string

  private subDescription: string

  private code: string

  private subCode: string

  private notes: string

  withDescription(description: string) {
    this.description = description
    return this
  }

  withSubDescription(subDescription: string) {
    this.subDescription = subDescription
    return this
  }

  withCode(code: string) {
    this.code = code
    return this
  }

  withSubCode(subCode: string) {
    this.subCode = subCode
    return this
  }

  withNotes(notes: string) {
    this.notes = notes
    return this
  }

  build() {
    return {
      notes: this.notes,
      mainCategory: {
        code: this.code,
        description: this.description,
      },
      subCategory: {
        code: this.subCode,
        description: this.subDescription,
      },
    }
  }
}

export function deliusLicenceConditionFreedomOfMovement() {
  return new DeliusLicenceConditionTemplateBuilder()
    .withDescription('Freedom of movement')
    .withSubDescription('On release to be escorted by police to Approved Premises')
    .withCode('NLC8')
    .withSubCode('NST30')
}

export function deliusLicenceConditionDoNotPossess() {
  return new DeliusLicenceConditionTemplateBuilder()
    .withDescription('Poss, own, control, inspect specified items /docs')
    .withSubDescription(
      'Not to own or possess more than one mobile phone or SIM card without the prior approval of your supervising officer and to provide your supervising officer with details of that mobile telephone including the IMEI number and the SIM card that you possess.'
    )
    .withCode('NLC5')
    .withSubCode('NST14')
}

export function deliusLicenceConditionParticipateOrCoOperate() {
  return new DeliusLicenceConditionTemplateBuilder()
    .withDescription('Participate or co-op with Programme or Activities')
    .withSubDescription(
      'Not to delete the usage history on any internet enabled device or computer used and to allow such items to be inspected as required by the police or your supervising officer. Such inspection may include removal of the device for inspection and the installation of monitoring software.'
    )
    .withCode('NLC4')
    .withSubCode('NST20')
}
