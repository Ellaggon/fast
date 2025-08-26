import type { APIRoute } from "astro"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { r2 } from "@/lib/r2"

export const POST: APIRoute = async ({ request }) => {
	try {
		if (!process.env.R2_BUCKET_NAME) {
			//si no hay nombre
			throw new Error("R2_BUCKET_NAME is not defined")
		}

		const formData = await request.formData()
		const files = formData.getAll("file") as File[] | null

		console.log("files: ", files)
		if (!files || files.length === 0) {
			// si no hay archivo
			throw new Error("No file provided")
		}

		for (const file of files) {
			const contentType = file.type
			if (!contentType.startsWith("image/")) {
				// si el archivo no es imagen
				throw new Error("Only image files are allowed")
			}
		}

		const signedUrls = await Promise.all(
			files.map(async (file) => {
				const uuid = crypto.randomUUID()
				const fileName = uuid
				const signedUrl = await getSignedUrl(
					// creamos la firma URL para cada file
					r2,
					new PutObjectCommand({
						Bucket: process.env.R2_BUCKET_NAME,
						Key: uuid,
						ContentType: file.type,
					}),
					{ expiresIn: 60 }
				)
				return { fileName, signedUrl }
			})
		)

		return new Response(JSON.stringify({ url: signedUrls }), {
			headers: { "Content-Type": "application/json" },
		})
	} catch (err) {
		console.error("Error genereting signed URLs", err)
		if (err instanceof Error) {
			return new Response(
				JSON.stringify({ error: "Error generating signed URL", details: err.message }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				}
			)
		} else {
			return new Response(
				JSON.stringify({ error: "Unknown error", details: "An unknown error occurred" }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				}
			)
		}
	}
}
