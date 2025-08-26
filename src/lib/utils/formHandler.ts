export function initializeFormHandler() {
	document.addEventListener("DOMContentLoaded", () => {
		const forms = document.querySelectorAll("form[data-form-type]")
		if (forms.length === 0) return

		forms.forEach((form) => {
			form.addEventListener("submit", (e) => {
				e.preventDefault()
				const formType = form.getAttribute("data-form-type")

				// Lógica para manejar cada tipo de formulario
				switch (formType) {
					case "provider":
						handleProviderForm(e)
						break
					case "product":
						handleProductForm(e)
						break
					case "hotel":
						handleHotelForm(e)
						break
					case "hotelRoomType":
						handleHotelRoomsTypeForm(e)
						break
					case "tourPackage":
						handleTourPackageForm(e)
						break
					default:
						console.error("Tipo de formulario no reconocido.")
				}
			})
		})
	})
}

// Función específica para manejar el formulario del proveedor
async function handleProviderForm(e: Event) {
	const form = e.target as HTMLFormElement
	const formData = new FormData(form)

	try {
		const res = await fetch("/api/providers/create", {
			method: "POST",
			body: formData,
		})

		if (res.ok) {
			const result = await res.json()
			console.log("Proveedor creado:", result)
			alert("Empresa registrada con éxito!")
			// Redirige al siguiente paso, por ejemplo, el formulario de productos
			window.location.href = "/forms/product"
		} else {
			const errorText = await res.text()
			console.error("Error en la respuesta del servidor:", errorText)
			alert("Error al registrar la empresa.")
		}
	} catch (e) {
		console.error("Error enviando la solicitud:", e)
		alert("Error de conexión con el servidor.")
	}
}

async function handleProductForm(e: Event) {
	const form = e.target as HTMLFormElement
	const formData = new FormData(form)
	const productType = formData.get("productType")?.toString()

	try {
		const res = await fetch("/api/products/create", {
			method: "POST",
			body: formData,
		})

		if (res.ok) {
			const result = await res.json()
			const { productId } = result
			console.log("Producto base creado:", result)
			alert("Producto base guardado. ¡Continúa con los detalles!")

			if (productType === "Hotel") {
				window.location.href = `/forms/hotel/${productId}`
			} else if (productType === "Tour") {
				window.location.href = `/forms/tour/${productId}`
			} else if (productType === "Package") {
				window.location.href = `/forms/package/${productId}`
			} else {
				window.location.href = "/dashboard/provider"
			}
		} else {
			const errorText = await res.text()
			if (errorText.includes("Falta el ID del proveedor")) {
				alert("Por favor antes debes registrar tu empresa.")
				window.location.href = "/forms/provider"
			} else if (errorText.includes("Faltan campos obligatorios")) {
				console.error("Error en la respuesta del servidor: ", errorText)
				alert("Error al guardar el producto.")
			}
		}
	} catch (e) {
		console.error("Error enviando la solicitud: ", e)
		alert("Error de conexión con el servidor.")
	}
}

async function handleHotelForm(e: Event) {
	const form = e.target as HTMLFormElement
	const formData = new FormData(form)

	try {
		const res = await fetch("/api/products/hotel/create", {
			method: "POST",
			body: formData,
		})

		if (res.ok) {
			const result = await res.json()
			console.log("Detalles de Hotel creados: ", result)
			alert("Hotel registrado con éxito!")
			window.location.href = "/dashboard/provider"
		} else {
			const errorText = await res.text()
			console.error("Error en la respuesta del servidor: ", errorText)
			alert("Error al guardar los detalles del hotel.")
		}
	} catch (e) {
		console.error("Error enviando la solicitud: ", e)
		alert("Error de conexión con el servidor.")
	}
}

async function handleHotelRoomsTypeForm(e: Event) {
	const form = e.target as HTMLFormElement
	const formData = new FormData(form)

	try {
		const res = await fetch("/api/products/hotel/rooms/create", {
			method: "POST",
			body: formData,
		})

		if (res.ok) {
			console.log("Configuracion de habitación guardada")
			alert("Configuracion de habitaciones guardada exitosamente.")
			window.location.href = "/dashboard/provider"
		} else {
			const errorText = await res.text()
			console.error("Error en la respuesta del servidor: ", errorText)
			alert("Error al guardar la configuración de la habitación.")
		}
	} catch (e) {
		console.error("Error enviando la solicitud: ", e)
		alert("Error de conexión con el servidor.")
	}
}

async function handleTourPackageForm(e: Event) {
	const form = e.target as HTMLFormElement
	const formData = new FormData(form)

	try {
		const res = await fetch("/api/products/tourPackage/create", {
			method: "POST",
			body: formData,
		})

		if (res.ok) {
			const result = await res.json()
			console.log(`${result} creado: `, result)
			alert(`${result.message}`)
			window.location.href = "/dashboard/provider"
		} else {
			const errorText = await res.text()
			if (errorText.includes("Falta el ID del proveedor")) {
				alert("Por favor antes debes registrar tu empresa.")
				window.location.href = "/forms/provider"
			} else if (errorText.includes("Faltan campos obligatorios")) {
				console.error("Error en la respuesta del servidor: ", errorText)
				alert("Error al guardar el tour o paquete")
			}
		}
	} catch (e) {
		console.error("Error enviando la solicitud: ", e)
		alert("Error de conexión con el servidor.")
	}
}

initializeFormHandler()
