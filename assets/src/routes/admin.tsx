import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, CheckCircle, Edit3, X, Image as ImageIcon, UploadCloud, Loader2, Palette } from 'lucide-react'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

const DEFAULT_CATEGORIES = [
  { id: 'halloween', name: 'Halloween' },
  { id: 'natal', name: 'Natal' },
  { id: 'casa', name: 'Casa & Utilitários' },
  { id: 'decoracao', name: 'Decoração' },
  { id: 'porta-chaves', name: 'Porta-chaves' },
  { id: 'presentes', name: 'Presentes' },
  { id: 'personalizados', name: 'Personalizados' },
]

const DEFAULT_PALETTE = [
  { name: 'Laranja', hex: '#c9622a' },
  { name: 'Preto Mate', hex: '#2a2a2e' },
  { name: 'Branco Translúcido', hex: '#f0ede6' },
  { name: 'Branco Osso', hex: '#e8dfcd' },
  { name: 'Cinza Pedra', hex: '#8d8b86' },
  { name: 'Roxo Profundo', hex: '#4b2a52' },
  { name: 'Verde Salva', hex: '#8a9a7b' },
  { name: 'Terracota', hex: '#b4633f' },
  { name: 'Dourado', hex: '#a8873f' },
]

// Converte HEIC/HEIF para JPEG e corrige a rotação de fotos do iPhone
async function processImage(file: File): Promise<Blob> {
  if (typeof window === 'undefined') return file

  let blobToProcess: Blob = file

  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')

  if (isHeic) {
    try {
      const mod = await import('heic-to')
      const convertFn =
        (mod as any).heicTo ||
        (mod as any).default?.heicTo ||
        (mod as any).default ||
        mod

      if (typeof convertFn === 'function') {
        const result = await convertFn({
          blob: file,
          type: 'image/jpeg',
          quality: 0.88,
        })

        const resolvedBlob = Array.isArray(result) ? result[0] : result
        if (resolvedBlob instanceof Blob && resolvedBlob.size > 0) {
          blobToProcess = new Blob([await resolvedBlob.arrayBuffer()], {
            type: 'image/jpeg',
          })
        }
      }
    } catch (err) {
      console.warn('Falha na conversão do heic-to:', err)
    }
  }

  if ('createImageBitmap' in window) {
    try {
      const imgBitmap = await createImageBitmap(blobToProcess, {
        imageOrientation: 'from-image',
      })

      const MAX_WIDTH = 1600
      const MAX_HEIGHT = 1600
      let width = imgBitmap.width
      let height = imgBitmap.height

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width))
          width = MAX_WIDTH
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round(width * (MAX_HEIGHT / height))
          height = MAX_HEIGHT
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(imgBitmap, 0, 0, width, height)
        const finalBlob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', 0.85)
        )
        if (finalBlob) return finalBlob
      }
    } catch (bitmapErr) {
      console.warn('createImageBitmap ignorado:', bitmapErr)
    }
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(blobToProcess)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const MAX_WIDTH = 1600
      const MAX_HEIGHT = 1600
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width))
          width = MAX_WIDTH
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round(width * (MAX_HEIGHT / height))
          height = MAX_HEIGHT
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(blobToProcess)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => resolve(blob || blobToProcess),
        'image/jpeg',
        0.85
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(blobToProcess)
    }

    img.src = objectUrl
  })
}

