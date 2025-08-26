import { uploadFiles } from "@/lib/dropFiles"

export const uploadFilesToR2 = async () => {
	if (!uploadFiles) return

	const formData = new FormData()
	Array.from(uploadFiles).forEach((file) => {
		formData.append("file", file)
	})

	const response = await fetch("/api/createSigned", {
		method: "POST",
		body: formData,
	})

	if (!response.ok) {
		const errorText = await response.text()
		console.error("Error response from server:", errorText)
		return
	}

	const { url } = await response.json()
	console.log("res: ", url)

	if (!url || !Array.isArray(url)) {
		console.error("Error: La respuesta del servidor no contiene 'publicUrls'")
		return []
	}
	const signedUrls = await Promise.all(
		url.map(
			async ({ fileName, signedUrl }: { fileName: string; signedUrl: string }, index: number) => {
				const file = uploadFiles ? uploadFiles[index] : null
				if (!file) return
				await fetch(signedUrl, {
					method: "PUT",
					body: file,
				})
				console.log(`Archivo ${fileName} subido exitosamente.`)

				const publicUrl = `https://pub-de0b5a27b1424d99afa6c7b2fe2f02dc.r2.dev/${fileName}`
				return publicUrl
			}
		)
	)
	return signedUrls
}
