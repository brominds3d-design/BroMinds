
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
  Gift,
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

const PACK_TYPES = [
  { value: 'base', label: 'Base' },
  { value: 'placa', label: 'Placa' },
  { value: 'decorativo', label: 'Boneco / Elemento decorativo' },
] as const

const PACK_SIZES = [
  { value: 'S', label: 'Pequeno (S)' },
  { value: 'M', label: 'Médio (M)' },
  { value: 'L', label: 'Grande (L)' },
] as const

type PackType = 'base' | 'placa' | 'decorativo'
type PackSize = 'S' | 'M' | 'L'

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

        imgBitmap.close()

        if (finalBlob) return finalBlob
      } else {
        imgBitmap.close()
      }
    } catch (bitmapErr) {
      console.warn('createImageBitmap ignorado:', bitmapErr)
    }
  }

  return blobToProcess
}

function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'christmas-packs'
  >('overview')

  // Dados globais
  const [productsList, setProductsList] = useState<any[]>([])
  const [categoriesList, setCategoriesList] =
    useState<any[]>(DEFAULT_CATEGORIES)
  const [usersList, setUsersList] = useState<any[]>([])
  const [favoritesCounts, setFavoritesCounts] = useState<
    Record<string, number>
  >({})
  const [totalFavsCount, setTotalFavsCount] = useState(0)

  // Feedback geral
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  // Feedback dos packs
  const [packSavingId, setPackSavingId] = useState<string | null>(null)
  const [packSuccess, setPackSuccess] = useState('')
  const [packError, setPackError] = useState('')

  // Formulário de produto
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('halloween')
  const [shortDesc, setShortDesc] = useState('')
  const [imagesList, setImagesList] = useState<
    Array<{ src: string; alt: string }>
  >([])
  const [featured, setFeatured] = useState(false)

  const [availablePalette, setAvailablePalette] = useState<
    Array<{ id?: string; name: string; hex: string }>
  >([])

  const [selectedColors, setSelectedColors] = useState<
    Array<{ name: string; hex: string }>
  >([])

  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#e3dac9')
  const [showColorForm, setShowColorForm] = useState(false)

  const [variants, setVariants] = useState<
    Array<{ name: string; price: number; dimensions: string }>
  >([{ name: 'Único', price: 0, dimensions: '' }])

  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Formulário de categoria
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

  // ============================================================
  // CARREGAMENTO DOS DADOS
  // ============================================================

  const fetchData = async () => {
    // 1. Produtos
    const { data: prods, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (productsError) {
      console.error('Erro ao carregar produtos:', productsError.message)
    } else if (prods) {
      setProductsList(prods)
    }

    // 2. Categorias
    const { data: cats, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true })

    if (categoriesError) {
      console.error('Erro ao carregar categorias:', categoriesError.message)
    } else if (cats && cats.length > 0) {
      setCategoriesList(cats)
    }

    // 3. Perfis / Logins
    const { data: profiles, error: profilesError } = await supabase
      .from('customer_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Erro ao carregar perfis:', profilesError.message)
    } else if (profiles) {
      setUsersList(profiles)
    }

    // 4. Favoritos
    const { data: favs, error: favoritesError } = await supabase
      .from('favorites')
      .select('product_id')

    if (favoritesError) {
      console.error('Erro ao carregar favoritos:', favoritesError.message)
    } else if (favs) {
      setTotalFavsCount(favs.length)

      const counts: Record<string, number> = {}

      favs.forEach((f) => {
        counts[f.product_id] = (counts[f.product_id] || 0) + 1
      })

      setFavoritesCounts(counts)
    }

    // 5. Cores
    const { data: colors, error: colorsError } = await supabase
      .from('colors')
      .select('*')
      .order('name', { ascending: true })

    if (colorsError) {
      console.error('Erro ao carregar cores:', colorsError.message)
    } else if (colors && colors.length > 0) {
      setAvailablePalette(colors)

      setSelectedColors((current) =>
        current.length === 0
          ? [{ name: colors[0].name, hex: colors[0].hex }]
          : current,
      )
    }
  }

  useEffect(() => {
    void fetchData()
  }, [])

  // ============================================================
  // LÓGICA DE CONFIGURAÇÃO DOS PACKS DE NATAL
  // ============================================================

  const updatePackField = (
    productId: string,
    field: 'pack_eligible' | 'pack_type' | 'pack_size' | 'pack_price',
    value: boolean | PackType | PackSize | number | null,
  ) => {
    setProductsList((current) =>
      current.map((product) =>
        product.id === productId
          ? { ...product, [field]: value }
          : product,
      ),
    )

    setPackSuccess('')
    setPackError('')
  }

  const savePackConfiguration = async (product: any) => {
    setPackSuccess('')
    setPackError('')

    if (product.pack_eligible) {
      if (!product.pack_type) {
        setPackError(
          `Seleciona o tipo de peça para "${product.name}".`,
        )
        return
      }

      if (
        (product.pack_type === 'base' ||
          product.pack_type === 'placa') &&
        !product.pack_size
      ) {
        setPackError(
          `Seleciona o tamanho S, M ou L para "${product.name}".`,
        )
        return
      }

      if (
        product.pack_price === null ||
        product.pack_price === undefined ||
        product.pack_price === '' ||
        !Number.isFinite(Number(product.pack_price)) ||
        Number(product.pack_price) < 0
      ) {
        setPackError(
          `Indica um preço válido para "${product.name}".`,
        )
        return
      }
    }

    setPackSavingId(product.id)

    const payload = {
      pack_eligible: Boolean(product.pack_eligible),
      pack_type: product.pack_eligible ? product.pack_type : null,
      pack_size:
        product.pack_eligible &&
        (product.pack_type === 'base' || product.pack_type === 'placa')
          ? product.pack_size
          : null,
      pack_price:
        product.pack_eligible &&
        product.pack_price !== null &&
        product.pack_price !== undefined &&
        product.pack_price !== ''
          ? Number(product.pack_price)
          : null,
    }

    try {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', product.id)

      if (error) throw error

      setProductsList((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, ...payload } : item,
        ),
      )

      setPackSuccess(
        `Configuração de "${product.name}" guardada com sucesso.`,
      )
    } catch (err: any) {
      setPackError(
        err?.message ||
          'Não foi possível guardar a configuração do pack.',
      )
    } finally {
      setPackSavingId(null)
    }
  }

  const eligiblePackProducts = productsList.filter(
    (product) => product.pack_eligible,
  )

  const packBaseCount = eligiblePackProducts.filter(
    (product) => product.pack_type === 'base',
  ).length

  const packPlateCount = eligiblePackProducts.filter(
    (product) => product.pack_type === 'placa',
  ).length

  const packDecorativeCount = eligiblePackProducts.filter(
    (product) => product.pack_type === 'decorativo',
  ).length

  // ============================================================
  // LÓGICA DE PRODUTOS
  // ============================================================

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)

    try {
      const uploaded: Array<{ src: string; alt: string }> = []

      for (let i = 0; i < files.length; i++) {
        const processedBlob = await processImage(files[i])

        const cleanFileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 7)}.jpg`

        const filePath = `itens/${cleanFileName}`

        const { error: uploadError } = await supabase.storage
          .from('produtos')
          .upload(filePath, processedBlob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: true,
          })

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('produtos')
          .getPublicUrl(filePath)

        uploaded.push({
          src: data.publicUrl,
          alt: name || 'Foto da peça',
        })
      }

      setImagesList((prev) => [...prev, ...uploaded])
    } catch (err: any) {
      alert(
        'Erro ao carregar fotos: ' +
          (err.message || 'Verifica a ligação.'),
      )
    } finally {
      setUploadingImage(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleEditProduct = (prod: any) => {
    setEditingId(prod.id)
    setName(prod.name || '')
    setCategoryId(prod.category_id || 'halloween')
    setShortDesc(prod.short_description || '')
    setImagesList(Array.isArray(prod.images) ? prod.images : [])
    setFeatured(Boolean(prod.featured))

    setSelectedColors(
      prod.colors && prod.colors.length > 0
        ? prod.colors
        : availablePalette.length > 0
          ? [
              {
                name: availablePalette[0].name,
                hex: availablePalette[0].hex,
              },
            ]
          : [],
    )

    setVariants(
      prod.variants && prod.variants.length > 0
        ? prod.variants
        : [
            {
              name: 'Único',
              price: prod.base_price || 0,
              dimensions: '',
            },
          ],
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
      setSelectedColors([
        {
          name: availablePalette[0].name,
          hex: availablePalette[0].hex,
        },
      ])
    } else {
      setSelectedColors([])
    }

    setVariants([{ name: 'Único', price: 0, dimensions: '' }])
    setShowColorForm(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const toggleColor = (color: { name: string; hex: string }) => {
    if (
      selectedColors.some(
        (c) => c.name.toLowerCase() === color.name.toLowerCase(),
      )
    ) {
      setSelectedColors(
        selectedColors.filter(
          (c) => c.name.toLowerCase() !== color.name.toLowerCase(),
        ),
      )
    } else {
      setSelectedColors([
        ...selectedColors,
        { name: color.name, hex: color.hex },
      ])
    }
  }

  const handleAddNewColor = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newColorName.trim()) return

    const colorName = newColorName.trim()
    const colorHex = newColorHex.trim()

    const { error } = await supabase
      .from('colors')
      .insert([{ name: colorName, hex: colorHex }])

    if (error) {
      alert('Erro ao adicionar cor: ' + error.message)
      return
    }

    const newColor = { name: colorName, hex: colorHex }

    setAvailablePalette((prev) => [...prev, newColor])
    setSelectedColors((prev) => [...prev, newColor])
    setNewColorName('')
    setShowColorForm(false)
  }

  const removeColorFromPalette = async (
    colorName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation()

    if (!confirm(`Eliminar "${colorName}" da paleta permanente?`)) return

    const { error } = await supabase
      .from('colors')
      .delete()
      .eq('name', colorName)

    if (error) {
      alert('Erro ao eliminar cor: ' + error.message)
      return
    }

    setAvailablePalette((prev) =>
      prev.filter((c) => c.name !== colorName),
    )

    setSelectedColors((prev) =>
      prev.filter((c) => c.name !== colorName),
    )
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

    try {
      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error

        setSuccess('Peça atualizada com sucesso!')
      } else {
        const { error } = await supabase
          .from('products')
          .insert([payload])

        if (error) throw error

        setSuccess('Peça criada com sucesso!')
      }

      resetProductForm()
      await fetchData()
    } catch (err: any) {
      alert(
        `${editingId ? 'Erro ao atualizar' : 'Erro ao criar'}: ${
          err.message || 'Erro desconhecido.'
        }`,
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (
    id: string,
    prodName: string,
  ) => {
    if (!confirm(`Eliminar "${prodName}"?`)) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Erro: ' + error.message)
    } else {
      if (editingId === id) resetProductForm()
      await fetchData()
    }
  }

  // ============================================================
  // LÓGICA DE CATEGORIAS
  // ============================================================

  const handleCatImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCatImage(true)

    try {
      const processedBlob = await processImage(file)

      const cleanFileName = `cat-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 6)}.jpg`

      const filePath = `itens/${cleanFileName}`

      const { error: uploadError } = await supabase.storage
        .from('produtos')
        .upload(filePath, processedBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('produtos')
        .getPublicUrl(filePath)

      setCatImage(data.publicUrl)
    } catch (err: any) {
      alert(
        'Erro ao carregar foto da categoria: ' + err.message,
      )
    } finally {
      setUploadingCatImage(false)

      if (catFileInputRef.current) {
        catFileInputRef.current.value = ''
      }
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

    try {
      const { error } = await supabase
        .from('categories')
        .upsert([payload])

      if (error) throw error

      setSuccess('Categoria guardada com sucesso!')
      resetCategoryForm()
      await fetchData()
    } catch (err: any) {
      alert('Erro ao guardar categoria: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // INTERFACE
  // ============================================================

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">
            Painel de Gestão · BroMinds
          </h1>
          <p className="text-sm text-ink-3">
            Métricas, catálogo de peças, categorias e configuração de packs.
          </p>
        </div>
      </div>

      {/* Navegação */}
      <div className="flex flex-wrap border-b border-paper-3 mb-8 gap-2">
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
          Visão Geral
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

        <button
          type="button"
          onClick={() => {
            setActiveTab('christmas-packs')
            setPackSuccess('')
            setPackError('')
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'christmas-packs'
              ? 'border-ember text-ember'
              : 'border-transparent text-ink-2 hover:text-ink'
          }`}
        >
          <Gift className="h-4 w-4" />
          Packs de Natal
        </button>
      </div>

      {/* Mensagem de sucesso geral */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 text-sm font-semibold">
          <CheckCircle className="h-5 w-5" />
          {success}
        </div>
      )}

      {/* ========================================================
          ABA 1: VISÃO GERAL
      ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-paper p-5 rounded-2xl border border-paper-3 shadow-sm">
              <div className="flex items-center justify-between text-ink-3">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Pessoas Registadas (@)
                </span>
                <Users className="h-5 w-5 text-ember" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-ink">
                {usersList.length}
              </p>
              <p className="mt-1 text-xs text-ink-3">
                Contas criadas com @handle
              </p>
            </div>

            <div className="bg-paper p-5 rounded-2xl border border-paper-3 shadow-sm">
              <div className="flex items-center justify-between text-ink-3">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Total de Favoritos
                </span>
                <Heart className="h-5 w-5 text-red-500 fill-current" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-ink">
                {totalFavsCount}
              </p>
              <p className="mt-1 text-xs text-ink-3">
                Peças guardadas por clientes
              </p>
            </div>

            <div className="bg-paper p-5 rounded-2xl border border-paper-3 shadow-sm">
              <div className="flex items-center justify-between text-ink-3">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Peças Publicadas
                </span>
                <Package className="h-5 w-5 text-ink-2" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-ink">
                {productsList.length}
              </p>
              <p className="mt-1 text-xs text-ink-3">
                Distribuídas em {categoriesList.length} coleções
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clientes */}
            <div className="bg-paper p-6 rounded-2xl border border-paper-3 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-ember" />
                Clientes Identificados ({usersList.length})
              </h2>

              {usersList.length === 0 ? (
                <p className="text-xs text-ink-3 py-4">
                  Ainda nenhum cliente criou o seu @handle.
                </p>
              ) : (
                <div className="divide-y divide-paper-3 max-h-80 overflow-y-auto">
                  {usersList.map((u) => (
                    <div
                      key={u.id}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-ink">
                          @{u.handle}
                        </span>

                        {u.display_name && (
                          <span className="ml-2 text-ink-3">
                            ({u.display_name})
                          </span>
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

            {/* Favoritos */}
            <div className="bg-paper p-6 rounded-2xl border border-paper-3 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink mb-4 flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500 fill-current" />
                Peças Mais Guardadas
              </h2>

              {productsList.length === 0 ? (
                <p className="text-xs text-ink-3 py-4">
                  Sem peças registadas.
                </p>
              ) : (
                <div className="divide-y divide-paper-3 max-h-80 overflow-y-auto">
                  {[...productsList]
                    .sort(
                      (a, b) =>
                        (favoritesCounts[b.id] || 0) -
                        (favoritesCounts[a.id] || 0),
                    )
                    .slice(0, 6)
                    .map((prod) => (
                      <div
                        key={prod.id}
                        className="py-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          {prod.images?.[0]?.src ? (
                            <img
                              src={prod.images[0].src}
                              alt=""
                              className="h-8 w-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-paper-2 flex items-center justify-center">
                              <Package className="h-4 w-4 text-ink-3" />
                            </div>
                          )}

                          <span className="font-semibold text-ink line-clamp-1">
                            {prod.name}
                          </span>
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

      {/* ========================================================
          ABA 2: PEÇAS
      ========================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-10">
          <form
            onSubmit={handleSubmitProduct}
            className="space-y-6 bg-paper p-6 rounded-2xl border border-paper-3 shadow-sm"
          >
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
                  <X className="h-3.5 w-3.5" />
                  Cancelar Edição
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

            {/* Fotografias */}
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
                    <span className="text-xs font-semibold text-ink">
                      A carregar fotos...
                    </span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-6 w-6 text-ember group-hover:scale-110 transition" />
                    <span className="text-sm font-semibold text-ink">
                      Clica para escolher fotos
                    </span>
                  </>
                )}
              </button>

              {imagesList.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {imagesList.map((img, idx) => (
                    <div
                      key={`${img.src}-${idx}`}
                      className="relative aspect-square rounded-xl overflow-hidden border border-paper-3 bg-paper-2"
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setImagesList((current) =>
                            current.filter((_, i) => i !== idx),
                          )
                        }
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
                <form
                  onSubmit={handleAddNewColor}
                  className="mb-3.5 p-3 rounded-xl border border-paper-3 bg-paper-2 flex flex-wrap items-center gap-2.5"
                >
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
                    type="submit"
                    className="bg-ink hover:bg-ember text-paper px-3 py-2 rounded-lg text-xs font-semibold"
                  >
                    Guardar Cor
                  </button>
                </form>
              )}

              <div className="flex flex-wrap gap-2">
                {availablePalette.map((col) => {
                  const active = selectedColors.some(
                    (c) =>
                      c.name.toLowerCase() === col.name.toLowerCase(),
                  )

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

                      <span
                        onClick={(e) =>
                          void removeColorFromPalette(col.name, e)
                        }
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
                  onClick={() =>
                    setVariants((current) => [
                      ...current,
                      { name: '', price: 0, dimensions: '' },
                    ])
                  }
                  className="text-xs flex items-center gap-1 text-ember hover:underline font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar tamanho
                </button>
              </div>

              <div className="space-y-2">
                {variants.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-paper-2 p-2.5 rounded-xl border border-paper-3"
                  >
                    <input
                      type="text"
                      placeholder="Tamanho"
                      value={v.name}
                      onChange={(e) => {
                        const copy = [...variants]
                        copy[i] = { ...copy[i], name: e.target.value }
                        setVariants(copy)
                      }}
                      className="flex-1 min-w-0 rounded-lg border border-paper-3 bg-paper p-2 text-sm outline-none"
                      required
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Preço €"
                      value={v.price || ''}
                      onChange={(e) => {
                        const copy = [...variants]
                        copy[i] = {
                          ...copy[i],
                          price: parseFloat(e.target.value) || 0,
                        }
                        setVariants(copy)
                      }}
                      className="w-24 rounded-lg border border-paper-3 bg-paper p-2 text-sm outline-none"
                      required
                    />

                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setVariants((current) =>
                            current.filter((_, idx) => idx !== i),
                          )
                        }
                        className="text-red-500 p-1"
                        aria-label="Remover tamanho"
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
              <label
                htmlFor="feat"
                className="text-xs font-medium text-ink cursor-pointer"
              >
                Destacar na página inicial
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="w-full bg-ink hover:bg-ember text-paper font-semibold py-3.5 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading
                ? 'A guardar...'
                : editingId
                  ? 'Atualizar Peça'
                  : 'Publicar Peça'}
            </button>
          </form>

          {/* Listagem de peças */}
          <div>
            <h3 className="text-xl font-bold text-ink mb-4">
              Peças em Catálogo ({productsList.length})
            </h3>

            <div className="grid gap-3">
              {productsList.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between gap-3 p-3.5 bg-paper rounded-xl border border-paper-3 hover:border-ink/20 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {prod.images?.[0]?.src ? (
                      <img
                        src={prod.images[0].src}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover border border-paper-3"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-paper-2 flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-ink-3" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-ink">
                        {prod.name}
                      </h4>

                      <p className="text-xs text-ink-3 flex flex-wrap items-center gap-2 mt-0.5">
                        <span>{prod.category_id}</span>
                        <span>·</span>
                        <span>
                          {Number(prod.base_price || 0).toFixed(2)} €
                        </span>
                        <span>·</span>
                        <span className="text-red-500 font-bold flex items-center gap-1">
                          <Heart className="h-3 w-3 fill-current" />
                          {favoritesCounts[prod.id] || 0}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
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
                      onClick={() =>
                        void handleDeleteProduct(prod.id, prod.name)
                      }
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

      {/* ========================================================
          ABA 3: CATEGORIAS
      ========================================================= */}
      {activeTab === 'categories' && (
        <div className="space-y-10">
          <form
            onSubmit={handleSubmitCategory}
            className="space-y-6 bg-paper p-6 rounded-2xl border border-paper-3 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-paper-3 pb-3">
              <h2 className="text-lg font-bold text-ink">
                {editingCatId
                  ? `Editar Categoria (${catName})`
                  : 'Criar Nova Categoria'}
              </h2>

              {editingCatId && (
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg border border-paper-3 hover:bg-paper-2"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancelar
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

            {/* Imagem de capa */}
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

              <div className="flex flex-wrap items-center gap-4">
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
                    <img
                      src={catImage}
                      alt="Capa"
                      className="h-12 w-12 rounded-xl object-cover border border-paper-3"
                    />

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

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="catFeat"
                  checked={catFeatured}
                  onChange={(e) => setCatFeatured(e.target.checked)}
                  className="rounded border-paper-3 text-ember"
                />

                <label
                  htmlFor="catFeat"
                  className="text-xs font-medium text-ink cursor-pointer"
                >
                  Destacar na página inicial
                </label>
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="catOrder"
                  className="text-xs font-bold text-ink"
                >
                  Ordem:
                </label>

                <input
                  id="catOrder"
                  type="number"
                  value={catOrder}
                  onChange={(e) =>
                    setCatOrder(parseInt(e.target.value, 10) || 0)
                  }
                  className="w-16 rounded-lg border border-paper-3 bg-paper-2 p-1.5 text-xs outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingCatImage}
              className="w-full bg-ink hover:bg-ember text-paper font-semibold py-3.5 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading
                ? 'A guardar...'
                : editingCatId
                  ? 'Atualizar Categoria'
                  : 'Criar Categoria'}
            </button>
          </form>

          {/* Categorias existentes */}
          <div>
            <h3 className="text-xl font-bold text-ink mb-4">
              Categorias Ativas ({categoriesList.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoriesList.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-3 p-4 bg-paper rounded-2xl border border-paper-3 hover:border-ink/20 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-14 w-14 rounded-xl object-cover border border-paper-3 bg-paper-2"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-paper-2 border border-paper-3 flex items-center justify-center text-ink-3">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-ink">
                        {cat.name}
                      </h4>

                      <p className="text-xs text-ink-3 line-clamp-1">
                        {cat.tagline || cat.description || 'Sem descrição'}
                      </p>

                      <span className="text-[10px] font-mono text-ink-3">
                        slug: /{cat.slug || cat.id}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleEditCategory(cat)}
                    className="p-2 rounded-lg border border-paper-3 hover:bg-paper-2 text-ink shrink-0"
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

      {/* ========================================================
          ABA 4: PACKS DE NATAL
      ========================================================= */}
      {activeTab === 'christmas-packs' && (
        <div className="space-y-6">
          {/* Introdução */}
          <div className="bg-paper p-6 rounded-2xl border border-paper-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-ember/10 text-ember">
                <Gift className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-ink">
                  Configuração dos Packs de Natal
                </h2>

                <p className="mt-1 text-sm text-ink-3">
                  Escolhe quais os produtos que podem integrar os packs,
                  define a função de cada peça e estabelece o respetivo
                  preço dentro do pack.
                </p>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-paper p-4 rounded-xl border border-paper-3">
              <p className="text-xs text-ink-3 font-semibold">
                Produtos no catálogo
              </p>
              <p className="text-2xl font-extrabold text-ink mt-1">
                {productsList.length}
              </p>
            </div>

            <div className="bg-paper p-4 rounded-xl border border-paper-3">
              <p className="text-xs text-ink-3 font-semibold">
                Elegíveis para packs
              </p>
              <p className="text-2xl font-extrabold text-ember mt-1">
                {eligiblePackProducts.length}
              </p>
            </div>

            <div className="bg-paper p-4 rounded-xl border border-paper-3">
              <p className="text-xs text-ink-3 font-semibold">
                Bases configuradas
              </p>
              <p className="text-2xl font-extrabold text-ink mt-1">
                {packBaseCount}
              </p>
            </div>

            <div className="bg-paper p-4 rounded-xl border border-paper-3">
              <p className="text-xs text-ink-3 font-semibold">
                Placas configuradas
              </p>
              <p className="text-2xl font-extrabold text-ink mt-1">
                {packPlateCount}
              </p>
            </div>
          </div>

          {/* Descontos informativos */}
          <div className="bg-paper-2 p-5 rounded-2xl border border-paper-3">
            <h3 className="font-bold text-ink mb-3">
              Escalões de desconto previstos
            </h3>

            <p className="text-xs text-ink-3 mb-3">
              Só contam os bonecos e elementos decorativos. A base e a
              placa não contam para o número de peças.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { pieces: '0–2 peças', discount: '0%' },
                { pieces: '3–4 peças', discount: '5%' },
                { pieces: '5–6 peças', discount: '8%' },
                { pieces: '7 ou mais', discount: '12%' },
              ].map((tier) => (
                <div
                  key={tier.pieces}
                  className="p-3 bg-paper rounded-xl border border-paper-3"
                >
                  <p className="text-xs text-ink-3">{tier.pieces}</p>
                  <p className="text-xl font-extrabold text-ember mt-1">
                    {tier.discount}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-ink-3 mt-3">
              Estes escalões são informativos nesta página de administração.
              O cálculo do desconto e o preço final serão implementados no
              configurador do cliente.
            </p>
          </div>

          {/* Feedback */}
          {packSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 text-sm font-semibold">
              <CheckCircle className="h-5 w-5 shrink-0" />
              {packSuccess}
            </div>
          )}

          {packError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
              {packError}
            </div>
          )}

          {/* Lista de produtos configuráveis */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
              <div>
                <h3 className="text-xl font-bold text-ink">
                  Produtos e preços dos packs
                </h3>
                <p className="text-xs text-ink-3 mt-1">
                  As alterações só são guardadas quando clicas em
                  «Guardar configuração».
                </p>
              </div>

              <span className="text-xs text-ink-3">
                {packDecorativeCount} elementos decorativos configurados
              </span>
            </div>

            {productsList.length === 0 ? (
              <div className="bg-paper p-8 rounded-2xl border border-paper-3 text-center">
                <Package className="h-8 w-8 mx-auto text-ink-3 mb-3" />
                <p className="font-semibold text-ink">
                  Ainda não existem produtos.
                </p>
                <p className="text-sm text-ink-3 mt-1">
                  Cria primeiro as peças na aba Peças.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {productsList.map((prod) => {
                  const eligible = Boolean(prod.pack_eligible)
                  const selectedType = prod.pack_type || ''
                  const needsSize =
                    selectedType === 'base' || selectedType === 'placa'

                  return (
                    <div
                      key={prod.id}
                      className={`bg-paper rounded-2xl border p-4 sm:p-5 shadow-sm transition ${
                        eligible
                          ? 'border-ember/50'
                          : 'border-paper-3'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {prod.images?.[0]?.src ? (
                          <img
                            src={prod.images[0].src}
                            alt={prod.name}
                            className="h-16 w-16 rounded-xl object-cover border border-paper-3 shrink-0"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-xl bg-paper-2 border border-paper-3 flex items-center justify-center shrink-0">
                            <Package className="h-6 w-6 text-ink-3" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-ink">
                            {prod.name}
                          </h4>

                          <p className="text-xs text-ink-3 mt-1">
                            Categoria: {prod.category_id || 'Sem categoria'}
                          </p>

                          <p className="text-xs text-ink-3 mt-0.5">
                            Preço normal:{' '}
                            {Number(prod.base_price || 0).toFixed(2)} €
                          </p>
                        </div>

                        <label className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={eligible}
                            onChange={(e) =>
                              updatePackField(
                                prod.id,
                                'pack_eligible',
                                e.target.checked,
                              )
                            }
                            className="h-5 w-5 rounded border-paper-3 text-ember focus:ring-ember"
                          />
                          <span className="text-[10px] text-ink-3 font-semibold">
                            Elegível
                          </span>
                        </label>
                      </div>

                      {eligible && (
                        <div className="mt-5 pt-4 border-t border-paper-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* Tipo */}
                          <div>
                            <label
                              htmlFor={`pack-type-${prod.id}`}
                              className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5"
                            >
                              Tipo de peça
                            </label>

                            <select
                              id={`pack-type-${prod.id}`}
                              value={selectedType}
                              onChange={(e) => {
                                const value = e.target.value as PackType | ''

                                updatePackField(
                                  prod.id,
                                  'pack_type',
                                  value || null,
                                )

                                if (value === 'decorativo') {
                                  updatePackField(
                                    prod.id,
                                    'pack_size',
                                    null,
                                  )
                                }
                              }}
                              className="w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember"
                            >
                              <option value="">Selecionar tipo...</option>

                              {PACK_TYPES.map((type) => (
                                <option
                                  key={type.value}
                                  value={type.value}
                                >
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Tamanho */}
                          <div>
                            <label
                              htmlFor={`pack-size-${prod.id}`}
                              className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5"
                            >
                              Tamanho
                            </label>

                            <select
                              id={`pack-size-${prod.id}`}
                              value={prod.pack_size || ''}
                              disabled={!needsSize}
                              onChange={(e) =>
                                updatePackField(
                                  prod.id,
                                  'pack_size',
                                  (e.target.value || null) as PackSize | null,
                                )
                              }
                              className="w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember disabled:opacity-50"
                            >
                              <option value="">
                                {needsSize
                                  ? 'Selecionar tamanho...'
                                  : 'Não aplicável'}
                              </option>

                              {PACK_SIZES.map((size) => (
                                <option
                                  key={size.value}
                                  value={size.value}
                                >
                                  {size.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Preço */}
                          <div>
                            <label
                              htmlFor={`pack-price-${prod.id}`}
                              className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5"
                            >
                              Preço no pack (€)
                            </label>

                            <input
                              id={`pack-price-${prod.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={prod.pack_price ?? ''}
                              onChange={(e) =>
                                updatePackField(
                                  prod.id,
                                  'pack_price',
                                  e.target.value === ''
                                    ? null
                                    : Number(e.target.value),
                                )
                              }
                              placeholder="Ex: 5.00"
                              className="w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember"
                            />
                          </div>
                        </div>
                      )}

                      {eligible && (
                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <p className="text-[11px] text-ink-3">
                            {selectedType === 'base'
                              ? 'Esta peça será uma base obrigatória no configurador.'
                              : selectedType === 'placa'
                                ? 'Esta placa será apresentada como opção adicional.'
                                : selectedType === 'decorativo'
                                  ? 'Esta peça contará para os escalões de desconto.'
                                  : 'Seleciona o tipo para concluir a configuração.'}
                          </p>

                          <button
                            type="button"
                            disabled={packSavingId === prod.id}
                            onClick={() =>
                              void savePackConfiguration(prod)
                            }
                            className="flex items-center justify-center gap-2 bg-ink hover:bg-ember text-paper px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                          >
                            {packSavingId === prod.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                A guardar...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Guardar configuração
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {!eligible && (
                        <p className="text-xs text-ink-3 mt-3">
                          Este produto não aparece no configurador enquanto
                          não for marcado como elegível.
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Nota final */}
          <div className="p-4 rounded-xl border border-paper-3 bg-paper-2">
            <p className="text-xs text-ink-3 leading-relaxed">
              <strong className="text-ink">Nota:</strong> esta aba permite
              guardar a configuração de cada produto no Supabase. Ainda é
              necessário implementar a página pública do configurador,
              incluindo a seleção obrigatória da base, a placa opcional,
              os elementos decorativos, o cálculo do desconto e a adição
              do pack completo à encomenda.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
