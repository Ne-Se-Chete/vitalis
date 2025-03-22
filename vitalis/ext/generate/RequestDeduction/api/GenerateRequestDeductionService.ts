import { Controller, Put } from "sdk/http";
import { tasks } from "sdk/bpm";
import { user } from "sdk/security";

@Controller
class GenerateRequestDeductionService {

    @Put("/requests/:id/approve")
    public approveRequest(_: any, ctx: any) {
        const processId = ctx.pathParameters.id;
        this.completeTask(processId, true);

        return { "message": "Request Approved" };
    }

    @Put("/requests/:id/deny")
    public declineRequest(_: any, ctx: any) {
        const processId = ctx.pathParameters.id;
        this.completeTask(processId, false);

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