export type IntakeStatusValue = 'open' | 'closed';

export type IntakeBanner = {
    status: IntakeStatusValue;
    message: string;
};