import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Plus,
  Trash2,
  CheckCircle,
  Edit3,
  X,
  Image as ImageIcon,
  UploadCloud,
  Loader2,
  Palette,
  Users,
  Heart,
  Package,
  Layers,
  LayoutDashboard,
  Eye,
} from 'lucide-react'

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
      const MAX_DIM = 1600
      let width = imgBitmap.width
      let height = imgBitmap.height

      if (width > height) {
        if (width > MAX_DIM) {
          height = Math.round(height * (MAX_DIM / width))
          width = MAX_DIM
        }
      } else if (height > MAX_DIM) {
        width = Math.round(width * (MAX_DIM / height))
        height = MAX_DIM
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(imgBitmap, 0, 0, width, height)
        const finalBlob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', 0.85),
        )
        if (finalBlob) return finalBlob
      }
    } catch (bitmapErr) {
      console.warn('createImageBitmap ignorado:', bitmapErr)
    }
  }

  return blobToProcess
}

function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories'>('overview')

  // Dados Globais
  const [productsList, setProductsList] = useState<any[]>([])
  const [categoriesList, setCategoriesList] = useState<any[]>(DEFAULT_CATEGORIES)
  const [usersList, setUsersList] = useState<any[]>([])
  const [favoritesCounts, setFavoritesCounts] = useState<Record<string, number>>({})
  const [totalFavsCount, setTotalFavsCount] = useState(0)

  // Feedback
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  // Form Produto
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('halloween')
  const [shortDesc, setShortDesc] = useState('')
  const [imagesList, setImagesList] = useState<Array<{ src: string; alt: string }>>([])
  const [featured, setFeatured] = useState(false)
  const [availablePalette, setAvailablePalette] = useState<Array<{ id?: string; name: string; hex: string }>>([])
  const [selectedColors, setSelectedColors] = useState<Array<{ name: string; hex: string }>>([])
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#e3dac9')
  const [showColorForm, setShowColorForm] = useState(false)
  const [variants, setVariants] = useState<Array<{ name: string; price: number; dimensions: string }>>([
    { name: 'Único', price: 0, dimensions: '' },
  ])
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form Categoria
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [catName, setCatName] = useState('')
  const [catSlug, setCatSlug] = useState('')
  const [catTagline, setCatTagline] = useState('')
  const [catDescription, setCatDescription] = useState('')
  const [catImage, setCatImage] = useState('')
  const [catFeatured, setCatFeatured] = useState(false)
  const [catOrder, setCatOrder] = useState(0)
  const [uploadingCatImage, setUploadingCatImage] = useState(false)
  const catFileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = async () => {
    // 1. Produtos
    const { data: prods } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (prods) setProductsList(prods)

    // 2. Categorias
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true })
    if (cats && cats.length > 0) setCategoriesList(cats)

    // 3. Perfis / Logins
    const { data: profiles } = await supabase
      .from('customer_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (profiles) setUsersList(profiles)

    // 4. Favoritos
    const { data: favs } = await supabase.from('favorites').select('product_id')
    if (favs) {
      setTotalFavsCount(favs.length)
      const counts: Record<string, number> = {}
      favs.forEach((f) => {
        counts[f.product_id] = (counts[f.product_id] || 0) + 1
      })
      setFavoritesCounts(counts)
    }

    // 5. Cores
    const { data: colors } = await supabase
      .from('colors')
      .select('*')
      .order('name', { ascending: true })
    if (colors && colors.length > 0) {
      setAvailablePalette(colors)
      if (selectedColors.length === 0) {
        setSelectedColors([{ name: colors[0].name, hex: colors[0].hex }])
      }
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ==================== LÓGICA DE PRODUTOS ====================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)
    try {
      const uploaded: Array<{ src: string; alt: string }> = []
      for (let i = 0; i < files.length; i++) {
        const processedBlob = await processImage(files[i])
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

  const handleEditProduct = (prod: any) => {
    setEditingId(prod.id)
    setName(prod.name || '')
    setCategoryId(prod.category_id || 'halloween')
    setShortDesc(prod.short_description || '')
    setImagesList(Array.isArray(prod.images) ? prod.images : [])
    setFeatured(Boolean(prod.featured))
    setSelectedColors(prod.colors && prod.colors.length > 0 ? prod.colors : [availablePalette[0]])
    setVariants(
      prod.variants && prod.variants.length > 0
        ? prod.variants
        : [{ name: 'Único', price: prod.base_price || 0, dimensions: '' }],
    )
    setActiveTab('products')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetProductForm = () => {
    setEditingId(null)
    setName('')
    setCategoryId('halloween')
    setShortDesc('')
    setImagesList([])
    setFeatured(false)
    if (availablePalette.length > 0) {
      setSelectedColors([{ name: availablePalette[0].name, hex: availablePalette[0].hex }])
    }
    setVariants([{ name: 'Único', price: 0, dimensions: '' }])
    setShowColorForm(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const toggleColor = (color: { name: string; hex: string }) => {
    if (selectedColors.some((c) => c.name.toLowerCase() === color.name.toLowerCase())) {
      setSelectedColors(selectedColors.filter((c) => c.name.toLowerCase() !== color.name.toLowerCase()))
    } else {
      setSelectedColors([...selectedColors, { name: color.name, hex: color.hex }])
    }
  }

  const handleAddNewColor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColorName.trim()) return

    const colorName = newColorName.trim()
    const colorHex = newColorHex.trim()
    await supabase.from('colors').insert([{ name: colorName, hex: colorHex }])

    const newColor = { name: colorName, hex: colorHex }
    setAvailablePalette((prev) => [...prev, newColor])
    setSelectedColors((prev) => [...prev, newColor])
    setNewColorName('')
    setShowColorForm(false)
  }

  const removeColorFromPalette = async (colorName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Eliminar "${colorName}" da paleta permanente?`)) return
    await supabase.from('colors').delete().eq('name', colorName)
    setAvailablePalette((prev) => prev.filter((c) => c.name !== colorName))
    setSelectedColors((prev) => prev.filter((c) => c.name !== colorName))
  }

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')

    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    const payload = {
      slug,
      name,
      category_id: categoryId,
      base_price: variants[0]?.price || 0,
      short_description: shortDesc,
      images: imagesList,
      colors: selectedColors,
      variants,
      featured,
    }

    if (editingId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingId)
      setLoading(false)
      if (error) alert('Erro ao atualizar: ' + error.message)
      else {
        setSuccess('Peça atualizada com sucesso!')
        resetProductForm()
        fetchData()
      }
    } else {
      const { error } = await supabase.from('products').insert([payload])
      setLoading(false)
      if (error) alert('Erro ao criar: ' + error.message)
      else {
        setSuccess('Peça criada com sucesso!')
        resetProductForm()
        fetchData()
      }
    }
  }

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!confirm(`Eliminar "${prodName}"?`)) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) alert('Erro: ' + error.message)
    else {
      if (editingId === id) resetProductForm()
      fetchData()
    }
  }

  // ==================== LÓGICA DE CATEGORIAS ====================
  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCatImage(true)
    try {
      const processedBlob = await processImage(file)
      const cleanFileName = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.jpg`
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
      setCatImage(data.publicUrl)
    } catch (err: any) {
      alert('Erro ao carregar foto da categoria: ' + err.message)
    } finally {
      setUploadingCatImage(false)
      if (catFileInputRef.current) catFileInputRef.current.value = ''
    }
  }

  const handleEditCategory = (cat: any) => {
    setEditingCatId(cat.id)
    setCatName(cat.name || '')
    setCatSlug(cat.slug || cat.id)
    setCatTagline(cat.tagline || '')
    setCatDescription(cat.description || '')
    setCatImage(cat.image || '')
    setCatFeatured(Boolean(cat.featured))
    setCatOrder(Number(cat.order || 0))
    setActiveTab('categories')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetCategoryForm = () => {
    setEditingCatId(null)
    setCatName('')
    setCatSlug('')
    setCatTagline('')
    setCatDescription('')
    setCatImage('')
    setCatFeatured(false)
    setCatOrder(categoriesList.length + 1)
  }

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')

    const generatedSlug = (catSlug || catName)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    const payload = {
      id: editingCatId || generatedSlug,
      slug: generatedSlug,
      name: catName,
      tagline: catTagline,
      description: catDescription,
      image: catImage || '/img/placeholder.png',
      featured: catFeatured,
      order: Number(catOrder || 0),
    }

    const { error } = await supabase.from('categories').upsert([payload])
    setLoading(false)

    if (error) {
      alert('Erro ao guardar categoria: ' + error.message)
    } else {
      setSuccess('Categoria guardada com sucesso!')
      resetCategoryForm()
      fetchData()
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Topo do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">Painel de Gestão · BroMinds</h1>
          <p className="text-sm text-ink-3">Métricas, catálogo de peças e personalização de categorias.</p>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex border-b border-paper-3 mb-8 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-ember text-ember'
              : 'border-transparent text-ink-2 hover:text-ink'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Visão Geral & Métricas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'products'
              ? 'border-ember text-ember'
              : 'border-transparent text-ink-2 hover:text-ink'
          }`}
        >
          <Package className="h-4 w-4" />
          Peças ({productsList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'categories'
              ? 'border-ember text-ember'
              : 'border-transparent text-ink-2 hover:text-ink'
          }`}
        >
          <Layers className="h-4 w-4" />
          Categorias ({categoriesList.length})
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 text-sm font-semibold">
          <CheckCircle className="h-5 w-5" />
          {success}
        </div>
      )}

      {/* =========================================================
          ABA 1: VISÃO GERAL & MÉTRICAS
      ========================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Cartões de Indicadores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-paper p-5 rounded-2xl border border-paper-3 shadow-sm">
              <div className="flex items-center justify-between text-ink-3">
                <span className="text-xs font-bold uppercase tracking-wider">Pessoas Registadas (@)</span>
                <Users className="h-5 w-5 text-ember" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-ink">{usersList.length}</p>
              <p className="mt-1 text-xs text-ink-3">Contas criadas com @handle</p>
            </div>

            <div className="bg-paper p-5 rounded-2xl border border-paper-3 shadow-sm">
              <div className="flex items-center justify-between text-ink-3">
                <span className="text-xs font-bold uppercase tracking-wider">Total de Favoritos</span>
                <Heart className="h-5 w-5 text-red-500 fill-current" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-ink">{totalFavsCount}</p>
              <p className="mt-1 text-xs text-ink-3">Peças guardadas por clientes</p>
            </div>

            <div className="bg-paper p-5 rounded-2xl border border-paper-3 shadow-sm">
              <div className="flex items-center justify-between text-ink-3">
                <span className="text-xs font-bold uppercase tracking-wider">Peças Publicadas</span>
                <Package className="h-5 w-5 text-ink-2" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-ink">{productsList.length}</p>
              <p className="mt-1 text-xs text-ink-3">Distribuídas em {categoriesList.length} coleções</p>
            </div>
          </div>

          {/* Grelha: Utilizadores e Peças Mais Desejadas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Logins Recentes */}
            <div className="bg-paper p-6 rounded-2xl border border-paper-3 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-ember" />
                Clientes Identificados ({usersList.length})
              </h2>
              {usersList.length === 0 ? (
                <p className="text-xs text-ink-3 py-4">Ainda nenhum cliente criou o seu @handle.</p>
              ) : (
                <div className="divide-y divide-paper-3 max-h-80 overflow-y-auto">
                  {usersList.map((u) => (
                    <div key={u.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-ink">@{u.handle}</span>
                        {u.display_name && (
                          <span className="ml-2 text-ink-3">({u.display_name})</span>
                        )}
                      </div>
                      <span className="text-[11px] text-ink-3">
                        {new Date(u.created_at).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Peças Mais Populares nos Favoritos */}
            <div className="bg-paper p-6 rounded-2xl border border-paper-3 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink mb-4 flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500 fill-current" />
                Peças Mais Guardadas
              </h2>
              {productsList.length === 0 ? (
                <p className="text-xs text-ink-3 py-4">Sem peças registadas.</p>
              ) : (
                <div className="divide-y divide-paper-3 max-h-80 overflow-y-auto">
                  {[...productsList]
                    .sort((a, b) => (favoritesCounts[b.id] || 0) - (favoritesCounts[a.id] || 0))
                    .slice(0, 6)
                    .map((prod) => (
                      <div key={prod.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          {prod.images?.[0]?.src ? (
                            <img src={prod.images[0].src} alt="" className="h-8 w-8 rounded-lg object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-paper-2 flex items-center justify-center">
                              <Package className="h-4 w-4 text-ink-3" />
                            </div>
                          )}
                          <span className="font-semibold text-ink line-clamp-1">{prod.name}</span>
                        </div>
                        <span className="font-bold text-ember flex items-center gap-1 bg-ember/10 px-2 py-0.5 rounded-full">
                          <Heart className="h-3 w-3 fill-current text-red-500" />
                          {favoritesCounts[prod.id] || 0}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          ABA 2: PEÇAS (CRIAR, EDITAR, FOTOS, CORES)
      ========================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-10">
          <form onSubmit={handleSubmitProduct} className="space-y-6 bg-paper p-6 rounded-2xl border border-paper-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-paper-3 pb-3">
              <h2 className="text-lg font-bold text-ink">
                {editingId ? 'Editar Peça' : 'Criar Nova Peça'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg border border-paper-3 hover:bg-paper-2"
                >
                  <X className="h-3.5 w-3.5" /> Cancelar Edição
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                Nome da Peça
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Porta-Chaves Personalizado"
                className="w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                Coleção / Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                Fotografias da Peça
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-paper-3 hover:border-ember rounded-2xl bg-paper-2/60 transition cursor-pointer text-center group disabled:opacity-50"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="h-7 w-7 text-ember animate-spin" />
                    <span className="text-xs font-semibold text-ink">A carregar fotos...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-6 w-6 text-ember group-hover:scale-110 transition" />
                    <span className="text-sm font-semibold text-ink">Clica para escolher fotos</span>
                  </>
                )}
              </button>

              {imagesList.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {imagesList.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-paper-3 bg-paper-2">
                      <img src={img.src} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImagesList(imagesList.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-ink/80 text-paper hover:bg-red-600 transition"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                Pequena Descrição
              </label>
              <input
                type="text"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Ex: Acessório compacto para mochilas e chaves"
                className="w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember"
              />
            </div>

            {/* Cores */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                  Cores Disponíveis
                </label>
                <button
                  type="button"
                  onClick={() => setShowColorForm(!showColorForm)}
                  className="text-xs flex items-center gap-1 text-ember hover:underline font-semibold"
                >
                  <Palette className="h-3.5 w-3.5" />
                  {showColorForm ? 'Fechar' : '+ Adicionar Cor à Paleta'}
                </button>
              </div>

              {showColorForm && (
                <div className="mb-3.5 p-3 rounded-xl border border-paper-3 bg-paper-2 flex flex-wrap items-center gap-2.5">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="h-9 w-9 rounded-lg border border-paper-3 cursor-pointer p-0.5 bg-paper"
                  />
                  <input
                    type="text"
                    placeholder="Nome da cor (ex: Bege Areia)"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="flex-1 min-w-[150px] rounded-lg border border-paper-3 bg-paper p-2 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewColor}
                    className="bg-ink hover:bg-ember text-paper px-3 py-2 rounded-lg text-xs font-semibold"
                  >
                    Guardar Cor
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {availablePalette.map((col) => {
                  const active = selectedColors.some((c) => c.name.toLowerCase() === col.name.toLowerCase())
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
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: col.hex }} />
                      <span>{col.name}</span>
                      <span
                        onClick={(e) => removeColorFromPalette(col.name, e)}
                        className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-xs text-ink-3 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white"
                      >
                        ×
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Variantes */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                  Tamanhos e Preços
                </label>
                <button
                  type="button"
                  onClick={() => setVariants([...variants, { name: '', price: 0, dimensions: '' }])}
                  className="text-xs flex items-center gap-1 text-ember hover:underline font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar tamanho
                </button>
              </div>

              <div className="space-y-2">
                {variants.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 bg-paper-2 p-2.5 rounded-xl border border-paper-3">
                    <input
                      type="text"
                      placeholder="Tamanho"
                      value={v.name}
                      onChange={(e) => {
                        const copy = [...variants]
                        copy[i].name = e.target.value
                        setVariants(copy)
                      }}
                      className="flex-1 rounded-lg border border-paper-3 bg-paper p-2 text-sm outline-none"
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Preço €"
                      value={v.price || ''}
                      onChange={(e) => {
                        const copy = [...variants]
                        copy[i].price = parseFloat(e.target.value) || 0
                        setVariants(copy)
                      }}
                      className="w-24 rounded-lg border border-paper-3 bg-paper p-2 text-sm outline-none"
                      required
                    />
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                        className="text-red-500 p-1"
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
                className="rounded border-paper-3 text-ember"
              />
              <label htmlFor="feat" className="text-xs font-medium text-ink cursor-pointer">
                Destacar na página inicial
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="w-full bg-ink hover:bg-ember text-paper font-semibold py-3.5 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? 'A guardar...' : editingId ? 'Atualizar Peça' : 'Publicar Peça'}
            </button>
          </form>

          {/* Listagem de Peças Existentes */}
          <div>
            <h3 className="text-xl font-bold text-ink mb-4">Peças em Catálogo ({productsList.length})</h3>
            <div className="grid gap-3">
              {productsList.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3.5 bg-paper rounded-xl border border-paper-3 hover:border-ink/20 transition"
                >
                  <div className="flex items-center gap-3">
                    {prod.images?.[0]?.src ? (
                      <img src={prod.images[0].src} alt="" className="h-12 w-12 rounded-lg object-cover border border-paper-3" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-paper-2 flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-ink-3" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-ink">{prod.name}</h4>
                      <p className="text-xs text-ink-3 flex items-center gap-2 mt-0.5">
                        <span>{prod.category_id}</span>
                        <span>·</span>
                        <span>{prod.base_price?.toFixed(2)} €</span>
                        <span>·</span>
                        <span className="text-red-500 font-bold flex items-center gap-1">
                          <Heart className="h-3 w-3 fill-current" />
                          {favoritesCounts[prod.id] || 0}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditProduct(prod)}
                      className="p-2 rounded-lg border border-paper-3 hover:bg-paper-2 text-ink"
                      title="Editar"
                    >
                      <Edit3 className="h-4 w-4 text-ember" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          ABA 3: CATEGORIAS (CRIAR, EDITAR, FOTO DE CAPA)
      ========================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-10">
          <form onSubmit={handleSubmitCategory} className="space-y-6 bg-paper p-6 rounded-2xl border border-paper-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-paper-3 pb-3">
              <h2 className="text-lg font-bold text-ink">
                {editingCatId ? `Editar Categoria (${catName})` : 'Criar Nova Categoria'}
              </h2>
              {editingCatId && (
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg border border-paper-3 hover:bg-paper-2"
                >
                  <X className="h-3.5 w-3.5" /> Cancelar
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Ex: Porta-chaves"
                  className="w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                  Slug / Identificador (URL)
                </label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="Ex: porta-chaves"
                  disabled={Boolean(editingCatId)}
                  className="w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember disabled:opacity-60"
                />
              </div>
            </div>

            {/* Foto de Capa da Categoria */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                Fotografia de Capa da Categoria
              </label>
              <input
                ref={catFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={handleCatImageUpload}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  disabled={uploadingCatImage}
                  onClick={() => catFileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-paper-3 bg-paper-2 hover:bg-paper-3 text-xs font-semibold text-ink transition disabled:opacity-50"
                >
                  {uploadingCatImage ? (
                    <Loader2 className="h-4 w-4 animate-spin text-ember" />
                  ) : (
                    <UploadCloud className="h-4 w-4 text-ember" />
                  )}
                  <span>Escolher Foto de Capa</span>
                </button>

                {catImage && (
                  <div className="flex items-center gap-2">
                    <img src={catImage} alt="Capa" className="h-12 w-12 rounded-xl object-cover border border-paper-3" />
                    <button
                      type="button"
                      onClick={() => setCatImage('')}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                Tagline (Frase de Destaque)
              </label>
              <input
                type="text"
                value={catTagline}
                onChange={(e) => setCatTagline(e.target.value)}
                placeholder="Ex: Leva contigo os teus designs favoritos"
                className="w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                Descrição Completa
              </label>
              <textarea
                rows={3}
                value={catDescription}
                onChange={(e) => setCatDescription(e.target.value)}
                placeholder="Ex: Peças práticas e colecionáveis para levar no dia a dia."
                className="w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="catFeat"
                  checked={catFeatured}
                  onChange={(e) => setCatFeatured(e.target.checked)}
                  className="rounded border-paper-3 text-ember"
                />
                <label htmlFor="catFeat" className="text-xs font-medium text-ink cursor-pointer">
                  Destacar na página inicial
                </label>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-ink">Ordem:</label>
                <input
                  type="number"
                  value={catOrder}
                  onChange={(e) => setCatOrder(parseInt(e.target.value) || 0)}
                  className="w-16 rounded-lg border border-paper-3 bg-paper-2 p-1.5 text-xs outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingCatImage}
              className="w-full bg-ink hover:bg-ember text-paper font-semibold py-3.5 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? 'A guardar...' : editingCatId ? 'Atualizar Categoria' : 'Criar Categoria'}
            </button>
          </form>

          {/* Grelha de Categorias Existentes */}
          <div>
            <h3 className="text-xl font-bold text-ink mb-4">Categorias Ativas ({categoriesList.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoriesList.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-4 bg-paper rounded-2xl border border-paper-3 hover:border-ink/20 transition"
                >
                  <div className="flex items-center gap-3">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="h-14 w-14 rounded-xl object-cover border border-paper-3 bg-paper-2" />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-paper-2 border border-paper-3 flex items-center justify-center text-ink-3">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-ink">{cat.name}</h4>
                      <p className="text-xs text-ink-3 line-clamp-1">{cat.tagline || cat.description || 'Sem descrição'}</p>
                      <span className="text-[10px] font-mono text-ink-3">slug: /{cat.slug || cat.id}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleEditCategory(cat)}
                    className="p-2 rounded-lg border border-paper-3 hover:bg-paper-2 text-ink"
                    title="Editar Categoria e Foto"
                  >
                    <Edit3 className="h-4 w-4 text-ember" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}