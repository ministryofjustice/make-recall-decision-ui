/* istanbul ignore file */
/* tslint:disable */
 

export type UserAccessResponse = {
    userRestricted?: boolean;
    userExcluded?: boolean;
    userNotFound?: boolean;
    exclusionMessage?: string;
    restrictionMessage?: string;
};

