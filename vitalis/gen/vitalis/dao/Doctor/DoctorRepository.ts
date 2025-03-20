import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface DoctorEntity {
    readonly Id: number;
    Name?: string;
    Email?: string;
    Gender?: number;
}

export interface DoctorCreateEntity {
    readonly Name?: string;
    readonly Email?: string;
    readonly Gender?: number;
}

export interface DoctorUpdateEntity extends DoctorCreateEntity {
    readonly Id: number;
}

export interface DoctorEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Email?: string | string[];
            Gender?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Email?: string | string[];
            Gender?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Gender?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Gender?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Gender?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Gender?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Gender?: number;
        };
    },
    $select?: (keyof DoctorEntity)[],
    $sort?: string | (keyof DoctorEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface DoctorEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<DoctorEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface DoctorUpdateEntityEvent extends DoctorEntityEvent {
    readonly previousEntity: DoctorEntity;
}

export class DoctorRepository {

    private static readonly DEFINITION = {
        table: "DOCTOR",
        properties: [
            {
                name: "Id",
                column: "DOCTOR_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "DOCTOR_NAME",
                type: "VARCHAR",
            },
            {
                name: "Email",
                column: "DOCTOR_EMAIL",
                type: "VARCHAR",
            },
            {
                name: "Gender",
                column: "DOCTOR_GENDER",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(DoctorRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: DoctorEntityOptions): DoctorEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): DoctorEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: DoctorCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "DOCTOR",
            entity: entity,
            key: {
                name: "Id",
                column: "DOCTOR_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: DoctorUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "DOCTOR",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "DOCTOR_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: DoctorCreateEntity | DoctorUpdateEntity): number {
        const id = (entity as DoctorUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as DoctorUpdateEntity);
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
            table: "DOCTOR",
            entity: entity,
            key: {
                name: "Id",
                column: "DOCTOR_ID",
                value: id
            }
        });
    }

    public count(options?: DoctorEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "DOCTOR"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: DoctorEntityEvent | DoctorUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("vitalis-Doctor-Doctor", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("vitalis-Doctor-Doctor").send(JSON.stringify(data));
    }
}
