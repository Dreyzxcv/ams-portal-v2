export type IntakeStatusValue = 'open' | 'closed';

export type IntakeBanner = {
    status: IntakeStatusValue;
    batch: string;
    message: string;
};