ALTER TABLE "shared_projects" DROP CONSTRAINT "shared_projects_projectId_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "shared_projects" ALTER COLUMN "projectId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "shared_projects" ADD CONSTRAINT "shared_projects_projectId_projects_websiteId_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("websiteId") ON DELETE no action ON UPDATE no action;