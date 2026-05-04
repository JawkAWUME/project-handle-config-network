import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddConnectionTypeToEquipment1746315700000 implements MigrationInterface {
  name = 'AddConnectionTypeToEquipment1746315700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const enumValues = ['fh', 'fo', 'both'];

    // Switches
    await queryRunner.addColumn(
      'switches',
      new TableColumn({
        name: 'connection_type',
        type: 'enum',
        enum: enumValues,
        isNullable: true,
      })
    );

    // Routers
    await queryRunner.addColumn(
      'routers',
      new TableColumn({
        name: 'connection_type',
        type: 'enum',
        enum: enumValues,
        isNullable: true,
      })
    );

    // Firewalls
    await queryRunner.addColumn(
      'firewalls',
      new TableColumn({
        name: 'connection_type',
        type: 'enum',
        enum: enumValues,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('switches', 'connection_type');
    await queryRunner.dropColumn('routers', 'connection_type');
    await queryRunner.dropColumn('firewalls', 'connection_type');
  }
}