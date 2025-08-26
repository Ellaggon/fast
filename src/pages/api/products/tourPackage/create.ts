import type { APIRoute } from "astro"
import { db, Product, Tour, Package } from "astro:db"

export const POST: APIRoute = async ({ request }) => {
	try {
		const formData = await request.formData()
		const name = formData.get("name")?.toString()
		const cityId = formData.get("cityId")?.toString()
		const shortDescription = formData.get("shortDescription")?.toString()
		const longDescription = formData.get("longDescription")?.toString()
		const basePriceUSD = parseFloat(formData.get("basePriceUSD")?.toString() || "0")
		const basePriceBOB = parseFloat(formData.get("basePriceBOB")?.toString() || "0")
		const productType = formData.get("productType")?.toString()
		const providerId = formData.get("providerId")?.toString()

		if (!productType || !cityId || basePriceUSD <= 0) {
			return new Response(JSON.stringify({ error: "Faltan campos obligatorios" }), { status: 400 })
		}
		if (!providerId) {
			return new Response(JSON.stringify({ error: "Falta el ID del proveedor" }), { status: 400 })
		}

		const newProductId = crypto.randomUUID()

		// 1. Guardar en la tabla `Product`
		await db.insert(Product).values({
			id: newProductId,
			name,
			shortDescription: shortDescription || null,
			longDescription: longDescription || null,
			productType,
			cityId,
			basePriceUSD,
			basePriceBOB,
			providerId,
		})

		// 2. Guardar en la tabla específica (`Tour` o `Package`)
		if (productType === "tour") {
			const duration = formData.get("duration")?.toString()
			const difficultyLevel = formData.get("difficultyLevel")?.toString()
			const guideLanguagesStr = formData.get("guideLanguages")?.toString()
			const guideLanguages = guideLanguagesStr
				? guideLanguagesStr.split(",").map((lang) => lang.trim())
				: []
			const includes = formData.get("includes")?.toString()
			const excludes = formData.get("excludes")?.toString()

			await db.insert(Tour).values({
				productId: newProductId,
				duration: duration || null,
				difficultyLevel: difficultyLevel || null,
				guideLanguages: guideLanguages as any, // Astro DB handles JSON arrays
				includes: includes || null,
				excludes: excludes || null,
			})
		} else if (productType === "package") {
			const itinerary = formData.get("itinerary")?.toString()
			const days = parseInt(formData.get("days")?.toString() || "0")
			const nights = parseInt(formData.get("nights")?.toString() || "0")

			await db.insert(Package).values({
				productId: newProductId,
				itinerary: itinerary || null,
				days: days || null,
				nights: nights || null,
			})
		}

		return new Response(
			JSON.stringify({
				message: `Producto de tipo ${productType} creado con exito`,
				productId: newProductId,
			}),
			{ status: 200 }
		)
	} catch (e) {
		console.error("Error al crear el tour o paquete: ", e)
		return new Response(JSON.stringify({ error: `Error interno del servidor.` }), { status: 500 })
	}
}
