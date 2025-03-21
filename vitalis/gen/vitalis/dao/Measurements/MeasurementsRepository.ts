import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface MeasurementsEntity {
    readonly Id: number;
    Patient?: number;
    Timestamp?: Date;
    Longitude?: number;
    Latitude?: number;
    ECG?: string;
    BloodOxidation?: number;
    HeartRate?: number;
}

export interface MeasurementsCreateEntity {
    readonly Patient?: number;
    readonly Longitude?: number;
    readonly Latitude?: number;
    readonly ECG?: string;
    readonly BloodOxidation?: number;
    readonly HeartRate?: number;
}

export interface MeasurementsUpdateEntity extends MeasurementsCreateEntity {
    readonly Id: number;
}

export interface MeasurementsEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Patient?: number | number[];
            Timestamp?: Date | Date[];
            Longitude?: number | number[];
            Latitude?: number | number[];
            ECG?: string | string[];
            BloodOxidation?: number | number[];
            HeartRate?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Patient?: number | number[];
            Timestamp?: Date | Date[];
            Longitude?: number | number[];
            Latitude?: number | number[];
            ECG?: string | string[];
            BloodOxidation?: number | number[];
            HeartRate?: number | number[];
        };
        contains?: {
            Id?: number;
            Patient?: number;
            Timestamp?: Date;
            Longitude?: number;
            Latitude?: number;
            ECG?: string;
            BloodOxidation?: number;
            HeartRate?: number;
        };
        greaterThan?: {
            Id?: number;
            Patient?: number;
            Timestamp?: Date;
            Longitude?: number;
            Latitude?: number;
            ECG?: string;
            BloodOxidation?: number;
            HeartRate?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Patient?: number;
            Timestamp?: Date;
            Longitude?: number;
            Latitude?: number;
            ECG?: string;
            BloodOxidation?: number;
            HeartRate?: number;
        };
        lessThan?: {
            Id?: number;
            Patient?: number;
            Timestamp?: Date;
            Longitude?: number;
            Latitude?: number;
            ECG?: string;
            BloodOxidation?: number;
            HeartRate?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Patient?: number;
            Timestamp?: Date;
            Longitude?: number;
            Latitude?: number;
            ECG?: string;
            BloodOxidation?: number;
            HeartRate?: number;
        };
    },
    $select?: (keyof MeasurementsEntity)[],
    $sort?: string | (keyof MeasurementsEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface MeasurementsEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<MeasurementsEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface MeasurementsUpdateEntityEvent extends MeasurementsEntityEvent {
    readonly previousEntity: MeasurementsEntity;
}

export class MeasurementsRepository {

    private static readonly DEFINITION = {
        table: "MEASUREMENTS",
        properties: [
            {
                name: "Id",
                column: "MEASUREMENTS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Patient",
                column: "MEASUREMENTS_PATIENT",
                type: "INTEGER",
            },
            {
                name: "Timestamp",
                column: "MEASUREMENTS_TIMESTAMP",
                type: "TIMESTAMP",
            },
            {
                name: "Longitude",
                column: "MEASUREMENTS_LONGITUDE",
                type: "DOUBLE",
            },
            {
                name: "Latitude",
                column: "MEASUREMENTS_LATITUDE",
                type: "DOUBLE",
            },
            {
                name: "ECG",
                column: "MEASUREMENTS_ECG",
                type: "VARCHAR",
            },
            {
                name: "BloodOxidation",
                column: "MEASUREMENTS_BLOODOXIDATION",
                type: "DECIMAL",
            },
            {
                name: "HeartRate",
                column: "MEASUREMENTS_HEARTRATE",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(MeasurementsRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: MeasurementsEntityOptions): MeasurementsEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): MeasurementsEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: MeasurementsCreateEntity): number {
        // @ts-ignore
        (entity as MeasurementsEntity).Timestamp = new Date();
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "MEASUREMENTS",
            entity: entity,
            key: {
                name: "Id",
                column: "MEASUREMENTS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: MeasurementsUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "MEASUREMENTS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "MEASUREMENTS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: MeasurementsCreateEntity | MeasurementsUpdateEntity): number {
        const id = (entity as MeasurementsUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as MeasurementsUpdateEntity);
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
            table: "MEASUREMENTS",
            entity: entity,
            key: {
                name: "Id",
                column: "MEASUREMENTS_ID",
                value: id
            }
        });
    }

    public count(options?: MeasurementsEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "MEASUREMENTS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: MeasurementsEntityEvent | MeasurementsUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("vitalis-Measurements-Measurements", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("vitalis-Measurements-Measurements").send(JSON.stringify(data));
    }
}
