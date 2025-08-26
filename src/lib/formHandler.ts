import { dropFiles, uploadFiles } from "@/lib/dropFiles"
import { uploadFilesToR2 } from "@/lib/uploadFilesToR2"
import { formSchema, type FieldName } from "@/schemas/formSchema"

export function initializeFormHandlers() {
	document.addEventListener("DOMContentLoaded", () => {
		dropFiles("dropZone", "imageUpload", "imagePreview", "imageText")

		const schema = formSchema // validations schema

		document
			.querySelectorAll(
				"#publicationForm input, #publicationForm textarea, #publicationForm select"
			)
			.forEach((field) => {
				field.addEventListener("input", (e) => {
					const input = e?.target as HTMLInputElement | HTMLTextAreaElement
					const fieldName = input.name as FieldName
					let value: unknown = input.value

					if (fieldName === "imageUpload" && uploadFiles) {
						value = Array.from(uploadFiles).map((file) => ({
							name: file.name,
							size: file.size,
							type: file.type,
						}))
					}

					if (fieldName === "price") {
						value = parseFloat(input.value)
					}

					const validation = schema.safeParse({ [fieldName]: value })
					const errorElement = document.querySelector(`[data-error-for="${fieldName}"]`)

					if (errorElement) {
						const fieldErrors = validation.success
							? null
							: validation.error.formErrors.fieldErrors[fieldName]
						errorElement.textContent = fieldErrors ? fieldErrors[0] : ""
					}
				})
			})

		document.getElementById("publicationForm")?.addEventListener("submit", async (e) => {
			e.preventDefault()

			const formData = new FormData(e.target as HTMLFormElement)
			const formObject = Object.fromEntries(formData.entries())

			const parsedFormObject = {
				...formObject,
				price: formObject.price ? Number(formObject.price) : null,
				imageUpload: Array.from(uploadFiles || []).map((file) => ({
					name: file.name,
					size: file.size,
					type: file.type,
				})),
			}

			const validation = schema.safeParse(parsedFormObject)

			if (validation.success) {
				const publicUrls = await uploadFilesToR2()
				console.log("publicUrls: ", publicUrls)

				if (!publicUrls || publicUrls.length === 0) {
					console.error("Images could not be uploaded")
					return
				}
				formData.append("signedUrls", JSON.stringify(publicUrls))

				try {
					const res = await fetch("/api/uploadFormToDB", {
						method: "POST",
						body: formData,
					})
					if (res.ok) {
						const result = await res.json()
						console.log("result: ", result)
						window.location.href = "/posts/page/1"
					} else {
						const errorText = await res.text()
						console.error("Error in server response: ", errorText)
					}
				} catch (e) {
					console.error("Error sending request", e)
				}
				alert("Publicación creada con exito!")
			} else {
				const fieldErrors = validation.error.formErrors.fieldErrors as Record<FieldName, string[]>
				Object.keys(fieldErrors).forEach((key) => {
					const fieldName = key as FieldName
					const errorElement = document.querySelector(`[data-error-for="${fieldName}"]`)
					if (errorElement) {
						errorElement.textContent = fieldErrors[fieldName]?.[0] || ""
					}
				})
			}
		})
	})
}

initializeFormHandlers()
