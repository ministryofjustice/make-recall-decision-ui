const standardLicenceConditions = (newStandardLicenceConditions: boolean) => {
  const conditions = [
    {
      id: 1,
      value: 'GOOD_BEHAVIOUR',
      text: newStandardLicenceConditions
        ? 'Behave well in a way that supports the purpose of you being on licence, and do not commit any crime.'
        : 'Be of good behaviour and not behave in a way which undermines the purpose of the licence period',
    },
    {
      id: 2,
      value: 'NO_OFFENCE',
      text: 'Not commit any offence',
    },
    {
      id: 3,
      value: 'KEEP_IN_TOUCH',
      text: newStandardLicenceConditions
        ? 'Keep in touch and meet with your supervising officer in the way they tell you to. This includes meeting them where you live.'
        : 'Keep in touch with the supervising officer in accordance with instructions given by the supervising officer',
    },
    {
      id: 4,
      value: 'SUPERVISING_OFFICER_VISIT',
      text: 'Receive visits from the supervising officer in accordance with instructions given by the supervising officer',
    },
    {
      id: 5,
      value: 'ADDRESS_APPROVED',
      text: newStandardLicenceConditions
        ? 'Get permission from your supervising officer to stay at an address and if you want to stay somewhere else for one or more nights.'
        : 'Reside permanently at an address approved by the supervising officer and obtain the prior permission of the supervising officer for any stay of one or more nights at a different address',
    },
    {
      id: 6,
      value: 'NO_WORK_UNDERTAKEN',
      text: newStandardLicenceConditions
        ? 'Tell your supervising officer about any new work, or a type of work, you want to do. Get their approval before you start this work'
        : 'Not undertake work, or a particular type of work, unless it is approved by the supervising officer and notify the supervising officer in advance of any proposal to undertake work or a particular type of work',
    },
    {
      id: 7,
      value: 'NO_TRAVEL_OUTSIDE_UK',
      text: newStandardLicenceConditions
        ? 'Get permission from your supervising officer if you want to leave the United Kingdom, Isle of Man or the Channel Islands. This does not apply if you are being deported or removed for immigration purposes.'
        : 'Not travel outside the United Kingdom, the Channel Islands or the Isle of Man except with the prior permission of your supervising officer or for the purposes of immigration deportation or removal',
    },
    {
      id: 8,
      value: 'NAME_CHANGE',
      text: newStandardLicenceConditions
        ? 'Tell your supervising officer about any names you use that are different to the names on this licence.'
        : 'Tell your supervising officer if you use a name which is different to the name or names which appear on your licence',
    },
    {
      id: 9,
      value: 'CONTACT_DETAILS',
      text: newStandardLicenceConditions
        ? 'Inform your supervising officer if your contact details change. For example, your phone number or email address.'
        : 'Tell your supervising officer if you change or add any contact details, including phone number or email',
    },
  ]

  if (newStandardLicenceConditions) {
    conditions.push({
      id: 10,
      value: 'PASSPORT_DETAILS',
      text: 'Get permission from your supervising officer if you want to apply for a new passport. If requested, tell your supervising officer about any passports you have already.',
    })
  }

  return conditions
}

export default standardLicenceConditions
