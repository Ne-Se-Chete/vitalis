import { MeasurementsRepository as MeasurementsDao } from "vitalis/gen/vitalis/dao/Measurements/MeasurementsRepository";

import { Controller, Get, Put, response, request } from "sdk/http";
import { tasks } from "sdk/bpm";
import { user } from "sdk/security";

@Controller
class GenerateRequestDeductionService {
    private readonly measurementsDao;

    constructor() {
        this.measurementsDao = new MeasurementsDao();
    }

    @Get("/measurementsData/:measurementsId")
    public getMeasurementsData(_: any, ctx: any) {
        const measurementsId = ctx.pathParameters.id;

        const measurementsData = this.measurementsDao.findById(measurementsId);

        if (!measurementsData) {
            response.setStatus(response.NOT_FOUND);
            return { message: "Measurement data not found!" }
        }

        response.setStatus(response.FOUND);
        return measurementsData;
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