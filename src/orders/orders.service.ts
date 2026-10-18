import { Injectable } from "@nestjs/common";
import { Order, Prisma } from "@prisma/client";
import { ApiException } from "../exceptions/api.exception";
import { PrismaService } from "../prisma/prisma.service";
import Logger from "../services/loggers/logger.service";
import { normalizeDate } from "../utils/normalizeDate";
import {
    CreateOrderRequest,
    ListOrdersQuery,
    ListOrdersResponse,
    OrderResponse,
    UpdateOrderRequest
} from "./order.interfaces";

@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService) { }

    private format(order: Order): OrderResponse {
        return {
            id: order.id,
            number: order.number,
            status: order.status,
            expectedDeliveryDate: order.expectedDeliveryDate,
            customer: order.customer,
            deliveryAddress: order.deliveryAddress,
            items: order.items,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        };
    }

    private async getNextNumber(): Promise<number> {
        const counter = await this.prisma.counter.upsert({
            where: { id: "order" },
            create: { id: "order", seq: 1 },
            update: { seq: { increment: 1 } }
        }).catch(error => {
            const executionException = new ApiException({
                exceptionType: "FatalError",
                message: "Error occurred when tried to connect on database to generate the order number."
            });
            Logger.error({
                event: "order.create",
                message: `${executionException.exceptionType} - ${executionException.message}`,
                content: { filter: { id: "order" }, error }
            });
            throw executionException;
        });

        return counter.seq;
    }

    async create(data: CreateOrderRequest): Promise<OrderResponse> {
        const number = await this.getNextNumber();

        const query: Prisma.OrderCreateInput = {
            number,
            expectedDeliveryDate: new Date(data.expectedDeliveryDate),
            customer: data.customer,
            deliveryAddress: { ...data.deliveryAddress, complement: data.deliveryAddress.complement ?? null },
            items: data.items,
            deletedAt: null
        };

        const newOrder = await this.prisma.order.create({ data: query }).catch(error => {
            const executionException = new ApiException({
                exceptionType: "FatalError",
                message: "Error occurred when tried to connect on database to create an order."
            });
            Logger.error({
                event: "order.create",
                message: `${executionException.exceptionType} - ${executionException.message}`,
                content: { filter: {}, query, error }
            });
            throw executionException;
        });

        return this.format(newOrder);
    }

    async list(params: ListOrdersQuery): Promise<ListOrdersResponse> {
        const { number, status, from, to, page, limit } = params;

        const normalizedFrom = normalizeDate(from ?? null, "start", "order.list");
        const normalizedTo = normalizeDate(to ?? null, "end", "order.list");

        if (normalizedFrom && normalizedTo && normalizedFrom > normalizedTo) {
            const executionException = new ApiException({
                exceptionType: "ValidationError",
                message: "Parameter 'from' must be <= 'to'."
            });
            Logger.warn({
                event: "order.list",
                message: `${executionException.exceptionType} - ${executionException.message}`,
                content: { from, to }
            });
            throw executionException;
        }

        const filter: Prisma.OrderWhereInput = { deletedAt: null };

        if (number) filter.number = number;
        if (status) filter.status = status;
        if (normalizedFrom || normalizedTo) {
            filter.createdAt = {
                ...(normalizedFrom ? { gte: normalizedFrom } : {}),
                ...(normalizedTo ? { lte: normalizedTo } : {})
            };
        }

        const [total, orders] = await Promise.all([
            this.prisma.order.count({ where: filter }),
            this.prisma.order.findMany({
                where: filter,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit
            })
        ]).catch(error => {
            const executionException = new ApiException({
                exceptionType: "FatalError",
                message: "Error occurred when tried to connect on database and retrieve orders."
            });
            Logger.error({
                event: "order.list",
                message: `${executionException.exceptionType} - ${executionException.message}`,
                content: { filter, error }
            });
            throw executionException;
        });

        return {
            docs: orders.map(order => this.format(order)),
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        };
    }

    async update(orderId: string, data: UpdateOrderRequest): Promise<OrderResponse> {
        const filter = { id: orderId, deletedAt: null };

        const order = await this.prisma.order.findFirst({ where: filter }).catch(error => {
            const executionException = new ApiException({
                exceptionType: "FatalError",
                message: "Error occurred when tried to connect on database and find an order."
            });
            Logger.error({
                event: "order.update",
                message: `${executionException.exceptionType} - ${executionException.message}`,
                content: { filter, error }
            });
            throw executionException;
        });

        if (!order) {
            const executionException = new ApiException({
                exceptionType: "NotFoundError",
                message: `Can't find order with provided id: ${orderId}`
            });
            Logger.warn({
                event: "order.update",
                message: `${executionException.exceptionType} - ${executionException.message}`
            });
            throw executionException;
        }

        const query: Prisma.OrderUpdateInput = {
            ...(data.expectedDeliveryDate ? { expectedDeliveryDate: new Date(data.expectedDeliveryDate) } : {}),
            ...(data.status ? { status: data.status } : {}),
            ...(data.customer ? { customer: { set: { ...order.customer, ...data.customer } } } : {}),
            ...(data.deliveryAddress ? { deliveryAddress: { set: { ...order.deliveryAddress, ...data.deliveryAddress } } } : {}),
            ...(data.items ? { items: { set: data.items } } : {})
        };

        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: query
        }).catch(error => {
            const executionException = new ApiException({
                exceptionType: "FatalError",
                message: `Error occurred when tried to connect on database and update order ${orderId}`
            });
            Logger.error({
                event: "order.update",
                message: `${executionException.exceptionType} - ${executionException.message}`,
                content: { filter: { id: orderId }, query, error }
            });
            throw executionException;
        });

        return this.format(updatedOrder);
    }

    async remove(orderId: string): Promise<void> {
        const filter = { id: orderId, deletedAt: null };

        const result = await this.prisma.order.updateMany({
            where: filter,
            data: { deletedAt: new Date() }
        }).catch(error => {
            const executionException = new ApiException({
                exceptionType: "FatalError",
                message: "Error occurred when tried to connect on database and delete an order."
            });
            Logger.error({
                event: "order.delete",
                message: `${executionException.exceptionType} - ${executionException.message}`,
                content: { filter, error }
            });
            throw executionException;
        });

        if (result.count === 0) {
            const executionException = new ApiException({
                exceptionType: "NotFoundError",
                message: `Couldn't find an order with orderId: ${orderId}.`
            });
            Logger.warn({
                event: "order.delete",
                message: `${executionException.exceptionType} - ${executionException.message}`,
                content: { _id: orderId }
            });
            throw executionException;
        }
    }
}
