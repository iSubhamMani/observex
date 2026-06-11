ALTER TABLE "projects" DROP CONSTRAINT "projects_owner_users_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;