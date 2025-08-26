import type { APIRoute } from "astro"
import { db, Product } from "astro:db"

export const POST: APIRoute = async ({ request }) => {
	try {
		const formData = await request.formData()

		const name = formData.get("name")?.toString()
		const shortDescription = formData.get("shortDescription")?.toString()
		const longDescription = formData.get("longDescription")?.toString()
		const productType = formData.get("productType")?.toString()
		const providerId = formData.get("providerId")?.toString()
		const cityId = formData.get("cityId")?.toString()
		const basePriceUSD = parseFloat(formData.get("basePriceUSD")?.toString() || "0")
		const basePriceBOB = parseFloat(formData.get("basePriceBOB")?.toString() || "0")

		// Validar los datos (idealmente con Zod o similar)
		if (!name || !productType || !cityId) {
			return new Response(JSON.stringify({ error: "Faltan campos obligatorios" }), { status: 400 })
		}
		if (!providerId) {
			return new Response(JSON.stringify({ error: "Falta el ID del proveedor" }), { status: 400 })
		}

		const newProductId = crypto.randomUUID()
		console.log("Datos a insertar en Product:", { name, productType, providerId, cityId })

		const productData = {
			id: newProductId,
			name,
			shortDescription,
			longDescription,
			productType,
			providerId,
			cityId,
			basePriceUSD,
			basePriceBOB,
			isActive: true,
			creationDate: new Date(),
			lastUpdated: new Date(),
		}

		await db.insert(Product).values(productData)

		return new Response(
			JSON.stringify({ message: "Producto creado con éxito", productId: newProductId }),
			{ status: 200 }
		)
	} catch (error) {
		console.error("Error creando producto:", error)
		return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 })
	}
}
