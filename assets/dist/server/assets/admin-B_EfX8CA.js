import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { s as supabase } from "./router-Yi7VtT48.js";
import { LayoutDashboard, Package, Layers, Gift, CheckCircle, Users, Heart, X, Loader2, UploadCloud, Palette, Plus, Trash2, Image, Edit3 } from "lucide-react";
import "@tanstack/react-router";
import "@supabase/supabase-js";
import "zod";
const DEFAULT_CATEGORIES = [{
  id: "halloween",
  name: "Halloween"
}, {
  id: "natal",
  name: "Natal"
}, {
  id: "casa",
  name: "Casa & Utilitários"
}, {
  id: "decoracao",
  name: "Decoração"
}, {
  id: "porta-chaves",
  name: "Porta-chaves"
}, {
  id: "presentes",
  name: "Presentes"
}, {
  id: "personalizados",
  name: "Personalizados"
}];
const PACK_TYPES = [{
  value: "base",
  label: "Base"
}, {
  value: "placa",
  label: "Placa"
}, {
  value: "decorativo",
  label: "Boneco / Elemento decorativo"
}];
const PACK_SIZES = [{
  value: "S",
  label: "Pequeno (S)"
}, {
  value: "M",
  label: "Médio (M)"
}, {
  value: "L",
  label: "Grande (L)"
}];
async function processImage(file) {
  if (typeof window === "undefined") return file;
  let blobToProcess = file;
  const isHeic = file.type === "image/heic" || file.type === "image/heif" || file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");
  if (isHeic) {
    try {
      const mod = await import("heic-to");
      const convertFn = mod.heicTo || mod.default?.heicTo || mod.default || mod;
      if (typeof convertFn === "function") {
        const result = await convertFn({
          blob: file,
          type: "image/jpeg",
          quality: 0.88
        });
        const resolvedBlob = Array.isArray(result) ? result[0] : result;
        if (resolvedBlob instanceof Blob && resolvedBlob.size > 0) {
          blobToProcess = new Blob([await resolvedBlob.arrayBuffer()], {
            type: "image/jpeg"
          });
        }
      }
    } catch (err) {
      console.warn("Falha na conversão do heic-to:", err);
    }
  }
  if ("createImageBitmap" in window) {
    try {
      const imgBitmap = await createImageBitmap(blobToProcess, {
        imageOrientation: "from-image"
      });
      const MAX_DIM = 1600;
      let width = imgBitmap.width;
      let height = imgBitmap.height;
      if (width > height) {
        if (width > MAX_DIM) {
          height = Math.round(height * (MAX_DIM / width));
          width = MAX_DIM;
        }
      } else if (height > MAX_DIM) {
        width = Math.round(width * (MAX_DIM / height));
        height = MAX_DIM;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(imgBitmap, 0, 0, width, height);
        const finalBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
        imgBitmap.close();
        if (finalBlob) return finalBlob;
      } else {
        imgBitmap.close();
      }
    } catch (bitmapErr) {
      console.warn("createImageBitmap ignorado:", bitmapErr);
    }
  }
  return blobToProcess;
}
function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  const [usersList, setUsersList] = useState([]);
  const [favoritesCounts, setFavoritesCounts] = useState({});
  const [totalFavsCount, setTotalFavsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [packSavingId, setPackSavingId] = useState(null);
  const [packSuccess, setPackSuccess] = useState("");
  const [packError, setPackError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("halloween");
  const [shortDesc, setShortDesc] = useState("");
  const [imagesList, setImagesList] = useState([]);
  const [featured, setFeatured] = useState(false);
  const [availablePalette, setAvailablePalette] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#e3dac9");
  const [showColorForm, setShowColorForm] = useState(false);
  const [variants, setVariants] = useState([{
    name: "Único",
    price: 0,
    dimensions: ""
  }]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const [editingCatId, setEditingCatId] = useState(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catTagline, setCatTagline] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catFeatured, setCatFeatured] = useState(false);
  const [catOrder, setCatOrder] = useState(0);
  const [uploadingCatImage, setUploadingCatImage] = useState(false);
  const catFileInputRef = useRef(null);
  const fetchData = async () => {
    const {
      data: prods,
      error: productsError
    } = await supabase.from("products").select("*").order("created_at", {
      ascending: false
    });
    if (productsError) {
      console.error("Erro ao carregar produtos:", productsError.message);
    } else if (prods) {
      setProductsList(prods);
    }
    const {
      data: cats,
      error: categoriesError
    } = await supabase.from("categories").select("*").order("order", {
      ascending: true
    });
    if (categoriesError) {
      console.error("Erro ao carregar categorias:", categoriesError.message);
    } else if (cats && cats.length > 0) {
      setCategoriesList(cats);
    }
    const {
      data: profiles,
      error: profilesError
    } = await supabase.from("customer_profiles").select("*").order("created_at", {
      ascending: false
    });
    if (profilesError) {
      console.error("Erro ao carregar perfis:", profilesError.message);
    } else if (profiles) {
      setUsersList(profiles);
    }
    const {
      data: favs,
      error: favoritesError
    } = await supabase.from("favorites").select("product_id");
    if (favoritesError) {
      console.error("Erro ao carregar favoritos:", favoritesError.message);
    } else if (favs) {
      setTotalFavsCount(favs.length);
      const counts = {};
      favs.forEach((f) => {
        counts[f.product_id] = (counts[f.product_id] || 0) + 1;
      });
      setFavoritesCounts(counts);
    }
    const {
      data: colors,
      error: colorsError
    } = await supabase.from("colors").select("*").order("name", {
      ascending: true
    });
    if (colorsError) {
      console.error("Erro ao carregar cores:", colorsError.message);
    } else if (colors && colors.length > 0) {
      setAvailablePalette(colors);
      setSelectedColors((current) => current.length === 0 ? [{
        name: colors[0].name,
        hex: colors[0].hex
      }] : current);
    }
  };
  useEffect(() => {
    void fetchData();
  }, []);
  const updatePackField = (productId, field, value) => {
    setProductsList((current) => current.map((product) => product.id === productId ? {
      ...product,
      [field]: value
    } : product));
    setPackSuccess("");
    setPackError("");
  };
  const savePackConfiguration = async (product) => {
    setPackSuccess("");
    setPackError("");
    if (product.pack_eligible) {
      if (!product.pack_type) {
        setPackError(`Seleciona o tipo de peça para "${product.name}".`);
        return;
      }
      if ((product.pack_type === "base" || product.pack_type === "placa") && !product.pack_size) {
        setPackError(`Seleciona o tamanho S, M ou L para "${product.name}".`);
        return;
      }
      if (product.pack_price === null || product.pack_price === void 0 || product.pack_price === "" || !Number.isFinite(Number(product.pack_price)) || Number(product.pack_price) < 0) {
        setPackError(`Indica um preço válido para "${product.name}".`);
        return;
      }
    }
    setPackSavingId(product.id);
    const payload = {
      pack_eligible: Boolean(product.pack_eligible),
      pack_type: product.pack_eligible ? product.pack_type : null,
      pack_size: product.pack_eligible && (product.pack_type === "base" || product.pack_type === "placa") ? product.pack_size : null,
      pack_price: product.pack_eligible && product.pack_price !== null && product.pack_price !== void 0 && product.pack_price !== "" ? Number(product.pack_price) : null
    };
    try {
      const {
        error
      } = await supabase.from("products").update(payload).eq("id", product.id);
      if (error) throw error;
      setProductsList((current) => current.map((item) => item.id === product.id ? {
        ...item,
        ...payload
      } : item));
      setPackSuccess(`Configuração de "${product.name}" guardada com sucesso.`);
    } catch (err) {
      setPackError(err?.message || "Não foi possível guardar a configuração do pack.");
    } finally {
      setPackSavingId(null);
    }
  };
  const eligiblePackProducts = productsList.filter((product) => product.pack_eligible);
  const packBaseCount = eligiblePackProducts.filter((product) => product.pack_type === "base").length;
  const packPlateCount = eligiblePackProducts.filter((product) => product.pack_type === "placa").length;
  const packDecorativeCount = eligiblePackProducts.filter((product) => product.pack_type === "decorativo").length;
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    try {
      const uploaded = [];
      for (let i = 0; i < files.length; i++) {
        const processedBlob = await processImage(files[i]);
        const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
        const filePath = `itens/${cleanFileName}`;
        const {
          error: uploadError
        } = await supabase.storage.from("produtos").upload(filePath, processedBlob, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: true
        });
        if (uploadError) throw uploadError;
        const {
          data
        } = supabase.storage.from("produtos").getPublicUrl(filePath);
        uploaded.push({
          src: data.publicUrl,
          alt: name || "Foto da peça"
        });
      }
      setImagesList((prev) => [...prev, ...uploaded]);
    } catch (err) {
      alert("Erro ao carregar fotos: " + (err.message || "Verifica a ligação."));
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  const handleEditProduct = (prod) => {
    setEditingId(prod.id);
    setName(prod.name || "");
    setCategoryId(prod.category_id || "halloween");
    setShortDesc(prod.short_description || "");
    setImagesList(Array.isArray(prod.images) ? prod.images : []);
    setFeatured(Boolean(prod.featured));
    setSelectedColors(prod.colors && prod.colors.length > 0 ? prod.colors : availablePalette.length > 0 ? [{
      name: availablePalette[0].name,
      hex: availablePalette[0].hex
    }] : []);
    setVariants(prod.variants && prod.variants.length > 0 ? prod.variants : [{
      name: "Único",
      price: prod.base_price || 0,
      dimensions: ""
    }]);
    setActiveTab("products");
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  const resetProductForm = () => {
    setEditingId(null);
    setName("");
    setCategoryId("halloween");
    setShortDesc("");
    setImagesList([]);
    setFeatured(false);
    if (availablePalette.length > 0) {
      setSelectedColors([{
        name: availablePalette[0].name,
        hex: availablePalette[0].hex
      }]);
    } else {
      setSelectedColors([]);
    }
    setVariants([{
      name: "Único",
      price: 0,
      dimensions: ""
    }]);
    setShowColorForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const toggleColor = (color) => {
    if (selectedColors.some((c) => c.name.toLowerCase() === color.name.toLowerCase())) {
      setSelectedColors(selectedColors.filter((c) => c.name.toLowerCase() !== color.name.toLowerCase()));
    } else {
      setSelectedColors([...selectedColors, {
        name: color.name,
        hex: color.hex
      }]);
    }
  };
  const handleAddNewColor = async (e) => {
    e.preventDefault();
    if (!newColorName.trim()) return;
    const colorName = newColorName.trim();
    const colorHex = newColorHex.trim();
    const {
      error
    } = await supabase.from("colors").insert([{
      name: colorName,
      hex: colorHex
    }]);
    if (error) {
      alert("Erro ao adicionar cor: " + error.message);
      return;
    }
    const newColor = {
      name: colorName,
      hex: colorHex
    };
    setAvailablePalette((prev) => [...prev, newColor]);
    setSelectedColors((prev) => [...prev, newColor]);
    setNewColorName("");
    setShowColorForm(false);
  };
  const removeColorFromPalette = async (colorName, e) => {
    e.stopPropagation();
    if (!confirm(`Eliminar "${colorName}" da paleta permanente?`)) return;
    const {
      error
    } = await supabase.from("colors").delete().eq("name", colorName);
    if (error) {
      alert("Erro ao eliminar cor: " + error.message);
      return;
    }
    setAvailablePalette((prev) => prev.filter((c) => c.name !== colorName));
    setSelectedColors((prev) => prev.filter((c) => c.name !== colorName));
  };
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const payload = {
      slug,
      name,
      category_id: categoryId,
      base_price: variants[0]?.price || 0,
      short_description: shortDesc,
      images: imagesList,
      colors: selectedColors,
      variants,
      featured
    };
    try {
      if (editingId) {
        const {
          error
        } = await supabase.from("products").update(payload).eq("id", editingId);
        if (error) throw error;
        setSuccess("Peça atualizada com sucesso!");
      } else {
        const {
          error
        } = await supabase.from("products").insert([payload]);
        if (error) throw error;
        setSuccess("Peça criada com sucesso!");
      }
      resetProductForm();
      await fetchData();
    } catch (err) {
      alert(`${editingId ? "Erro ao atualizar" : "Erro ao criar"}: ${err.message || "Erro desconhecido."}`);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteProduct = async (id, prodName) => {
    if (!confirm(`Eliminar "${prodName}"?`)) return;
    const {
      error
    } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert("Erro: " + error.message);
    } else {
      if (editingId === id) resetProductForm();
      await fetchData();
    }
  };
  const handleCatImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCatImage(true);
    try {
      const processedBlob = await processImage(file);
      const cleanFileName = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.jpg`;
      const filePath = `itens/${cleanFileName}`;
      const {
        error: uploadError
      } = await supabase.storage.from("produtos").upload(filePath, processedBlob, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: true
      });
      if (uploadError) throw uploadError;
      const {
        data
      } = supabase.storage.from("produtos").getPublicUrl(filePath);
      setCatImage(data.publicUrl);
    } catch (err) {
      alert("Erro ao carregar foto da categoria: " + err.message);
    } finally {
      setUploadingCatImage(false);
      if (catFileInputRef.current) {
        catFileInputRef.current.value = "";
      }
    }
  };
  const handleEditCategory = (cat) => {
    setEditingCatId(cat.id);
    setCatName(cat.name || "");
    setCatSlug(cat.slug || cat.id);
    setCatTagline(cat.tagline || "");
    setCatDescription(cat.description || "");
    setCatImage(cat.image || "");
    setCatFeatured(Boolean(cat.featured));
    setCatOrder(Number(cat.order || 0));
    setActiveTab("categories");
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  const resetCategoryForm = () => {
    setEditingCatId(null);
    setCatName("");
    setCatSlug("");
    setCatTagline("");
    setCatDescription("");
    setCatImage("");
    setCatFeatured(false);
    setCatOrder(categoriesList.length + 1);
  };
  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    const generatedSlug = (catSlug || catName).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const payload = {
      id: editingCatId || generatedSlug,
      slug: generatedSlug,
      name: catName,
      tagline: catTagline,
      description: catDescription,
      image: catImage || "/img/placeholder.png",
      featured: catFeatured,
      order: Number(catOrder || 0)
    };
    try {
      const {
        error
      } = await supabase.from("categories").upsert([payload]);
      if (error) throw error;
      setSuccess("Categoria guardada com sucesso!");
      resetCategoryForm();
      await fetchData();
    } catch (err) {
      alert("Erro ao guardar categoria: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto py-10 px-4", children: [
    /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-extrabold text-ink", children: "Painel de Gestão · BroMinds" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-3", children: "Métricas, catálogo de peças, categorias e configuração de packs." })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap border-b border-paper-3 mb-8 gap-2", children: [
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setActiveTab("overview"), className: `flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${activeTab === "overview" ? "border-ember text-ember" : "border-transparent text-ink-2 hover:text-ink"}`, children: [
        /* @__PURE__ */ jsx(LayoutDashboard, { className: "h-4 w-4" }),
        "Visão Geral"
      ] }),
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setActiveTab("products"), className: `flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${activeTab === "products" ? "border-ember text-ember" : "border-transparent text-ink-2 hover:text-ink"}`, children: [
        /* @__PURE__ */ jsx(Package, { className: "h-4 w-4" }),
        "Peças (",
        productsList.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setActiveTab("categories"), className: `flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${activeTab === "categories" ? "border-ember text-ember" : "border-transparent text-ink-2 hover:text-ink"}`, children: [
        /* @__PURE__ */ jsx(Layers, { className: "h-4 w-4" }),
        "Categorias (",
        categoriesList.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
        setActiveTab("christmas-packs");
        setPackSuccess("");
        setPackError("");
      }, className: `flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${activeTab === "christmas-packs" ? "border-ember text-ember" : "border-transparent text-ink-2 hover:text-ink"}`, children: [
        /* @__PURE__ */ jsx(Gift, { className: "h-4 w-4" }),
        "Packs de Natal"
      ] })
    ] }),
    success && /* @__PURE__ */ jsxs("div", { className: "mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 text-sm font-semibold", children: [
      /* @__PURE__ */ jsx(CheckCircle, { className: "h-5 w-5" }),
      success
    ] }),
    activeTab === "overview" && /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-paper p-5 rounded-2xl border border-paper-3 shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-ink-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-bold uppercase tracking-wider", children: "Pessoas Registadas (@)" }),
            /* @__PURE__ */ jsx(Users, { className: "h-5 w-5 text-ember" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-3xl font-extrabold text-ink", children: usersList.length }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-ink-3", children: "Contas criadas com @handle" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-paper p-5 rounded-2xl border border-paper-3 shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-ink-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-bold uppercase tracking-wider", children: "Total de Favoritos" }),
            /* @__PURE__ */ jsx(Heart, { className: "h-5 w-5 text-red-500 fill-current" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-3xl font-extrabold text-ink", children: totalFavsCount }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-ink-3", children: "Peças guardadas por clientes" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-paper p-5 rounded-2xl border border-paper-3 shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-ink-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-bold uppercase tracking-wider", children: "Peças Publicadas" }),
            /* @__PURE__ */ jsx(Package, { className: "h-5 w-5 text-ink-2" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-3xl font-extrabold text-ink", children: productsList.length }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-ink-3", children: [
            "Distribuídas em ",
            categoriesList.length,
            " coleções"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-paper p-6 rounded-2xl border border-paper-3 shadow-sm", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-sm font-bold uppercase tracking-wider text-ink mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 text-ember" }),
            "Clientes Identificados (",
            usersList.length,
            ")"
          ] }),
          usersList.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-3 py-4", children: "Ainda nenhum cliente criou o seu @handle." }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-paper-3 max-h-80 overflow-y-auto", children: usersList.map((u) => /* @__PURE__ */ jsxs("div", { className: "py-2.5 flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("span", { className: "font-bold text-ink", children: [
                "@",
                u.handle
              ] }),
              u.display_name && /* @__PURE__ */ jsxs("span", { className: "ml-2 text-ink-3", children: [
                "(",
                u.display_name,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] text-ink-3", children: new Date(u.created_at).toLocaleDateString("pt-PT") })
          ] }, u.id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-paper p-6 rounded-2xl border border-paper-3 shadow-sm", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-sm font-bold uppercase tracking-wider text-ink mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Heart, { className: "h-4 w-4 text-red-500 fill-current" }),
            "Peças Mais Guardadas"
          ] }),
          productsList.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-3 py-4", children: "Sem peças registadas." }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-paper-3 max-h-80 overflow-y-auto", children: [...productsList].sort((a, b) => (favoritesCounts[b.id] || 0) - (favoritesCounts[a.id] || 0)).slice(0, 6).map((prod) => /* @__PURE__ */ jsxs("div", { className: "py-2.5 flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
              prod.images?.[0]?.src ? /* @__PURE__ */ jsx("img", { src: prod.images[0].src, alt: "", className: "h-8 w-8 rounded-lg object-cover" }) : /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-paper-2 flex items-center justify-center", children: /* @__PURE__ */ jsx(Package, { className: "h-4 w-4 text-ink-3" }) }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-ink line-clamp-1", children: prod.name })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "font-bold text-ember flex items-center gap-1 bg-ember/10 px-2 py-0.5 rounded-full", children: [
              /* @__PURE__ */ jsx(Heart, { className: "h-3 w-3 fill-current text-red-500" }),
              favoritesCounts[prod.id] || 0
            ] })
          ] }, prod.id)) })
        ] })
      ] })
    ] }),
    activeTab === "products" && /* @__PURE__ */ jsxs("div", { className: "space-y-10", children: [
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmitProduct, className: "space-y-6 bg-paper p-6 rounded-2xl border border-paper-3 shadow-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-paper-3 pb-3", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-ink", children: editingId ? "Editar Peça" : "Criar Nova Peça" }),
          editingId && /* @__PURE__ */ jsxs("button", { type: "button", onClick: resetProductForm, className: "flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg border border-paper-3 hover:bg-paper-2", children: [
            /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }),
            "Cancelar Edição"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold uppercase tracking-wider text-ink mb-1.5", children: "Nome da Peça" }),
          /* @__PURE__ */ jsx("input", { type: "text", required: true, value: name, onChange: (e) => setName(e.target.value), placeholder: "Ex: Porta-Chaves Personalizado", className: "w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold uppercase tracking-wider text-ink mb-1.5", children: "Coleção / Categoria" }),
          /* @__PURE__ */ jsx("select", { value: categoryId, onChange: (e) => setCategoryId(e.target.value), className: "w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember", children: categoriesList.map((cat) => /* @__PURE__ */ jsx("option", { value: cat.id, children: cat.name }, cat.id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold uppercase tracking-wider text-ink mb-2", children: "Fotografias da Peça" }),
          /* @__PURE__ */ jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: "image/jpeg,image/png,image/webp,image/heic,image/heif", onChange: handleFileUpload, className: "hidden" }),
          /* @__PURE__ */ jsx("button", { type: "button", disabled: uploadingImage, onClick: () => fileInputRef.current?.click(), className: "w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-paper-3 hover:border-ember rounded-2xl bg-paper-2/60 transition cursor-pointer text-center group disabled:opacity-50", children: uploadingImage ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-7 w-7 text-ember animate-spin" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-ink", children: "A carregar fotos..." })
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(UploadCloud, { className: "h-6 w-6 text-ember group-hover:scale-110 transition" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-ink", children: "Clica para escolher fotos" })
          ] }) }),
          imagesList.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3", children: imagesList.map((img, idx) => /* @__PURE__ */ jsxs("div", { className: "relative aspect-square rounded-xl overflow-hidden border border-paper-3 bg-paper-2", children: [
            /* @__PURE__ */ jsx("img", { src: img.src, alt: img.alt, className: "h-full w-full object-cover" }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setImagesList((current) => current.filter((_, i) => i !== idx)), className: "absolute top-1.5 right-1.5 p-1 rounded-full bg-ink/80 text-paper hover:bg-red-600 transition", children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }) })
          ] }, `${img.src}-${idx}`)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold uppercase tracking-wider text-ink mb-1.5", children: "Pequena Descrição" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: shortDesc, onChange: (e) => setShortDesc(e.target.value), placeholder: "Ex: Acessório compacto para mochilas e chaves", className: "w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold uppercase tracking-wider text-ink", children: "Cores Disponíveis" }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setShowColorForm(!showColorForm), className: "text-xs flex items-center gap-1 text-ember hover:underline font-semibold", children: [
              /* @__PURE__ */ jsx(Palette, { className: "h-3.5 w-3.5" }),
              showColorForm ? "Fechar" : "+ Adicionar Cor à Paleta"
            ] })
          ] }),
          showColorForm && /* @__PURE__ */ jsxs("form", { onSubmit: handleAddNewColor, className: "mb-3.5 p-3 rounded-xl border border-paper-3 bg-paper-2 flex flex-wrap items-center gap-2.5", children: [
            /* @__PURE__ */ jsx("input", { type: "color", value: newColorHex, onChange: (e) => setNewColorHex(e.target.value), className: "h-9 w-9 rounded-lg border border-paper-3 cursor-pointer p-0.5 bg-paper" }),
            /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Nome da cor (ex: Bege Areia)", value: newColorName, onChange: (e) => setNewColorName(e.target.value), className: "flex-1 min-w-[150px] rounded-lg border border-paper-3 bg-paper p-2 text-xs outline-none" }),
            /* @__PURE__ */ jsx("button", { type: "submit", className: "bg-ink hover:bg-ember text-paper px-3 py-2 rounded-lg text-xs font-semibold", children: "Guardar Cor" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: availablePalette.map((col) => {
            const active = selectedColors.some((c) => c.name.toLowerCase() === col.name.toLowerCase());
            return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => toggleColor(col), className: `group flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition ${active ? "border-ember bg-ember/10 text-ink font-bold shadow-sm" : "border-paper-3 bg-paper hover:bg-paper-2 text-ink-2"}`, children: [
              /* @__PURE__ */ jsx("span", { className: "w-3.5 h-3.5 rounded-full border border-black/10", style: {
                backgroundColor: col.hex
              } }),
              /* @__PURE__ */ jsx("span", { children: col.name }),
              /* @__PURE__ */ jsx("span", { onClick: (e) => void removeColorFromPalette(col.name, e), className: "ml-1 flex h-4 w-4 items-center justify-center rounded-full text-xs text-ink-3 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white", children: "×" })
            ] }, col.name);
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold uppercase tracking-wider text-ink", children: "Tamanhos e Preços" }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setVariants((current) => [...current, {
              name: "",
              price: 0,
              dimensions: ""
            }]), className: "text-xs flex items-center gap-1 text-ember hover:underline font-semibold", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
              "Adicionar tamanho"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: variants.map((v, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 bg-paper-2 p-2.5 rounded-xl border border-paper-3", children: [
            /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Tamanho", value: v.name, onChange: (e) => {
              const copy = [...variants];
              copy[i] = {
                ...copy[i],
                name: e.target.value
              };
              setVariants(copy);
            }, className: "flex-1 min-w-0 rounded-lg border border-paper-3 bg-paper p-2 text-sm outline-none", required: true }),
            /* @__PURE__ */ jsx("input", { type: "number", min: "0", step: "0.01", placeholder: "Preço €", value: v.price || "", onChange: (e) => {
              const copy = [...variants];
              copy[i] = {
                ...copy[i],
                price: parseFloat(e.target.value) || 0
              };
              setVariants(copy);
            }, className: "w-24 rounded-lg border border-paper-3 bg-paper p-2 text-sm outline-none", required: true }),
            variants.length > 1 && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setVariants((current) => current.filter((_, idx) => idx !== i)), className: "text-red-500 p-1", "aria-label": "Remover tamanho", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-2", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", id: "feat", checked: featured, onChange: (e) => setFeatured(e.target.checked), className: "rounded border-paper-3 text-ember" }),
          /* @__PURE__ */ jsx("label", { htmlFor: "feat", className: "text-xs font-medium text-ink cursor-pointer", children: "Destacar na página inicial" })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: loading || uploadingImage, className: "w-full bg-ink hover:bg-ember text-paper font-semibold py-3.5 rounded-xl shadow-md transition disabled:opacity-50", children: loading ? "A guardar..." : editingId ? "Atualizar Peça" : "Publicar Peça" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-xl font-bold text-ink mb-4", children: [
          "Peças em Catálogo (",
          productsList.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-3", children: productsList.map((prod) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 p-3.5 bg-paper rounded-xl border border-paper-3 hover:border-ink/20 transition", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
            prod.images?.[0]?.src ? /* @__PURE__ */ jsx("img", { src: prod.images[0].src, alt: "", className: "h-12 w-12 rounded-lg object-cover border border-paper-3" }) : /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-lg bg-paper-2 flex items-center justify-center", children: /* @__PURE__ */ jsx(Image, { className: "h-5 w-5 text-ink-3" }) }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-ink", children: prod.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-ink-3 flex flex-wrap items-center gap-2 mt-0.5", children: [
                /* @__PURE__ */ jsx("span", { children: prod.category_id }),
                /* @__PURE__ */ jsx("span", { children: "·" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  Number(prod.base_price || 0).toFixed(2),
                  " €"
                ] }),
                /* @__PURE__ */ jsx("span", { children: "·" }),
                /* @__PURE__ */ jsxs("span", { className: "text-red-500 font-bold flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Heart, { className: "h-3 w-3 fill-current" }),
                  favoritesCounts[prod.id] || 0
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => handleEditProduct(prod), className: "p-2 rounded-lg border border-paper-3 hover:bg-paper-2 text-ink", title: "Editar", children: /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4 text-ember" }) }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => void handleDeleteProduct(prod.id, prod.name), className: "p-2 text-red-500 hover:bg-red-50 rounded-lg", title: "Eliminar", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
          ] })
        ] }, prod.id)) })
      ] })
    ] }),
    activeTab === "categories" && /* @__PURE__ */ jsxs("div", { className: "space-y-10", children: [
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmitCategory, className: "space-y-6 bg-paper p-6 rounded-2xl border border-paper-3 shadow-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-paper-3 pb-3", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-ink", children: editingCatId ? `Editar Categoria (${catName})` : "Criar Nova Categoria" }),
          editingCatId && /* @__PURE__ */ jsxs("button", { type: "button", onClick: resetCategoryForm, className: "flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg border border-paper-3 hover:bg-paper-2", children: [
            /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }),
            "Cancelar"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold uppercase tracking-wider text-ink mb-1.5", children: "Nome da Categoria" }),
            /* @__PURE__ */ jsx("input", { type: "text", required: true, value: catName, onChange: (e) => setCatName(e.target.value), placeholder: "Ex: Porta-chaves", className: "w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold uppercase tracking-wider text-ink mb-1.5", children: "Slug / Identificador (URL)" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: catSlug, onChange: (e) => setCatSlug(e.target.value), placeholder: "Ex: porta-chaves", disabled: Boolean(editingCatId), className: "w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember disabled:opacity-60" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold uppercase tracking-wider text-ink mb-2", children: "Fotografia de Capa da Categoria" }),
          /* @__PURE__ */ jsx("input", { ref: catFileInputRef, type: "file", accept: "image/jpeg,image/png,image/webp,image/heic,image/heif", onChange: handleCatImageUpload, className: "hidden" }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [
            /* @__PURE__ */ jsxs("button", { type: "button", disabled: uploadingCatImage, onClick: () => catFileInputRef.current?.click(), className: "flex items-center gap-2 px-4 py-3 rounded-xl border border-paper-3 bg-paper-2 hover:bg-paper-3 text-xs font-semibold text-ink transition disabled:opacity-50", children: [
              uploadingCatImage ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin text-ember" }) : /* @__PURE__ */ jsx(UploadCloud, { className: "h-4 w-4 text-ember" }),
              /* @__PURE__ */ jsx("span", { children: "Escolher Foto de Capa" })
            ] }),
            catImage && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("img", { src: catImage, alt: "Capa", className: "h-12 w-12 rounded-xl object-cover border border-paper-3" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setCatImage(""), className: "text-xs text-red-500 hover:underline", children: "Remover" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold uppercase tracking-wider text-ink mb-1.5", children: "Tagline (Frase de Destaque)" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: catTagline, onChange: (e) => setCatTagline(e.target.value), placeholder: "Ex: Leva contigo os teus designs favoritos", className: "w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold uppercase tracking-wider text-ink mb-1.5", children: "Descrição Completa" }),
          /* @__PURE__ */ jsx("textarea", { rows: 3, value: catDescription, onChange: (e) => setCatDescription(e.target.value), placeholder: "Ex: Peças práticas e colecionáveis para levar no dia a dia.", className: "w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", id: "catFeat", checked: catFeatured, onChange: (e) => setCatFeatured(e.target.checked), className: "rounded border-paper-3 text-ember" }),
            /* @__PURE__ */ jsx("label", { htmlFor: "catFeat", className: "text-xs font-medium text-ink cursor-pointer", children: "Destacar na página inicial" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "catOrder", className: "text-xs font-bold text-ink", children: "Ordem:" }),
            /* @__PURE__ */ jsx("input", { id: "catOrder", type: "number", value: catOrder, onChange: (e) => setCatOrder(parseInt(e.target.value, 10) || 0), className: "w-16 rounded-lg border border-paper-3 bg-paper-2 p-1.5 text-xs outline-none" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: loading || uploadingCatImage, className: "w-full bg-ink hover:bg-ember text-paper font-semibold py-3.5 rounded-xl shadow-md transition disabled:opacity-50", children: loading ? "A guardar..." : editingCatId ? "Atualizar Categoria" : "Criar Categoria" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-xl font-bold text-ink mb-4", children: [
          "Categorias Ativas (",
          categoriesList.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: categoriesList.map((cat) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 p-4 bg-paper rounded-2xl border border-paper-3 hover:border-ink/20 transition", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
            cat.image ? /* @__PURE__ */ jsx("img", { src: cat.image, alt: cat.name, className: "h-14 w-14 rounded-xl object-cover border border-paper-3 bg-paper-2" }) : /* @__PURE__ */ jsx("div", { className: "h-14 w-14 rounded-xl bg-paper-2 border border-paper-3 flex items-center justify-center text-ink-3", children: /* @__PURE__ */ jsx(Image, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-ink", children: cat.name }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-3 line-clamp-1", children: cat.tagline || cat.description || "Sem descrição" }),
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono text-ink-3", children: [
                "slug: /",
                cat.slug || cat.id
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => handleEditCategory(cat), className: "p-2 rounded-lg border border-paper-3 hover:bg-paper-2 text-ink shrink-0", title: "Editar Categoria e Foto", children: /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4 text-ember" }) })
        ] }, cat.id)) })
      ] })
    ] }),
    activeTab === "christmas-packs" && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-paper p-6 rounded-2xl border border-paper-3 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-3 rounded-xl bg-ember/10 text-ember", children: /* @__PURE__ */ jsx(Gift, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-extrabold text-ink", children: "Configuração dos Packs de Natal" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-ink-3", children: "Escolhe quais os produtos que podem integrar os packs, define a função de cada peça e estabelece o respetivo preço dentro do pack." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-paper p-4 rounded-xl border border-paper-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-3 font-semibold", children: "Produtos no catálogo" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-extrabold text-ink mt-1", children: productsList.length })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-paper p-4 rounded-xl border border-paper-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-3 font-semibold", children: "Elegíveis para packs" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-extrabold text-ember mt-1", children: eligiblePackProducts.length })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-paper p-4 rounded-xl border border-paper-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-3 font-semibold", children: "Bases configuradas" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-extrabold text-ink mt-1", children: packBaseCount })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-paper p-4 rounded-xl border border-paper-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-3 font-semibold", children: "Placas configuradas" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-extrabold text-ink mt-1", children: packPlateCount })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-paper-2 p-5 rounded-2xl border border-paper-3", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-ink mb-3", children: "Escalões de desconto previstos" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-3 mb-3", children: "Só contam os bonecos e elementos decorativos. A base e a placa não contam para o número de peças." }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [{
          pieces: "0–2 peças",
          discount: "0%"
        }, {
          pieces: "3–4 peças",
          discount: "5%"
        }, {
          pieces: "5–6 peças",
          discount: "8%"
        }, {
          pieces: "7 ou mais",
          discount: "12%"
        }].map((tier) => /* @__PURE__ */ jsxs("div", { className: "p-3 bg-paper rounded-xl border border-paper-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-3", children: tier.pieces }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-extrabold text-ember mt-1", children: tier.discount })
        ] }, tier.pieces)) }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-ink-3 mt-3", children: "Estes escalões são informativos nesta página de administração. O cálculo do desconto e o preço final serão implementados no configurador do cliente." })
      ] }),
      packSuccess && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 text-sm font-semibold", children: [
        /* @__PURE__ */ jsx(CheckCircle, { className: "h-5 w-5 shrink-0" }),
        packSuccess
      ] }),
      packError && /* @__PURE__ */ jsx("div", { className: "p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold", children: packError }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-ink", children: "Produtos e preços dos packs" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-3 mt-1", children: "As alterações só são guardadas quando clicas em «Guardar configuração»." })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-ink-3", children: [
            packDecorativeCount,
            " elementos decorativos configurados"
          ] })
        ] }),
        productsList.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-paper p-8 rounded-2xl border border-paper-3 text-center", children: [
          /* @__PURE__ */ jsx(Package, { className: "h-8 w-8 mx-auto text-ink-3 mb-3" }),
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-ink", children: "Ainda não existem produtos." }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-3 mt-1", children: "Cria primeiro as peças na aba Peças." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: productsList.map((prod) => {
          const eligible = Boolean(prod.pack_eligible);
          const selectedType = prod.pack_type || "";
          const needsSize = selectedType === "base" || selectedType === "placa";
          return /* @__PURE__ */ jsxs("div", { className: `bg-paper rounded-2xl border p-4 sm:p-5 shadow-sm transition ${eligible ? "border-ember/50" : "border-paper-3"}`, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              prod.images?.[0]?.src ? /* @__PURE__ */ jsx("img", { src: prod.images[0].src, alt: prod.name, className: "h-16 w-16 rounded-xl object-cover border border-paper-3 shrink-0" }) : /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded-xl bg-paper-2 border border-paper-3 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Package, { className: "h-6 w-6 text-ink-3" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("h4", { className: "font-bold text-ink", children: prod.name }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-ink-3 mt-1", children: [
                  "Categoria: ",
                  prod.category_id || "Sem categoria"
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-ink-3 mt-0.5", children: [
                  "Preço normal:",
                  " ",
                  Number(prod.base_price || 0).toFixed(2),
                  " €"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex flex-col items-center gap-1 shrink-0 cursor-pointer", children: [
                /* @__PURE__ */ jsx("input", { type: "checkbox", checked: eligible, onChange: (e) => updatePackField(prod.id, "pack_eligible", e.target.checked), className: "h-5 w-5 rounded border-paper-3 text-ember focus:ring-ember" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-ink-3 font-semibold", children: "Elegível" })
              ] })
            ] }),
            eligible && /* @__PURE__ */ jsxs("div", { className: "mt-5 pt-4 border-t border-paper-3 grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: `pack-type-${prod.id}`, className: "block text-xs font-bold uppercase tracking-wider text-ink mb-1.5", children: "Tipo de peça" }),
                /* @__PURE__ */ jsxs("select", { id: `pack-type-${prod.id}`, value: selectedType, onChange: (e) => {
                  const value = e.target.value;
                  updatePackField(prod.id, "pack_type", value || null);
                  if (value === "decorativo") {
                    updatePackField(prod.id, "pack_size", null);
                  }
                }, className: "w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember", children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Selecionar tipo..." }),
                  PACK_TYPES.map((type) => /* @__PURE__ */ jsx("option", { value: type.value, children: type.label }, type.value))
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: `pack-size-${prod.id}`, className: "block text-xs font-bold uppercase tracking-wider text-ink mb-1.5", children: "Tamanho" }),
                /* @__PURE__ */ jsxs("select", { id: `pack-size-${prod.id}`, value: prod.pack_size || "", disabled: !needsSize, onChange: (e) => updatePackField(prod.id, "pack_size", e.target.value || null), className: "w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember disabled:opacity-50", children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: needsSize ? "Selecionar tamanho..." : "Não aplicável" }),
                  PACK_SIZES.map((size) => /* @__PURE__ */ jsx("option", { value: size.value, children: size.label }, size.value))
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: `pack-price-${prod.id}`, className: "block text-xs font-bold uppercase tracking-wider text-ink mb-1.5", children: "Preço no pack (€)" }),
                /* @__PURE__ */ jsx("input", { id: `pack-price-${prod.id}`, type: "number", min: "0", step: "0.01", value: prod.pack_price ?? "", onChange: (e) => updatePackField(prod.id, "pack_price", e.target.value === "" ? null : Number(e.target.value)), placeholder: "Ex: 5.00", className: "w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm outline-none focus:border-ember" })
              ] })
            ] }),
            eligible && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-ink-3", children: selectedType === "base" ? "Esta peça será uma base obrigatória no configurador." : selectedType === "placa" ? "Esta placa será apresentada como opção adicional." : selectedType === "decorativo" ? "Esta peça contará para os escalões de desconto." : "Seleciona o tipo para concluir a configuração." }),
              /* @__PURE__ */ jsx("button", { type: "button", disabled: packSavingId === prod.id, onClick: () => void savePackConfiguration(prod), className: "flex items-center justify-center gap-2 bg-ink hover:bg-ember text-paper px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50", children: packSavingId === prod.id ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
                "A guardar..."
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4" }),
                "Guardar configuração"
              ] }) })
            ] }),
            !eligible && /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-3 mt-3", children: "Este produto não aparece no configurador enquanto não for marcado como elegível." })
          ] }, prod.id);
        }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "p-4 rounded-xl border border-paper-3 bg-paper-2", children: /* @__PURE__ */ jsxs("p", { className: "text-xs text-ink-3 leading-relaxed", children: [
        /* @__PURE__ */ jsx("strong", { className: "text-ink", children: "Nota:" }),
        " esta aba permite guardar a configuração de cada produto no Supabase. Ainda é necessário implementar a página pública do configurador, incluindo a seleção obrigatória da base, a placa opcional, os elementos decorativos, o cálculo do desconto e a adição do pack completo à encomenda."
      ] }) })
    ] })
  ] });
}
export {
  AdminPage as component
};
