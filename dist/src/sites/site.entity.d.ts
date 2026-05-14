export declare enum ConnectionType {
    FH = "fh",
    FO = "fo",
    BOTH = "both"
}
export declare class Site {
    id: number;
    name: string;
    code: string;
    address: string;
    city: string;
    country: string;
    postal_code: string;
    phone: string;
    technical_contact: string;
    technical_email: string;
    description: string;
    status: string;
    capacity: number;
    notes: string;
    latitude: number;
    longitude: number;
    connection_type: ConnectionType;
    created_at: Date;
    updated_at: Date;
}
