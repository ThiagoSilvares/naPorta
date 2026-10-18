export type OrderStatus = "PENDING" | "IN_TRANSIT" | "DELIVERED" | "CANCELED";

export interface OrderCustomer {
    name: string;
    document: string;
}

export interface OrderAddress {
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
}

export interface OrderItemData {
    description: string;
    price: number;
}

export interface CreateOrderRequest {
    expectedDeliveryDate: string;
    customer: OrderCustomer;
    deliveryAddress: OrderAddress;
    items: OrderItemData[];
}

export interface UpdateOrderRequest {
    expectedDeliveryDate?: string;
    status?: OrderStatus;
    customer?: Partial<OrderCustomer>;
    deliveryAddress?: Partial<OrderAddress>;
    items?: OrderItemData[];
}

export interface ListOrdersQuery {
    number?: number;
    status?: OrderStatus;
    from?: string;
    to?: string;
    page: number;
    limit: number;
}

export interface OrderResponse {
    id: string;
    number: number;
    status: OrderStatus;
    expectedDeliveryDate: Date;
    customer: OrderCustomer;
    deliveryAddress: OrderAddress;
    items: OrderItemData[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ListOrdersResponse {
    docs: OrderResponse[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}
