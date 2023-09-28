import { ActiveConvictionTemplateBuilder } from './ActiveConvictionTemplateBuilder'

export class CaseTemplateBuilder {
  private personalDetailsOverview = {
    name: 'Charles Edwin',
    dateOfBirth: '1980-07-24',
    age: 41,
    gender: 'Male',
    crn: 'X430109',
  }

  private hasAllConvictionsReleasedOnLicence = true

  private activeConvictions: ActiveConvictionTemplateBuilder[] = []

  private cvlLicence = null

  withActiveConviction(activeConvictionTemplate: ActiveConvictionTemplateBuilder) {
    this.activeConvictions.push(activeConvictionTemplate)
    return this
  }

  withCvlLicence() {
    this.cvlLicence = {
      licenceStatus: 'ACTIVE',
      conditionalReleaseDate: '2022-06-10',
      actualReleaseDate: '2022-06-11',
      sentenceStartDate: '2022-06-12',
      sentenceEndDate: '2022-06-13',
      licenceStartDate: '2022-06-14',
      licenceExpiryDate: '2022-06-15',
      topupSupervisionStartDate: '2022-06-16',
      topupSupervisionExpiryDate: '2022-06-17',
      standardLicenceConditions: [
        {
          code: '9ce9d594-e346-4785-9642-c87e764bee37',
          text: 'This is a standard licence condition',
          expandedText: null as string,
          category: null as string,
        },
      ],
      additionalLicenceConditions: [
        {
          code: '9ce9d594-e346-4785-9642-c87e764bee39',
          text: 'This is an additional licence condition',
          expandedText: 'Expanded additional licence condition',
          category: 'Freedom of movement',
        },
      ],
      bespokeConditions: [
        {
          code: '9ce9d594-e346-4785-9642-c87e764bee45',
          text: 'This is a bespoke condition',
          expandedText: null as string,
          category: null as string,
        },
      ],
    }
    return this
  }

  withNoCvlLicence() {
    this.cvlLicence = null
    return this
  }

  withNoBespokeConditions() {
    this.cvlLicence.bespokeConditions = []
    return this
  }

  withNoAdditionalCvlLicenceConditions() {
    this.cvlLicence.additionalLicenceConditions = []
    return this
  }

  withAllConvictionsReleasedOnLicence() {
    this.hasAllConvictionsReleasedOnLicence = true
    return this
  }

  withAllConvictionsNotReleasedOnLicence() {
    this.hasAllConvictionsReleasedOnLicence = false
    return this
  }

  build() {
    return {
      sectionId: 'licence-conditions',
      statusCode: 200,
      response: {
        personalDetailsOverview: this.personalDetailsOverview,
        hasAllConvictionsReleasedOnLicence: this.hasAllConvictionsReleasedOnLicence,
        activeConvictions: this.activeConvictions.map(builder => builder.build()),
        cvlLicence: this.cvlLicence,
      },
    }
  }
}

export function caseTemplate() {
  return new CaseTemplateBuilder()
}
