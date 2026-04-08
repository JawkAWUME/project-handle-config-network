import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1775652442507 implements MigrationInterface {
    name = 'InitialSchema1775652442507'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'agent', 'viewer')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'viewer', "department" character varying, "phone" character varying, "is_active" boolean NOT NULL DEFAULT true, "email_verified_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sites" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "code" character varying, "address" character varying, "city" character varying, "country" character varying, "postal_code" character varying, "phone" character varying, "technical_contact" character varying, "technical_email" character varying, "description" text, "status" character varying, "capacity" integer, "notes" text, "latitude" numeric(10,8), "longitude" numeric(11,8), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4f5eccb1dfde10c9170502595a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."configuration_histories_change_type_enum" AS ENUM('create', 'update', 'backup', 'restore', 'auto_backup', 'manual_backup')`);
        await queryRunner.query(`CREATE TABLE "configuration_histories" ("id" SERIAL NOT NULL, "device_type" character varying(255), "device_id" integer, "configuration" text, "configuration_file" text, "config_size" integer, "config_checksum" character varying(64), "user_id" integer, "change_type" "public"."configuration_histories_change_type_enum", "notes" text, "restored_from" integer, "ip_address" character varying(45), "change_summary" text, "pre_change_config" text, "post_change_config" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e9db3aae97229629259f1b49da6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."access_logs_action_enum" AS ENUM('login', 'logout', 'view', 'create', 'update', 'delete', 'backup', 'restore', 'export')`);
        await queryRunner.query(`CREATE TYPE "public"."access_logs_result_enum" AS ENUM('success', 'failed', 'denied')`);
        await queryRunner.query(`CREATE TABLE "access_logs" ("id" SERIAL NOT NULL, "user_id" integer, "session_id" character varying(255), "ip_address" character varying(45), "user_agent" text, "url" text, "method" character varying(10), "action" "public"."access_logs_action_enum", "device_type" character varying(50), "device_id" integer, "parameters" json, "response_code" integer, "response_time" double precision, "result" "public"."access_logs_result_enum", "error_message" text, "referrer" text, "country" character varying(100), "city" character varying(100), "latitude" numeric(10,8), "longitude" numeric(11,8), "isp" character varying(255), "browser" character varying(50), "platform" character varying(50), "device_family" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_73016a99e25b421f7bca271ca86" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."firewalls_firewall_type_enum" AS ENUM('palo_alto', 'fortinet', 'checkpoint', 'cisco_asa', 'other')`);
        await queryRunner.query(`CREATE TABLE "firewalls" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "site_id" integer, "user_id" integer, "firewall_type" "public"."firewalls_firewall_type_enum", "brand" character varying, "model" character varying, "ip_nms" character varying, "ip_service" character varying, "vlan_nms" integer, "vlan_service" integer, "username" character varying, "password" character varying, "enable_password" character varying, "configuration" text, "configuration_file" text, "security_policies" json, "nat_rules" json, "vpn_configuration" json, "licenses" json, "firmware_version" character varying, "serial_number" character varying, "asset_tag" character varying, "status" boolean NOT NULL DEFAULT true, "high_availability" boolean NOT NULL DEFAULT false, "ha_peer_id" integer, "monitoring_enabled" boolean NOT NULL DEFAULT false, "last_backup" TIMESTAMP, "security_policies_count" integer, "cpu" integer, "memory" integer, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dd8dcbfd87fdff9d4c3469ee22d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "routers" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "site_id" integer, "user_id" integer, "brand" character varying, "model" character varying, "interfaces" json, "interfaces_count" integer, "interfaces_up_count" integer, "routing_protocols" json, "management_ip" character varying, "ip_nms" character varying, "ip_service" character varying, "vlan_nms" integer, "vlan_service" integer, "username" character varying, "password" character varying, "enable_password" character varying, "configuration" text, "configuration_file" text, "operating_system" character varying, "serial_number" character varying, "asset_tag" character varying, "status" boolean NOT NULL DEFAULT true, "last_backup" TIMESTAMP, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "interfaces_config" text, CONSTRAINT "PK_b6d283f1e40d4942dedbc0cb27a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "switches" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "site_id" integer, "user_id" integer, "brand" character varying(100), "model" character varying(100), "firmware_version" character varying(100), "serial_number" character varying(100), "asset_tag" character varying(100), "ip_nms" character varying(45), "ip_service" character varying(45), "vlan_nms" integer, "vlan_service" integer, "username" character varying(255), "password" character varying(255), "ports_total" integer NOT NULL DEFAULT '0', "ports_used" integer NOT NULL DEFAULT '0', "port_config" text, "configuration" text, "last_backup" TIMESTAMP, "status" boolean NOT NULL DEFAULT true, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_62b5d31b1b12565cbbd0fff2957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "configuration_histories" ADD CONSTRAINT "FK_6fa87af2a8086e6bbcfae0b235b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "configuration_histories" ADD CONSTRAINT "FK_0dbaa194da88eeff4d2862a4652" FOREIGN KEY ("restored_from") REFERENCES "configuration_histories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "access_logs" ADD CONSTRAINT "FK_7760024cf1cc6b657ce8b1133fa" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "firewalls" ADD CONSTRAINT "FK_0e71bfc377de9fe7542955f4c26" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "firewalls" ADD CONSTRAINT "FK_fd4dba606451f62bb41c4d63adb" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "routers" ADD CONSTRAINT "FK_ee85ea84e7d4d74de7e6932e988" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "routers" ADD CONSTRAINT "FK_2042f6c37daad8d742da2f5cb55" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "switches" ADD CONSTRAINT "FK_696bdbae7462b82fbbc849e260d" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "switches" ADD CONSTRAINT "FK_773733d2285bcefa750acb10a69" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "switches" DROP CONSTRAINT "FK_773733d2285bcefa750acb10a69"`);
        await queryRunner.query(`ALTER TABLE "switches" DROP CONSTRAINT "FK_696bdbae7462b82fbbc849e260d"`);
        await queryRunner.query(`ALTER TABLE "routers" DROP CONSTRAINT "FK_2042f6c37daad8d742da2f5cb55"`);
        await queryRunner.query(`ALTER TABLE "routers" DROP CONSTRAINT "FK_ee85ea84e7d4d74de7e6932e988"`);
        await queryRunner.query(`ALTER TABLE "firewalls" DROP CONSTRAINT "FK_fd4dba606451f62bb41c4d63adb"`);
        await queryRunner.query(`ALTER TABLE "firewalls" DROP CONSTRAINT "FK_0e71bfc377de9fe7542955f4c26"`);
        await queryRunner.query(`ALTER TABLE "access_logs" DROP CONSTRAINT "FK_7760024cf1cc6b657ce8b1133fa"`);
        await queryRunner.query(`ALTER TABLE "configuration_histories" DROP CONSTRAINT "FK_0dbaa194da88eeff4d2862a4652"`);
        await queryRunner.query(`ALTER TABLE "configuration_histories" DROP CONSTRAINT "FK_6fa87af2a8086e6bbcfae0b235b"`);
        await queryRunner.query(`DROP TABLE "switches"`);
        await queryRunner.query(`DROP TABLE "routers"`);
        await queryRunner.query(`DROP TABLE "firewalls"`);
        await queryRunner.query(`DROP TYPE "public"."firewalls_firewall_type_enum"`);
        await queryRunner.query(`DROP TABLE "access_logs"`);
        await queryRunner.query(`DROP TYPE "public"."access_logs_result_enum"`);
        await queryRunner.query(`DROP TYPE "public"."access_logs_action_enum"`);
        await queryRunner.query(`DROP TABLE "configuration_histories"`);
        await queryRunner.query(`DROP TYPE "public"."configuration_histories_change_type_enum"`);
        await queryRunner.query(`DROP TABLE "sites"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
