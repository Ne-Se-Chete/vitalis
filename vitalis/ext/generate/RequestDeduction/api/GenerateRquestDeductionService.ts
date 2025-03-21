import { Controller, Get, Put, response, request } from "sdk/http";
import { tasks } from "sdk/bpm";
import { user } from "sdk/security";

@Controller
class GenerateRequestDeductionService {

    @Get("/leaveRequestData/:leaveRequestId")
    public leaveRequestData(_: any, ctx: any) {
        const leaveRequestId = ctx.pathParameters.leaveRequestId;

        const leaveRequest = this.leaveRequestDao.findById(leaveRequestId);

        const employee = this.employeeDao.findAll({
            $filter: {
                equals: {
                    Id: leaveRequest.Employee
                }
            }
        });

        const currentYear = new Date().getFullYear();

        const leaveBalances = this.leaveBalanceDao.findAll({
            $filter: {
                equals: {
                    Employee: leaveRequest.Employee
                },
                greaterThanOrEqual: { Year: currentYear - 2 },
                greaterThan: { Balance: 0 },
            }
        });

        const deductionsCount = this.leaveDeductionDao.count();

        const remainingLeave = leaveBalances.reduce((sum, lb) => sum + lb.Balance, 0);
        const startDate = new Date(leaveRequest.StartDate);
        const endDate = new Date(leaveRequest.EndDate);
        const domain = request.getServerName() + ":" + request.getServerPort();

        return {
            "LeaveRequest": leaveRequest,
            "Employee": employee[0].Name,
            "StartDate": startDate.toLocaleDateString(),
            "EndDate": endDate.toLocaleDateString(),
            "RemainingLeave": remainingLeave,
            "LeaveBalances": leaveBalances,
            "DeductionsCount": deductionsCount,
            "Domain": domain
        };

    }

    @Put("/requests/:id/approve")
    public approveRequest(_: any, ctx: any) {
        const processId = ctx.pathParameters.id;
        this.completeTask(processId, true);

        response.setStatus(response.OK);
        return { message: "Request Approved" };
    }

    @Put("/requests/:id/deny")
    public declineRequest(_: any, ctx: any) {
        const processId = ctx.pathParameters.id;
        this.completeTask(processId, false);

        response.setStatus(response.OK);
        return { message: "Request Denied" };
    }

    private completeTask(processId: string, approved: boolean) {

        const task = tasks.list().filter(task => task.data.processInstanceId === processId);

        const variables = {
            Approver: user.getName(),
            RequestApproved: approved
        };

        tasks.complete(task[0].data.id.toString(), variables);
    }


}