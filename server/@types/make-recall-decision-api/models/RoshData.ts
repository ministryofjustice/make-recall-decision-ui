/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type RoshData = {
    riskToChildren?: RoshData.riskToChildren;
    riskToPublic?: RoshData.riskToPublic;
    riskToKnownAdult?: RoshData.riskToKnownAdult;
    riskToStaff?: RoshData.riskToStaff;
    riskToPrisoners?: RoshData.riskToPrisoners;
};

export namespace RoshData {

    export enum riskToChildren {
        VERY_HIGH = 'VERY_HIGH',
        HIGH = 'HIGH',
        MEDIUM = 'MEDIUM',
        LOW = 'LOW',
        NOT_APPLICABLE = 'NOT_APPLICABLE',
    }

    export enum riskToPublic {
        VERY_HIGH = 'VERY_HIGH',
        HIGH = 'HIGH',
        MEDIUM = 'MEDIUM',
        LOW = 'LOW',
        NOT_APPLICABLE = 'NOT_APPLICABLE',
    }

    export enum riskToKnownAdult {
        VERY_HIGH = 'VERY_HIGH',
        HIGH = 'HIGH',
        MEDIUM = 'MEDIUM',
        LOW = 'LOW',
        NOT_APPLICABLE = 'NOT_APPLICABLE',
    }

    export enum riskToStaff {
        VERY_HIGH = 'VERY_HIGH',
        HIGH = 'HIGH',
        MEDIUM = 'MEDIUM',
        LOW = 'LOW',
        NOT_APPLICABLE = 'NOT_APPLICABLE',
    }

    export enum riskToPrisoners {
        VERY_HIGH = 'VERY_HIGH',
        HIGH = 'HIGH',
        MEDIUM = 'MEDIUM',
        LOW = 'LOW',
        NOT_APPLICABLE = 'NOT_APPLICABLE',
    }


}

