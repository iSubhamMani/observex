CREATE TABLE "shared_projects" (
	"shareToken" varchar(255) PRIMARY KEY NOT NULL,
	"projectId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shared_projects" ADD CONSTRAINT "shared_projects_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;