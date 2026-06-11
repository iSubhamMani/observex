ALTER TABLE "shared_projects" DROP CONSTRAINT "shared_projects_projectId_projects_websiteId_fk";
--> statement-breakpoint
ALTER TABLE "shared_projects" ADD CONSTRAINT "shared_projects_projectId_projects_websiteId_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("websiteId") ON DELETE cascade ON UPDATE no action;