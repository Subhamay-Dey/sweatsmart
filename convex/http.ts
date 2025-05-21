import { httpRouter } from "convex/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET as string;

        if (!webhookSecret) {
            throw new Error("Clerk Webhook secret is missing!");
        }

        const svix_id = request.headers.get("svix-id");
        const svix_signature = request.headers.get("svix-signature");
        const svix_timestamp = request.headers.get("svix-timestamp");

        if (!svix_id || !svix_signature || !svix_timestamp) {
            return new Response("Svix headers are missing!", {
                status: 400,
            });
        }

        const payload = await request.json();
        const body = JSON.stringify(payload);
        const webhook = new Webhook(webhookSecret);
        let event: WebhookEvent;

        try {
            event = webhook.verify(body,{
                "svix-id": svix_id,
                "svix-signature": svix_signature,
                "svix-timestamp": svix_timestamp
            }) as WebhookEvent;
        } catch (error) {
            console.error("Error verifying webhook:", error);
            return new Response("Invalid webhook signature", {
                status: 401,
            });
        }

        const eventType = event.type;

        if(eventType === "user.created") {
            const {id, first_name, last_name, image_url, email_addresses} = event.data;
            const email = email_addresses[0].email_address;
            const name = `${first_name || ""} ${last_name || ""}`.trim();

            try {
                await ctx.runMutation(api.users.syncUser, {
                    name: name,
                    email: email,
                    image: image_url,
                    clerkId: id,
                })
            } catch (error) {
                console.log("Error creating user:", error);
                return new Response("Error creating user", { status: 500 })
            }
        }

        return new Response("Webhook processed successfully", { status: 200 });
    })
});

export default http;