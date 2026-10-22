export type CertificateRow = {
    id: number;
    name: string;
    username: string;
    status: string | null;
    certificate: {
        id: number;
        status: 'pending' | 'issued' | 'revoked';
        number: string | null;
        issued_at: string | null;
        has_file: boolean;
        mime: string | null;
    } | null;
};