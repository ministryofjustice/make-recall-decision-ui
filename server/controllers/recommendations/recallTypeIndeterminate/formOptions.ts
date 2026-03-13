export const recallTypeIndeterminate = [
  { value: 'EMERGENCY', text: 'Emergency recall' },
  { value: 'NO_RECALL', text: 'No recall' },
]

export const recallTypeIndeterminateFTR56 = [
  { value: 'EMERGENCY', text: 'Emergency standard recall' },
  { value: 'NO_RECALL', text: 'No recall - send a decision not to recall letter' },
]

// valid values to send to MRD API for the recallType property
export const recallTypeIndeterminateApi = [
  { value: 'STANDARD', text: 'Standard recall' },
  { value: 'NO_RECALL', text: 'No recall' },
]
