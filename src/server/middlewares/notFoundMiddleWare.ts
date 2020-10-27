import {Middleware, Req, Res} from "@tsed/common";
import * as Express from "express";
import {NotFound} from "ts-httpexceptions";

@Middleware()
export class NotFoundMiddleware {
    use(@Req() request: Express.Request, @Res() response: Express.Response) {
        response.status(404).json(new NotFound(`Path not found, ip: ${request.ip}`));
    }
}
