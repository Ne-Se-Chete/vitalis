import { response } from "sdk/http";
export class HttpUtils {
    // HTTP 200
    static sendResponseOk(entity) {
        HttpUtils.sendResponse(200, entity);
    }
    // HTTP 201
    static sendResponseCreated(entity) {
        HttpUtils.sendResponse(201, entity);
    }
    // HTTP 204
    static sendResponseNoContent() {
        HttpUtils.sendResponse(204);
    }
    // HTTP 400
    static sendResponseBadRequest(message) {
        HttpUtils.sendResponse(400, {
            "code": 400,
            "message": message
        });
    }
    // HTTP 403
    static sendForbiddenRequest(message) {
        HttpUtils.sendResponse(403, {
            "code": 403,
            "message": message
        });
    }
    // HTTP 404
    static sendResponseNotFound(message) {
        HttpUtils.sendResponse(404, {
            "code": 404,
            "message": message
        });
    }
    // HTTP 500
    static sendInternalServerError(message) {
        HttpUtils.sendResponse(500, {
            "code": 500,
            "message": message
        });
    }
    // Generic
    static sendResponse(status, body) {
        response.setContentType("application/json");
        response.setStatus(status);
        if (body) {
            response.println(JSON.stringify(body));
        }
    }
}
