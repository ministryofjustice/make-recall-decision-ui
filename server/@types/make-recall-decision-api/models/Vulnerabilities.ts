/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { VulnerabilityDetail } from './VulnerabilityDetail';

export interface Vulnerabilities extends Record<string, any> {
    error?: string;
    lastUpdatedDate?: string;
    suicide?: VulnerabilityDetail;
    selfHarm?: VulnerabilityDetail;
    vulnerability?: VulnerabilityDetail;
    custody?: VulnerabilityDetail;
    hostelSetting?: VulnerabilityDetail;
}
