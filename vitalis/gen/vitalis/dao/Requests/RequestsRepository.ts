import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface RequestsEntity {
    readonly Id: number;
    Date?: Date;
    Status?: number;
    Measurements?: number;
    Description?: string;
}

export interface RequestsCreateEntity {
    readonly Status?: number;
    readonly Measurements?: number;
    readonly Description?: string;
}

export interface RequestsUpdateEntity extends RequestsCreateEntity {
    readonly Id: number;
}

export interface RequestsEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Date?: Date | Date[];
            Status?: number | number[];
            Measurements?: number | number[];
            Description?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Date?: Date | Date[];
            Status?: number | number[];
            Measurements?: number | number[];
            Description?: string | string[];
        };
        contains?: {
            Id?: number;
            Date?: Date;
            Status?: number;
            Measurements?: number;
            Description?: string;
        };
        greaterThan?: {
            Id?: number;
            Date?: Date;
            Status?: number;
            Measurements?: number;
            Description?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Date?: Date;
            Status?: number;
            Measurements?: number;
            Description?: string;
        };
        lessThan?: {
            Id?: number;
            Date?: Date;
            Status?: number;
            Measurements?: number;
            Description?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Date?: Date;
            Status?: number;
            Measurements?: number;
            Description?: string;
        };
    },
    $select?: (keyof RequestsEntity)[],
    $sort?: string | (keyof RequestsEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface RequestsEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<RequestsEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface RequestsUpdateEntityEvent extends RequestsEntityEvent {
    readonly previousEntity: RequestsEntity;
}

export class RequestsRepository {

    private static readonly DEFINITION = {
        table: "REQUESTS",
        properties: [
            {
                name: "Id",
                column: "REQUESTS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Date",
                column: "REQUESTS_DATE",
                type: "DATE",
            },
            {
                name: "Status",
                column: "REQUESTS_STATUS",
                type: "INTEGER",
            },
            {
                name: "Measurements",
                column: "REQUESTS_MEASUREMENTS",
                type: "INTEGER",
            },
            {
                name: "Description",
                column: "REQUESTS_DESCRIPTION",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(RequestsRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: RequestsEntityOptions): RequestsEntity[] {
        return this.dao.list(options).map((e: RequestsEntity) => {
            EntityUtils.setDate(e, "Date");
            return e;
        });
    }

    public findById(id: number): RequestsEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Date");
        return entity ?? undefined;
    }

    public create(entity: RequestsCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Date");
        // @ts-ignore
        (entity as RequestsEntity).Date = new Date();
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "REQUESTS",
            entity: entity,
            key: {
                name: "Id",
                column: "REQUESTS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: RequestsUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "Date");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "REQUESTS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "REQUESTS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: RequestsCreateEntity | RequestsUpdateEntity): number {
        const id = (entity as RequestsUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as RequestsUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "REQUESTS",
            entity: entity,
            key: {
                name: "Id",
                column: "REQUESTS_ID",
                value: id
            }
        });
    }

    public count(options?: RequestsEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "REQUESTS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: RequestsEntityEvent | RequestsUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("vitalis-Requests-Requests", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("vitalis-Requests-Requests").send(JSON.stringify(data));
    }
}
