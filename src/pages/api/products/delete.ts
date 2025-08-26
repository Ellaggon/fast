import type { APIRoute } from "astro"
import { db, eq, Product, Provider } from "astro:db"
import { getSession } from "auth-astro/server"

export const POST: APIRoute = async ({ request, redirect }) => {
	const session = await getSession(request)

	if (!session || !session.user?.email) {
		return new Response("Unauthorized", { status: 401 })
	}

	try {
		const { productId } = await request.json()

		if (!productId) {
			return new Response("Product ID is required", { status: 400 })
		}

		// 2. Obtener el providerId del usuario para verificar la propiedad
		const providerResult = await db
			.select()
			.from(Provider)
			.where(eq(Provider.userEmail, session.user.email))
			.limit(1)

		if (providerResult.length === 0) {
			return new Response("Provider not found", { status: 404 })
		}
		const providerId = providerResult[0].id

		// 3. Verificar que el producto pertenezca al proveedor
		const product = await db
			.select()
			.from(Product)
			.where(eq(Product.id, productId))
			.where(eq(Product.providerId, providerId))
			.limit(1)

		if (product.length === 0) {
			return new Response("Product not found or not owned by provider", { status: 403 })
		}

		// 4. Eliminar el producto de la base de datos
		await db.delete(Product).where(eq(Product.id, productId))

		// 5. Redirigir al panel del proveedor
		return redirect("/dashboard/provider")
	} catch (e) {
		console.error("Error al eliminar el producto: ", e)
		return new Response("Error al procesar la solicitud", { status: 500 })
	}
}
