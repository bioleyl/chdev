import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1750454400000 implements MigrationInterface {
  name = 'CreateInitialTables1750454400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user_entity table
    await queryRunner.query(`
      CREATE TABLE "user_entity" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "email" varchar NOT NULL UNIQUE,
        "password" varchar NOT NULL,
        "role" varchar NOT NULL DEFAULT 'VIEWER',
        "createdAt" datetime NOT NULL,
        "updatedAt" datetime NOT NULL
      )
    `);

    // Create client_entity table
    await queryRunner.query(`
      CREATE TABLE "client_entity" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "companyName" varchar,
        "email" varchar,
        "phone" varchar,
        "address" varchar,
        "zipCode" integer,
        "city" varchar,
        "country" varchar,
        "notes" text,
        "totalBilled" real NOT NULL DEFAULT 0,
        "createdAt" datetime NOT NULL,
        "updatedAt" datetime NOT NULL
      )
    `);

    // Create prestation_entity table
    await queryRunner.query(`
      CREATE TABLE "prestation_entity" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "label" varchar NOT NULL,
        "description" text,
        "unitPrice" real NOT NULL,
        "unit" varchar NOT NULL DEFAULT 'U',
        "createdAt" datetime NOT NULL,
        "updatedAt" datetime NOT NULL
      )
    `);

    // Create invoice_entity table
    await queryRunner.query(`
      CREATE TABLE "invoice_entity" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "number" varchar NOT NULL UNIQUE,
        "clientId" integer,
        "status" varchar NOT NULL DEFAULT 'draft',
        "total" real NOT NULL DEFAULT 0,
        "createdAt" datetime NOT NULL,
        "updatedAt" datetime NOT NULL,
        CONSTRAINT "FK_invoice_client" FOREIGN KEY ("clientId") REFERENCES "client_entity" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    // Create invoice_line_entity table
    await queryRunner.query(`
      CREATE TABLE "invoice_line_entity" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "invoiceId" integer NOT NULL,
        "prestationId" integer NOT NULL,
        "quantity" real NOT NULL,
        "unitPrice" real NOT NULL,
        "description" text,
        "createdAt" datetime NOT NULL,
        "updatedAt" datetime NOT NULL,
        CONSTRAINT "FK_invoice_line_invoice" FOREIGN KEY ("invoiceId") REFERENCES "invoice_entity" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_invoice_line_prestation" FOREIGN KEY ("prestationId") REFERENCES "prestation_entity" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "invoice_line_entity"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoice_entity"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "prestation_entity"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "client_entity"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_entity"`);
  }
}
