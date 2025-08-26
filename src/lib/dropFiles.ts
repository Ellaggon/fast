export let uploadFiles: FileList | null // almacenamiento del estado

const $ = (el: string) => document.getElementById(el) as HTMLElement | null

export function dropFiles(
	dropZone: string,
	imageUpload: string,
	imagePreview: string,
	imageText: string
) {
	const $dropZone = $(dropZone)
	const $imageUpload = $(imageUpload) as HTMLInputElement
	const $imagePreview = $(imagePreview)
	const $imageText = $(imageText)

	if ($dropZone && $imageUpload && $imagePreview) {
		$dropZone.addEventListener("click", () => {
			$imageUpload?.click()
		})
		$dropZone.addEventListener("change", (e) => {
			const target = e.target as HTMLInputElement
			uploadFiles = target?.files
			if (uploadFiles) handleFile(uploadFiles)
			$imageText?.classList.add("hidden")
			console.log("change files: ", uploadFiles)
		})
		// drop, dragover & dragleave
		$dropZone.addEventListener("dragover", (e) => {
			e.preventDefault()
			$dropZone.classList.remove("border-gray-700")
			$dropZone.classList.add("border-blue-500")
		})
		$dropZone.addEventListener("dragleave", () => {
			$dropZone.classList.remove("border-blue-500")
			$dropZone.classList.add("border-gray-700")
		})
		$dropZone.addEventListener("drop", (e) => {
			e.preventDefault()
			const dataTransfer = e.dataTransfer
			if (!dataTransfer) return
			uploadFiles = dataTransfer.files
			console.log("uploadFile desde el drop:", uploadFiles)
			if (uploadFiles) handleFile(uploadFiles)
			$imageText?.classList.add("hidden")
		})

		function handleFile(dragFiles: FileList) {
			if (!$imagePreview) return
			$imagePreview.innerHTML = ""

			// Para disparar el evento input para validaciones en el drag&drop
			if ($imageUpload) {
				const dataTransfer = new DataTransfer()
				Array.from(dragFiles).forEach((file) => dataTransfer.items.add(file))
				$imageUpload.files = dataTransfer.files
				$imageUpload.dispatchEvent(new Event("input")) // Activa la validación
			}

			Array.from(dragFiles).forEach((dragFile) => {
				if (dragFile && dragFile.type.startsWith("image/")) {
					const render = new FileReader()

					render.onload = function (e) {
						const target = e.target as FileReader
						if (!target?.result) return

						const imgElement = document.createElement("img")
						imgElement.src = target.result as string
						imgElement.classList.add("w-full", "h-auto", "rounded-lg", "mb-3")
						$imagePreview.classList.remove("hidden")
						$imagePreview.appendChild(imgElement)
					}
					render.readAsDataURL(dragFile)
				} else {
					$imagePreview.classList.add("hidden")
				}
			})
		}
	}
}
