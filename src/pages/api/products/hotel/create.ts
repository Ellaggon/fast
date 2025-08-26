import type { APIRoute } from "astro"
import { db, Hotel } from "astro:db"

export const POST: APIRoute = async ({ request }) => {
	try {
		const formData = await request.formData()
		const productId = formData.get("productId")?.toString()
		const stars = parseInt(formData.get("stars")?.toString() || "0")
		const address = formData.get("address")?.toString()
		const phone = formData.get("phone")?.toString()
		const email = formData.get("email")?.toString()
		const website = formData.get("website")?.toString()
		const checkInTime = formData.get("checkInTime")?.toString()
		const checkOutTime = formData.get("checkOutTime")?.toString()

		// Validación de los datos
		if (!productId || !stars || !checkInTime || !checkOutTime) {
			return new Response(JSON.stringify({ error: "Faltan campos obligatorios" }), { status: 400 })
		}

		// Se inserta el registro en la tabla `Hotel`
		await db.insert(Hotel).values({
			productId: productId,
			stars: stars,
			address: address,
			phone: phone || null, // Usar 'null' para campos opcionales si están vacíos
			email: email || null,
			website: website || null,
			checkInTime: checkInTime,
			checkOutTime: checkOutTime,
		})

		console.log(`Detalles del hotel para el producto ${productId} creados exitosamente.`)

		return new Response(JSON.stringify({ message: "Detalles del hotel guardados exitosamente." }), {
			status: 200,
		})
	} catch (e) {
		console.error("Error creando los detalles del hotel: ", e)
		return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 })
	}
}
