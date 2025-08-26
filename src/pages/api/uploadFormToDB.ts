import type { APIRoute } from "astro"
import { db, eq, NOW, Publication, User } from "astro:db"
import { getSession } from "auth-astro/server"

export const POST: APIRoute = async ({ request }) => {
	const session = await getSession(request)
	const userEmail = session?.user?.email

	let userId: string | undefined

	try {
		if (!userEmail) {
			throw new Error("Email is required to fetch the user ID")
		}
		const result = await db.select({ id: User.id }).from(User).where(eq(User.email, userEmail))

		userId = result[0]?.id
	} catch (e) {
		console.error("Error fetchin user ID", e)
		return new Response(
			JSON.stringify({
				message: "Error fetching user ID",
				error: e instanceof Error ? e.message : e,
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		)
	}

	if (!userEmail) {
		return new Response(JSON.stringify({ message: "User not authenticated" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		})
	}
	console.log(userId)

	if (request.method === "POST") {
		try {
			const uid = crypto.randomUUID()

			const formData = await request.formData()
			const title = formData.get("title")
			const description = formData.get("description")
			const vehicle_type_id = formData.get("vehicle_type_id")
			const price = Number(formData.get("price"))
			const city_id = formData.get("city_id")

			const signedUrls = formData.get("signedUrls")
			const parsedUrls = signedUrls ? JSON.parse(signedUrls as string) : []
			if (
				typeof title === "string" &&
				typeof description === "string" &&
				typeof vehicle_type_id === "string" &&
				!isNaN(price) &&
				typeof city_id === "string" &&
				Array.isArray(parsedUrls)
			) {
				await db.insert(Publication).values({
					id: uid,
					title,
					description,
					images: parsedUrls,
					published: NOW,
					price,
					vehicle_type_id,
					city_id,
					user_id: userId,
				})
				return new Response(JSON.stringify({ message: "Publicacion creada con exito" }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				})
			} else {
				return new Response(JSON.stringify({ message: "Invalid form data" }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				})
			}
		} catch (e) {
			console.error("Error en el servidor", e)
			return new Response(
				JSON.stringify({
					message: "An unexpected error has ocurred",
					error: e instanceof Error ? e.message : e,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				}
			)
		}
	} else {
		return new Response("Method not allowed", {
			status: 405,
			headers: { "Content-Type": "application/json" },
		})
	}
}