function AdminPage() {
  const [productsList, setProductsList] = useState<any[]>([])
  const [categoriesList, setCategoriesList] = useState<any[]>(DEFAULT_CATEGORIES)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('halloween')
  const [shortDesc, setShortDesc] = useState('')
  const [imagesList, setImagesList] = useState<Array<{ src: string; alt: string }>>([])
  const [featured, setFeatured] = useState(false)

  // Gestão de cores
  const [availablePalette, setAvailablePalette] = useState(DEFAULT_PALETTE)
  const [selectedColors, setSelectedColors] = useState<Array<{ name: string; hex: string }>>([
    DEFAULT_PALETTE[0],
  ])
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#6b3e26')
  const [showColorForm, setShowColorForm] = useState(false)

  const [variants, setVariants] = useState<Array<{ name: string; price: number; dimensions: string }>>([
    { name: 'Único', price: 0, dimensions: '' },
  ])

  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [success, setSuccess] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('order', { ascending: true })

    if (!error && data && data.length > 0) {
      setCategoriesList(data)
    }
  }

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProductsList(data)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)
    try {
      const uploaded: Array<{ src: string; alt: string }> = []

      for (let i = 0; i < files.length; i++) {
        const originalFile = files[i]
        const processedBlob = await processImage(originalFile)
        const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`
        const filePath = `itens/${cleanFileName}`

        const { error: uploadError } = await supabase.storage
          .from('produtos')
          .upload(filePath, processedBlob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: true,
          })

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('produtos').getPublicUrl(filePath)
        uploaded.push({ src: data.publicUrl, alt: name || 'Foto da peça' })
      }

      setImagesList((prev) => [...prev, ...uploaded])
    } catch (err: any) {
      alert('Erro ao carregar fotos: ' + (err.message || 'Verifica a ligação.'))
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removePhoto = (index: number) => {
    setImagesList(imagesList.filter((_, i) => i !== index))
  }

  const handleEdit = (prod: any) => {
    setEditingId(prod.id)
    setName(prod.name || '')
    setCategoryId(prod.category_id || 'halloween')
    setShortDesc(prod.short_description || '')
    setImagesList(prod.images && Array.isArray(prod.images) ? prod.images : [])
    setFeatured(!!prod.featured)

    const prodColors = prod.colors && prod.colors.length > 0 ? prod.colors : [DEFAULT_PALETTE[0]]
    setSelectedColors(prodColors)

    // Adiciona cores personalizadas existentes à paleta visível
    setAvailablePalette((prev) => {
      const combined = [...prev]
      prodColors.forEach((c: { name: string; hex: string }) => {
        if (!combined.some((p) => p.name.toLowerCase() === c.name.toLowerCase())) {
          combined.push(c)
        }
      })
      return combined
    })

    setVariants(
      prod.variants && prod.variants.length > 0
        ? prod.variants
        : [{ name: 'Único', price: prod.base_price || 0, dimensions: '' }]
    )
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setCategoryId('halloween')
    setShortDesc('')
    setImagesList([])
    setFeatured(false)
    setSelectedColors([DEFAULT_PALETTE[0]])
    setVariants([{ name: 'Único', price: 0, dimensions: '' }])
    setShowColorForm(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const toggleColor = (color: { name: string; hex: string }) => {
    if (selectedColors.some((c) => c.name === color.name)) {
      setSelectedColors(selectedColors.filter((c) => c.name !== color.name))
    } else {
      setSelectedColors([...selectedColors, color])
    }
  }

  const handleAddNewColor = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColorName.trim()) return

    const newColor = {
      name: newColorName.trim(),
      hex: newColorHex,
    }

    if (!availablePalette.some((c) => c.name.toLowerCase() === newColor.name.toLowerCase())) {
      setAvailablePalette((prev) => [...prev, newColor])
    }

    if (!selectedColors.some((c) => c.name.toLowerCase() === newColor.name.toLowerCase())) {
      setSelectedColors((prev) => [...prev, newColor])
    }

    setNewColorName('')
    setShowColorForm(false)
  }

  const removeColorFromPalette = (colorName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setAvailablePalette((prev) => prev.filter((c) => c.name !== colorName))
    setSelectedColors((prev) => prev.filter((c) => c.name !== colorName))
  }

  const addVariant = () => {
    setVariants([...variants, { name: '', price: 0, dimensions: '' }])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')

    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    const basePrice = variants[0]?.price || 0

    const productPayload = {
      slug,
      name,
      category_id: categoryId,
      base_price: basePrice,
      short_description: shortDesc,
      images: imagesList,
      colors: selectedColors,
      variants,
      featured,
    }

    if (editingId) {
      const { error } = await supabase
        .from('products')
        .update(productPayload)
        .eq('id', editingId)

      setLoading(false)
      if (error) {
        alert('Erro ao atualizar produto: ' + error.message)
      } else {
        setSuccess('Produto atualizado com sucesso!')
        resetForm()
        fetchProducts()
      }
    } else {
      const { error } = await supabase.from('products').insert([productPayload])

      setLoading(false)
      if (error) {
        alert('Erro ao criar produto: ' + error.message)
      } else {
        setSuccess('Produto criado com sucesso!')
        resetForm()
        fetchProducts()
      }
    }
  }

  const handleDelete = async (id: string, prodName: string) => {
    if (!confirm(`Tens a certeza que queres eliminar "${prodName}"?`)) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      alert('Erro ao eliminar: ' + error.message)
    } else {
      if (editingId === id) resetForm()
      fetchProducts()
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink">Painel Admin · BroMinds</h1>
          <p className="text-sm text-ink-3">Gere peças, fotografias, tamanhos e cores do catálogo.</p>
        </div>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-paper-3 bg-paper hover:bg-paper-2 text-ink"
          >
            <X className="h-4 w-4" /> Cancelar Edição
          </button>
        )}
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle className="h-5 w-5" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-paper p-6 rounded-2xl border border-paper-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-paper-3 pb-3">
          <h2 className="text-lg font-bold text-ink">
            {editingId ? 'Editar Peça' : 'Criar Nova Peça'}
          </h2>
          {editingId && (
            <span className="text-xs font-mono bg-ember/10 text-ember px-2.5 py-0.5 rounded-full font-bold">
              Modo de Edição
            </span>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
            Nome da Peça
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Caixa de Abóbora"
            className="w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm text-ink outline-none focus:border-ember focus:bg-paper"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
            Coleção / Categoria
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm text-ink outline-none focus:border-ember focus:bg-paper"
          >
            {categoriesList.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Upload de Múltiplas Imagens */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-2">
            Fotografias da Peça (Podes selecionar várias)
          </label>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif,.HEIC,.HEIF"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            disabled={uploadingImage}
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-paper-3 hover:border-ember rounded-2xl bg-paper-2/60 hover:bg-paper-2 transition cursor-pointer text-center group disabled:opacity-50"
          >
            {uploadingImage ? (
              <>
                <Loader2 className="h-7 w-7 text-ember animate-spin" />
                <span className="text-xs font-semibold text-ink">A carregar fotos para o Supabase...</span>
              </>
            ) : (
              <>
                <div className="h-10 w-10 rounded-full bg-paper flex items-center justify-center text-ember group-hover:scale-110 transition shadow-sm">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-ink block">
                    Clica para escolher uma ou mais fotos
                  </span>
                  <span className="text-xs text-ink-3">A 1.ª é a capa · A 2.ª aparece ao passar o rato nos cartões</span>
                </div>
              </>
            )}
          </button>

          {/* Grelha de fotos carregadas */}
          {imagesList.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {imagesList.map((img, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-paper-3 bg-paper-2">
                  <img src={img.src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-ink/80 text-paper hover:bg-red-600 transition"
                    title="Remover foto"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-ember text-paper px-2 py-0.5 rounded font-bold">
                      1ª Foto (Capa)
                    </span>
                  )}
                  {idx === 1 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-ink/80 text-paper px-2 py-0.5 rounded font-semibold">
                      2ª Foto (Hover)
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
            Pequena Descrição
          </label>
          <input
            type="text"
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="Ex: Silhueta decorativa para prateleiras e secretárias"
            className="w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm text-ink outline-none focus:border-ember focus:bg-paper"
          />
        </div>

        {/* CORES DISPONÍVEIS COM OPÇÃO DE REMOÇÃO DE CORES PERSONALIZADAS */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink">
              Cores Disponíveis para esta Peça
            </label>
            <button
              type="button"
              onClick={() => setShowColorForm(!showColorForm)}
              className="text-xs flex items-center gap-1 text-ember hover:underline font-semibold"
            >
              <Palette className="h-3.5 w-3.5" />
              {showColorForm ? 'Fechar formulário' : '+ Adicionar Nova Cor'}
            </button>
          </div>

          {showColorForm && (
            <div className="mb-3.5 p-3 rounded-xl border border-paper-3 bg-paper-2 flex flex-wrap items-center gap-2.5">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="h-9 w-9 rounded-lg border border-paper-3 cursor-pointer p-0.5 bg-paper"
                title="Escolher código de cor"
              />
              <input
                type="text"
                placeholder="Nome da cor (ex: Castanho)"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="flex-1 min-w-[150px] rounded-lg border border-paper-3 bg-paper p-2 text-xs text-ink outline-none focus:border-ember"
              />
              <span className="font-mono text-xs text-ink-3 uppercase px-1">
                {newColorHex}
              </span>
              <button
                type="button"
                onClick={handleAddNewColor}
                className="bg-ink hover:bg-ember text-paper px-3 py-2 rounded-lg text-xs font-semibold transition"
              >
                Guardar Cor
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {availablePalette.map((col) => {
              const active = selectedColors.some((c) => c.name === col.name)
              const isCustom = !DEFAULT_PALETTE.some((d) => d.name === col.name)

              return (
                <button
                  type="button"
                  key={col.name}
                  onClick={() => toggleColor(col)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition ${
                    active
                      ? 'border-ember bg-ember/10 text-ink font-bold shadow-sm'
                      : 'border-paper-3 bg-paper hover:bg-paper-2 text-ink-2'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                  {isCustom && (
                    <span
                      onClick={(e) => removeColorFromPalette(col.name, e)}
                      className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-xs text-ink-3 hover:bg-red-500 hover:text-white transition"
                      title={`Eliminar ${col.name} da lista`}
                    >
                      ×
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tamanhos e Preços */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink">
              Tamanhos, Preços e Dimensões
            </label>
            <button
              type="button"
              onClick={addVariant}
              className="text-xs flex items-center gap-1 text-ember hover:underline font-semibold"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar tamanho
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-paper-2 p-3 rounded-xl border border-paper-3"
              >
                <input
                  type="text"
                  placeholder="Nome (ex: Pequena / Média / Único)"
                  value={v.name}
                  onChange={(e) => updateVariant(i, 'name', e.target.value)}
                  className="flex-1 rounded-lg border border-paper-3 bg-paper p-2 text-sm text-ink outline-none"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço €"
                  value={v.price || ''}
                  onChange={(e) => updateVariant(i, 'price', parseFloat(e.target.value) || 0)}
                  className="w-24 rounded-lg border border-paper-3 bg-paper p-2 text-sm text-ink outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Dimensões (ex: 12 × 12 × 10 cm)"
                  value={v.dimensions}
                  onChange={(e) => updateVariant(i, 'dimensions', e.target.value)}
                  className="flex-1 rounded-lg border border-paper-3 bg-paper p-2 text-sm text-ink outline-none"
                />
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="feat"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="rounded border-paper-3 text-ember focus:ring-ember"
          />
          <label htmlFor="feat" className="text-xs font-medium text-ink cursor-pointer">
            Destacar este produto na página inicial
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="flex-1 bg-ink hover:bg-ember text-paper font-semibold py-3 rounded-xl shadow-md transition disabled:opacity-50"
          >
            {loading
              ? 'A guardar...'
              : editingId
              ? 'Atualizar Produto'
              : 'Guardar e Publicar Produto'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-3 border border-paper-3 bg-paper-2 hover:bg-paper-3 text-ink text-sm font-semibold rounded-xl transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista de Peças Existentes */}
      <div className="mt-14">
        <h3 className="text-xl font-bold text-ink mb-4">Peças no Catálogo ({productsList.length})</h3>
        <div className="grid gap-3">
          {productsList.map((prod) => {
            const hasImg = prod.images && prod.images.length > 0 && prod.images[0]?.src
            return (
              <div
                key={prod.id}
                className="flex items-center justify-between p-3.5 bg-paper rounded-xl border border-paper-3 hover:border-ink/20 transition"
              >
                <div className="flex items-center gap-3">
                  {hasImg ? (
                    <img
                      src={prod.images[0].src}
                      alt={prod.name}
                      className="h-12 w-12 rounded-lg object-cover border border-paper-3 bg-paper-2"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-paper-2 border border-paper-3 flex items-center justify-center text-ink-3">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-ink">{prod.name}</h4>
                    <p className="text-xs text-ink-3">
                      {prod.category_id} · {prod.base_price?.toFixed(2)} € · {prod.images?.length || 0} foto(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(prod)}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-paper-3 bg-paper hover:bg-paper-2 text-ink transition"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-ember" /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(prod.id, prod.name)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    title="Eliminar peça"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}