/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { VulnerabilityDetail } from './VulnerabilityDetail';

export type Vulnerabilities = {
    error?: string;
    lastUpdatedDate?: string;
    suicide?: VulnerabilityDetail;
    selfHarm?: VulnerabilityDetail;
    vulnerability?: VulnerabilityDetail;
    custody?: VulnerabilityDetail;
    hostelSetting?: VulnerabilityDetail;
};

