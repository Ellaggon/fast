import { deleteObjectFromR2 } from "@/lib/r2"
import { db, eq, Publication } from "astro:db"

export async function POST({ request }: { request: Request }) {
	try {
		const { id } = await request.json() // Recibimos el ID de la publicación

		if (!id) {
			return new Response(
				JSON.stringify({
					error: "ID de publicación requerido",
				}),
				{
					status: 400,
				}
			)
		}

		const publications = await db.select().from(Publication).where(eq(Publication.id, id))

		if (publications.length === 0) {
			return new Response(
				JSON.stringify({
					error: "Publicacion no encontrada",
				}),
				{
					status: 404,
				}
			)
		}
		console.log(publications)

		const publication = publications[0]

		if (publication.images && Array.isArray(publication.images)) {
			const bucketName = "first-step"

			for (const imageUrl of publication.images) {
				const objectKey = imageUrl.split("/").pop()

				if (objectKey) {
					await deleteObjectFromR2(bucketName, objectKey)
				}
			}
		}

		await db.delete(Publication).where(eq(Publication.id, id))

		return new Response(JSON.stringify({ success: true }), { status: 200 })
	} catch (e) {
		console.error("Error eliminando publicación: ", e)
		return new Response(
			JSON.stringify({
				error: "Error al eliminar publicación",
			}),
			{
				status: 500,
			}
		)
	}
}
