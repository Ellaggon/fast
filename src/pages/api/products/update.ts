import type { APIRoute } from "astro"
import { db, eq, and, Provider, Product } from "astro:db"
import { getSession } from "auth-astro/server"
import { z } from "zod"

// Definir el esquema de validación para los datos entrantes
const ProductUpdateSchema = z.object({
	productId: z.string(),
	name: z.string().min(1, "El nombre del producto es requerido."),
	shortDescription: z.string().min(1, "Una breve descripción es requerida."),
	longDescription: z.string().min(1, "Una descripción larga es requerida."),
	productType: z.enum(["Tour", "Package"]),
	basePriceUSD: z.number().min(0, "El precio no puede ser negativo."),
	basePriceBOB: z.number().min(0, "El precio no puede ser negativo."),
})

export const POST: APIRoute = async ({ request, redirect }) => {
	const session = await getSession(request)

	if (!session || !session.user?.email) {
		return new Response("Unauthorized", { status: 401 })
	}

	try {
		const formData = await request.formData()
		const data = Object.fromEntries(formData.entries())

		// 2. Parsear y validar los datos del formulario
		const validatedData = ProductUpdateSchema.parse({
			productId: data.productId,
			name: data.name,
			shortDescription: data.shortDescription,
			longDescription: data.longDescription,
			productType: data.productType,
			basePriceUSD: parseFloat(data.basePriceUSD as string),
			basePriceBOB: parseFloat(data.basePriceBOB as string),
		})

		// 3. Obtener el providerId del usuario para verificar la propiedad
		const providerResult = await db
			.select({
				id: Provider.id,
			})
			.from(Provider)
			.where(eq(Provider.userEmail, session.user?.email))
			.limit(1)

		if (providerResult.length === 0) {
			return new Response("Provider not found", { status: 404 })
		}

		const providerId = providerResult[0].id

		// 4. Verificar que el producto pertenezca al proveedor
		const product = await db
			.select()
			.from(Product)
			.where(and(eq(Product.id, validatedData.productId), eq(Product.providerId, providerId)))
			.limit(1)

		if (product.length === 0) {
			return new Response("Product not found or not owned by provider", { status: 403 })
		}

		// 5. Actualizar el producto en la base de datos
		await db
			.update(Product)
			.set({
				name: validatedData.name,
				shortDescription: validatedData.shortDescription,
				longDescription: validatedData.longDescription,
				productType: validatedData.productType,
				basePriceUSD: validatedData.basePriceUSD,
				basePriceBOB: validatedData.basePriceBOB,
				lastUpdated: new Date(),
			})
			.where(eq(Product.id, validatedData.productId))

		return redirect("/dashboard/provider")
	} catch (e) {
		console.error("Error al actualizar el producto: ", e)
		return new Response("Error al procesar la solicitud", { status: 500 })
	}
}
