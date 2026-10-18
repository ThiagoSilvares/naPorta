import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwtAuth.guard";
import { assertValidObjectId } from "../utils/isValidObjectId";
import { validateSchema } from "../utils/validateSchema";
import {
    CreateOrderRequest,
    ListOrdersQuery,
    ListOrdersResponse,
    OrderResponse,
    UpdateOrderRequest
} from "./order.interfaces";
import OrderJSONSchema from "./order.schema.json";
import OrderQueryJSONSchema from "./order.query.schema.json";
import OrderUpdateJSONSchema from "./order.update.schema.json";
import { OrdersService } from "./orders.service";

@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    async createOrder(@Body() body: unknown): Promise<OrderResponse> {
        const data = validateSchema<CreateOrderRequest>(OrderJSONSchema, body, "order.create");

        return this.ordersService.create(data);
    }

    @Get()
    async getAllOrders(@Query() query: Record<string, string>): Promise<ListOrdersResponse> {
        const params = validateSchema<ListOrdersQuery>(OrderQueryJSONSchema, query, "order.list");

        return this.ordersService.list(params);
    }

    @Patch(":orderId")
    async updateOrder(@Param("orderId") orderId: string, @Body() body: unknown): Promise<OrderResponse> {
        assertValidObjectId(orderId, "order.update");
        const data = validateSchema<UpdateOrderRequest>(OrderUpdateJSONSchema, body, "order.update");

        return this.ordersService.update(orderId, data);
    }

    @Delete(":orderId")
    @HttpCode(204)
    async deleteOrder(@Param("orderId") orderId: string): Promise<void> {
        assertValidObjectId(orderId, "order.delete");

        return this.ordersService.remove(orderId);
    }
}
