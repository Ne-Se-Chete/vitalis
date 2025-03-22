import { Controller, Put, response } from "sdk/http";
import { tasks } from "sdk/bpm";
import { user } from "sdk/security";

@Controller
class GenerateRequestDeductionService {

    @Put("/requests/:id/approve")
    public approveRequest(_: any, ctx: any) {
        const processId = ctx.pathParameters.id;
        this.completeTask(processId, true);

        // response.setStatus(response.OK);
        // response.json({ "message": "Request Approved" })
        return { "message": "Request Approved" };
    }

    @Put("/requests/:id/deny")
    public declineRequest(_: any, ctx: any) {
        const processId = ctx.pathParameters.id;
        this.completeTask(processId, false);

        // response.setStatus(response.OK);
        // response.json({ "message": "Request Denied" })
        return { "message": "Request Denied" };
    }

    private completeTask(processId: string, approved: boolean) {

        const task = tasks.list().filter(task => task.data.processInstanceId === processId);

        const variables = {
            "Approver": user.getName(),
            "RequestApproved": approved
        };

        tasks.complete(task[0].data.id.toString(), variables);
    }
}